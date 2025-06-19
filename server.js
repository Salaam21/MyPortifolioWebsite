const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// SQLite database setup
const db = new sqlite3.Database('contact_form.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'msinyani3@gmail.com', // Your email
    pass: 'Mas2122001gmail'   // Your email password
  }
});

// Route to handle form submission
app.post('/contact', (req, res) => {
  const { fullname, email, message } = req.body;

  // Save to database
  const query = `INSERT INTO contacts (fullname, email, message) VALUES (?, ?, ?)`;
  db.run(query, [fullname, email, message], function (err) {
    if (err) {
      console.error('Error saving to database:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Send email
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'msinyani3@gmail.com',  // Your email to receive the form data
      subject: 'New Contact Form Submission',
      text: `You have a new contact form submission:\n\nFull Name: ${fullname}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Internal Server Error');
      }
      res.status(200).send('Form submitted successfully');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
