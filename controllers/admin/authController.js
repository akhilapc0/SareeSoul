import  bcrypt from 'bcryptjs';
import  User from '../../models/userModel.js';

const getAdminLogin=async(req,res)=>{
    res.render('admin-login',{error:null})
}

const postAdminLogin=async(req,res)=>{
    try{
        const{email,password}=req.body;
        const admin= await User.findOne({email,isAdmin:true});
        if(!admin){
            return res.render('admin-login',{error:"admin account is not found"})
        }
        const isMatch=await bcrypt.compare(password,admin.password);
        if(! isMatch){
            return res.render('admin-login',{error:'incorrect password'})
        }
        req.session.admin={
            _id:admin._id,
            email:admin.email,
            name:`${admin.firstName} ${admin.lastName}`,
            isAdmin:true
        }
        return res.redirect('/admin/dashboard')

    }
    catch(error){
        console.log(error);
        res.render('admin-login',{error:"something went wrong"})

    }
}

const getDashboard=async(req,res)=>{
    try{
        
        res.render('dashboard',{admin:req.session.admin})
    }
    catch(error){
        console.error(error);
        res.send('something went wrong')
    }
}

const adminLogout=async(req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                console.log("error destroying session:",err);
                return res.redirect('/admin/dashboard')
            }
            res.redirect('/admin/login');
        })
    }
    catch(error){
        console.log(error);
        res.redirect('/admin/dashboard')
    }
}



const authController={
    getAdminLogin,
    postAdminLogin,
    getDashboard,
    adminLogout
}
export default authController;