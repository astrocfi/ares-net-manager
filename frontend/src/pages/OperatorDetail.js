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
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { apiService } from '../services/apiService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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

const OperatorDetail = () => {
  const { operatorId } = useParams();
  const navigate = useNavigate();
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    if (operatorId) {
      fetchOperator();
    }
  }, [operatorId]);

  const fetchOperator = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/operators/${operatorId}/`);
      setOperator(response.data);
      setEditOperator({
        call_sign: response.data.call_sign,
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        address: response.data.address || '',
        phone_primary: response.data.phone_primary || '',
        phone_secondary: response.data.phone_secondary || '',
        email_primary: response.data.email_primary || '',
        email_secondary: response.data.email_secondary || '',
        notes: response.data.notes || '',
        credentials: response.data.credentials || [],
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching operator:', error);
      showError('Failed to fetch operator details');
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

  const handleEditOpen = () => {
    setEditDialogOpen(true);
    setEditFormErrors({});
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditFormErrors({});
  };

  const handleDeleteOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleEditSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    try {
      await apiService.put(`/operators/${operatorId}/`, editOperator);
      fetchOperator();
      handleEditClose();
    } catch (error) {
      console.error('Error updating operator:', error);
      showError('Failed to update operator: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.delete(`/operators/${operatorId}/`);
      handleDeleteClose();
      navigate('/operators');
    } catch (error) {
      console.error('Error deleting operator:', error);
      showError('Failed to delete operator: ' + (error.response?.data?.detail || error.message));
    }
  };

  const isEditFormValid = () => {
    return editOperator?.call_sign?.trim() &&
           (!editOperator?.phone_primary || isValidPhoneNumber(editOperator.phone_primary)) &&
           (!editOperator?.phone_secondary || isValidPhoneNumber(editOperator.phone_secondary)) &&
           (!editOperator?.email_primary || isValidEmail(editOperator.email_primary)) &&
           (!editOperator?.email_secondary || isValidEmail(editOperator.email_secondary));
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

  if (!operator) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error">Operator not found</Typography>
          <Button onClick={() => navigate('/operators')} sx={{ mt: 2 }}>Back to Operators</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{operator.call_sign}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit operator">
              <IconButton onClick={handleEditOpen} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete operator">
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
                <Typography variant="h6">Operator Details</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Name</Typography>
              <Typography variant="body1">{`${operator.first_name || ''} ${operator.last_name || ''}`.trim() || 'No name'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Credentials</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {operator.credentials?.map((credential) => (
                  <Chip key={credential} label={credential} />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Primary Phone</Typography>
              <Typography variant="body1">{operator.phone_primary || 'Not provided'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Secondary Phone</Typography>
              <Typography variant="body1">{operator.phone_secondary || 'Not provided'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Primary Email</Typography>
              <Typography variant="body1">{operator.email_primary || 'Not provided'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="text.secondary">Secondary Email</Typography>
              <Typography variant="body1">{operator.email_secondary || 'Not provided'}</Typography>
            </Grid>

            {operator.address && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">Address</Typography>
                <Typography variant="body1">{operator.address}</Typography>
              </Grid>
            )}

            {operator.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="text.secondary">Notes</Typography>
                <Typography variant="body1">{operator.notes}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Operator</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete operator "{operator.call_sign}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
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

export default OperatorDetail;