import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { tCardService } from '../services/tCardService';

const Column = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minWidth: '250px',
  maxHeight: '100%',
  userSelect: 'none',
  touchAction: 'none'
}));

const ColumnHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

function SortableColumn({ column, onEdit, onDelete, onAddCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    touchAction: 'none'
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit clicked for column:', column);
    onEdit(column);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete clicked for column:', column.id);
    onDelete(column.id);
  };

  const handleAddCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add card clicked for column:', column.id);
    onAddCard(column.id);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Column elevation={3}>
        <ColumnHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Box {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {column.title}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Tooltip title="Rename column">
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{ mr: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete column">
              <IconButton
                size="small"
                onClick={handleDeleteClick}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ColumnHeader>
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0
        }}>
          {/* Cards will be rendered here */}
        </Box>
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleAddCardClick}
          >
            Add Card
          </Button>
        </Box>
      </Column>
    </div>
  );
}

const TCardRack = ({ eventId, columns, onColumnsChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [editColumnTitle, setEditColumnTitle] = useState('');

  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [editCardData, setEditCardData] = useState({
    callSign: '',
    name: '',
    credentials: [],
    notes: ''
  });

  const credentials = ['C4', 'F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'MAC', 'ERO'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      setLoading(true);

      // Find the indices of the dragged and target columns
      const oldIndex = columns.findIndex(col => col.id === active.id);
      const newIndex = columns.findIndex(col => col.id === over.id);

      // Create a new array with the reordered columns
      const reorderedColumns = arrayMove(columns, oldIndex, newIndex);

      // Update positions for all columns in the new order
      await tCardService.reorderColumns(eventId, reorderedColumns);

      // Refresh the data
      onColumnsChange();
    } catch (err) {
      setError(err.message);
      console.error('Error reordering columns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = async (column) => {
    setEditingColumn(column);
    setEditColumnTitle(column.title);
    setEditColumnDialogOpen(true);
  };

  const handleSaveColumn = async () => {
    if (!editingColumn || !editColumnTitle.trim()) return;

    try {
      setLoading(true);
      await tCardService.updateColumn(
        editingColumn.id,
        editColumnTitle.trim(),
        editingColumn.position,
        eventId
      );
      setEditColumnDialogOpen(false);
      onColumnsChange();
    } catch (err) {
      setError(err.message);
      console.error('Error updating column:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      setLoading(true);
      await tCardService.deleteColumn(columnId);
      onColumnsChange();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting column:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = (columnId) => {
    console.log('handleAddCard called with columnId:', columnId);
    console.log('Current columns state:', columns);
    setEditingCard({ columnId });
    setEditCardData({
      callSign: '',
      name: '',
      credentials: [],
      notes: ''
    });
    setEditCardDialogOpen(true);
  };

  const handleSaveCard = () => {
    console.log('handleSaveCard called');
    console.log('Current editingCard:', editingCard);
    console.log('Current editCardData:', editCardData);

    if (editCardData.callSign.trim()) {
      const newCard = {
        id: `card-${Date.now()}`,
        callSign: editCardData.callSign.trim(),
        name: editCardData.name.trim(),
        credentials: editCardData.credentials,
        notes: editCardData.notes.trim(),
        checkInTime: new Date().toISOString(),
        lastHeardFrom: new Date().toISOString()
      };

      console.log('New card to be added:', newCard);

      const updatedColumns = columns.map(column => {
        if (column.id === editingCard.columnId) {
          console.log('Found matching column:', column);
          return {
            ...column,
            cards: [...(column.cards || []), newCard]
          };
        }
        return column;
      });

      console.log('Updated columns:', updatedColumns);
      onColumnsChange();
      setEditCardDialogOpen(false);
      setEditingCard(null);
      setEditCardData({
        callSign: '',
        name: '',
        credentials: [],
        notes: ''
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          p: 2,
          gap: 2,
          minHeight: '100%'
        }}
      >
        <SortableContext
          items={columns.map(column => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column, index) => (
            <SortableColumn
              key={column.id}
              column={column}
              index={index}
              onEdit={handleEditColumn}
              onDelete={handleDeleteColumn}
              onAddCard={handleAddCard}
            />
          ))}
        </SortableContext>
      </Box>

      {/* Edit Column Dialog */}
      <Dialog open={editColumnDialogOpen} onClose={() => setEditColumnDialogOpen(false)}>
        <DialogTitle>Rename Column</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Title"
            fullWidth
            value={editColumnTitle}
            onChange={(e) => setEditColumnTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveColumn()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveColumn} variant="contained" disabled={!editColumnTitle.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog
        open={editCardDialogOpen}
        onClose={() => {
          console.log('Closing card dialog');
          setEditCardDialogOpen(false);
        }}
      >
        <DialogTitle>Add Card</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Call Sign"
            fullWidth
            value={editCardData.callSign}
            onChange={(e) => {
              console.log('Call sign changed:', e.target.value);
              setEditCardData({ ...editCardData, callSign: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editCardData.name}
            onChange={(e) => {
              console.log('Name changed:', e.target.value);
              setEditCardData({ ...editCardData, name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Credentials"
            fullWidth
            value={editCardData.credentials.join(', ')}
            onChange={(e) => {
              console.log('Credentials changed:', e.target.value);
              setEditCardData({ ...editCardData, credentials: e.target.value.split(',').map(c => c.trim()) });
            }}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            value={editCardData.notes}
            onChange={(e) => {
              console.log('Notes changed:', e.target.value);
              setEditCardData({ ...editCardData, notes: e.target.value });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            console.log('Canceling card dialog');
            setEditCardDialogOpen(false);
          }}>Cancel</Button>
          <Button onClick={handleSaveCard} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
};

export default TCardRack;
