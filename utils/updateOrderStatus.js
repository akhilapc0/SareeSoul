  
  
  function updateOrderStatus(order) {
    const statuses = order.items.map(i => i.itemStatus);
    const uniqueStatuses = [...new Set(statuses)];

    // All items same status
    if (uniqueStatuses.length === 1) return order.status = uniqueStatuses[0];

    // All items are cancelled or returned
    if (statuses.every(s => s === 'Cancelled' || s === 'Returned')) return order.status = 'Cancelled';

    // Any item requested for return
    if (statuses.includes('ReturnRequested')) return order.status = 'ReturnRequested';

    // Some items shipped, some pending
    if (statuses.includes('Shipped') && statuses.includes('Pending')) return order.status = 'Partially Shipped';

    // Any other mixed state
    return order.status = 'Partial';
}

export default  updateOrderStatus;