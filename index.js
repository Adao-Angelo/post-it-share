const express = require('express');
const { saveNote, getNote, deleteExpiredNotes, markNoteAsOpened } = require('./db');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.get('/note/:id', (req, res) => {
  res.sendFile(__dirname + '/public/note.html');
})

app.post('/notes', async (req, res) => {
  const { content } = req.body

  if (!content) {
    return res.send('<span class="error">Erro inesperado!</span>')
  }

  const id = crypto.randomUUID();
  await saveNote(id, content)
  res.send(`
    <p>Compartilhe sua nota através do link
      <br />
      <span>${req.headers.origin}/note/${id}</span>
    </p>
    `)
})

app.get('/share/:id', async (req, res) => {
  await deleteExpiredNotes();

  const { id } = req.params;
  const note = await getNote(id);
  if (!note) {
    return res.send('<span class="error">Esta mensagem não existe mais!</span>')
  }

  if (!note.opened_at) {
    await markNoteAsOpened(id);
  }

  res.send(note.content)
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});