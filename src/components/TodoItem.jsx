import { useState } from 'react'

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  function handleSave() {
    if (!editText.trim()) return
    onUpdate(todo.id, { text: editText.trim() })
    setEditing(false)
  }

  function handleCancel() {
    setEditText(todo.text)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded group hover:border-gray-300">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="size-4 accent-blue-600 cursor-pointer"
      />

      {editing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <button onClick={handleSave} className="text-green-600 text-sm font-medium hover:underline cursor-pointer">
            Save
          </button>
          <button onClick={handleCancel} className="text-gray-500 text-sm hover:underline cursor-pointer">
            Cancel
          </button>
        </div>
      ) : (
        <span
          className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {todo.text}
        </span>
      )}

      {!editing && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => { setEditing(true); setEditText(todo.text) }}
            className="text-blue-600 text-xs font-medium hover:underline cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-red-500 text-xs font-medium hover:underline cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
