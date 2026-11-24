import { useEffect, useState, type SubmitEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Note from "./components/Note";
import notesService, {
  categoryLabels,
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
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDebounce } from "./hooks/useDebounce";

type Theme = "light" | "dark";
type NotesFilter = {
  showAll: boolean;
  categoryFilter: NoteCategory | "toutes";
};

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

const isCategoryFilter = (
  value: unknown,
): value is NoteCategory | "toutes" =>
  value === "toutes" ||
  (typeof value === "string" && Object.hasOwn(categoryLabels, value));

const isNotesFilter = (value: unknown): value is NotesFilter => {
  if (typeof value !== "object" || value === null) return false;

  return (
    "showAll" in value &&
    typeof value.showAll === "boolean" &&
    "categoryFilter" in value &&
    isCategoryFilter(value.categoryFilter)
  );
};

const isSearch = (value: unknown): value is string =>
  typeof value === "string";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.items);
  const loading = useSelector(
    (state: RootState) => state.notes.status === "loading",
  );
  const [theme, setTheme] = useLocalStorage<Theme>(
    "notes-app:theme",
    "light",
    isTheme,
  );
  const [filters, setFilters] = useLocalStorage<NotesFilter>(
    "notes-app:filters",
    { showAll: true, categoryFilter: "toutes" },
    isNotesFilter,
  );
  const [search, setSearch] = useLocalStorage(
    "notes-app:last-search",
    "",
    isSearch,
  );
  const debouncedSearch = useDebounce(search, 300);
  const [newNote, setNewNote] = useState("");
  const [newCompleted, setNewCompleted] = useState(false);
  const [newCategory, setNewCategory] = useState<NoteCategory>("PERSONAL");
  const { categoryFilter, showAll } = filters;
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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
      setNewCategory("PERSONAL");
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
      (categoryFilter === "toutes" || note.category === categoryFilter) &&
      note.content.toLowerCase().includes(debouncedSearch.trim().toLowerCase()),
  );

  return (
    <main className="notes-app">
      <header className="notes-header">
        <div className="notes-header-top">
          <p className="eyebrow">Votre espace personnel</p>
          <button
            className="button-theme"
            type="button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            aria-label={`Activer le thème ${theme === "light" ? "sombre" : "clair"}`}
          >
            {theme === "light" ? "Mode sombre" : "Mode clair"}
          </button>
        </div>
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
          {(
            Object.entries(categoryLabels) as [NoteCategory, string][]
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
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
            onClick={() =>
              setFilters((current) => ({
                ...current,
                showAll: !current.showAll,
              }))
            }
            aria-pressed={!showAll}
          >
            {showAll ? "Voir les importantes" : "Voir toutes les notes"}
          </button>
          <label className="category-filter">
            <span>Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                const selectedCategory = event.target.value;
                if (isCategoryFilter(selectedCategory)) {
                  setFilters((current) => ({
                    ...current,
                    categoryFilter: selectedCategory,
                  }));
                }
              }}
            >
              <option value="toutes">Toutes</option>
              {(
                Object.entries(categoryLabels) as [NoteCategory, string][]
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="search-field">
          <span>Rechercher une note</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Saisissez un mot-clé..."
          />
        </label>
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
              {search.trim()
                ? "Aucune note ne correspond à votre recherche."
                : showAll
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
