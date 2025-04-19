import React, { useState, useEffect } from 'react';
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
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tCardService } from '../services/tCardService';
import TCardDialog from './TCardDialog';

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

function SortableColumn({ column, cards, onEditCard, onDeleteCard, onAddCard, onEditColumn, onDeleteColumn }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `column-${column?.id || ''}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEditColumn(column);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteColumn(column.id);
  };

  const handleAddCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddCard(column.id);
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 300,
        maxWidth: 300,
        mr: 2,
        flexShrink: 0
      }}
    >
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', alignItems: 'center', flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {column?.title || 'Untitled Column'}
          </Typography>
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
      </Box>
      <ColumnContent
        column={column}
        cards={cards}
        onEditCard={onEditCard}
        onDeleteCard={onDeleteCard}
      />
      <Box
        sx={{
          p: 1,
          borderTop: 1,
          borderColor: 'divider',
          '& button': {
            width: '100%'
          }
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddCard(column.id);
          }}
          size="small"
        >
          Add Card
        </Button>
      </Box>
    </Paper>
  );
}

function Card({ card, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `card-${card.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative',
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(card);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(card.id);
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 1,
        mb: 0.5,
        bgcolor: 'background.paper',
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 'unset',
        cursor: 'grab'
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {card.operator?.name ? `${card.operator.name.split(' ').reverse().join(', ')}` : ''}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {card.operator?.call_sign}
        </Typography>
        <IconButton size="small" onClick={handleEditClick} sx={{ p: 0.5 }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDeleteClick} sx={{ p: 0.5 }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}

function ColumnContent({ column, cards, onEditCard, onDeleteCard }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column?.id || ''}`,
  });

  const columnCards = cards
    .filter(card => card.column === column?.id)
    .sort((a, b) => a.position - b.position);

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        p: 1,
        backgroundColor: isOver ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
        transition: 'background-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5
      }}
    >
      <SortableContext
        items={columnCards.map(card => `card-${card.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {columnCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
          />
        ))}
      </SortableContext>
    </Box>
  );
}

const TCardRack = ({ eventId, columns, onColumnsChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState('');
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);

  const credentials = ['C4', 'F3', 'F2', 'F1', 'N3', 'N2', 'N1', 'P3', 'P2', 'P1', 'MAC', 'ERO'];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (eventId) {
      fetchCards();
    }
  }, [eventId]);

  const fetchCards = async () => {
    try {
      const response = await tCardService.getCards(eventId);
      setCards(response);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cards:', err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    console.log('Drag End Event:', { active, over });

    if (!over) {
      console.log('No over target, returning');
      return;
    }

    try {
      setLoading(true);

      // Handle column reordering
      if (active.id.toString().startsWith('column-') && over.id.toString().startsWith('column-')) {
        console.log('Column reordering detected');
        const oldIndex = columns.findIndex(col => `column-${col.id}` === active.id);
        const newIndex = columns.findIndex(col => `column-${col.id}` === over.id);

        if (oldIndex !== newIndex) {
          const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
          // Update positions in sequence
          for (let i = 0; i < reorderedColumns.length; i++) {
            await tCardService.updateColumn(
              eventId,
              reorderedColumns[i].id,
              reorderedColumns[i].title,
              i
            );
          }
          onColumnsChange();
        }
      }
      // Handle card movement
      else if (active.id.toString().startsWith('card-')) {
        console.log('Card movement detected');
        const cardId = parseInt(active.id.replace('card-', ''));
        const card = cards.find(c => c.id === cardId);
        console.log('Moving card:', { cardId, card });

        if (over.id.toString().startsWith('column-')) {
          console.log('Moving to new column');
          const newColumnId = parseInt(over.id.replace('column-', ''));
          const newPosition = cards.filter(c => c.column === newColumnId).length;
          await tCardService.moveCard(cardId, newColumnId, newPosition);
        } else if (over.id.toString().startsWith('card-')) {
          console.log('Reordering within column');
          const overCardId = parseInt(over.id.replace('card-', ''));
          const overCard = cards.find(c => c.id === overCardId);

          if (card.column === overCard.column) {
            const columnCards = cards
              .filter(c => c.column === card.column)
              .sort((a, b) => a.position - b.position);

            const oldIndex = columnCards.findIndex(c => c.id === cardId);
            const newIndex = columnCards.findIndex(c => c.id === overCardId);

            if (oldIndex !== newIndex) {
              const reorderedCards = arrayMove(columnCards, oldIndex, newIndex);
              // Update positions in sequence
              for (let i = 0; i < reorderedCards.length; i++) {
                await tCardService.moveCard(reorderedCards[i].id, reorderedCards[i].column, i);
              }
            }
          } else {
            // Moving to a different column
            const newColumnId = overCard.column;
            const newPosition = cards.filter(c => c.column === newColumnId).length;
            await tCardService.moveCard(cardId, newColumnId, newPosition);
          }
        }

        const updatedCards = await tCardService.getCards(eventId);
        setCards(updatedCards);
      }
    } catch (err) {
      console.error('Error in handleDragEnd:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setEditColumnTitle(column.title);
    setEditColumnDialogOpen(true);
  };

  const handleSaveColumn = async () => {
    if (!editingColumn || !editColumnTitle.trim()) return;

    try {
      setLoading(true);
      await tCardService.updateColumn(
        eventId,
        editingColumn.id,
        editColumnTitle.trim(),
        editingColumn.position
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
      await tCardService.deleteColumn(eventId, columnId);
      onColumnsChange();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting column:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = (columnId) => {
    setEditingCard({
      column: columnId,
      position: cards.filter(card => card.column === columnId).length
    });
    setEditCardDialogOpen(true);
  };

  const handleEditCard = (card) => {
    setEditingCard(card);
    setEditCardDialogOpen(true);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await tCardService.deleteCard(cardId);
      const updatedCards = await tCardService.getCards(eventId);
      setCards(updatedCards);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleSaveCard = async (cardData) => {
    try {
      if (cardData.id) {
        await tCardService.updateCard(cardData.id, cardData);
      } else {
        await tCardService.createCard({
          ...cardData,
          event: eventId,
          column: editingCard.column,
          position: editingCard.position
        });
      }
      const updatedCards = await tCardService.getCards(eventId);
      setCards(updatedCards);
      setEditingCard(null);
      setEditCardDialogOpen(false);
    } catch (error) {
      console.error('Error saving card:', error);
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
          height: '100%',
          boxSizing: 'border-box',
          flex: 1
        }}
      >
        <SortableContext
          items={columns.map(column => `column-${column.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <SortableColumn
              key={column.id}
              column={column}
              cards={cards}
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onAddCard={handleAddCard}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
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

      <TCardDialog
        open={editCardDialogOpen}
        onClose={() => {
          setEditCardDialogOpen(false);
          setEditingCard(null);
        }}
        onSubmit={handleSaveCard}
        card={editingCard}
        credentials={credentials}
      />
    </DndContext>
  );
};

export default TCardRack;