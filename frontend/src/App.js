import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import TCardRack from './components/TCardRack';
import NetworkDisplay from './components/NetworkDisplay';
import Layout from './components/Layout';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.2rem',
          padding: '12px 24px',
        },
      },
    },
  },
});

function App() {
  console.log('App component rendering');
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<EventList />} />
              <Route path="/events/:eventId" element={<EventDetail />}>
                <Route path="t-card-rack" element={<TCardRack />} />
                <Route path="network/:networkId" element={<NetworkDisplay />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
