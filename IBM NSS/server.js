
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create a SQLite database (you can replace this with your preferred database)
const db = new sqlite3.Database('reviews.db');

// Create a table to store reviews
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, user_id INTEGER, rating INTEGER, comment TEXT)');
});

// Handle review submissions
app.post('/submit-review', (req, res) => {
    const productId = req.body.product_id;
    const userId = req.body.user_id;
    const rating = req.body.rating;
    const comment = req.body.comment;

    // Insert the review into the database
    const stmt = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)');
    stmt.run(productId, userId, rating, comment);
    stmt.finalize();

    res.send('Review submitted successfully.');
});

// Retrieve reviews for a product
app.get('/product-reviews/:product_id', (req, res) => {
    const productId = req.params.product_id;
    
    // Query the database for reviews of the specified product
    db.all('SELECT rating, comment FROM reviews WHERE product_id = ?', [productId], (err, rows) => {
        if (err) {
            res.status(500).send('Error retrieving reviews.');
        } else {
            res.json(rows);
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
