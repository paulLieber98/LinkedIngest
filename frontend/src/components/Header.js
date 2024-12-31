import React from 'react';
import { Box, Flex, Link, Button, Container } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.100">
      <Container maxW="container.lg">
        <Flex h={14} alignItems="center" justifyContent="space-between">
          <Link
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            color="gray.800"
            _hover={{ textDecoration: 'none' }}
          >
            Linked<Box as="span" color="orange.500">Ingest</Box>
          </Link>

          <Flex alignItems="center" gap={6}>
            <Link
              as={RouterLink}
              to="/about"
              color="gray.600"
              fontSize="sm"
              fontWeight="medium"
            >
              About
            </Link>
            <Button
              as="a"
              href="https://github.com/yourusername/linkedingest"
              target="_blank"
              size="sm"
              colorScheme="gray"
              variant="ghost"
              fontSize="sm"
            >
              GitHub
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

export default Header; 