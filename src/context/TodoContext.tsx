import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Todo } from '../types/todo';

// Define the shape of the context state
interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  updateTodo: (id: string, text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  filter: 'all' | 'active' | 'completed';
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  clearCompleted: () => void;
}

// Create the context with undefined as initial value
const TodoContext = createContext<TodoContextType | undefined>(undefined);

// Provider component to wrap the app and provide state
export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Load todos from local storage if available
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      return JSON.parse(savedTodos);
    }
    return [];
  });
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Save to local storage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Adds a new todo to the list
  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  // Updates an existing todo's text
  const updateTodo = (id: string, text: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );
  };

  // Toggles the completion status of a todo
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Deletes a todo from the list
  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Clears all completed todos
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  return (
    <TodoContext.Provider 
      value={{ 
        todos, 
        addTodo, 
        updateTodo, 
        toggleTodo, 
        deleteTodo, 
        filter, 
        setFilter, 
        clearCompleted 
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use the Todo context easily
export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};
