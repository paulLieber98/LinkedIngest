import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  Textarea,
  Heading,
  Image,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCopy, FiPlay } from 'react-icons/fi';

// Decorative elements
const Sparkle = ({ top, left, size = "40px", color = "#FF69B4" }) => (
  <Box
    position="absolute"
    top={top}
    left={left}
    width={size}
    height={size}
    transform="rotate(45deg)"
    _before={{
      content: '""',
      position: "absolute",
      width: "100%",
      height: "100%",
      background: color,
      borderRadius: "50%",
      filter: "blur(5px)",
      opacity: 0.3,
    }}
  />
);

function Home() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSummary('');
      toast({
        title: 'File uploaded',
        description: `${acceptedFiles[0].name} is ready for analysis`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file && activeTab === 1) {
      toast({
        title: 'No file selected',
        description: 'Please upload a PDF file first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!url && activeTab === 0) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a LinkedIn URL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      let response;
      const formData = new FormData();
      
      // Use the current origin as the API base URL
      const API_BASE_URL = window.location.origin;

      if (activeTab === 1 && file) {
        formData.append('file', file);
        response = await fetch(`${API_BASE_URL}/api/analyze_pdf`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
        });
      } else if (activeTab === 0 && url) {
        response = await fetch(`${API_BASE_URL}/api/analyze_url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ url }),
          credentials: 'same-origin',
        });
      }

      if (!response.ok) {
        let errorMessage = 'Failed to analyze profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.success || !data.summary) {
        throw new Error('Invalid response from server');
      }

      setSummary(data.summary);
      toast({
        title: 'Analysis Complete',
        description: 'Profile has been successfully analyzed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast({
        title: 'Copied',
        description: 'Summary copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="cream" minH="100vh" py={12} position="relative" overflow="hidden">
      {/* Decorative sparkles */}
      <Sparkle top="10%" left="10%" color="#4299E1" />
      <Sparkle top="20%" left="80%" color="#48BB78" />
      <Sparkle top="70%" left="15%" color="#F56565" />
      <Sparkle top="60%" left="85%" color="#9F7AEA" />

      <Container maxW="container.md" position="relative">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading 
              as="h1" 
              size="2xl" 
              mb={4}
              bgGradient="linear(to-r, #FF6B6B, #4ECDC4)"
              bgClip="text"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              transform="translateY(-4px)"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-6px)" }}
            >
              LinkedIngest
            </Heading>
            <Text 
              fontSize="xl" 
              color="gray.600"
              maxW="600px"
              mx="auto"
              lineHeight="tall"
            >
              Transform LinkedIn profiles into LLM-friendly summaries
            </Text>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.9)"
            p={8}
            borderRadius="3xl"
            boxShadow="2xl"
            border="2px"
            borderColor="gray.100"
            position="relative"
            transition="all 0.3s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "2xl" }}
            backdropFilter="blur(10px)"
          >
            <Tabs 
              variant="soft-rounded" 
              colorScheme="teal" 
              onChange={(index) => {
                setActiveTab(index);
                setSummary('');
              }}
              isLazy
            >
              <TabList mb={6} gap={4}>
                <Tab 
                  fontWeight="medium" 
                  _selected={{ 
                    bg: 'teal.100',
                    color: 'teal.800',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  px={6}
                  py={3}
                >
                  LinkedIn URL
                </Tab>
                <Tab 
                  fontWeight="medium" 
                  _selected={{ 
                    bg: 'teal.100',
                    color: 'teal.800',
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s"
                  borderRadius="xl"
                  px={6}
                  py={3}
                >
                  PDF Upload
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Input
                    placeholder="Enter LinkedIn profile URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    size="lg"
                    bg="white"
                    borderWidth={2}
                    borderColor="gray.200"
                    borderRadius="2xl"
                    _hover={{ borderColor: "teal.300" }}
                    _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 3px rgba(45, 212, 191, 0.3)" }}
                    fontSize="lg"
                    p={6}
                  />
                </TabPanel>

                <TabPanel>
                  <Box
                    {...getRootProps()}
                    p={10}
                    border="3px dashed"
                    borderColor={isDragActive ? 'teal.400' : file ? 'green.400' : 'gray.200'}
                    borderRadius="3xl"
                    textAlign="center"
                    bg={isDragActive ? 'teal.50' : file ? 'green.50' : 'white'}
                    cursor="pointer"
                    transition="all 0.3s"
                    _hover={{ 
                      borderColor: file ? 'green.500' : 'teal.400', 
                      bg: file ? 'green.100' : 'teal.50',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                  >
                    <input {...getInputProps()} />
                    <VStack spacing={4}>
                      <Box
                        p={4}
                        borderRadius="full"
                        bg={file ? 'green.100' : 'teal.100'}
                        color={file ? 'green.500' : 'teal.500'}
                        transition="all 0.3s"
                      >
                        <FiUpload size={40} />
                      </Box>
                      <Text 
                        color={file ? 'green.600' : 'gray.600'} 
                        fontSize="xl" 
                        fontWeight="medium"
                        maxW="300px"
                      >
                        {file
                          ? `Selected: ${file.name}`
                          : isDragActive
                          ? 'Drop the PDF here'
                          : 'Drag & drop a PDF or click to select'}
                      </Text>
                    </VStack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Button
              colorScheme="teal"
              size="lg"
              isLoading={isLoading}
              onClick={handleAnalyze}
              leftIcon={<FiPlay />}
              isDisabled={(activeTab === 0 && !url) || (activeTab === 1 && !file)}
              w="100%"
              mt={6}
              py={8}
              fontSize="xl"
              fontWeight="bold"
              borderRadius="2xl"
              boxShadow="lg"
              _hover={{ 
                transform: 'translateY(-2px)', 
                boxShadow: '2xl',
                bg: 'teal.500'
              }}
              _active={{
                transform: 'translateY(1px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
            >
              Analyze Profile
            </Button>
          </Box>

          {summary && (
            <Box
              bg="rgba(255, 255, 255, 0.9)"
              borderRadius="3xl"
              boxShadow="2xl"
              border="2px"
              borderColor="gray.100"
              p={8}
              position="relative"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-2px)" }}
              backdropFilter="blur(10px)"
            >
              <Textarea
                value={summary}
                readOnly
                minH="300px"
                p={6}
                borderRadius="2xl"
                bg="gray.50"
                fontSize="lg"
                whiteSpace="pre-wrap"
                borderColor="transparent"
                _hover={{ borderColor: "transparent" }}
                sx={{
                  '&::-webkit-scrollbar': {
                    width: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                  },
                }}
              />
              <Button
                position="absolute"
                top={6}
                right={6}
                colorScheme="teal"
                variant="ghost"
                leftIcon={<FiCopy />}
                onClick={handleCopy}
                size="md"
                borderRadius="xl"
                _hover={{
                  bg: 'teal.100',
                  transform: 'translateY(-1px)'
                }}
                transition="all 0.2s"
              >
                Copy
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default Home; 