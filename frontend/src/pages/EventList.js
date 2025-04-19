import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  DialogContentText,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import { apiService } from '../services/apiService';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import EventEditDialog from '../components/EventEditDialog';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    location: '',
    start_time: new Date(),
    end_time: new Date(),
    description: '',
  });
  const [editEvent, setEditEvent] = useState({
    name: '',
    location: '',
    start_time: new Date(),
    end_time: new Date(),
    description: '',
  });
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    console.log('EventList component mounted');
    fetchEvents();
  }, [showArchived]);

  const fetchEvents = async () => {
    console.log('Attempting to fetch events...');
    try {
      const response = await apiService.get(`/events/?include_archived=${showArchived}`);
      console.log('Events fetched successfully:', response);
      const eventList = Array.isArray(response.data) ? response.data : [];
      // Sort events by start time in descending order (most recent first)
      const sortedEvents = eventList.sort((a, b) =>
        new Date(b.start_time) - new Date(a.start_time)
      );
      console.log('Setting events state with:', sortedEvents);
      setEvents(sortedEvents);
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
      setEvents([]);
    }
  };

  const handleOpen = () => {
    console.log('Opening create event dialog');
    setOpen(true);
  };

  const handleClose = () => {
    console.log('Closing create event dialog');
    setOpen(false);
  };

  const handleEditOpen = (event) => {
    setSelectedEvent(event);
    setEditEvent({
      name: event.name,
      location: event.location,
      start_time: new Date(event.start_time),
      end_time: new Date(event.end_time),
      description: event.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteOpen = (event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleArchiveOpen = (event) => {
    setSelectedEvent(event);
    setArchiveDialogOpen(true);
  };

  const handleArchiveClose = () => {
    setArchiveDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleChange = (field) => (event) => {
    setNewEvent({ ...newEvent, [field]: event.target.value });
  };

  const handleEditChange = (field) => (event) => {
    setEditEvent({ ...editEvent, [field]: event.target.value });
  };

  const handleDateChange = (field) => (date) => {
    if (date && date instanceof Date && !isNaN(date)) {
      setNewEvent({ ...newEvent, [field]: date });
      setError(null);
    } else {
      console.error('Invalid date received:', date);
      setError(`Invalid ${field.replace('_', ' ')}`);
    }
  };

  const handleEditDateChange = (field) => (date) => {
    if (date && date instanceof Date && !isNaN(date)) {
      setEditEvent({ ...editEvent, [field]: date });
      setError(null);
    } else {
      console.error('Invalid date received:', date);
      setError(`Invalid ${field.replace('_', ' ')}`);
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

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    // Validate required fields
    if (!newEvent.name || !newEvent.name.trim() || !newEvent.location || !newEvent.location.trim() || !newEvent.start_time || !newEvent.end_time) {
      showError('All fields are required');
      return;
    }

    const eventData = {
      name: newEvent.name.trim(),
      location: newEvent.location.trim(),
      description: newEvent.description,
      start_time: newEvent.start_time,
      end_time: newEvent.end_time
    };

    // Ensure dates are valid
    if (!(newEvent.start_time instanceof Date) || isNaN(newEvent.start_time)) {
      showError('Invalid start time');
      return;
    }
    if (!(newEvent.end_time instanceof Date) || isNaN(newEvent.end_time)) {
      showError('Invalid end time');
      return;
    }

    // Ensure end time is after start time
    if (newEvent.end_time <= newEvent.start_time) {
      showError('End time must be after start time');
      return;
    }

    console.log('Submitting new event with data:', eventData);
    try {
      const response = await apiService.post('/events/', eventData);
      console.log('Event created successfully:', response);
      fetchEvents();
      handleClose();
      setNewEvent({
        name: '',
        location: '',
        start_time: new Date(),
        end_time: new Date(),
        description: '',
      });
      setError(null);
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Failed to create event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleEditSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!selectedEvent) return;

    // Validate required fields
    if (!editEvent.name || !editEvent.name.trim() || !editEvent.location || !editEvent.location.trim() || !editEvent.start_time || !editEvent.end_time) {
      showError('All fields are required');
      return;
    }

    const eventData = {
      name: editEvent.name.trim(),
      location: editEvent.location.trim(),
      description: editEvent.description,
      start_time: editEvent.start_time,
      end_time: editEvent.end_time
    };

    // Ensure dates are valid
    if (!(editEvent.start_time instanceof Date) || isNaN(editEvent.start_time)) {
      showError('Invalid start time');
      return;
    }
    if (!(editEvent.end_time instanceof Date) || isNaN(editEvent.end_time)) {
      showError('Invalid end time');
      return;
    }

    // Ensure end time is after start time
    if (editEvent.end_time <= editEvent.start_time) {
      showError('End time must be after start time');
      return;
    }

    try {
      await apiService.put(`/events/${selectedEvent.id}/`, eventData);
      fetchEvents();
      handleEditClose();
      setError(null);
    } catch (error) {
      console.error('Error updating event:', error);
      showError('Failed to update event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      await apiService.delete(`/events/${selectedEvent.id}/`);
      fetchEvents();
      handleDeleteClose();
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleArchive = async () => {
    if (!selectedEvent) return;

    try {
      await apiService.post(`/events/${selectedEvent.id}/deactivate/`);
      fetchEvents();
      handleArchiveClose();
    } catch (error) {
      console.error('Error archiving event:', error);
      showError('Failed to archive event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  const handleRestore = async (event) => {
    try {
      await apiService.post(`/events/${event.id}/activate/`);
      fetchEvents();
    } catch (error) {
      console.error('Error restoring event:', error);
      showError('Failed to restore event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  return (
    <Container sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Events</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            }
            label="Include Archived Events"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              minWidth: '150px',
              height: '40px',
              fontSize: '1rem'
            }}
          >
            Create Event
          </Button>
        </Box>
      </Box>

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

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {events && events.map((event) => (
            <ListItem key={event.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Tooltip title="Activate event for live operations">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate(`/events/${event.id}/live`)}
                    sx={{ mr: 1 }}
                  >
                    ACTIVATE
                  </Button>
                </Tooltip>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {event.name}
                      {!event.is_active && (
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            color: 'text.secondary'
                          }}
                        >
                          Archived
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={`${event.location} - ${format(new Date(event.start_time), 'PPpp')} to ${format(new Date(event.end_time), 'PPpp')}`}
                  sx={{ flex: 1 }}
                />
                <Tooltip title="View event details">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(`/events/${event.id}`)}
                    sx={{ mr: 1, minWidth: '80px' }}
                  >
                    DETAILS
                  </Button>
                </Tooltip>
                <Tooltip title="Edit event">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditOpen(event)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {!event.is_active ? (
                  <Tooltip title="Restore event">
                    <IconButton
                      color="primary"
                      onClick={() => handleRestore(event)}
                      sx={{ mr: 1 }}
                    >
                      <UnarchiveIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Archive event">
                    <IconButton
                      color="error"
                      onClick={() => handleArchiveOpen(event)}
                      sx={{ mr: 1 }}
                    >
                      <ArchiveIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Create Event Dialog */}
      <EventEditDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        event={newEvent}
        setEvent={setNewEvent}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        title="Add New Event"
      />

      {/* Edit Event Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{selectedEvent?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={handleArchiveClose}>
        <DialogTitle>Archive Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive the event "{selectedEvent?.name}"? Archived events can be restored later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleArchiveClose}>Cancel</Button>
          <Button onClick={handleArchive} color="error">
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventList;