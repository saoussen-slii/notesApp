import type { NoteData } from "../services/notesService";

type NoteProps = {
  note: NoteData;
  onToggleImportance: (note: NoteData) => void;
  onDelete: (id: NoteData["id"]) => void;
};

function Note({ note, onToggleImportance, onDelete }: NoteProps) {
  return (
    <li className="note-card">
      <div className="note-content">
        {note.content}
        {note.important && <span className="note-badge">Importante</span>}
      </div>
      <div className="note-actions">
        <button
          type="button"
          onClick={() => onToggleImportance(note)}
          aria-pressed={note.important}
        >
          {note.important ? "Retirer des importantes" : "Marquer importante"}
        </button>
        <button
          className="button-delete"
          type="button"
          onClick={() => onDelete(note.id)}
          aria-label={`Supprimer la note : ${note.content}`}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}

export default Note;
