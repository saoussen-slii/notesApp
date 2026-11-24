import { useEffect } from "react";
import "./App.css";
import Note from "./components/Note";
import { categoryLabels, type NoteCategory } from "./services/notesService";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useNotes } from "./hooks/useNotes";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

type Theme = "light" | "dark";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

function App() {
  const {
    addNote,
    categoryFilter,
    deleteNote,
    error,
    loading,
    newCategory,
    newCompleted,
    newNote,
    search,
    setCategoryFilter,
    setNewCategory,
    setNewCompleted,
    setNewNote,
    setSearch,
    showAll,
    toggleCompleted,
    toggleImportance,
    toggleShowAll,
    visibleNotes,
  } = useNotes();
  const [theme, setTheme] = useLocalStorage<Theme>(
    "notes-app:theme",
    "light",
    isTheme,
  );
  const isOnline = useOnlineStatus();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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

      {!isOnline && (
        <p className="offline-message" role="status">
          Vous êtes hors ligne. Les modifications ne peuvent pas être
          enregistrées auprès du serveur.
        </p>
      )}

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
          {(Object.entries(categoryLabels) as [NoteCategory, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
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
            onClick={toggleShowAll}
            aria-pressed={!showAll}
          >
            {showAll ? "Voir les importantes" : "Voir toutes les notes"}
          </button>
          <label className="category-filter">
            <span>Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="toutes">Toutes</option>
              {(Object.entries(categoryLabels) as [NoteCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
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
