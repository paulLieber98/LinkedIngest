import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Icon,
  Link,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiLock, FiMessageSquare } from 'react-icons/fi';

function About() {
  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            About LinkedIngest
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Turn any LinkedIn profile into an LLM-friendly summary for personalized outreach
          </Text>
        </Box>

        <Box textAlign="center" py={4} bg="blue.50" borderRadius="lg">
          <Text fontSize="md" color="gray.700">
            Inspired by{' '}
            <Link href="https://gitingest.com" color="blue.500" isExternal>
              GitIngest
            </Link>
            , which turns GitHub repositories into LLM-friendly summaries
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Icon as={FiUsers} w={8} h={8} color="blue.500" mb={4} />
            <Heading size="md" mb={3}>
              Personalized Networking
            </Heading>
            <Text color="gray.600">
              Create meaningful connections by understanding professional backgrounds quickly and effectively.
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Icon as={FiClock} w={8} h={8} color="blue.500" mb={4} />
            <Heading size="md" mb={3}>
              Save Time
            </Heading>
            <Text color="gray.600">
              Automate the process of analyzing LinkedIn profiles and crafting personalized outreach messages.
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Icon as={FiLock} w={8} h={8} color="blue.500" mb={4} />
            <Heading size="md" mb={3}>
              Privacy First
            </Heading>
            <Text color="gray.600">
              We respect LinkedIn's terms of service and user privacy. No data is stored longer than necessary.
            </Text>
          </Box>

          <Box p={6} bg="white" borderRadius="lg" boxShadow="sm" border="1px" borderColor="gray.200">
            <Icon as={FiMessageSquare} w={8} h={8} color="blue.500" mb={4} />
            <Heading size="md" mb={3}>
              AI-Powered Summaries
            </Heading>
            <Text color="gray.600">
              Leverage advanced language models to generate concise, relevant profile summaries.
            </Text>
          </Box>
        </SimpleGrid>

        <Box mt={8}>
          <Heading size="lg" mb={4}>
            How It Works
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Text>1. Input a LinkedIn profile URL or upload an exported PDF profile</Text>
            <Text>2. Choose your preferred tone and add optional context</Text>
            <Text>3. Get an AI-generated summary optimized for your needs</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

export default About; 