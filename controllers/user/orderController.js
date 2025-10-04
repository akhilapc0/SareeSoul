const Order=require('../../models/orderModel');
const User=require('../../models/userModel')
const Variant=require('../../models/variantModel');

const getUserOrders=async(req,res)=>{
    try{
       const userId=req.session?.user?._id || req.session?.passport?.user;
       const user=req.session?.user || await User.findById(userId);

       const page=parseInt(req.query.page) || 1;
       const limit=5;
       const skip=(page - 1)*limit;
       const query={userId};
       if(req.query.orderId){
        query.orderId={$regex:req.query.orderId,$options:'i'}
       }
       if(req.query.startDate && req.query.endDate){
            query.createdAt={
                $gte:new Date(req.query.startDate),
                $lte:new Date(req.query.endDate)
            }
       }
       const orders=await Order.find(query)
                    .sort({createdAt:-1})
                    .skip(skip)
                    .limit(limit)
                    .populate({
                        path:'items.productId',
                        select:'name salesPrice'
                    })
                    .populate({
                        path:'items.variantId',
                        select:'colour'
                    })
        const totalOrders=await Order.countDocuments(query)
        const totalPages=Math.ceil(totalOrders/limit);

        res.render('my-orders',{
            user,
            orders,
            currentPage:page,
            totalPages,
            search:req.query.orderId || '',
            startDate:req.query.startDate|| '',
            endDate:req.query.endDate || ''
        })

    }
    catch(err){
        console.error("error loading user orders:",err);
        res.status(500).send('something went wrong')
    }
}

const getOrderDetail=async(req,res)=>{
    try{
        const userId=req.session?.user?._id || req.session?.passport?.user;
        const orderId=req.params.orderId;
        const order=await Order.findOne({orderId,userId})
        .populate({
            path:'items.productId',
            select:'name description salesPrice'
        })
        .populate({
            path:'items.variantId',
            select:'colour images'
        })

        if(!order){
            return res.status(400).send('order not found')
        }
        const user=req.session?.user || await User.findById(userId);
        res.render('order-detail',{user,order})

    }
    catch(error){
        console.error('Error fetching order detail:',error);
        res.status(500).send('something went wrong')
    }
}

const cancelOrder=async(req,res)=>{

    try{
        
        const userId=req.session?.user?._id || req.session?.passport?.user;
        console.log(userId)
        const orderId=req.params.orderId;
        const {reason} =req.body;
        const order=await Order.findOne({orderId,userId});
        if(!order) return res.status(400).json({messages:'Order not found'});
        if(order.status === 'Cancelled' || order.status === "Delivered"){
            return res.status(400).json({message:'Order cannot be cancelled'});

        }
        for(const item of order.items){
            const variant=await Variant.findById(item.variantId);
            if(variant){
                variant.stock+=item.quantity;
                   await variant.save();
            }
         
            item.cancelReason=reason || '';
            item.itemStatus='Cancelled'
        }
        order.status='Cancelled';
        await order.save();
        return res.json({message:'Order cancelled successfully',order});


    }
    catch(error){
        console.error('Error cancelling order:',error);
        return res.status(500).json({message:'server error'})

    }
}

const cancelOrderItem=async(req,res)=>{
    try{
    const userId=req.session?.user?._id || req.session?.passport?.user;
    const {orderId,itemId}=req.params;
    const {reason}=req.body;
    const order=await Order.findOne({orderId,userId});
    if(!order) return res.status(400).json({message:'Order not found'});
    const item=order.items.id(itemId);
    if(!item) return res.status(400).json({message:'Item not found in order'});
    if(item.itemStatus ==='Cancelled' || item.itemStatus === 'Delivered'){
        return res.status(400).json({message:'Item cannot be cancelled'});
    }
    const variant=await Variant.findById(item.variantId);
    if(variant){
        variant.stock+=item.quantity;
        await variant.save();

    }
    item.itemStatus='Cancelled';
    item.cancelReason=reason || '';
    if(order.items.every(i=> i.itemStatus==='Cancelled')){
        order.status='Cancelled'
    }
    await order.save();
    return res.json({message:'Item cancelled successfully',order})

    }
    catch(err){
        console.error('Error cancelling order item:',error);
        return res.status(500).json({message:"server error"})
    }

}

const returnItem=async(req,res)=>{
    try{
        const userId=req.session?.user?._id || req.session?.passport?.user;
        const{orderId,itemId}=req.params;
        const{reason}=req.body;
        if(!reason){
            return res.status(400).json({message:"Return reason is required"});

        }
        const order=await Order.findOne({orderId,userId});
        if(!order) return res.status(400).json({message:"order not found"});
        const item=order.items.id(itemId);
        if(!item) return res.status(400).json({message:"Item not found"})
        if(item.itemStatus !== 'Delivered'){
            return res.status(400).json({message:"Only delivered items can be returned"})
        }
        item.itemStatus='ReturnRequested';
        item.returnReason=reason;
        await order.save();
        return res.json({message:'Return request submitted successfully',order});

    }
    catch(error){
        console.error('Error submitting return request:',error);
        return res.status(500).json({message:"server error"})

    }
}

const returnOrder=async(req,res)=>{
    try{
        const userId=req.session?.user?._id || req.session?.passport?.user;
        const {orderId}=req.params;
        const{reason}=req.body;
        if(!reason){
            return res.status(400).json({message:"Return reason is required"});
        }
        const order=await Order.findOne({OrderId,userId});
        if(!order) return res.status(400).json({message:"order not found"});
        const hasDelivered=order.items.some(item=>item.itemStatus === "Delivered");
        if(!hasDelivered){
            return res.status(400).json({message:"No delivered items to return"})
        }
        order.items.forEach(item=>{
            if(item.itemStatus === "Delivered"){
                item.itemStatus="ReturnRequested";
                item.returnReason=reason;
            }
        })
        order.status="ReturnRequested";
        await order.save();

        return res.json({message:"Return request for order submitted successfully",order});


    }
    catch(err){
        console.error("Error returning order:",err);
        return res.status(500).json({message:"server error"})

    }
}
module.exports={
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    cancelOrderItem,
    returnItem,
    returnOrder
}