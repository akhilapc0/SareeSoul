const User=require('../models/userModel')
const bcrypt = require('bcryptjs');

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



const checkUser=async(req,res)=>{
  try{
  let {email,password,firstName}=req.body;
  const user=await User.findOne({email});
  if(user){
    if(firstName && user.firstName!==firstName){
      await User.findByIdAndUpdate(
        {email},
        {$set:{firstName:firstName}}
      )
      return res.json('first name updated successfully')
    }

    return res.json('message:user alreday exist')

  }
 
  if(!firstName){
     firstName=email.split("@")[0];
  }
  const hashPassword=await bcrypt.hash(password,10);
  const newUser=new User({email,password:hashPassword,firstName})
   await newUser.save();
   return res.json('message:user created successfully')
}
catch(error){
  console.log(error);
  return res.status(500).json('error creating user')
}
}


const userInfo=async(req,res,next)=>{
  try{
    const userId=req.session?.user?._id || req.session?.passport?.user?._id;
    if(!userId){
      return next();
    }
    const user=await User.findById(userId);
    let str=`user id:${user._id},firstName:${user.firstName},date:${Date.now()}`
    console.log(str);
  }
  catch(error){
    console.log(error);

  }
  next()
}

module.exports = { isLoggedIn, isLoggedOut,checkBlocked,checkUser,userInfo };
