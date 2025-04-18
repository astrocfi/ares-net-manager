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
  const [columns, setColumns] = useState([
    { id: 'resource', title: 'Resource' },
    { id: 'staging', title: 'Staging' },
    { id: 'command', title: 'Command' },
    { id: 'message', title: 'Message' },
    { id: 'shadow', title: 'Shadow' }
  ]);

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
      setView(newView);
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn = {
        id: `column-${Date.now()}`,
        title: newColumnTitle.trim(),
      };
      setColumns(prevColumns => [...prevColumns, newColumn]);
      setNewColumnDialogOpen(false);
      setNewColumnTitle('');
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
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
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

      <Box sx={{
        flex: 1,
        overflow: 'hidden'
      }}>
        {view === 'tcard' ? (
          <TCardRack
            columns={columns}
            setColumns={setColumns}
          />
        ) : (
          <Box>
            {/* Network Status view will be implemented later */}
            Network Status View
          </Box>
        )}
      </Box>

      <Dialog
        open={newColumnDialogOpen}
        onClose={() => {
          setNewColumnDialogOpen(false);
          setNewColumnTitle('');
        }}
      >
        <DialogTitle>Add New Column</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Title"
            fullWidth
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewColumnDialogOpen(false);
            setNewColumnTitle('');
          }}>Cancel</Button>
          <Button onClick={handleAddColumn} variant="contained">Add</Button>
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