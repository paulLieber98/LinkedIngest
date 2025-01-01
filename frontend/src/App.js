import React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';
import { keyframes } from '@emotion/react';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50% }
  100% { background-position: 100% 50% }
`;

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box
          minH="100vh"
          pt="60px"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgGradient: 'linear(to-r, blue.50, purple.50, blue.50)',
            backgroundSize: '200% 100%',
            animation: `${gradientAnimation} 8s linear infinite`,
            opacity: 0.6,
            zIndex: -1,
            filter: 'blur(20px)',
          }}
        >
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 