const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./notes.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY, 
      content TEXT,
      opened_at DATE DEFAULT null,
      created_at DATE DEFAULT (datetime('now', 'localtime'))
    )`);
});

const saveNote = (id, content) => new Promise((resolve, reject) =>
  db.run(`
    INSERT INTO notes (id, content) VALUES (?, ?) 
  `, [id, content], (err) => err ? reject(err) : resolve())
)

const getNote = (id) => new Promise((resolve, reject) =>
  db.get(`
    SELECT * FROM notes WHERE id = ?  
  `, [id], (err, row) => err ? reject(err) : resolve(row))
)

const markNoteAsOpened = (id) => new Promise((resolve, reject) =>
  db.run(`
    UPDATE notes SET opened_at = datetime('now', 'localtime') WHERE id = ?
  `, [id], (err) => err ? reject(err) : resolve())
)

const deleteExpiredNotes = () => new Promise((resolve, reject) =>
  db.run(`
    DELETE FROM notes
    WHERE opened_at < datetime('now',  'localtime', '-5 minutes')
    OR opened_at IS NULL AND created_at < datetime('now',  'localtime', '-7 days')
  `, (err) => err ? reject(err) : resolve())
)

module.exports = {
  saveNote,
  getNote,
  deleteExpiredNotes,
  markNoteAsOpened
}