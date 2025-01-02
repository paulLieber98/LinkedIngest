import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/Navbar';

// Extend the theme to include custom colors and styles
const theme = extendTheme({
  colors: {
    cream: '#FFF8F0',
  },
  styles: {
    global: {
      body: {
        bg: 'cream',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App; 