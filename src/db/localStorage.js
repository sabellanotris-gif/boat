const STORAGE_KEY = 'capstone-todos'

let nextId = 1

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const todos = JSON.parse(raw)
    nextId = Math.max(0, ...todos.map(t => t.id)) + 1
    return todos
  } catch {
    return []
  }
}

function save(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function getTodos() {
  return Promise.resolve(load())
}

export function createTodo(text) {
  const todos = load()
  const todo = { id: nextId++, text, completed: false, createdAt: new Date().toISOString() }
  todos.push(todo)
  save(todos)
  return Promise.resolve(todo)
}

export function updateTodo(id, updates) {
  const todos = load()
  const index = todos.findIndex(t => t.id === id)
  if (index === -1) return Promise.reject(new Error('Todo not found'))
  todos[index] = { ...todos[index], ...updates }
  save(todos)
  return Promise.resolve(todos[index])
}

export function deleteTodo(id) {
  const todos = load().filter(t => t.id !== id)
  save(todos)
  return Promise.resolve()
}
