import React from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box
          minH="100vh"
          pt="60px"
          position="relative"
          bgGradient="linear(to-br, blue.50, purple.50, blue.50)"
          _after={{
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(100px)',
            zIndex: -1,
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