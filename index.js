const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();
require('./config/db');

const session = require('express-session');

// use session to remember logged-in user
app.use(session({
  secret: process.env.SESSION_SECRET, // like a password to protect user session
  resave: false, // don't save session if nothing changed
  saveUninitialized: false, // don't create empty session
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // session expires after 1 day
  }
}));



// this lets express read data from html forms (like register form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// setting ejs as the template engine (so we can use .ejs files)
app.set('view engine', 'ejs');

// telling express where the ejs files are saved
app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin') // remove if admin folder not used
]);

// this allows express to load css, js, images from public folder
app.use(express.static(path.join(__dirname, 'public')));

// importing routes for register and login
const authRoutes = require('./routes/user/authRoutes');
const adminauthRoutes=require('./routes/admin/authRoutes');
const adminUserRoutes=require('./routes/admin/userRoutes');
const categoryRoutes=require('./routes/admin/categoryRoutes');
const brandRoutes=require('./routes/admin/brandRoutes');
// using the imported routes in the main app
app.use('/', authRoutes);
app.use('/admin',adminauthRoutes);
app.use('/admin',adminUserRoutes);
app.use('/admin',categoryRoutes);
app.use('/admin',brandRoutes);
// starting the server on port 3000 (or other port if set)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
