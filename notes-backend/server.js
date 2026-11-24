import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "notes_app",
});

const noteCategories = ["PERSONAL", "SCHOOL", "WORK"];

function readUserId(value) {
  const userId = Number(value);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  return userId;
}

function readNoteId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function readNoteBody(body) {
  const { content, important = false, completed = false, category } = body ?? {};
  if (
    typeof content !== "string" ||
    typeof important !== "boolean" ||
    typeof completed !== "boolean" ||
    !noteCategories.includes(category)
  ) {
    return null;
  }
  return { content, important, completed, category };
}

function toNote(row) {
  return {
    id: row.id,
    content: row.content,
    important: Boolean(row.important),
    completed: Boolean(row.completed),
    category: row.category,
  };
}

app.get("/notes", async (req, res) => {
  const userId = readUserId(req.query.userId);
  if (userId === null) {
    return res.status(400).json({ error: "userId is invalid" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, content, important, completed, category FROM notes WHERE user_id = ?",
      [userId], 
    );
    res.json(rows.map(toNote));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database error" });
  }
});

app.post("/notes", async (req, res) => {
  const userId = readUserId(req.body?.userId);
  const note = readNoteBody(req.body);
  if (userId === null || note === null) {
    return res.status(400).json({
      error: "content, important, completed, category, or userId is invalid",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO notes (content, important, completed, category, user_id) VALUES (?, ?, ?, ?, ?)",
      [note.content, note.important, note.completed, note.category, userId],
    );
    console.log(result);
    res.status(201).json({ id: result.insertId, ...note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database error" });
  }
});

app.put("/notes/:id", async (req, res) => {
  const id = readNoteId(req.params.id);
  const userId = readUserId(req.body?.userId);
  const note = readNoteBody(req.body);
  if (id === null || userId === null || note === null) {
    return res.status(400).json({
      error: "content, important, completed, category, or userId is invalid",
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE notes SET content = ?, important = ?, completed = ?, category = ? WHERE id = ? AND user_id = ?",
      [note.content, note.important, note.completed, note.category, id, userId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ id, ...note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database error" });
  }
});

app.delete("/notes/:id", async (req, res) => {
  const id = readNoteId(req.params.id);
  const userId = readUserId(req.query.userId);
  if (id === null || userId === null) {
    return res.status(400).json({ error: "userId is invalid" });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "database error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
