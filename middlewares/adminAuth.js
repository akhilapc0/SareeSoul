
import User from '../models/userModel.js';

const adminAuth=async(req,res,next)=>{
        
    if(!req.session.admin || !req.session.admin.isAdmin){
       return  res.redirect('/admin/login')
    }
    next();
};


export const verifyAdminForDBOperation=async(adminId)=>{
    const admin=await User.findById(adminId);

    if(!admin || !admin.isAdmin || admin.isBlocked){
        throw new Error('unauthorized admin operation');
    }
    return true;
}




export default adminAuth;
