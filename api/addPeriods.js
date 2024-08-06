const sqlite3 = require('sqlite3').verbose();

module.exports = (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const { startDate, endDate } = req.body;
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

                db.run('INSERT INTO periods (start_date, end_date) VALUES (?, ?)', [startDate, endDate], function(err) {
                    if (err) {
                        console.error('Error adding period:', err.message);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        res.json({ start_date: startDate, end_date: endDate });
                    }
                    db.close();
                });
            });
        });
    });
};
