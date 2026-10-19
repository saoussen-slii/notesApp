import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./notesSlice";

export const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
});
console.log("before", store.getState());

store.subscribe(() => {
  console.log("after", store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
