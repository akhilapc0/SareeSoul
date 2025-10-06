async function cancelOrder(orderId) {
    const { value: reason } = await Swal.fire({
        title: 'Cancel Order?',
        text: 'Are you sure you want to cancel this entire order?',
        input: 'text',
        inputPlaceholder: 'Optional reason...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, Cancel Order',
        cancelButtonText: 'No'
    });

    if (reason !== undefined) {
        try {
            const res = await fetch(`/orders/${orderId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error!', data.message || 'Cancellation failed', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Something went wrong', 'error');
        }
    }
}

async function cancelItem(orderId, itemId, btn) {
    const { value: reason } = await Swal.fire({
        title: 'Cancel Item?',
        text: 'Are you sure you want to cancel this item?',
        input: 'text',
        inputPlaceholder: 'Optional reason...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No'
    });

    if (reason !== undefined) {
        try {
            const res = await fetch(`/orders/${orderId}/item/${itemId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                const row = btn.closest('.item-row');
                const statusBadge = row.querySelector('.item-status');
                if (statusBadge) {
                    statusBadge.textContent = 'Cancelled';
                    statusBadge.className = 'badge item-status bg-danger ms-2';
                }
                btn.remove();
                Swal.fire('Cancelled!', 'Item has been cancelled.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error!', data.message || 'Cancellation failed', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Something went wrong', 'error');
        }
    }
}

async function returnItem(orderId, itemId, btn) {
    const { value: reason } = await Swal.fire({
        title: 'Return Item?',
        text: 'Please provide a reason for returning this item.',
        input: 'text',
        inputPlaceholder: 'Enter reason...',
        icon: 'warning',
        inputValidator: (value) => { if (!value) return 'Reason is required!'; },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit Return',
        cancelButtonText: 'Cancel'
    });

    if (reason) {
        try {
            const res = await fetch(`/orders/${orderId}/item/${itemId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                const row = btn.closest('.item-row');
                const statusBadge = row.querySelector('.item-status');
                if (statusBadge) {
                    statusBadge.textContent = 'ReturnRequested';
                    statusBadge.className = 'badge item-status bg-warning ms-2';
                }
                btn.remove();
                Swal.fire('Return Requested!', 'Your return request has been submitted.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error!', data.message || 'Return request failed', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error!', 'Something went wrong', 'error');
        }
    }
}

async function returnOrder(orderId) {
    const { value: reason } = await Swal.fire({
        title: 'Return Order',
        text: 'Please provide a reason for returning this order',
        input: 'text',
        inputPlaceholder: 'Enter your reason here',
        inputValidator: (value) => { if (!value) return 'Return reason is required!'; },
        showCancelButton: true,
        confirmButtonText: 'Submit Return',
        cancelButtonText: 'Cancel',
        icon: 'warning'
    });

    if (reason) {
        try {
            const res = await fetch(`/orders/${orderId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire('Success', data.message, 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Error', data.message || 'Something went wrong', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Server error', 'error');
        }
    }
}