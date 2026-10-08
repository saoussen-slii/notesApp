import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = "./db.json";

async function readNotes() {
  const data = await fs.promises.readFile(dbPath, "utf-8");
  return JSON.parse(data).notes;
}

async function writeNotes(notes) {
  await fs.promises.writeFile(dbPath, JSON.stringify({ notes }, null, 2));
}

app.get("/notes", async (req, res) => {
  const notesPromise = readNotes();
  console.log("Promise avant await :", notesPromise);

  const notes = await notesPromise;
  res.json(notes);
});

app.post("/notes", async (req, res) => {
  const { content, important = false } = req.body ?? {};
  if (typeof content !== "string" || typeof important !== "boolean") {
    return res.status(400).json({
      error: "content must be a string and important must be a boolean",
    });
  }

  const notes = await readNotes();
  const newNote = {
    id: Date.now(),
    content,
    important,
  };

  notes.push(newNote);
  await writeNotes(notes);
  res.status(201).json(newNote);
});

app.put("/notes/:id", async (req, res) => {
  const { content, important } = req.body ?? {};
  if (typeof content !== "string" || typeof important !== "boolean") {
    return res.status(400).json({
      error: "content must be a string and important must be a boolean",
    });
  }

  const notes = await readNotes();
  const index = notes.findIndex((note) => String(note.id) === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  const updatedNote = { ...notes[index], content, important };
  notes[index] = updatedNote;
  await writeNotes(notes);
  res.json(updatedNote);
});

app.delete("/notes/:id", async (req, res) => {
  const notes = await readNotes();
  const index = notes.findIndex((note) => String(note.id) === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  notes.splice(index, 1);
  await writeNotes(notes);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
