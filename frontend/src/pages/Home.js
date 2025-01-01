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
  Select,
  Heading,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCopy, FiPlay, FiX, FiSettings } from 'react-icons/fi';

function Home() {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
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

      if (activeTab === 1 && file) {
        formData.append('file', file);
        formData.append('tone', tone);
        if (context.trim()) {
          formData.append('context', context);
        }
        response = await fetch('/api/analyze_pdf', {
          method: 'POST',
          body: formData,
        });
      } else if (activeTab === 0 && url) {
        response = await fetch('/api/analyze_url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            url,
            tone,
            context: context.trim() || undefined
          }),
        });
      } else {
        throw new Error(activeTab === 0 
          ? 'Please provide a LinkedIn URL' 
          : 'Please upload a PDF file');
      }

      if (!response.ok) {
        throw new Error('Failed to analyze profile');
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

  const CustomizationOptions = () => (
    <Box 
      mt={6} 
      p={6} 
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      bg="gray.50"
      position="relative"
    >
      <Box
        position="absolute"
        top="-14px"
        left="50%"
        transform="translateX(-50%)"
        bg="white"
        px={4}
        py={1}
        borderRadius="full"
        border="1px"
        borderColor="gray.200"
      >
        <HStack spacing={2} color="gray.600">
          <FiSettings />
          <Text fontWeight="medium">Customization Options</Text>
        </HStack>
      </Box>

      <VStack spacing={4}>
        <Select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          bg="white"
          size="lg"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
          <option value="enthusiastic">Enthusiastic</option>
        </Select>

        <Textarea
          placeholder="Add context for personalization (optional)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          bg="white"
          size="lg"
          rows={4}
          resize="vertical"
        />
      </VStack>
    </Box>
  );

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Text fontSize="4xl" fontWeight="bold" mb={2}>
            LinkedIngest
          </Text>
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
        >
          <TabList>
            <Tab>LinkedIn URL</Tab>
            <Tab>PDF Upload</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4}>
                <Input
                  placeholder="Enter LinkedIn profile URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  size="lg"
                />
                <CustomizationOptions />
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4}>
                <Box
                  {...getRootProps()}
                  p={10}
                  border="2px dashed"
                  borderColor={isDragActive ? 'blue.400' : file ? 'green.400' : 'gray.200'}
                  borderRadius="md"
                  textAlign="center"
                  bg={isDragActive ? 'blue.50' : file ? 'green.50' : 'transparent'}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ 
                    borderColor: file ? 'green.500' : 'blue.400', 
                    bg: file ? 'green.100' : 'blue.50' 
                  }}
                  position="relative"
                >
                  <input {...getInputProps()} />
                  <VStack spacing={3}>
                    <FiUpload size={24} color={file ? '#38A169' : '#4299E1'} />
                    <Text color={file ? 'green.600' : 'gray.600'}>
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
                <CustomizationOptions />
              </VStack>
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
        >
          Analyze Profile
        </Button>

        {summary && (
          <Box position="relative">
            <Textarea
              value={summary}
              readOnly
              minH="300px"
              p={4}
              borderRadius="md"
              bg="gray.50"
              whiteSpace="pre-wrap"
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