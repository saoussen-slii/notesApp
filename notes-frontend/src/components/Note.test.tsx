import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Note from './Note'
import type { NoteData } from '../services/notesService'

const note: NoteData = {
  id: 1,
  content: 'Réviser les notes',
  important: false,
  completed: false,
  category: 'PERSONAL',
}

describe('Note', () => {
  it('renders note content and its category', () => {
    render(
      <Note
        note={note}
        onToggleImportance={vi.fn()}
        onToggleCompleted={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Réviser les notes')).toBeInTheDocument()
    expect(screen.getByText('Catégorie: Personnel')).toBeInTheDocument()
  })

  it('calls the completion and delete handlers', () => {
    const onToggleCompleted = vi.fn()
    const onDelete = vi.fn()

    render(
      <Note
        note={note}
        onToggleImportance={vi.fn()}
        onToggleCompleted={onToggleCompleted}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: 'Terminée : Réviser les notes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer la note : Réviser les notes' }))

    expect(onToggleCompleted).toHaveBeenCalledWith(note)
    expect(onDelete).toHaveBeenCalledWith(note.id)
  })
})
