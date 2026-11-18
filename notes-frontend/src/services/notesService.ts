import axios from "axios";

export type NoteCategory = "PERSONAL" | "SCHOOL" | "WORK";

export const CURRENT_USER_ID = 1;

export const categoryLabels: Record<NoteCategory, string> = {
  PERSONAL: "Personnel",
  SCHOOL: "École",
  WORK: "Travail",
};

export type NoteData = {
  id: number | string;
  content: string;
  important: boolean;
  completed: boolean;
  category: NoteCategory;
};

const api = axios.create({ baseURL: "http://localhost:3001/notes" });

const getAll = async () => {
  const response = await api.get<NoteData[]>("", {
    params: { userId: CURRENT_USER_ID },
  });
  return response.data;
};

const create = async (note: Omit<NoteData, "id">) => {
  const response = await api.post<NoteData>("", {
    ...note,
    userId: CURRENT_USER_ID,
  });
  return response.data;
};

const update = async (id: NoteData["id"], note: NoteData) => {
  const response = await api.put<NoteData>(`/${id}`, {
    ...note,
    userId: CURRENT_USER_ID,
  });
  return response.data;
};

const remove = async (id: NoteData["id"]) => {
  await api.delete(`/${id}`, { params: { userId: CURRENT_USER_ID } });
};

export default { getAll, create, update, remove };
