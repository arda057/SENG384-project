import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const PORT = 5000;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPerson(full_name, email) {
  if (!full_name || !email) return false;
  if (!full_name.trim() || !email.trim()) return false;
  if (!emailRegex.test(email)) return false;
  return true;
}

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/people", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM people ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.get("/api/people/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM people WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.post("/api/people", async (req, res) => {
  const { full_name, email } = req.body;

  if (!isValidPerson(full_name, email)) {
    return res.status(400).json({ error: "VALIDATION_ERROR" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *",
      [full_name.trim(), email.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.put("/api/people/:id", async (req, res) => {
  const { full_name, email } = req.body;

  if (!isValidPerson(full_name, email)) {
    return res.status(400).json({ error: "VALIDATION_ERROR" });
  }

  try {
    const result = await pool.query(
      "UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING *",
      [full_name.trim(), email.trim(), req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.delete("/api/people/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM people WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.status(200).json({ message: "DELETED" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
