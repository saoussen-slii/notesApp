import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import App from "./App";
import notesReducer from "./store/notesSlice";
import notesService, { type NoteData } from "./services/notesService";

vi.mock("./services/notesService", () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  categoryLabels: {
    PERSONAL: "Personnel",
    SCHOOL: "École",
    WORK: "Travail",
  },
}));

const notes: NoteData[] = [
  {
    id: 1,
    content: "Rapport mensuel",
    important: true,
    completed: false,
    category: "WORK",
  },
  {
    id: 2,
    content: "Rapport scolaire",
    important: true,
    completed: false,
    category: "SCHOOL",
  },
  {
    id: 3,
    content: "Brouillon",
    important: true,
    completed: false,
    category: "WORK",
  },
];

function renderApp() {
  const store = configureStore({ reducer: { notes: notesReducer } });
  return render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

describe("App preferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(notesService.getAll).mockResolvedValue(notes);
  });

  it("restores and persists the theme, filters, and last search", async () => {
    window.localStorage.setItem("notes-app:theme", JSON.stringify("dark"));
    window.localStorage.setItem(
      "notes-app:filters",
      JSON.stringify({ showAll: false, categoryFilter: "WORK" }),
    );
    window.localStorage.setItem(
      "notes-app:last-search",
      JSON.stringify("rapport"),
    );

    renderApp();

    expect(await screen.findByText("Rapport mensuel")).toBeInTheDocument();
    expect(screen.queryByText("Rapport scolaire")).not.toBeInTheDocument();
    expect(screen.queryByText("Brouillon")).not.toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Rechercher une note" })).toHaveValue(
      "rapport",
    );
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("dark"),
    );

    fireEvent.change(screen.getByLabelText("Catégorie :"), {
      target: { value: "SCHOOL" },
    });
    expect(await screen.findByText("Rapport scolaire")).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem("notes-app:filters")).toBe(
        JSON.stringify({ showAll: false, categoryFilter: "SCHOOL" }),
      ),
    );

    fireEvent.change(screen.getByLabelText("Catégorie :"), {
      target: { value: "WORK" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Voir toutes les notes" }));
    await waitFor(() =>
      expect(window.localStorage.getItem("notes-app:filters")).toBe(
        JSON.stringify({ showAll: true, categoryFilter: "WORK" }),
      ),
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "brouillon" },
    });
    expect(await screen.findByText("Brouillon")).toBeInTheDocument();
    expect(window.localStorage.getItem("notes-app:last-search")).toBe(
      JSON.stringify("brouillon"),
    );

    fireEvent.click(screen.getByRole("button", { name: "Activer le thème clair" }));
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("light"),
    );
    expect(window.localStorage.getItem("notes-app:theme")).toBe(
      JSON.stringify("light"),
    );
  });
});
