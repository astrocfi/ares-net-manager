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
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCardClick}
          fullWidth
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
      sx={{
        p: 2,
        mb: 1,
        bgcolor: 'background.paper',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', flex: 1 }}>
          <Typography variant="subtitle1">{card.operator?.call_sign}</Typography>
          <Typography variant="body2" color="text.secondary">
            {card.operator?.name}
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      {card.notes && (
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', mt: 1 }}>
          <Typography variant="body2">
            {card.notes}
          </Typography>
        </Box>
      )}
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
    useSensor(PointerSensor),
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
    if (!over) return;

    try {
      setLoading(true);

      // Handle column reordering
      if (active.id.toString().startsWith('column-') && over.id.toString().startsWith('column-')) {
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
      // Handle card reordering
      else if (active.id.toString().startsWith('card-') && over.id.toString().startsWith('column-')) {
        const cardId = parseInt(active.id.replace('card-', ''));
        const columnId = parseInt(over.id.replace('column-', ''));
        const card = cards.find(c => c.id === cardId);

        if (card) {
          const newPosition = cards.filter(c => c.column === columnId).length;
          await tCardService.moveCard(cardId, columnId, newPosition);
          fetchCards();
        }
      }
      // Handle card reordering within the same column
      else if (active.id.toString().startsWith('card-') && over.id.toString().startsWith('card-')) {
        const activeCardId = parseInt(active.id.replace('card-', ''));
        const overCardId = parseInt(over.id.replace('card-', ''));
        const activeCard = cards.find(c => c.id === activeCardId);
        const overCard = cards.find(c => c.id === overCardId);

        if (activeCard && overCard && activeCard.column === overCard.column) {
          const columnCards = cards
            .filter(c => c.column === activeCard.column)
            .sort((a, b) => a.position - b.position);

          const oldIndex = columnCards.findIndex(c => c.id === activeCardId);
          const newIndex = columnCards.findIndex(c => c.id === overCardId);

          if (oldIndex !== newIndex) {
            const reorderedCards = arrayMove(columnCards, oldIndex, newIndex);
            // Update positions in sequence
            for (let i = 0; i < reorderedCards.length; i++) {
              await tCardService.moveCard(reorderedCards[i].id, reorderedCards[i].column, i);
            }
            fetchCards();
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Error handling drag end:', err);
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
          minHeight: '100%'
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
        onClose={() => setEditCardDialogOpen(false)}
        onSubmit={handleSaveCard}
        card={editingCard}
      />
    </DndContext>
  );
};

export default TCardRack;
