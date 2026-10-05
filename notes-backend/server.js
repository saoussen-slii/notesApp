import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = "./db.json";

function readNotes() {
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data).notes;
}

function writeNotes(notes) {
  fs.writeFileSync(dbPath, JSON.stringify({ notes }, null, 2));
}

app.get("/notes", (req, res) => {
  res.json(readNotes());
});

app.post("/notes", (req, res) => {
  const { content, important = false } = req.body ?? {};
  if (typeof content !== "string" || typeof important !== "boolean") {
    return res
      .status(400)
      .json({
        error: "content must be a string and important must be a boolean",
      });
  }

  const notes = readNotes();
  const newNote = {
    id: Date.now(),
    content,
    important,
  };

  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
});

app.put("/notes/:id", (req, res) => {
  const { content, important } = req.body ?? {};
  if (typeof content !== "string" || typeof important !== "boolean") {
    return res
      .status(400)
      .json({
        error: "content must be a string and important must be a boolean",
      });
  }

  const notes = readNotes();
  const index = notes.findIndex((note) => String(note.id) === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  const updatedNote = { ...notes[index], content, important };
  notes[index] = updatedNote;
  writeNotes(notes);
  res.json(updatedNote);
});

app.delete("/notes/:id", (req, res) => {
  const notes = readNotes();
  const index = notes.findIndex((note) => String(note.id) === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Note not found" });
  }

  notes.splice(index, 1);
  writeNotes(notes);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
