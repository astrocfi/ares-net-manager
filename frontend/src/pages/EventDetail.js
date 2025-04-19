import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiService } from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import EventEditDialog from '../components/EventEditDialog';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [editEvent, setEditEvent] = useState({
    name: '',
    location: '',
    start_time: new Date(),
    end_time: new Date(),
    description: '',
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/events/${eventId}/`);
      console.log('API Response:', response); // Debug log

      // Ensure we have valid data before setting state
      if (!response?.data) {
        throw new Error('No data received from API');
      }

      const eventData = response.data;
      setEvent(eventData);

      // Parse dates and ensure they're valid
      const startTime = eventData.start_time ? new Date(eventData.start_time) : null;
      const endTime = eventData.end_time ? new Date(eventData.end_time) : null;

      console.log('Parsed dates:', { startTime, endTime }); // Debug log

      setEditEvent({
        name: eventData.name || '',
        location: eventData.location || '',
        start_time: startTime || new Date(),
        end_time: endTime || new Date(),
        description: eventData.description || '',
      });
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
    navigate('/events');
  };

  const handleEditOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleDeleteOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleArchiveOpen = () => {
    setArchiveDialogOpen(true);
  };

  const handleArchiveClose = () => {
    setArchiveDialogOpen(false);
  };

  const handleEditChange = (field) => (event) => {
    setEditEvent({
      ...editEvent,
      [field]: event.target.value,
    });
  };

  const handleDateChange = (field) => (date) => {
    setEditEvent({
      ...editEvent,
      [field]: date,
    });
  };

  const handleEditSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Check if editEvent exists and has the required properties
    if (!editEvent || !editEvent.name || !editEvent.location || !editEvent.start_time || !editEvent.end_time) {
      showError('All fields are required');
      return;
    }

    // Trim the strings and check if they're empty
    const trimmedName = editEvent.name.trim();
    const trimmedLocation = editEvent.location.trim();
    if (!trimmedName || !trimmedLocation) {
      showError('Event name and location are required');
      return;
    }

    const eventData = {
      name: trimmedName,
      location: trimmedLocation,
      description: editEvent.description || '',
      start_time: editEvent.start_time,
      end_time: editEvent.end_time
    };

    try {
      await apiService.put(`/events/${eventId}/`, eventData);
      fetchEvent();
      handleEditClose();
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Failed to update event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.delete(`/events/${eventId}/`);
      handleDeleteClose();
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleArchive = async () => {
    try {
      if (event.is_active) {
        await apiService.post(`/events/${eventId}/deactivate/`);
      } else {
        await apiService.post(`/events/${eventId}/activate/`);
      }
      fetchEvent();
      handleArchiveClose();
    } catch (error) {
      console.error('Error archiving/unarchiving event:', error);
      showError('Failed to update event status: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleArchiveClick = () => {
    if (event.is_active) {
      handleArchiveOpen();
    } else {
      handleArchive();
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{event.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit event">
              <IconButton onClick={handleEditOpen} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={event.is_active ? "Archive event" : "Restore event"}>
              <IconButton onClick={handleArchiveClick} color={event.is_active ? "error" : "primary"}>
                {event.is_active ? <ArchiveIcon /> : <UnarchiveIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete event">
              <IconButton onClick={handleDeleteOpen} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Event Details</Typography>
                <Chip
                  label={event.is_active ? "Active" : "Archived"}
                  color={event.is_active ? "success" : "default"}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Location</Typography>
              <Typography variant="body1">{event.location || 'No location provided'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Status</Typography>
              <Typography variant="body1">{event.is_active ? "Active" : "Archived"}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Start Time</Typography>
              <Typography variant="body1">
                {event.start_time ? new Date(event.start_time).toLocaleString() : 'No start time provided'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">End Time</Typography>
              <Typography variant="body1">
                {event.end_time ? new Date(event.end_time).toLocaleString() : 'No end time provided'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" color="text.secondary">Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.description || 'No description provided'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Edit Dialog */}
      <EventEditDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        event={editEvent}
        setEvent={setEditEvent}
        formErrors={editFormErrors}
        setFormErrors={setEditFormErrors}
        title="Edit Event"
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onClose={handleArchiveClose}>
        <DialogTitle>Archive Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive the event "{event.name}"? Archived events can be restored later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleArchiveClose}>Cancel</Button>
          <Button onClick={handleArchive} color="error">
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetail;