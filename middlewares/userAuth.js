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

async function checkBlock(req,res,next){
  try{
  let userId=req.session.user?._id;
  if(!userId){
    return res.redirect('/login');
  }
  let user=await User.findById(userId);
  if(!user || user.isBlocked){
    return res.redirect('/login');

  }
  next();
}
catch(error){
  console.log(error);
  return res.redirect('/login')
}

}




module.exports = { isLoggedIn, isLoggedOut,checkBlock };
