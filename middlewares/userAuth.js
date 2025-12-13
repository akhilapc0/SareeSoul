import  User from '../models/userModel.js';

export  function hasUser(req) {
  return req.session?.user || req.session?.passport?.user;
}

export async function isLoggedIn(req, res, next) {
  
  try{
  const userId=req.session?.user?._id || req.session?.passport?.user;
  if(!userId){
    if(req.xhr || req.headers.accept?.includes("application/json")){
      return res.status(401).json({success:false,message:'Login required '})
    }
    return  res.redirect('/login');
  }

  const user=await User.findById(userId);
  if(!user){
    if(req.xhr || req.headers.accept?.includes('application/json')){
      return res.status(401).json({success:false,message:'User not found'})
    }
    return res.redirect('/login')
  }
  req.user=user;
  next();
}
catch(error){
  console.error(error);
  if(req.xhr || req.headers.accept?.includes('application/json')){
    return res.status(500).json({success:false})
  }
  res.redirect('/login')
}
}

export function isLoggedOut(req, res, next) {

  if (hasUser(req)) return res.redirect('/home');
  
  next();
}
export async function checkBlock(req, res, next) {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    if (!userId) {
    
      return next();
    }

    const user = await User.findById(userId);
    if (!user || user.isBlocked) {
     
      req.session.destroy(err => {
        if (err) console.log('Session destroy error:', err);

        if(req.xhr || req.headers.accept?.includes("application/json")){
          return res.status(403).json({success:false,message:'User is blocked'})
        }
        return res.redirect('/login');
      });
      return;
    }

    
    next();
  } catch (error) {
    console.log(error);
    if(req.xhr || req.headers.accept?.includes("application/json")){
      return res.status(500).json({success:false})
    }
    res.redirect('/login');
  }
}

export async function flashMessageMiddleware(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); 
  next();
}
export async function setUserLocals(req, res, next) {
 
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

