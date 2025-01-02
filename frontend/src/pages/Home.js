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
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCopy, FiPlay } from 'react-icons/fi';

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

    setIsLoading(true);
    try {
      let response;
      const formData = new FormData();
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://linkedingest.com';

      if (activeTab === 1 && file) {
        formData.append('file', file);
        response = await fetch(`${API_BASE_URL}/api/analyze_pdf`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        });
      } else if (activeTab === 0 && url) {
        response = await fetch(`${API_BASE_URL}/api/analyze_url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url }),
          mode: 'cors'
        });
      } else {
        throw new Error(activeTab === 0 
          ? 'Please provide a LinkedIn URL' 
          : 'Please upload a PDF file');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to analyze profile' }));
        throw new Error(errorData.detail || 'Failed to analyze profile');
      }

      const data = await response.json();
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
    <Box bg="gray.50" minH="100vh" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading 
              as="h1" 
              size="2xl" 
              mb={4}
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              LinkedIngest
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Transform LinkedIn profiles into LLM-friendly summaries
            </Text>
          </Box>

          <Box
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px"
            borderColor="gray.100"
          >
            <Tabs 
              variant="soft-rounded" 
              colorScheme="blue" 
              onChange={(index) => {
                setActiveTab(index);
                setSummary('');
              }}
              isLazy
            >
              <TabList mb={4}>
                <Tab fontWeight="medium" _selected={{ bg: 'blue.100' }}>LinkedIn URL</Tab>
                <Tab fontWeight="medium" _selected={{ bg: 'blue.100' }}>PDF Upload</Tab>
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
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                  />
                </TabPanel>

                <TabPanel>
                  <Box
                    {...getRootProps()}
                    p={10}
                    border="3px dashed"
                    borderColor={isDragActive ? 'blue.400' : file ? 'green.400' : 'gray.200'}
                    borderRadius="xl"
                    textAlign="center"
                    bg={isDragActive ? 'blue.50' : file ? 'green.50' : 'white'}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{ 
                      borderColor: file ? 'green.500' : 'blue.400', 
                      bg: file ? 'green.100' : 'blue.50' 
                    }}
                  >
                    <input {...getInputProps()} />
                    <VStack spacing={3}>
                      <FiUpload size={30} color={file ? '#38A169' : '#4299E1'} />
                      <Text color={file ? 'green.600' : 'gray.600'} fontSize="lg" fontWeight="medium">
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
              colorScheme="blue"
              size="lg"
              isLoading={isLoading}
              onClick={handleAnalyze}
              leftIcon={<FiPlay />}
              isDisabled={(activeTab === 0 && !url) || (activeTab === 1 && !file)}
              w="100%"
              mt={6}
              py={7}
              fontSize="lg"
              boxShadow="md"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Analyze Profile
            </Button>
          </Box>

          {summary && (
            <Box
              bg="white"
              borderRadius="xl"
              boxShadow="xl"
              border="1px"
              borderColor="gray.100"
              p={6}
              position="relative"
            >
              <Textarea
                value={summary}
                readOnly
                minH="300px"
                p={4}
                borderRadius="lg"
                bg="gray.50"
                fontSize="md"
                whiteSpace="pre-wrap"
                borderColor="transparent"
                _hover={{ borderColor: "transparent" }}
              />
              <Button
                position="absolute"
                top={4}
                right={4}
                colorScheme="blue"
                variant="ghost"
                leftIcon={<FiCopy />}
                onClick={handleCopy}
                size="sm"
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