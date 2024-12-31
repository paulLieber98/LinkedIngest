import React from 'react';
import { Box, Container, Text, Link, HStack } from '@chakra-ui/react';

function Footer() {
  return (
    <Box py={4} borderTop="1px" borderColor="gray.100">
      <Container maxW="container.lg">
        <HStack spacing={4} justify="center" fontSize="sm" color="gray.500">
          <Text>© {new Date().getFullYear()} LinkedIngest</Text>
          <Box as="span">·</Box>
          <Link href="#" color="gray.500" _hover={{ color: 'gray.700' }}>
            Privacy
          </Link>
          <Box as="span">·</Box>
          <Link href="#" color="gray.500" _hover={{ color: 'gray.700' }}>
            Terms
          </Link>
        </HStack>
      </Container>
    </Box>
  );
}

export default Footer; 