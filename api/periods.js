const sqlite3 = require('sqlite3').verbose();

module.exports = (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const db = new sqlite3.Database(':memory:', err => {
        if (err) {
            console.error('Error opening database', err.message);
            res.status(500).json({ error: 'Error opening database' });
            return;
        }

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS periods (start_date TEXT, end_date TEXT)', [], err => {
                if (err) {
                    console.error('Error creating table:', err.message);
                    res.status(500).json({ error: 'Error creating table' });
                    return;
                }

                db.all('SELECT start_date, end_date FROM periods ORDER BY start_date ASC', [], (err, rows) => {
                    if (err) {
                        console.error('Error fetching periods:', err.message);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.json(rows);
                    }
                    db.close();
                });
            });
        });
    });
};
