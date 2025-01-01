import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Select,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Icon,
  Progress,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_URL = '/api';

function Home() {
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const toast = useToast();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file of your LinkedIn profile',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setUploadedFile(file);
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File too large',
        description: 'Please upload a PDF file smaller than 10MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tone', tone);
      if (context) formData.append('context', context);

      const response = await axios.post(`${API_URL}/analyze/pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSummary(response.data.summary);
      toast({
        title: 'Success',
        description: 'Profile analyzed successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Error processing PDF file',
        status: 'error',
        duration: 5000,
      });
      setSummary('');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleUrlSubmit = async () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a LinkedIn URL',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/analyze/url`, {
        url,
        tone,
        context,
      });
      setSummary(response.data.summary);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
      setSummary('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="2xl" mb={3}>
            LinkedIngest
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Turn any LinkedIn profile into an LLM-friendly summary
          </Text>
        </Box>

        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          border="1px"
          borderColor="gray.200"
        >
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList mb="4">
              <Tab fontWeight="medium">URL Input</Tab>
              <Tab fontWeight="medium">PDF Upload</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={4}>
                  <Input
                    placeholder="Enter LinkedIn Profile URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    size="lg"
                    bg="white"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleUrlSubmit}
                    isLoading={loading}
                    width="full"
                    size="lg"
                  >
                    Analyze Profile
                  </Button>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <Box
                  {...getRootProps()}
                  p={8}
                  border="2px dashed"
                  borderColor={uploadedFile ? "green.500" : isDragActive ? "blue.500" : "gray.300"}
                  borderRadius="md"
                  textAlign="center"
                  cursor="pointer"
                  bg={uploadedFile ? "green.50" : isDragActive ? "blue.50" : "gray.50"}
                  _hover={{ 
                    borderColor: uploadedFile ? 'green.600' : 'blue.500',
                    bg: uploadedFile ? 'green.100' : 'gray.100'
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  <input {...getInputProps()} />
                  <VStack spacing={3}>
                    <Icon 
                      as={uploadedFile ? FiCheck : isDragActive ? FiUpload : FiFile} 
                      w={8} 
                      h={8} 
                      color={uploadedFile ? "green.500" : "gray.400"}
                    />
                    {uploadedFile ? (
                      <VStack spacing={2}>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                          File Uploaded Successfully
                        </Badge>
                        <HStack spacing={2} color="gray.600">
                          <Icon as={FiFile} />
                          <Text>{uploadedFile.name}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Click or drag another file to replace
                        </Text>
                      </VStack>
                    ) : (
                      <>
                        <Text color="gray.600" fontWeight="medium">
                          {isDragActive
                            ? "Drop your LinkedIn PDF here"
                            : "Drag and drop your LinkedIn PDF here, or click to select"}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Export your LinkedIn profile as PDF and upload it here
                        </Text>
                      </>
                    )}
                  </VStack>
                </Box>

                {uploadedFile && !loading && (
                  <Button
                    mt={4}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    leftIcon={<Icon as={FiX} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setSummary('');
                    }}
                  >
                    Remove File
                  </Button>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

          <VStack spacing={4} mt={6}>
            <Select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              size="md"
              bg="white"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
            </Select>

            <Textarea
              placeholder="Add context for personalization (optional)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              size="md"
              bg="white"
              rows={4}
            />
          </VStack>
        </Box>

        {loading && (
          <Box>
            <Progress size="xs" isIndeterminate colorScheme="blue" />
            <Text textAlign="center" mt={2} color="gray.600">
              Analyzing profile...
            </Text>
          </Box>
        )}

        {summary && (
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            border="1px"
            borderColor="gray.200"
            boxShadow="sm"
          >
            <Heading size="md" mb={4}>
              Generated Summary
            </Heading>
            <Text whiteSpace="pre-wrap">{summary}</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default Home; 