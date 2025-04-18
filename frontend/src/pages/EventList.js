import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import { apiService } from '../services/apiService';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    location: '',
    start_time: new Date(),
    end_time: new Date(),
    description: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('EventList component mounted');
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    console.log('Attempting to fetch events...');
    try {
      const response = await apiService.get('/events/');
      console.log('Events fetched successfully:', response);
      const eventList = Array.isArray(response.data) ? response.data : [];
      console.log('Setting events state with:', eventList);
      setEvents(eventList);
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

  const handleChange = (field) => (event) => {
    setNewEvent({ ...newEvent, [field]: event.target.value });
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!newEvent.name || !newEvent.location || !newEvent.start_time || !newEvent.end_time) {
      setError('All fields are required');
      return;
    }

    // Ensure dates are valid
    if (!(newEvent.start_time instanceof Date) || isNaN(newEvent.start_time)) {
      setError('Invalid start time');
      return;
    }
    if (!(newEvent.end_time instanceof Date) || isNaN(newEvent.end_time)) {
      setError('Invalid end time');
      return;
    }

    // Ensure end time is after start time
    if (newEvent.end_time <= newEvent.start_time) {
      setError('End time must be after start time');
      return;
    }

    const eventData = {
      name: newEvent.name,
      location: newEvent.location,
      description: newEvent.description,
      start_time: newEvent.start_time.toISOString(),
      end_time: newEvent.end_time.toISOString()
    };
    console.log('Submitting new event with data:', eventData);
    console.log('Start time:', newEvent.start_time);
    console.log('End time:', newEvent.end_time);
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
      console.error('Error response:', error.response?.data);
      setError('Failed to create event: ' + (error.response?.data?.detail || error.message || 'Unknown error'));
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Events</Typography>
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
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <List>
        {events && events.map((event) => (
          <ListItem key={event.id}>
            <ListItemText
              primary={event.name}
              secondary={`${event.location} - ${format(new Date(event.start_time), 'PPpp')} to ${format(new Date(event.end_time), 'PPpp')}`}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            value={newEvent.name}
            onChange={handleChange('name')}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newEvent.location}
            onChange={handleChange('location')}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newEvent.description}
            onChange={handleChange('description')}
          />
          <DateTimePicker
            label="Start Time"
            value={newEvent.start_time}
            onChange={handleDateChange('start_time')}
            sx={{ mt: 2, width: '100%' }}
          />
          <DateTimePicker
            label="End Time"
            value={newEvent.end_time}
            onChange={handleDateChange('end_time')}
            sx={{ mt: 2, width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventList;