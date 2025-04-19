import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const EventEditDialog = ({
  open,
  onClose,
  onSubmit,
  event,
  setEvent,
  formErrors,
  setFormErrors,
  title = 'Edit Event',
}) => {
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setEvent({ ...event, [field]: value });
    validateForm({ ...event, [field]: value });
  };

  const handleDateChange = (field) => (date) => {
    setEvent({ ...event, [field]: date });
    validateForm({ ...event, [field]: date });
  };

  const validateForm = (event) => {
    const errors = {};
    if (!event.name.trim()) {
      errors.name = 'Event name is required';
    }
    if (!event.location.trim()) {
      errors.location = 'Location is required';
    }
    if (!event.start_time) {
      errors.start_time = 'Start time is required';
    }
    if (!event.end_time) {
      errors.end_time = 'End time is required';
    }
    if (event.start_time && event.end_time && new Date(event.start_time) > new Date(event.end_time)) {
      errors.end_time = 'End time must be after start time';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    return event.name.trim() && event.location.trim() && event.start_time && event.end_time &&
           new Date(event.start_time) <= new Date(event.end_time);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Grid container spacing={0.25}>
            <Grid item xs={12}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Event Name"
                  fullWidth
                  value={event.name}
                  onChange={handleChange('name')}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  margin="dense"
                  label="Location"
                  fullWidth
                  value={event.location}
                  onChange={handleChange('location')}
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ height: '120px', mb: 3 }}>
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={event.description}
                  onChange={handleChange('description')}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: '80px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Time"
                    value={event.start_time}
                    onChange={handleDateChange('start_time')}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: '80px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="End Time"
                    value={event.end_time}
                    onChange={handleDateChange('end_time')}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" disabled={!isFormValid()}>
            {title === 'Add New Event' ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventEditDialog;