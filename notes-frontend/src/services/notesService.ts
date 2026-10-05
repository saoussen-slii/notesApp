import axios from "axios";

export type NoteData = {
  id: number | string;
  content: string;
  important: boolean;
};

const api = axios.create({ baseURL: "http://localhost:3001/notes" });

const getAll = async () => {
  const response = await api.get<NoteData[]>("");
  return response.data;
};

const create = async (note: Omit<NoteData, "id">) => {
  const response = await api.post<NoteData>("", note);
  return response.data;
};

const update = async (id: NoteData["id"], note: NoteData) => {
  const response = await api.put<NoteData>(`/${id}`, note);
  return response.data;
};

const remove = async (id: NoteData["id"]) => {
  await api.delete(`/${id}`);
};

export default { getAll, create, update, remove };
