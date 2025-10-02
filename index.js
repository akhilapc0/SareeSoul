const express = require('express');
const path = require('path');
const app = express();
const logger = require('./logger');
const { flashMessageMiddleware, setUserLocals } = require('./middlewares/userAuth'); 

require('dotenv').config();
require('./config/db');

const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/passport');

console.log = (...args) => logger.info(args.join(" "));
console.error = (...args) => logger.error(args.join(" "));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flashMessageMiddleware);
app.use(setUserLocals);
app.set('view engine', 'ejs');

app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin') 
]);

app.use(express.static(path.join(__dirname, 'public')));



const userRoutes = require('./routes/user/index');
const adminRoutes = require('./routes/admin/index');

app.use('/', userRoutes);
app.use('/admin', adminRoutes);

console.log("node starting");

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if(err) console.log(err);
  console.log(`server running at http://localhost:${PORT}`);
});