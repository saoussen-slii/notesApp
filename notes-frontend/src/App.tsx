import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import Note from "./components/Note";
import notesService, { type NoteData } from "./services/notesService";

function App() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    notesService
      .getAll()
      .then((data) => {
        setTimeout(() => {
          setLoading(false);
          setNotes(data);
        }, 1000);
      })
      .catch(() => setError("Impossible de charger les notes."));
  }, []);

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = newNote.trim();
    if (!content) return;

    try {
      const createdNote = await notesService.create({
        content,
        important: false,
      });
      setNotes((currentNotes) => currentNotes.concat(createdNote));
      setNewNote("");
      setError("");
    } catch {
      setError("Impossible d’ajouter la note.");
    }
  };

  const toggleImportance = async (note: NoteData) => {
    try {
      const updatedNote = await notesService.update(note.id, {
        ...note,
        important: !note.important,
      });
      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === updatedNote.id ? updatedNote : currentNote,
        ),
      );
      setError("");
    } catch {
      setError("Impossible de modifier l’importance de la note.");
    }
  };

  const deleteNote = async (id: NoteData["id"]) => {
    try {
      await notesService.remove(id);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
      setError("");
    } catch {
      setError("Impossible de supprimer la note.");
    }
  };

  const visibleNotes = showAll ? notes : notes.filter((note) => note.important);

  return (
    <main className="notes-app">
      <header className="notes-header">
        <p className="eyebrow">Votre espace personnel</p>
        <h1>Notes</h1>
        <p className="notes-subtitle">Toutes vos idées importantes, au même endroit.</p>
      </header>

      <form className="note-form" onSubmit={addNote}>
        <label htmlFor="note-content">Ajouter une note</label>
        <input
          id="note-content"
          value={newNote}
          onChange={(event) => setNewNote(event.target.value)}
          placeholder="Écrivez votre idée ici..."
        />
        <button className="button-primary" type="submit">Enregistrer</button>
      </form>

      {error && <p className="error-message" role="alert">{error}</p>}
      {loading && <p className="loading-state">Chargement de vos notes...</p>}

      <section aria-labelledby="notes-list-heading">
        <div className="notes-toolbar">
          <h2 id="notes-list-heading">
            {showAll ? "Toutes les notes" : "Notes importantes"}
            <span className="notes-count">({visibleNotes.length})</span>
          </h2>
          <button
            className="button-filter"
            type="button"
            onClick={() => setShowAll((current) => !current)}
            aria-pressed={!showAll}
          >
            {showAll ? "Voir les importantes" : "Voir toutes les notes"}
          </button>
        </div>
        {visibleNotes.length > 0 ? (
          <ul className="notes-list">
            {visibleNotes.map((note) => (
              <Note
                key={note.id}
                note={note}
                onToggleImportance={toggleImportance}
                onDelete={deleteNote}
              />
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="empty-state">
              {showAll
                ? "Aucune note pour le moment. Ajoutez votre première idée ci-dessus."
                : "Aucune note importante pour le moment."}
            </p>
          )
        )}
      </section>
    </main>
  );
}

export default App;
