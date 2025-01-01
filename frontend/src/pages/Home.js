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
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheck, FiX, FiLink, FiFileText, FiSettings, FiGithub } from 'react-icons/fi';
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const accentColor = "blue.500";
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
      if (context.trim()) {
        formData.append('context', context);
      }

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
      console.error('Error:', error);
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
        context: context.trim() || undefined,
      });
      setSummary(response.data.summary);
      toast({
        title: 'Success',
        description: 'Profile analyzed successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error:', error);
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
      <VStack spacing={8} align="stretch">
        <Box 
          textAlign="center" 
          mb={8} 
          p={6}
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderRadius="xl"
        >
          <Heading 
            as="h1" 
            size="2xl" 
            mb={4}
            bgGradient="linear(to-r, blue.400, purple.500)"
            bgClip="text"
          >
            LinkedIngest
          </Heading>
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
            Turn any LinkedIn profile into an LLM-friendly summary
          </Text>
        </Box>

        <Box
          bg={bgColor}
          p={8}
          borderRadius="xl"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: 'linear(to-r, blue.400, purple.500)',
          }}
        >
          <Tabs isFitted variant="soft-rounded" colorScheme="blue">
            <TabList mb="6">
              <Tab 
                fontWeight="medium" 
                _selected={{ 
                  color: 'white',
                  bg: accentColor,
                }}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiLink} />
                URL Input
              </Tab>
              <Tab 
                fontWeight="medium"
                _selected={{ 
                  color: 'white',
                  bg: accentColor,
                }}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Icon as={FiFileText} />
                PDF Upload
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={4}>
                  <Input
                    placeholder="Enter LinkedIn Profile URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    size="lg"
                    bg={bgColor}
                    border="2px"
                    borderColor={borderColor}
                    _hover={{ borderColor: accentColor }}
                    _focus={{ 
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                    fontSize="md"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleUrlSubmit}
                    isLoading={loading}
                    width="full"
                    size="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Analyze Profile
                  </Button>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <Box
                  {...getRootProps()}
                  p={8}
                  border="3px dashed"
                  borderColor={uploadedFile ? "green.500" : isDragActive ? accentColor : borderColor}
                  borderRadius="xl"
                  textAlign="center"
                  cursor="pointer"
                  bg={uploadedFile ? "green.50" : isDragActive ? "blue.50" : bgColor}
                  _hover={{ 
                    borderColor: uploadedFile ? 'green.600' : accentColor,
                    bg: uploadedFile ? 'green.100' : hoverBg,
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                  position="relative"
                >
                  <input {...getInputProps()} />
                  <VStack spacing={4}>
                    <Icon 
                      as={uploadedFile ? FiCheck : isDragActive ? FiUpload : FiFile} 
                      w={12} 
                      h={12} 
                      color={uploadedFile ? "green.500" : accentColor}
                    />
                    {uploadedFile ? (
                      <VStack spacing={3}>
                        <Badge 
                          colorScheme="green" 
                          fontSize="md" 
                          px={4} 
                          py={2}
                          borderRadius="full"
                        >
                          File Uploaded Successfully
                        </Badge>
                        <HStack spacing={2} color="gray.600">
                          <Icon as={FiFile} />
                          <Text fontWeight="medium">{uploadedFile.name}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Click or drag another file to replace
                        </Text>
                      </VStack>
                    ) : (
                      <>
                        <Text color="gray.600" fontWeight="medium" fontSize="lg">
                          {isDragActive
                            ? "Drop your LinkedIn PDF here"
                            : "Drag and drop your LinkedIn PDF here, or click to select"}
                        </Text>
                        <Text fontSize="md" color="gray.500">
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
                    size="md"
                    leftIcon={<Icon as={FiX} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setSummary('');
                    }}
                    _hover={{
                      bg: 'red.50',
                      transform: 'translateY(-1px)',
                    }}
                    transition="all 0.2s"
                  >
                    Remove File
                  </Button>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Box mt={8} position="relative">
            <Box
              position="absolute"
              top="-12px"
              left="50%"
              transform="translateX(-50%)"
              bg={bgColor}
              px={4}
              py={1}
              borderRadius="full"
              border="1px"
              borderColor={borderColor}
            >
              <HStack spacing={2} color="gray.600">
                <Icon as={FiSettings} />
                <Text fontWeight="medium">Customization Options</Text>
              </HStack>
            </Box>

            <VStack 
              spacing={4} 
              mt={6}
              p={6}
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
            >
              <Select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                size="lg"
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ borderColor: accentColor }}
                icon={<Icon as={FiSettings} />}
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
                size="lg"
                bg={bgColor}
                borderColor={borderColor}
                _hover={{ borderColor: accentColor }}
                rows={4}
                resize="vertical"
              />
            </VStack>
          </Box>
        </Box>

        {loading && (
          <Box
            p={4}
            bg={bgColor}
            borderRadius="lg"
            boxShadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <Progress 
              size="xs" 
              isIndeterminate 
              colorScheme="blue" 
              borderRadius="full"
            />
            <Text textAlign="center" mt={3} color="gray.600" fontWeight="medium">
              Analyzing profile...
            </Text>
          </Box>
        )}

        {summary && (
          <Box
            p={8}
            bg={bgColor}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="lg"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgGradient: 'linear(to-r, green.400, teal.500)',
            }}
          >
            <Heading 
              size="lg" 
              mb={4}
              bgGradient="linear(to-r, green.400, teal.500)"
              bgClip="text"
            >
              Generated Summary
            </Heading>
            <Text 
              whiteSpace="pre-wrap"
              fontSize="lg"
              lineHeight="tall"
            >
              {summary}
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export default Home; 