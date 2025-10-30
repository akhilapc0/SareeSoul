import Wallet from '../../models/walletModel.js';
import  User from '../../models/userModel.js';

export const getWalletDetails = async(req,res)=>{
    try{

        const userId= req.session?.user?._id || req.session?.passport?.user;
        const user=req.session?.user || await User.findById(userId);

        let wallet = await Wallet.findOne({userId});
        if(!wallet){
            wallet=new Wallet({userId});
            await wallet.save();
        }

        res.render('wallet',{
            user:user,
            balance:wallet.balance,
            transactions:wallet.transactions
        })

    }
    catch(error){
        console.error('Error fetching wallet details:',error);
        res.render('wallet',{
            user:req.user,
            balance:0,
            transactions:[],
            error:'Could not load wallet.please try again'
        })
    }

};


export const addMoneyToWallet=async(req,res)=>{
    try{
        const userId =req.session?.user?._id || req.session?.passport?.user;

        const {amount}=req.body;

        if(!amount || amount <=0){
            return res.json({success:false,message:"Invalid amount"})
        }

    let wallet =await Wallet.findOne({userId});
    if(!wallet){
        wallet=new Wallet({userId,balance:0,transactions:[]})
    }
    
    wallet.balance +=Number(amount);

    wallet.transactions.push({
        type:'Credit',
        amount,
        reason:'Added money to wallet'
    });

    await wallet.save();

    return res.json({success:true,newBalance:wallet.balance})

    }
    catch(error){

        console.log("error adding money",error);
        res.json({success:false,message:"Server error"})

    }
}