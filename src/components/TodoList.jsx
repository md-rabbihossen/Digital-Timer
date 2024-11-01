import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';

function TodoList({ fontColor, backgroundColor }) {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTodo.trim()) return;

    const newTodoItem = {
      id: uuidv4(),
      text: newTodo.trim(),
      completed: false
    };

    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    setNewTodo('');
  };

  const handleToggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));

    // Remove completed todo after animation
    setTimeout(() => {
      const filteredTodos = updatedTodos.filter(todo => !todo.completed);
      setTodos(filteredTodos);
      localStorage.setItem('todos', JSON.stringify(filteredTodos));
    }, 500);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
    localStorage.setItem('todos', JSON.stringify(items));
  };

  return (
    <div 
      className="todo-container" 
      style={{ 
        color: fontColor,
        borderColor: fontColor
      }}
    >
      <h2 className="todo-title">To Do</h2>
      
      <form 
        onSubmit={handleAddTodo} 
        className="todo-form"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="todo-input"
          style={{ 
            color: fontColor,
            borderColor: fontColor,
            backgroundColor: 'transparent'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
            }
          }}
        />
        <button 
          type="submit" 
          className="todo-add-btn"
          style={{ color: fontColor }}
        >
          <PlusCircleIcon className="h-6 w-6" />
        </button>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="todo-list"
            >
              {todos.map((todo, index) => (
                <Draggable key={todo.id} draggableId={todo.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`todo-item ${snapshot.isDragging ? 'dragging' : ''} ${
                        todo.completed ? 'completed' : ''
                      }`}
                      style={{ 
                        ...provided.draggableProps.style,
                        borderColor: fontColor,
                        color: fontColor
                      }}
                    >
                      <label className="todo-checkbox-container">
                        <label className="custom-checkbox">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleTodo(todo.id)}
                          />
                          <span 
                            className="checkmark" 
                            style={{ 
                              borderColor: fontColor,
                              backgroundColor: todo.completed ? backgroundColor : 'transparent'
                            }}
                          />
                        </label>
                        <span className="todo-text">{todo.text}</span>
                      </label>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default TodoList; 