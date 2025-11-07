async function cancelOrder(orderId) {
  openReasonModal(orderId, null, "cancelOrder");
}

async function cancelItem(orderId, itemId, btn) {
  openReasonModal(orderId, itemId, "cancelItem");
}

async function returnOrder(orderId) {
  openReasonModal(orderId, null, "returnOrder");
}

async function returnItem(orderId, itemId, btn) {
  openReasonModal(orderId, itemId, "returnItem");
}
