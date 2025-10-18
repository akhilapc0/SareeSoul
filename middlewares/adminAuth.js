

const adminAuth=async(req,res,next)=>{
    if(!req.session.admin || !req.session.admin.isAdmin){
       return  res.redirect('/admin/login')
    }
    next();
}

export default adminAuth;
