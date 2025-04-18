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
  Tooltip
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
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';

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

function SortableColumn({ column, onEdit, onDelete }) {
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

  return (
    <Column
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      elevation={3}
    >
      <ColumnHeader>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {column.title}
        </Typography>
        <Box>
          <Tooltip title="Rename column">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(column);
              }}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete column">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(column.id);
              }}
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
    </Column>
  );
}

const TCardRack = ({ columns, setColumns }) => {
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editColumnTitle, setEditColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteColumn = (columnId) => {
    setColumns(columns.filter(column => column.id !== columnId));
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setEditColumnTitle(column.title);
    setEditColumnDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editColumnTitle.trim() && editingColumn) {
      setColumns(columns.map(column =>
        column.id === editingColumn.id
          ? { ...column, title: editColumnTitle.trim() }
          : column
      ));
      setEditColumnDialogOpen(false);
      setEditingColumn(null);
      setEditColumnTitle('');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map(column => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          <Box sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            flex: 1,
            p: 1,
            height: '100%',
            minHeight: 0
          }}>
            {columns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                onEdit={handleEditColumn}
                onDelete={handleDeleteColumn}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

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
            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditColumnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TCardRack;
