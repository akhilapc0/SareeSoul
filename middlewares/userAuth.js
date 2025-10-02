const User=require('../models/userModel');

function hasUser(req) {
  return req.session?.user || req.session?.passport?.user;
}

function isLoggedIn(req, res, next) {
  if (hasUser(req)) return next();

  res.redirect('/login');
}

function isLoggedOut(req, res, next) {

  if (hasUser(req)) return res.redirect('/home');
  
  next();
}
async function checkBlock(req, res, next) {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    if (!userId) {
    
      return next();
    }

    const user = await User.findById(userId);
    if (!user || user.isBlocked) {
     
      req.session.destroy(err => {
        if (err) console.log('Session destroy error:', err);
        return res.redirect('/login');
      });
      return;
    }

    
    next();
  } catch (error) {
    console.log(error);
    res.redirect('/login');
  }
}

async function flashMessageMiddleware(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); 
  next();
}
async function setUserLocals(req, res, next) {
 
  if (req.session.user) {
    try {
     
      const user = await User.findById(req.session.user._id);
       
      
      if (!user || user.isBlocked) {
      
        res.locals.user = null;
        
        req.session.user = null;
      } else {
        
        res.locals.user = req.session.user;
      }
    } catch (error) {
      console.log('Error checking user:', error);
      res.locals.user = null;
    }
  } else {
    
    res.locals.user = null;
  }
  next();
}
module.exports = { isLoggedIn, isLoggedOut,checkBlock ,flashMessageMiddleware,setUserLocals};
