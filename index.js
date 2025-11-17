
import {notFoundHandler,errorHandler} from './middlewares/errorHandler.js';

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';

import passport from './config/passport.js';
import {flashMessageMiddleware, setUserLocals} from './middlewares/userAuth.js'; 
import getCartCount from './middlewares/cartCount.js';
import getWishlistCount from './middlewares/wishlistCount.js';
import logger from './logger.js';
import './config/db.js';




import userRoutes from './routes/user/index.js';
import  adminRoutes from './routes/admin/index.js';





const app = express();

// __dirname for ES Modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




console.log = (...args) => logger.info(args.join(" "));
console.error = (...args) => logger.error(args.join(" "));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));




app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));


app.use(flash());


app.use(passport.initialize());
app.use(passport.session());



app.use(flashMessageMiddleware);
app.use(setUserLocals);

app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin') 
]);


app.use(getCartCount);
app.use(getWishlistCount);
app.use('/', userRoutes);
app.use('/admin', adminRoutes);



app.use(notFoundHandler);
app.use(errorHandler)


const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if(err) console.log(err);
  console.log(`server running at http://localhost:${PORT}`);
});