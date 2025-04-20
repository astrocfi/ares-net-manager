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
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

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

const OperatorForm = ({
  open,
  onClose,
  onSubmit,
  title,
  operator,
  setOperator,
  formErrors,
  setFormErrors,
  isFormValid,
}) => {
  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'call_sign') {
      value = value.toUpperCase().replace(/[^A-Z0-9/]/g, '');
    } else if (field === 'phone_primary' || field === 'phone_secondary') {
      value = formatPhoneNumber(value);
    }
    setOperator({ ...operator, [field]: value });
    validateForm({ ...operator, [field]: value });
  };

  const handleCredentialChange = (credential, isRadio) => (event) => {
    if (isRadio) {
      const group = CREDENTIAL_GROUPS.find(g => g.options.includes(credential));
      if (!group) return;

      let newCredentials = operator.credentials.filter(c => !group.options.includes(c));
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

      setOperator({ ...operator, credentials: newCredentials });
    } else {
      const newCredentials = event.target.checked
        ? [...operator.credentials, credential]
        : operator.credentials.filter(c => c !== credential);
      setOperator({ ...operator, credentials: newCredentials });
    }
  };

  const validateForm = (operator) => {
    const errors = {};
    if (!operator.call_sign?.trim()) {
      errors.call_sign = 'Call sign is required';
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
                  label="Call Sign"
                  fullWidth
                  value={operator.call_sign}
                  onChange={handleChange('call_sign')}
                  required
                  error={!!formErrors.call_sign}
                  helperText={formErrors.call_sign}
                  inputProps={{ maxLength: 10 }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  margin="dense"
                  label="First Name"
                  fullWidth
                  value={operator.first_name}
                  onChange={handleChange('first_name')}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  margin="dense"
                  label="Last Name"
                  fullWidth
                  value={operator.last_name}
                  onChange={handleChange('last_name')}
                  inputProps={{ maxLength: 50 }}
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
                  value={operator.address}
                  onChange={handleChange('address')}
                  inputProps={{ maxLength: 254 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  margin="dense"
                  label="Primary Phone"
                  fullWidth
                  value={operator.phone_primary}
                  onChange={handleChange('phone_primary')}
                  placeholder="(555) 555-5555"
                  error={!!formErrors.phone_primary}
                  helperText={formErrors.phone_primary}
                  inputProps={{ maxLength: 20 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: '80px' }}>
                <TextField
                  margin="dense"
                  label="Secondary Phone"
                  fullWidth
                  value={operator.phone_secondary}
                  onChange={handleChange('phone_secondary')}
                  placeholder="(555) 555-5555"
                  error={!!formErrors.phone_secondary}
                  helperText={formErrors.phone_secondary}
                  inputProps={{ maxLength: 20 }}
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
                  value={operator.email_primary}
                  onChange={handleChange('email_primary')}
                  error={!!formErrors.email_primary}
                  helperText={formErrors.email_primary}
                  inputProps={{ maxLength: 70 }}
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
                  value={operator.email_secondary}
                  onChange={handleChange('email_secondary')}
                  error={!!formErrors.email_secondary}
                  helperText={formErrors.email_secondary}
                  inputProps={{ maxLength: 70 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Credentials
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0 }}>
                {CREDENTIAL_GROUPS.map((group) => (
                  <Paper
                    key={group.name}
                    elevation={0}
                    variant="outlined"
                    sx={{
                      p: '4px 0 4px 4px',
                      display: 'inline-block',
                      minWidth: 'auto',
                      width: group.name === 'UL/SHARES' ? '100px' : '80px',
                      '&:last-child': {
                        p: '4px'
                      }
                    }}
                  >
                    <FormGroup sx={{ '& .MuiFormControlLabel-root': { margin: 0 } }}>
                      {group.options.map((credential) => (
                        <FormControlLabel
                          key={credential}
                          control={
                            <Checkbox
                              size="small"
                              checked={operator.credentials.includes(credential)}
                              onChange={handleCredentialChange(credential, group.isRadio)}
                              sx={{
                                py: 0.5,
                                '& .MuiSvgIcon-root': {
                                  fontSize: '1rem'
                                }
                              }}
                            />
                          }
                          label={credential}
                          sx={{
                            margin: 0,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.875rem',
                              padding: '2px 0',
                              minWidth: 'auto',
                              width: 'auto',
                              marginLeft: '4px'
                            },
                            '& .MuiCheckbox-root': {
                              padding: '2px'
                            }
                          }}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Notes"
                fullWidth
                multiline
                rows={4}
                value={operator.notes}
                onChange={handleChange('notes')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary" disabled={!isFormValid()}>
            {title === 'Add New Operator' ? 'Add' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OperatorForm;