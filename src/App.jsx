import { useState, useEffect, useCallback } from 'react'
import { getTodos, createTodo, updateTodo, deleteTodo } from './db'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTodos().then(data => {
      setTodos(data)
      setLoading(false)
    })
  }, [])

  const handleAdd = useCallback(async (text) => {
    const todo = await createTodo(text)
    setTodos(prev => [todo, ...prev])
  }, [])

  const handleToggle = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const updated = await updateTodo(id, { completed: !todo.completed })
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
  }, [todos])

  const handleUpdate = useCallback(async (id, updates) => {
    const updated = await updateTodo(id, updates)
    setTodos(prev => prev.map(t => (t.id === id ? updated : t)))
  }, [])

  const handleDelete = useCallback(async (id) => {
    await deleteTodo(id)
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div className="min-h-dvh bg-gray-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Todo List</h1>
        <TodoForm onAdd={handleAdd} />
        <div className="mt-6">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
