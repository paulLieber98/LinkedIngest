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
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Use relative paths for API endpoints
const API_URL = '/api';

function Home() {
  const [url, setUrl] = useState('');
  const [tone, setTone] = useState('professional');
  const [context, setContext] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file',
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

      const response = await axios.post(`${API_URL}/analyze/pdf`, formData);
      setSummary(response.data.summary);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
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
                  borderColor="gray.300"
                  borderRadius="md"
                  textAlign="center"
                  cursor="pointer"
                  bg="gray.50"
                  _hover={{ borderColor: 'blue.500', bg: 'gray.100' }}
                  transition="all 0.2s"
                >
                  <input {...getInputProps()} />
                  <Text>Drag and drop a PDF file here, or click to select one</Text>
                </Box>
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