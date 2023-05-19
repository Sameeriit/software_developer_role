// module imported-----------------------------------------

const http = require("http");

const express = require("express");


const mysql = require("./connection").connecting;


// -----------------------------------------------------

const session = require('express-session');
const { connecting } = require("./connection");
const { dirname } = require("path");

const app = express();

// ... I installed express session for  storing and showing data in the home page

// Enable session middleware
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true
}));
// -----------------------------------------------------


const hostname = "localhost";
const port = 5000;

app.use(express.static(__dirname +"/public"));

// // configration---------------------------------------------

// -------------------------------------------------------------------------------


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Handle POST request for login form submission
app.post('/login', (req, res) => {
  const email = req.body.Email;
  const password = req.body.Password;

  // Perform MySQL query to check login credentials
  const query = 'SELECT * FROM login_detail WHERE EMAIL = ?';
  mysql.query(query, [EMAIL], (err, results) => {
    if (err) throw err;

     if (results.length > 0) {
           const user = results[0];

           // Check if password matches
            if (password === user.password) {
                // Successful login
                res.send('Login successful');
                // -----storing data------
                req.session.email = email;
                res.redirect('/home.html');
                // ----------------------
            } else {
                // Incorrect password
                const attempts = user.login_attempts || 0;
                const lastAttempt = user.last_login_attempt || null;
                const blockDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                const currentTime = new Date().getTime();

                if (attempts >= 4 && lastAttempt && currentTime - lastAttempt < blockDuration) {
                // User is blocked
                res.send('User is blocked. Please try again after 24 hours.');
                } else {
                // Incorrect password, update attempts count and last attempt time
                    const newAttempts = attempts + 1;
                    const newLastAttempt = currentTime;

                    const updateQuery = 'UPDATE users SET login_attempts = ?, last_login_attempt = ? WHERE email = ?';
                    mysql.query(updateQuery, [newAttempts, newLastAttempt, email], (err) => {
                        if (err) throw err;
                        res.send('Incorrect password. Please try again.');
                    });
                }
            }

        }else {
            // Insert new user into the database
            const insertQuery = 'INSERT INTO login_detail (EMAIL, PASSWORD) VALUES (?, ?)';
            mysql.query(insertQuery, [EMAIL, PASSWORD], (err) => {
            if (err) throw err;

            // User registered successfully
            res.send(' login successful');
        
            });
        }
  });
});


// Handle GET request for home page
app.get("/login",(req,res)=>{
      res.sendFile(__dirname +'/public/login.html')
})
app.get('/home', (req, res) => {
    // Check if user is logged in
    if (!req.session.email) {
      res.redirect('/');
      return;
    }
  
    // Retrieve user's email from session
    const email = req.session.email;
  
    // Perform any additional database queries or data retrieval here
  
    // Render the home page
    res.sendFile(__dirname + '/public/home.html');
  });


// -------------------------------------------------------------------------------


// sever listening------------------------------------------

const server = http.createServer(app);

server.listen(port,hostname,(err)=>{
    if(err) throw err
        console.log(`server is running at http://${hostname}:${port}/`);
    
  
});