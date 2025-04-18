import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiService } from '../services/apiService';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    name: '',
    location: '',
    health_welfare_time: 30,
  });

  // Fetch events
  const fetchEvents = async () => {
    try {
      const activeEvents = await apiService.get('/events/');
      let allEvents = activeEvents;

      if (showInactive) {
        const inactiveEvents = await apiService.get('/events/inactive/');
        allEvents = [...activeEvents, ...inactiveEvents];
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [showInactive]);

  // Handle event selection
  const handleEventSelect = (event) => {
    navigate(`/events/${event.id}`);
  };

  // Handle new event creation
  const handleCreateEvent = async () => {
    try {
      await apiService.post('/events/', newEventData);
      setNewEventDialogOpen(false);
      setNewEventData({ name: '', location: '', health_welfare_time: 30 });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await apiService.post(`/events/${selectedEvent.id}/deactivate/`);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          ARES Net Manager
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show Inactive Events"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Add New Event Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => setNewEventDialogOpen(true)}
          >
            <CardContent sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <AddIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6">Create New Event</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Event Cards */}
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                opacity: event.is_active ? 1 : 0.6,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <CardContent
                sx={{ flex: 1 }}
                onClick={() => handleEventSelect(event)}
              >
                <Typography variant="h6" component="h2">
                  {event.name}
                </Typography>
                <Typography color="textSecondary">
                  {event.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Created: {new Date(event.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setDeleteDialogOpen(true);
                }}
                sx={{ alignSelf: 'flex-end', m: 1 }}
              >
                Delete
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* New Event Dialog */}
      <Dialog open={newEventDialogOpen} onClose={() => setNewEventDialogOpen(false)}>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            value={newEventData.name}
            onChange={(e) => setNewEventData({ ...newEventData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={newEventData.location}
            onChange={(e) => setNewEventData({ ...newEventData, location: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Health & Welfare Check Time (minutes)"
            type="number"
            fullWidth
            value={newEventData.health_welfare_time}
            onChange={(e) => setNewEventData({ ...newEventData, health_welfare_time: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{selectedEvent?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventList;