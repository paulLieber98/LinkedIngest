import React from 'react';
import {
  Box,
  HStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

function Nav() {
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const linkHoverColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box 
      position="fixed" 
      top={0} 
      left={0} 
      right={0} 
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      zIndex={1000}
    >
      <Box maxW="container.md" mx="auto" px={4}>
        <HStack h="60px" justify="space-between" align="center">
          <Link
            as={RouterLink}
            to="/"
            fontSize="xl"
            fontWeight="bold"
            _hover={{ textDecoration: 'none' }}
          >
            <Text as="span" color="black">Linked</Text>
            <Text as="span" color="blue.500">Ingest</Text>
          </Link>

          <HStack spacing={6}>
            <Link
              as={RouterLink}
              to="/about"
              color={linkColor}
              fontWeight="medium"
              _hover={{ color: linkHoverColor, textDecoration: 'none' }}
            >
              About
            </Link>
            <Link
              href="https://github.com/paulLieber98/LinkedIngest"
              isExternal
              color={linkColor}
              fontWeight="medium"
              display="flex"
              alignItems="center"
              gap={2}
              _hover={{ color: linkHoverColor, textDecoration: 'none' }}
            >
              <Icon as={FiGithub} />
              <Text>GitHub</Text>
            </Link>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}

export default Nav; 