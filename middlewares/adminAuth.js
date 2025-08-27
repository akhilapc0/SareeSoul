const adminAuth=async(req,res,next)=>{
    if(!req.session.user || !req.session.user.isAdmin){
       return  res.redirect('/admin/login')
    }
    next();
}


module.exports= adminAuth;