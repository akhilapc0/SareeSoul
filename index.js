const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();
require('./config/db');

const session = require('express-session');
const passport=require('./config/passport')


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));




app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())

app.set('view engine', 'ejs');

app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin') 
]);

app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/user/authRoutes');
const userRoutes=require('./routes/user/userRoutes');
const adminauthRoutes=require('./routes/admin/authRoutes');
const adminUserRoutes=require('./routes/admin/userRoutes');
const categoryRoutes=require('./routes/admin/categoryRoutes');
const brandRoutes=require('./routes/admin/brandRoutes');
const productRoutes=require('./routes/admin/productRoutes');
const variantRoutes=require('./routes/admin/variantRoutes');
const profileRoutes=require('./routes/user/profileRoutes');
const addressRoutes=require('./routes/user/addressRoutes');

app.use('/', authRoutes);
app.use('/',userRoutes);
app.use('/',profileRoutes);
app.use('/',addressRoutes);


app.use('/admin',adminauthRoutes);
app.use('/admin',adminUserRoutes);
app.use('/admin',categoryRoutes);
app.use('/admin',brandRoutes);
app.use('/admin',productRoutes);
app.use('/admin',variantRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});


//npx eslint .