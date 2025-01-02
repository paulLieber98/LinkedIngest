import React from 'react';
import { Box, Flex, Link, HStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <Box 
      as="nav" 
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px"
      borderColor="gray.100"
      position="fixed"
      width="100%"
      top={0}
      zIndex={1000}
    >
      <Flex 
        maxW="container.xl" 
        mx="auto" 
        px={4} 
        py={4} 
        align="center" 
        justify="space-between"
      >
        <Link 
          as={RouterLink} 
          to="/"
          fontSize="xl"
          fontWeight="bold"
          _hover={{ textDecoration: 'none' }}
        >
          <Box as="span" color="gray.800">Linked</Box>
          <Box 
            as="span" 
            bgGradient="linear(to-r, #FF6B6B, #4ECDC4)"
            bgClip="text"
          >
            Ingest
          </Box>
        </Link>

        <HStack spacing={8}>
          <Link
            as={RouterLink}
            to="/about"
            fontSize="md"
            fontWeight="medium"
            color="gray.600"
            _hover={{
              color: 'teal.500',
              transform: 'translateY(-1px)',
              textDecoration: 'none'
            }}
            transition="all 0.2s"
          >
            About
          </Link>
          <Link
            href="https://github.com/paulLieber98/LinkedIngest"
            target="_blank"
            rel="noopener noreferrer"
            fontSize="md"
            fontWeight="medium"
            color="gray.600"
            _hover={{
              color: 'teal.500',
              transform: 'translateY(-1px)',
              textDecoration: 'none'
            }}
            transition="all 0.2s"
          >
            GitHub
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Navbar; 