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
import { FiUpload, FiCopy, FiPlay, FiX } from 'react-icons/fi';

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
        description: `${acceptedFiles[0].name} is ready for analysis. Click 'Analyze Profile' to proceed.`,
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
    noClick: false,
    noKeyboard: false,
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setSummary('');
  };

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
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2} color="gray.800">
            LinkedIngest
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Transform LinkedIn profiles into LLM-friendly summaries
          </Text>
        </Box>

        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          onChange={(index) => {
            setActiveTab(index);
            setSummary('');
          }}
          isLazy
        >
          <TabList>
            <Tab fontWeight="medium">LinkedIn URL</Tab>
            <Tab fontWeight="medium">PDF Upload</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Input
                placeholder="Enter LinkedIn profile URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                size="lg"
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "gray.400" }}
              />
            </TabPanel>

            <TabPanel>
              <Box
                {...getRootProps()}
                p={10}
                border="2px dashed"
                borderColor={isDragActive ? 'blue.400' : file ? 'green.400' : 'gray.200'}
                borderRadius="lg"
                textAlign="center"
                bg={isDragActive ? 'blue.50' : file ? 'green.50' : 'white'}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ 
                  borderColor: file ? 'green.500' : 'blue.400', 
                  bg: file ? 'green.100' : 'blue.50' 
                }}
                position="relative"
                w="100%"
              >
                <input {...getInputProps()} />
                <VStack spacing={3}>
                  <FiUpload size={24} color={file ? '#38A169' : '#4299E1'} />
                  <Text color={file ? 'green.600' : 'gray.600'} fontWeight="medium">
                    {file
                      ? `Selected: ${file.name}`
                      : isDragActive
                      ? 'Drop the PDF here'
                      : 'Drag & drop a PDF or click to select'}
                  </Text>
                  {file && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      leftIcon={<FiX />}
                      onClick={handleRemoveFile}
                      mt={2}
                    >
                      Remove File
                    </Button>
                  )}
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
        >
          Analyze Profile
        </Button>

        {summary && (
          <Box position="relative" bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Textarea
              value={summary}
              readOnly
              minH="300px"
              p={4}
              borderRadius="lg"
              bg="gray.50"
              whiteSpace="pre-wrap"
              borderColor="transparent"
              _hover={{ borderColor: "transparent" }}
            />
            <Button
              position="absolute"
              top={2}
              right={2}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              leftIcon={<FiCopy />}
              onClick={handleCopy}
            >
              Copy
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default Home; 