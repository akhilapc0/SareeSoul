import Order from'../../models/orderModel.js';
import Variant from'../../models/variantModel.js';
import  updateOrderStatus  from '../../utils/updateOrderStatus.js';

const getAllOrders=async(req,res)=>{
    try{
        const search=req.query.search || '';
        const statusFilter=req.query.status || '';
        const sortBy=req.query.sortBy || 'date';
        const order=req.query.order === 'asc' ? 1 :-1;
        const page=parseInt(req.query.page) || 1;
        const limit=10;
        const skip=(page-1)*limit;
        
        const query={};
        if(search){
            query.orderId={$regex: search,$options:'i'};
        }
        if(statusFilter){
            query.status=statusFilter;
        }

        let sortOption={};
        if(sortBy==='amount'){
            sortOption.total=order;
        }else{
            sortOption.createdAt=order;
        }
        const orders=await Order.find(query)
        .populate('userId','firstName email')
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

        const totalOrders=await Order.countDocuments(query);
        const totalPages=Math.ceil(totalOrders/limit);
        res.render('orders',{
            orders,
            currentPage:page,
            totalPages,
            search,
            statusFilter,
            sortBy,
            order
        })


    }
    catch(err){
        console.error('Error loading orders:',err);
        res.status(500).send('server error')
    }
}

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ orderId })
      .populate('userId', 'firstName lastName email phoneNumber')
      .populate('items.productId', 'name')
      .populate('items.variantId', 'colour')
      .lean();

    if (!order) {
      return res.status(400).send('Order not found');
    }

    
    order.items = order.items || [];

    
    if (order.userId) {
      order.userId.fullName = `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim();
    }

    res.render('orderDetails', { order });

  } catch (error) {
    console.error('Error loading order details:', error);
    res.status(500).send('Server error');
  }
};
const updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const item = order.items.id(itemId);
        if (!item) return res.status(404).json({ message: "Item not found in order" });

        
        if (['Cancelled', 'Returned', 'ReturnRequested'].includes(item.itemStatus)) {
            return res.status(400).json({ message: `Cannot update item with status '${item.itemStatus}'` });
        }

        
        const validTransitions = {
            'Pending': ['Shipped'],
            'Shipped': ['Delivered']
        };
        if (!validTransitions[item.itemStatus].includes(status)) {
            return res.status(400).json({ message: `Invalid status transition from ${item.itemStatus} to ${status}` });
        }

        
        item.itemStatus = status;

        
        updateOrderStatus(order);

        await order.save();

        return res.status(200).json({ message: "Item status updated successfully", order });

    } catch (error) {
        console.error('Error updating item status:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

const handleItemRequest = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { action, rejectReason } = req.body;

        const validActions = ['approve', 'reject'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const order = await Order.findOne({ orderId });
        if (!order) return res.status(404).json({ message: "Order not found" });

        const item = order.items.id(itemId);
        if (!item) return res.status(404).json({ message: "Item not found" });

        if (item.itemStatus !== 'ReturnRequested') {
            return res.status(400).json({ message: "No return request pending for this item" });
        }

        if (action === 'approve') {
           
            const variant = await Variant.findById(item.variantId);
            if (variant) {
                variant.stock += item.quantity;
                await variant.save();
            }
            item.itemStatus = 'Returned';
            item.rejectReason = ''; 
        }

        if (action === 'reject') {
            item.itemStatus = 'Delivered';
            item.rejectReason = rejectReason || ''; 
        }

        
        updateOrderStatus(order);

        await order.save();

        return res.json({ message: `Return request ${action}d successfully`, order });

    } catch (err) {
        console.error("Error handling return request:", err);
        return res.status(500).json({ message: "Server error" });
    }
};






const orderController={
    getAllOrders,
    getOrderDetails,
   updateOrderItemStatus,
   handleItemRequest
}

export default orderController;