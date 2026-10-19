import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import notesService, { type NoteData } from "../services/notesService";

export const fetchNotes = createAsyncThunk("notes/fetchNotes", () =>
  notesService.getAll(),
);

type NotesState = {
  items: NoteData[];
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: NotesState = {
  items: [],
  status: "idle",
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    noteAdded(state, action: PayloadAction<NoteData>) {
      state.items.push(action.payload);
    },
    noteUpdated(state, action: PayloadAction<NoteData>) {
      const index = state.items.findIndex(
        (note) => note.id === action.payload.id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    noteRemoved(state, action: PayloadAction<NoteData["id"]>) {
      state.items = state.items.filter((note) => note.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchNotes.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { noteAdded, noteUpdated, noteRemoved } = notesSlice.actions;
export default notesSlice.reducer;
