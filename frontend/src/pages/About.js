import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Link,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiClock, FiLock, FiCpu } from 'react-icons/fi';

// Reuse the Sparkle component from Home.js
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

const FeatureCard = ({ icon, title, description }) => (
  <Box
    bg="rgba(255, 255, 255, 0.9)"
    p={8}
    borderRadius="2xl"
    boxShadow="xl"
    border="2px"
    borderColor="gray.100"
    transition="all 0.3s"
    _hover={{ transform: "translateY(-4px)", boxShadow: "2xl" }}
    backdropFilter="blur(10px)"
  >
    <VStack spacing={4} align="flex-start">
      <Box
        p={3}
        borderRadius="xl"
        bg="teal.100"
        color="teal.600"
      >
        <Icon as={icon} boxSize={6} />
      </Box>
      <Heading size="md" color="gray.800">
        {title}
      </Heading>
      <Text color="gray.600" lineHeight="tall">
        {description}
      </Text>
    </VStack>
  </Box>
);

function About() {
  return (
    <Box bg="cream" minH="100vh" pt={24} pb={16} position="relative" overflow="hidden">
      {/* Decorative sparkles */}
      <Sparkle top="15%" left="5%" color="#4299E1" />
      <Sparkle top="25%" left="85%" color="#48BB78" />
      <Sparkle top="75%" left="10%" color="#F56565" />
      <Sparkle top="65%" left="90%" color="#9F7AEA" />

      <Container maxW="container.lg">
        <VStack spacing={12} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, #FF6B6B, #4ECDC4)"
              bgClip="text"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            >
              About LinkedIngest
            </Heading>
            <Text 
              fontSize="xl" 
              color="gray.600" 
              maxW="container.md"
              mx="auto"
            >
              Turn any LinkedIn profile into an LLM-friendly summary for personalized outreach
            </Text>
            <Text fontSize="lg" color="gray.500" mt={2}>
              Inspired by{' '}
              <Link
                href="https://gitingest.com"
                color="teal.500"
                fontWeight="medium"
                _hover={{ textDecoration: 'none', color: 'teal.600' }}
              >
                Gitingest
              </Link>
              , which turns GitHub repositories into LLM-friendly summaries
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} pt={8}>
            <FeatureCard
              icon={FiUsers}
              title="Personalized Networking"
              description="Create meaningful connections by understanding professional backgrounds quickly and effectively."
            />
            <FeatureCard
              icon={FiClock}
              title="Save Time"
              description="Automate the process of analyzing LinkedIn profiles and crafting personalized outreach messages."
            />
            <FeatureCard
              icon={FiLock}
              title="Privacy First"
              description="We respect LinkedIn's terms of service and user privacy. No data is stored longer than necessary."
            />
            <FeatureCard
              icon={FiCpu}
              title="AI-Powered Summaries"
              description="Leverage advanced language models to generate concise, relevant profile summaries."
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}

export default About; 