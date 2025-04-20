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
  FormControl,
  RadioGroup,
  Radio,
  Paper,
} from '@mui/material';
import { apiService } from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import OperatorForm from '../components/OperatorForm';

const CREDENTIAL_GROUPS = [
  {
    name: 'C4',
    options: ['C4'],
    isRadio: true
  },
  {
    name: 'F',
    options: ['F3', 'F2', 'F1'],
    isRadio: true
  },
  {
    name: 'N',
    options: ['N3', 'N2', 'N1'],
    isRadio: true
  },
  {
    name: 'P',
    options: ['P3', 'P2', 'P1'],
    isRadio: true
  },
  {
    name: 'S',
    options: ['S3', 'S2', 'S1'],
    isRadio: true
  },
  {
    name: 'E',
    options: ['E3', 'E2'],
    isRadio: true
  },
  {
    name: 'MAC/FIRE/ERO',
    options: ['MAC', 'FIRE', 'ERO'],
    isRadio: false
  },
  {
    name: 'UL/SHARES',
    options: ['UL', 'SHARES'],
    isRadio: false
  }
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
    first_name: '',
    last_name: '',
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
    first_name: '',
    last_name: '',
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

  const handleOpen = () => {
    setOpen(true);
    setFormErrors({});
  };

  const handleClose = () => {
    setOpen(false);
    setNewOperator({
      call_sign: '',
      first_name: '',
      last_name: '',
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
      first_name: operator.first_name || '',
      last_name: operator.last_name || '',
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
      value = value.toUpperCase().replace(/[^A-Z0-9/]/g, '');
    } else if (field === 'phone_primary' || field === 'phone_secondary') {
      value = formatPhoneNumber(value);
    }
    setNewOperator({ ...newOperator, [field]: value });
  };

  const handleEditChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'call_sign') {
      value = value.toUpperCase().replace(/[^A-Z0-9/]/g, '');
    } else if (field === 'phone_primary' || field === 'phone_secondary') {
      value = formatPhoneNumber(value);
    }
    setEditOperator({ ...editOperator, [field]: value });
  };

  const handleCredentialChange = (credential, isRadio) => (event) => {
    if (isRadio) {
      const group = CREDENTIAL_GROUPS.find(g => g.options.includes(credential));
      if (!group) return;

      let newCredentials = newOperator.credentials.filter(c => !group.options.includes(c));
      if (event.target.checked) {
        newCredentials.push(credential);
      }

      // If C4 is being checked, remove any F/N/P/S credentials
      if (credential === 'C4' && event.target.checked) {
        newCredentials = newCredentials.filter(c => !['F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'S3', 'S2', 'S1'].includes(c));
      }
      // If any F/N/P/S is being checked, remove C4
      else if (['F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'S3', 'S2', 'S1'].includes(credential) && event.target.checked) {
        newCredentials = newCredentials.filter(c => c !== 'C4');
      }

      setNewOperator({ ...newOperator, credentials: newCredentials });
    } else {
      const newCredentials = event.target.checked
        ? [...newOperator.credentials, credential]
        : newOperator.credentials.filter(c => c !== credential);
      setNewOperator({ ...newOperator, credentials: newCredentials });
    }
  };

  const handleEditCredentialChange = (credential, isRadio) => (event) => {
    if (isRadio) {
      const group = CREDENTIAL_GROUPS.find(g => g.options.includes(credential));
      if (!group) return;

      let newCredentials = editOperator.credentials.filter(c => !group.options.includes(c));
      if (event.target.checked) {
        newCredentials.push(credential);
      }

      // If C4 is being checked, remove any F/N/P/S credentials
      if (credential === 'C4' && event.target.checked) {
        newCredentials = newCredentials.filter(c => !['F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'S3', 'S2', 'S1'].includes(c));
      }
      // If any F/N/P/S is being checked, remove C4
      else if (['F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'S3', 'S2', 'S1'].includes(credential) && event.target.checked) {
        newCredentials = newCredentials.filter(c => c !== 'C4');
      }

      setEditOperator({ ...editOperator, credentials: newCredentials });
    } else {
      const newCredentials = event.target.checked
        ? [...editOperator.credentials, credential]
        : editOperator.credentials.filter(c => c !== credential);
      setEditOperator({ ...editOperator, credentials: newCredentials });
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
    return newOperator.call_sign.trim() &&
           (!newOperator.phone_primary || isValidPhoneNumber(newOperator.phone_primary)) &&
           (!newOperator.phone_secondary || isValidPhoneNumber(newOperator.phone_secondary)) &&
           (!newOperator.email_primary || isValidEmail(newOperator.email_primary)) &&
           (!newOperator.email_secondary || isValidEmail(newOperator.email_secondary));
  };

  const isEditFormValid = () => {
    return editOperator.call_sign.trim() &&
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
                  backgroundColor: 'grey.200',
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(`/operators/${operator.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Grid container spacing={0.5} alignItems="center">
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: '100px' }}>
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
                      {`${operator.first_name || ''} ${operator.last_name || ''}`.trim() || 'No name'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
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
                </Grid>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Create Operator Dialog */}
      <OperatorForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title="Add New Operator"
        operator={newOperator}
        setOperator={setNewOperator}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        isFormValid={isFormValid}
      />

      {/* Edit Operator Dialog */}
      <OperatorForm
        open={editDialogOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        title="Edit Operator"
        operator={editOperator}
        setOperator={setEditOperator}
        formErrors={editFormErrors}
        setFormErrors={setEditFormErrors}
        isFormValid={isEditFormValid}
      />
    </Container>
  );
};

export default OperatorList;