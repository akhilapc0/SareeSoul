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

module.exports = { isLoggedIn, isLoggedOut };
