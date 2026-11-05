import { useEffect, useState, type SubmitEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Note from "./components/Note";
import notesService, {
  type NoteCategory,
  type NoteData,
} from "./services/notesService";
import {
  fetchNotes,
  noteAdded,
  noteRemoved,
  noteUpdated,
} from "./store/notesSlice";
import type { AppDispatch, RootState } from "./store/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.items);
  const loading = useSelector(
    (state: RootState) => state.notes.status === "loading",
  );
  const [newNote, setNewNote] = useState("");
  const [newCompleted, setNewCompleted] = useState(false);
  const [newCategory, setNewCategory] = useState<NoteCategory>("personnel");
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | "toutes">(
    "toutes",
  );
  const [showAll, setShowAll] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchNotes())
      .unwrap()
      .then(() => setError(""))
      .catch(() => setError("Impossible de charger les notes."));
  }, [dispatch]);

  const addNote = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = newNote.trim();
    if (!content) return;

    try {
      const createdNote = await notesService.create({
        content,
        important: false,
        completed: newCompleted,
        category: newCategory,
      });
      dispatch(noteAdded(createdNote));
      setNewNote("");
      setNewCompleted(false);
      setNewCategory("personnel");
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
      dispatch(noteUpdated(updatedNote));
      setError("");
    } catch {
      setError("Impossible de modifier l’importance de la note.");
    }
  };

  const toggleCompleted = async (note: NoteData) => {
    try {
      const updatedNote = await notesService.update(note.id, {
        ...note,
        completed: !note.completed,
      });
      dispatch(noteUpdated(updatedNote));
      setError("");
    } catch {
      setError("Impossible de modifier l’état de la note.");
    }
  };

  const deleteNote = async (id: NoteData["id"]) => {
    try {
      await notesService.remove(id);
      dispatch(noteRemoved(id));
      setError("");
    } catch {
      setError("Impossible de supprimer la note.");
    }
  };

  const visibleNotes = notes.filter(
    (note) =>
      (showAll || note.important) &&
      (categoryFilter === "toutes" || note.category === categoryFilter),
  );

  return (
    <main className="notes-app">
      <header className="notes-header">
        <p className="eyebrow">Votre espace personnel</p>
        <h1>Notes</h1>
        <p className="notes-subtitle">
          Toutes vos idées importantes, au même endroit.
        </p>
      </header>

      <form className="note-form" onSubmit={addNote}>
        <label htmlFor="note-content">Ajouter une note</label>
        <input
          id="note-content"
          value={newNote}
          maxLength={100}
          onChange={(event) => setNewNote(event.target.value)}
          placeholder="Écrivez votre idée ici..."
          aria-describedby="note-character-count"
        />
        <button
          className="button-primary"
          type="submit"
          disabled={!newNote.trim() || loading}
        >
          Enregistrer
        </button>
        <label htmlFor="note-category">Catégorie</label>
        <select
          id="note-category"
          value={newCategory}
          onChange={(event) =>
            setNewCategory(event.target.value as NoteCategory)
          }
        >
          <option value="travail">Travail</option>
          <option value="ecole">École</option>
          <option value="personnel">Personnel</option>
          <option value="urgent">Urgent</option>
        </select>
        <label className="check-field" htmlFor="note-completed">
          <input
            id="note-completed"
            type="checkbox"
            checked={newCompleted}
            onChange={(event) => setNewCompleted(event.target.checked)}
          />
          Terminée
        </label>
        <p
          className="note-character-ount"
          id="note-character-count"
          aria-live="polite"
        >
          {newNote.length}/100
        </p>
      </form>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
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
          <label className="category-filter">
            <span>Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as NoteCategory | "toutes",
                )
              }
            >
              <option value="toutes">Toutes</option>
              <option value="travail">Travail</option>
              <option value="ecole">École</option>
              <option value="personnel">Personnel</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        {visibleNotes.length > 0 ? (
          <ul className="notes-list">
            {visibleNotes.map((note) => (
              <Note
                key={note.id}
                note={note}
                onToggleImportance={toggleImportance}
                onToggleCompleted={toggleCompleted}
                onDelete={deleteNote}
              />
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="empty-state">
              {showAll
                ? categoryFilter === "toutes"
                  ? "Aucune note pour le moment. Ajoutez votre première idée ci-dessus."
                  : "Aucune note dans cette catégorie."
                : categoryFilter === "toutes"
                  ? "Aucune note importante pour le moment."
                  : "Aucune note importante dans cette catégorie."}
            </p>
          )
        )}
      </section>
    </main>
  );
}

export default App;
