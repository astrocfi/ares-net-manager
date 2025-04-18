import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { apiService } from '../services/apiService';

const EventLive = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [currentView, setCurrentView] = useState('tcard');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/events/${eventId}/`);
      if (!response?.data) {
        throw new Error('No data received from API');
      }
      setEvent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      showError('Failed to fetch event details: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const showError = (message) => {
    setError(message);
    setErrorOpen(true);
  };

  const handleErrorClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorOpen(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setCurrentView(newView);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error">Event not found</Typography>
          <Button onClick={handleBack} sx={{ mt: 2 }}>Back to Events</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* View Selection Buttons */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={currentView}
            exclusive
            onChange={handleViewChange}
            aria-label="view selection"
          >
            <ToggleButton
              value="tcard"
              aria-label="T Card Rack"
              sx={{ px: 4, py: 1 }}
            >
              T Card Rack
            </ToggleButton>
            <ToggleButton
              value="network1"
              aria-label="Network #1"
              sx={{ px: 4, py: 1 }}
            >
              Network #1
            </ToggleButton>
            <ToggleButton
              value="network2"
              aria-label="Network #2"
              sx={{ px: 4, py: 1 }}
            >
              Network #2
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Content Area */}
        <Paper sx={{ p: 3, height: '600px' }}>
          {currentView === 'tcard' && (
            <Box>
              <Typography variant="h6" gutterBottom>T Card Rack</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">T Card Rack Component Coming Soon</Typography>
              </Box>
            </Box>
          )}

          {currentView === 'network1' && (
            <Box>
              <Typography variant="h6" gutterBottom>Network #1</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">Network Status Component Coming Soon</Typography>
              </Box>
            </Box>
          )}

          {currentView === 'network2' && (
            <Box>
              <Typography variant="h6" gutterBottom>Network #2</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography color="text.secondary">Network Status Component Coming Soon</Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventLive;