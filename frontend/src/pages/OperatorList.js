import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { apiService } from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const CREDENTIAL_OPTIONS = [
  'C4',
  'F3', 'F2', 'F1',
  'N3', 'N2', 'N1',
  'P3', 'P2', 'P1',
  'S3', 'S2', 'S1',
  'E3', 'E2',
  'MAC',
  'FIRE',
  'ERO',
  'UL',
  'SHARES',
];

// Format phone number as user types
const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Validate phone number
const isValidPhoneNumber = (phone) => {
  if (!phone) return true; // Empty is valid (optional field)
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length === 10;
};

// Validate email address
const isValidEmail = (email) => {
  if (!email) return true; // Empty is valid (optional field)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const OperatorList = () => {
  const [operators, setOperators] = useState([]);
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [newOperator, setNewOperator] = useState({
    call_sign: '',
    name: '',
    address: '',
    phone_primary: '',
    phone_secondary: '',
    email_primary: '',
    email_secondary: '',
    notes: '',
    credentials: [],
  });
  const [editOperator, setEditOperator] = useState({
    call_sign: '',
    name: '',
    address: '',
    phone_primary: '',
    phone_secondary: '',
    email_primary: '',
    email_secondary: '',
    notes: '',
    credentials: [],
  });
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await apiService.get('/operators/');
      setOperators(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError('Failed to load operators');
    }
  };

  const validateForm = (operator, isEdit = false) => {
    const errors = {};
    if (!operator.call_sign.trim()) {
      errors.call_sign = 'Call sign is required';
    }
    if (!operator.name.trim()) {
      errors.name = 'Name is required';
    }
    if (operator.phone_primary && !isValidPhoneNumber(operator.phone_primary)) {
      errors.phone_primary = 'Phone number must have 10 digits';
    }
    if (operator.phone_secondary && !isValidPhoneNumber(operator.phone_secondary)) {
      errors.phone_secondary = 'Phone number must have 10 digits';
    }
    if (operator.email_primary && !isValidEmail(operator.email_primary)) {
      errors.email_primary = 'Invalid email address';
    }
    if (operator.email_secondary && !isValidEmail(operator.email_secondary)) {
      errors.email_secondary = 'Invalid email address';
    }
    if (isEdit) {
      setEditFormErrors(errors);
    } else {
      setFormErrors(errors);
    }
    return Object.keys(errors).length === 0;
  };

  const handleOpen = () => {
    setOpen(true);
    setFormErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setNewOperator({
      call_sign: '',
      name: '',
      address: '',
      phone_primary: '',
      phone_secondary: '',
      email_primary: '',
      email_secondary: '',
      notes: '',
      credentials: [],
    });
    setFormErrors({});
  };

  const handleEditOpen = (operator) => {
    setSelectedOperator(operator);
    setEditOperator({
      call_sign: operator.call_sign,
      name: operator.name,
      address: operator.address || '',
      phone_primary: operator.phone_primary || '',
      phone_secondary: operator.phone_secondary || '',
      email_primary: operator.email_primary || '',
      email_secondary: operator.email_secondary || '',
      notes: operator.notes || '',
      credentials: operator.credentials || [],
    });
    setEditDialogOpen(true);
    setEditFormErrors({});
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedOperator(null);
    setEditFormErrors({});
  };

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'call_sign') {
      value = value.toUpperCase();
    } else if (field === 'phone_primary' || field === 'phone_secondary') {
      value = formatPhoneNumber(value);
    }
    setNewOperator({ ...newOperator, [field]: value });
    validateForm({ ...newOperator, [field]: value });
  };

  const handleEditChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'call_sign') {
      value = value.toUpperCase();
    } else if (field === 'phone_primary' || field === 'phone_secondary') {
      value = formatPhoneNumber(value);
    }
    setEditOperator({ ...editOperator, [field]: value });
    validateForm({ ...editOperator, [field]: value }, true);
  };

  const handleCredentialChange = (credential) => (event) => {
    const newCredentials = event.target.checked
      ? [...newOperator.credentials, credential]
      : newOperator.credentials.filter(c => c !== credential);
    setNewOperator({ ...newOperator, credentials: newCredentials });
  };

  const handleEditCredentialChange = (credential) => (event) => {
    const newCredentials = event.target.checked
      ? [...editOperator.credentials, credential]
      : editOperator.credentials.filter(c => c !== credential);
    setEditOperator({ ...editOperator, credentials: newCredentials });
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
    if (!validateForm(newOperator)) {
      return;
    }

    try {
      await apiService.post('/operators/', newOperator);
      fetchOperators();
      handleClose();
    } catch (error) {
      console.error('Error creating operator:', error);
      showError('Failed to create operator: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!selectedOperator) return;
    if (!validateForm(editOperator, true)) {
      return;
    }

    try {
      await apiService.put(`/operators/${selectedOperator.id}/`, editOperator);
      fetchOperators();
      handleEditClose();
    } catch (error) {
      console.error('Error updating operator:', error);
      showError('Failed to update operator: ' + (error.response?.data?.detail || error.message));
    }
  };

  const isFormValid = () => {
    return newOperator.call_sign.trim() && newOperator.name.trim() &&
           (!newOperator.phone_primary || isValidPhoneNumber(newOperator.phone_primary)) &&
           (!newOperator.phone_secondary || isValidPhoneNumber(newOperator.phone_secondary)) &&
           (!newOperator.email_primary || isValidEmail(newOperator.email_primary)) &&
           (!newOperator.email_secondary || isValidEmail(newOperator.email_secondary));
  };

  const isEditFormValid = () => {
    return editOperator.call_sign.trim() && editOperator.name.trim() &&
           (!editOperator.phone_primary || isValidPhoneNumber(editOperator.phone_primary)) &&
           (!editOperator.phone_secondary || isValidPhoneNumber(editOperator.phone_secondary)) &&
           (!editOperator.email_primary || isValidEmail(editOperator.email_primary)) &&
           (!editOperator.email_secondary || isValidEmail(editOperator.email_secondary));
  };

  return (
    <Container sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Operators</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
        >
          Add Operator
        </Button>
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
        <List sx={{ '& .MuiListItem-root': { py: 0.25 } }}>
          {operators.map((operator, index) => (
            <ListItem
              key={operator.id}
              sx={{
                backgroundColor: index % 2 === 0 ? 'background.paper' : 'grey.100',
                '&:hover': {
                  backgroundColor: 'grey.200'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Grid container spacing={0.5} alignItems="center">
                  <Grid item xs={1}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <Tooltip title="View details">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => navigate(`/operators/${operator.id}`)}
                          sx={{
                            mr: 0.5,
                            minWidth: '60px',
                            height: '24px',
                            fontSize: '0.75rem',
                            padding: '0 8px',
                            lineHeight: '1.2',
                            my: 'auto'
                          }}
                        >
                          DETAILS
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit operator">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditOpen(operator)}
                          sx={{ mr: 0.5, padding: '4px' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: '60px' }}>
                      {operator.call_sign}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body1" sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px',
                      lineHeight: 1.2
                    }}>
                      {operator.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {operator.credentials?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                      {operator.phone_primary}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2
                    }}>
                      {operator.email_primary}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Create Operator Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Operator</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={0.25}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Call Sign"
                    fullWidth
                    value={newOperator.call_sign}
                    onChange={handleChange('call_sign')}
                    required
                    error={!!formErrors.call_sign}
                    helperText={formErrors.call_sign}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={newOperator.name}
                    onChange={handleChange('name')}
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: '80px', mb: 3 }}>
                  <TextField
                    margin="dense"
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    value={newOperator.address}
                    onChange={handleChange('address')}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Primary Phone"
                    fullWidth
                    value={newOperator.phone_primary}
                    onChange={handleChange('phone_primary')}
                    placeholder="(555) 555-5555"
                    error={!!formErrors.phone_primary}
                    helperText={formErrors.phone_primary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Secondary Phone"
                    fullWidth
                    value={newOperator.phone_secondary}
                    onChange={handleChange('phone_secondary')}
                    placeholder="(555) 555-5555"
                    error={!!formErrors.phone_secondary}
                    helperText={formErrors.phone_secondary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Primary Email"
                    fullWidth
                    type="email"
                    value={newOperator.email_primary}
                    onChange={handleChange('email_primary')}
                    error={!!formErrors.email_primary}
                    helperText={formErrors.email_primary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Secondary Email"
                    fullWidth
                    type="email"
                    value={newOperator.email_secondary}
                    onChange={handleChange('email_secondary')}
                    error={!!formErrors.email_secondary}
                    helperText={formErrors.email_secondary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Credentials
                </Typography>
                <FormGroup row>
                  {CREDENTIAL_OPTIONS.map((credential) => (
                    <FormControlLabel
                      key={credential}
                      control={
                        <Checkbox
                          checked={newOperator.credentials.includes(credential)}
                          onChange={handleCredentialChange(credential)}
                        />
                      }
                      label={credential}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Notes"
                  fullWidth
                  multiline
                  rows={4}
                  value={newOperator.notes}
                  onChange={handleChange('notes')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" color="primary" disabled={!isFormValid()}>
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Operator Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Operator</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={0.25}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Call Sign"
                    fullWidth
                    value={editOperator.call_sign}
                    onChange={handleEditChange('call_sign')}
                    required
                    error={!!editFormErrors.call_sign}
                    helperText={editFormErrors.call_sign}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Name"
                    fullWidth
                    value={editOperator.name}
                    onChange={handleEditChange('name')}
                    required
                    error={!!editFormErrors.name}
                    helperText={editFormErrors.name}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ height: '80px', mb: 3 }}>
                  <TextField
                    margin="dense"
                    label="Address"
                    fullWidth
                    multiline
                    rows={2}
                    value={editOperator.address}
                    onChange={handleEditChange('address')}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Primary Phone"
                    fullWidth
                    value={editOperator.phone_primary}
                    onChange={handleEditChange('phone_primary')}
                    placeholder="(555) 555-5555"
                    error={!!editFormErrors.phone_primary}
                    helperText={editFormErrors.phone_primary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Secondary Phone"
                    fullWidth
                    value={editOperator.phone_secondary}
                    onChange={handleEditChange('phone_secondary')}
                    placeholder="(555) 555-5555"
                    error={!!editFormErrors.phone_secondary}
                    helperText={editFormErrors.phone_secondary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Primary Email"
                    fullWidth
                    type="email"
                    value={editOperator.email_primary}
                    onChange={handleEditChange('email_primary')}
                    error={!!editFormErrors.email_primary}
                    helperText={editFormErrors.email_primary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ height: '80px' }}>
                  <TextField
                    margin="dense"
                    label="Secondary Email"
                    fullWidth
                    type="email"
                    value={editOperator.email_secondary}
                    onChange={handleEditChange('email_secondary')}
                    error={!!editFormErrors.email_secondary}
                    helperText={editFormErrors.email_secondary}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Credentials
                </Typography>
                <FormGroup row>
                  {CREDENTIAL_OPTIONS.map((credential) => (
                    <FormControlLabel
                      key={credential}
                      control={
                        <Checkbox
                          checked={editOperator.credentials.includes(credential)}
                          onChange={handleEditCredentialChange(credential)}
                        />
                      }
                      label={credential}
                    />
                  ))}
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Notes"
                  fullWidth
                  multiline
                  rows={4}
                  value={editOperator.notes}
                  onChange={handleEditChange('notes')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" color="primary" disabled={!isEditFormValid()}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default OperatorList;