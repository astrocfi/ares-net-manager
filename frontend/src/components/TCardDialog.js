import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Typography,
} from '@mui/material';
import { operatorService } from '../services/operatorService';

const TCardDialog = ({ open, onClose, onSubmit, card: initialCard }) => {
  const [operators, setOperators] = useState([]);
  const [card, setCard] = useState(initialCard || {});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchOperators();
      if (initialCard) {
        setCard(initialCard);
      } else {
        setCard({});
      }
    }
  }, [open, initialCard]);

  const fetchOperators = async () => {
    try {
      const data = await operatorService.getOperators();
      setOperators(data);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError('Failed to fetch operators');
    }
  };

  const handleSubmit = async () => {
    if (!card.operator_id) {
      setError('Please select an operator');
      return;
    }

    try {
      await onSubmit(card);
      onClose(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOperatorChange = (event) => {
    const selectedOperator = operators.find(op => op.id === event.target.value);
    setCard(prev => ({
      ...prev,
      operator_id: event.target.value,
      operator: selectedOperator
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{card.id ? 'Edit T Card' : 'Add T Card'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Autocomplete
            options={operators}
            getOptionLabel={(option) => `${option.call_sign} - ${option.name}`}
            value={card.operator}
            onChange={(event, newValue) => {
              setCard(prev => ({
                ...prev,
                operator_id: newValue?.id,
                operator: newValue
              }));
              setError('');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Operator"
                error={!!error}
                helperText={error}
                required
              />
            )}
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={4}
            value={card.notes || ''}
            onChange={(e) => setCard(prev => ({ ...prev, notes: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {card.id ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TCardDialog;