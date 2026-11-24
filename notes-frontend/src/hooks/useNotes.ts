import { useEffect, useState, type SubmitEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import notesService, {
  categoryLabels,
  type NoteCategory,
  type NoteData,
} from "../services/notesService";
import {
  fetchNotes,
  noteAdded,
  noteRemoved,
  noteUpdated,
} from "../store/notesSlice";
import type { AppDispatch, RootState } from "../store/store";
import { useDebounce } from "./useDebounce";
import { useLocalStorage } from "./useLocalStorage";

type CategoryFilter = NoteCategory | "toutes";

type NotesFilter = {
  showAll: boolean;
  categoryFilter: CategoryFilter;
};

const isCategoryFilter = (value: unknown): value is CategoryFilter =>
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

export function useNotes() {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes.items);
  const loading = useSelector(
    (state: RootState) => state.notes.status === "loading",
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
  const [error, setError] = useState("");
  const { categoryFilter, showAll } = filters;

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

  const toggleShowAll = () => {
    setFilters((current) => ({ ...current, showAll: !current.showAll }));
  };

  const setCategoryFilter = (value: string) => {
    if (!isCategoryFilter(value)) {
      throw new Error(`Catégorie de filtre inconnue : ${value}`);
    }

    setFilters((current) => ({ ...current, categoryFilter: value }));
  };

  const visibleNotes = notes.filter(
    (note) =>
      (showAll || note.important) &&
      (categoryFilter === "toutes" || note.category === categoryFilter) &&
      note.content
        .toLowerCase()
        .includes(debouncedSearch.trim().toLowerCase()),
  );

  return {
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
  };
}
