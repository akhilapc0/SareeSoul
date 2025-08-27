const User=require('../models/userModel')
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


const checkBlock=async(req,res,next)=>{
    try{
        const userId  = req.session.user._id;
        const user=await User.findById(userId);
        if(user.isBlocked){
            req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.clearCookie("connect.sid"); 
                res.redirect("/login"); 
            }
        });

            res.redirect('/login');

        }
        next();

    }
    catch(error){
        console.log(error.message)
    }
}



const checkBlocked=async(req,res,next)=>{
    try{

        const userId=req.session?.user?._id;

if(!userId){
  return res.redirect('/login')
}

        const user=await User.findById(userId);
        if(user.isBlocked){
            req.session.destroy((err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.clearCookie('connect.sid');
                    res.redirect('/login');
                }

            })

        }
        next();
    }
    catch(error){
        console.log(error)
    }
}

module.exports = { isLoggedIn, isLoggedOut,checkBlocked };
