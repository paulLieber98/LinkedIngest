import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiLock, FiMessageSquare } from 'react-icons/fi';

const Feature = ({ title, text, icon }) => {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600">{text}</Text>
    </Box>
  );
};

function About() {
  return (
    <Container maxW="container.xl">
      <VStack spacing={10} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            About LinkedIngest
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Turn any LinkedIn profile into an LLM-friendly summary for personalized
            outreach
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Feature
            icon={FiUsers}
            title="Personalized Networking"
            text="Create meaningful connections by understanding professional backgrounds quickly and effectively."
          />
          <Feature
            icon={FiClock}
            title="Save Time"
            text="Automate the process of analyzing LinkedIn profiles and crafting personalized outreach messages."
          />
          <Feature
            icon={FiLock}
            title="Privacy First"
            text="We respect LinkedIn's terms of service and user privacy. No data is stored longer than necessary."
          />
          <Feature
            icon={FiMessageSquare}
            title="AI-Powered Summaries"
            text="Leverage advanced language models to generate concise, relevant profile summaries."
          />
        </SimpleGrid>

        <Box>
          <Heading size="lg" mb={4}>
            How It Works
          </Heading>
          <VStack spacing={4} align="stretch">
            <Text>
              1. Input a LinkedIn profile URL or upload an exported PDF profile
            </Text>
            <Text>
              2. Choose your preferred tone (Professional, Casual, or Friendly)
            </Text>
            <Text>
              3. Add optional context for more personalized summaries
            </Text>
            <Text>
              4. Get an AI-generated summary perfect for crafting personalized
              outreach
            </Text>
          </VStack>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            Our Mission
          </Heading>
          <Text>
            LinkedIngest aims to make professional networking more meaningful and
            efficient. We believe that personalized outreach leads to better
            connections and opportunities. Our tool helps professionals,
            recruiters, and networkers create genuine, context-aware
            communications that stand out.
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}

export default About; 