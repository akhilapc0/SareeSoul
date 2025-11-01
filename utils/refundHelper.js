

const calculateItemCouponShare = (item, totalCouponDiscount, orderSubtotal) => {
  if (!totalCouponDiscount || totalCouponDiscount === 0) return 0;
  
  
  const itemTotal = item.price * item.quantity;
  
  
  const itemShare = (itemTotal / orderSubtotal) * totalCouponDiscount;
  
  return Math.round(itemShare * 100) / 100; 
};


const calculateItemRefund = (item, orderDiscount, orderSubtotal) => {
  
  const itemTotal = item.price * item.quantity;
  
  
  const itemCouponDiscount = calculateItemCouponShare(item, orderDiscount, orderSubtotal);
  
  
  const refundAmount = itemTotal - itemCouponDiscount;
  
  return Math.round(refundAmount * 100) / 100; 
};


const calculateOrderRefund = (items, orderDiscount, orderSubtotal) => {
  let totalRefund = 0;
  
  items.forEach(item => {
    if (['Pending', 'Shipped', 'Delivered'].includes(item.itemStatus)) {
      totalRefund += calculateItemRefund(item, orderDiscount, orderSubtotal);
    }
  });
  
  return Math.round(totalRefund * 100) / 100;
};


const recalculateOrderAfterCancellation = (order, cancelledItemId) => {
  
  const cancelledItem = order.items.id(cancelledItemId);
  if (!cancelledItem) {
    throw new Error('Item not found');
  }
  
  
  let newSubtotal = 0;
  order.items.forEach(item => {
    if (item._id.toString() !== cancelledItemId.toString() && 
        !['Cancelled', 'Returned'].includes(item.itemStatus)) {
      newSubtotal += item.price * item.quantity;
    }
  });
  
  
  const originalSubtotal = order.subtotal;
  const originalDiscount = order.discount || 0;
  
  let newDiscount = 0;
  if (originalDiscount > 0 && newSubtotal > 0) {
    
    newDiscount = (newSubtotal / originalSubtotal) * originalDiscount;
    newDiscount = Math.round(newDiscount * 100) / 100;
  }
  
  const newTotal = newSubtotal - newDiscount;
  
  return {
    newSubtotal: Math.round(newSubtotal * 100) / 100,
    newDiscount: Math.round(newDiscount * 100) / 100,
    newTotal: Math.round(newTotal * 100) / 100
  };
};


const getRefundBreakdown = (item, orderDiscount, orderSubtotal) => {
  const itemTotal = item.price * item.quantity;
  const itemCouponDiscount = calculateItemCouponShare(item, orderDiscount, orderSubtotal);
  const refundAmount = itemTotal - itemCouponDiscount;
  
  return {
    itemPrice: item.price,
    quantity: item.quantity,
    itemTotal: itemTotal,
    couponShare: itemCouponDiscount,
    refundAmount: refundAmount,
    breakdown: {
      offerPrice: `₹${item.price} × ${item.quantity} = ₹${itemTotal}`,
      couponDeduction: `₹${itemCouponDiscount.toFixed(2)}`,
      finalRefund: `₹${refundAmount.toFixed(2)}`
    }
  };
};



export {
  calculateItemCouponShare,
  calculateItemRefund,
  calculateOrderRefund,
  recalculateOrderAfterCancellation,
  getRefundBreakdown
};
