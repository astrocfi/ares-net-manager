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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { apiService } from '../services/apiService';
import { tCardService } from '../services/tCardService';
import TCardRack from '../components/TCardRack';
import AddIcon from '@mui/icons-material/Add';

const EventLive = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [view, setView] = useState('tcard');
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

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
      console.log('Fetched event data:', response.data);
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
      setView(newView);
    }
  };

  const handleAddColumn = async () => {
    try {
      setLoading(true);
      await tCardService.createColumn(eventId, newColumnTitle, event?.columns?.length || 0);
      setNewColumnDialogOpen(false);
      setNewColumnTitle('');
      await fetchEvent(); // Refresh the event data to get the new column
    } catch (error) {
      console.error('Error adding column:', error);
      showError('Failed to add column: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>Error: {error}</Typography>
        <Button onClick={handleBack}>Back to Events</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        flex: '0 0 auto',
        py: 2,
        px: 2
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view selection"
            size="large"
          >
            <ToggleButton value="tcard" aria-label="T Card Rack">
              T Card Rack
            </ToggleButton>
            <ToggleButton value="network" aria-label="Network Status">
              Network Status
            </ToggleButton>
          </ToggleButtonGroup>
          {view === 'tcard' && (
            <Tooltip title="Add new column">
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setNewColumnDialogOpen(true)}
                size="small"
              >
                Add Column
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TCardRack
          eventId={eventId}
          columns={event?.columns || []}
          onColumnsChange={fetchEvent}
        />
      </Box>

      <Dialog open={newColumnDialogOpen} onClose={() => setNewColumnDialogOpen(false)}>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Title"
            fullWidth
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddColumn} variant="contained" disabled={!newColumnTitle.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default EventLive;