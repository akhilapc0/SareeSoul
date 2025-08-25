const User=require('../../models/userModel');

const getUserList=async(req,res)=>{
    try{
        
        const page=Number(req.query.page) || 1;
        const limit=5;
        const skip=(page-1)*limit;
        const search=(req.query.search) || '';
        const status=(req.query.status) || '';
        const query={
            isAdmin:false,
            $or:[
                {firstName:{$regex:search,$options:'i'}},
                {lastName:{$regex:search,$options:'i'}},
                {email:{$regex:search,$options:'i'}}
            ]
        }
        if(status==='active'){
            query.isBlocked=false;

        }
        else if(status==='blocked'){
            query.isBlocked=true;
        }
        const totalUsers=await User.countDocuments(query);
        const totalPages=Math.ceil(totalUsers/limit);
        const users=await User.find(query).sort({createdAt:-1}).skip(skip).limit(limit);
       return res.render('user-list',{
            users,
            currentPage:page,
            totalPages,
            search,
            status

        })
    }
    catch(error){
        console.error(error);
       return res.status(500).send('error fetching users')
    }
}

const toggleUserBlockStatus=async(req,res)=>{
    try{
        const userId=req.params.id;
        const user=await User.findById(userId);
        if(!user || user.isAdmin){
          return  res.status(404).send('user is not found ')
        }
        user.isBlocked=!user.isBlocked;
        await user.save();
        
        return res.json({success:true,isBlocked:user.isBlocked});

    }
    catch(error){
        console.log(error);
       return  res.status(500).send('something went wrong')

    }
}



module.exports={
    getUserList,
    toggleUserBlockStatus
}