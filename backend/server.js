const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database(':memory:', err => {
  if (err) {
    return console.error('Error opening database', err.message);
  }
  console.log('Connected to the in-memory SQLite database.');
});

app.use(cors());
app.use(bodyParser.json());

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS periods (start_date TEXT, end_date TEXT)');
});

app.get('/api/periods', (req, res) => {
  db.all('SELECT start_date, end_date FROM periods ORDER BY start_date ASC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching periods:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/periods', (req, res) => {
  const { startDate, endDate } = req.body;
  db.run('INSERT INTO periods (start_date, end_date) VALUES (?, ?)', [startDate, endDate], function(err) {
    if (err) {
      console.error('Error adding period:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ start_date: startDate, end_date: endDate });
  });
});

app.delete('/api/periods', (req, res) => {
  const { startDate, endDate } = req.body;
  db.run('DELETE FROM periods WHERE start_date = ? AND end_date = ?', [startDate, endDate], function(err) {
    if (err) {
      console.error('Error deleting period:', err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Period deleted successfully' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
