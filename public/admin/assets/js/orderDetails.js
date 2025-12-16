
        
               const statusClasses = {
    'Pending': 'alert-warning',
    'Shipped': 'alert-info',
    'Delivered': 'alert-success',
    'Cancelled': 'alert-danger',
    'Returned': 'alert-secondary'
};

//  Return request dropdown with SweetAlert confirmation + rejection reason
document.querySelectorAll('.request-action-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', async () => {
        const action = dropdown.value;
        const orderId = dropdown.dataset.orderid;
        const itemId = dropdown.dataset.itemid;
        const td = dropdown.closest('td');
        const badge = td.querySelector('.badge');
        const message = td.querySelector('.request-message');

        console.log(action)

        let rejectReason = '';

        // If rejecting, ask for reason
        if (action === 'reject') {
            const result = await Swal.fire({
                title: 'Reject Return Request',
                text: 'Please provide a reason for rejection',
                input: 'text',
                inputPlaceholder: 'Enter rejection reason...',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Reject',
                cancelButtonText: 'Cancel',
                inputValidator: (value) => {
                    if (!value) return 'Rejection reason is required!';
                }
            });

            if (!result.isConfirmed || !result.value) {
                dropdown.selectedIndex = 0; 
                return;
            }
            rejectReason = result.value;
        } else {
            // Approve confirmation
            const result = await Swal.fire({
                title: 'Approve Return?',
                text: 'Are you sure you want to approve this return request?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) {
                dropdown.selectedIndex = 0;
                return;
            }
        }

        try {
            const res = await fetch(`/admin/orders/${orderId}/items/${itemId}/request`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, rejectReason })
            });

            const data = await res.json();
            if (res.ok) {
                const updatedItem = data.order.items.find(i => i._id === itemId);
                badge.textContent = updatedItem.itemStatus;
                badge.className = 'badge rounded-pill mt-1 d-block ' + (statusClasses[updatedItem.itemStatus] || 'alert-primary');
                dropdown.remove();

                if (message) {
                    message.textContent = `Return request ${action}d successfully!`;
                    setTimeout(() => { message.textContent = ''; }, 3000);
                }

                // Reload to show rejection reason if rejected
                if (action === 'reject') {
                    setTimeout(() => location.reload(), 1500);
                }
            } else {
                Swal.fire('Error', data.message || 'Error processing request', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Server error', 'error');
        }
    });
});

//  Normal item status dropdown with SweetAlert confirmation
document.querySelectorAll('.update-status-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', async () => {
        const status = dropdown.value;
        const orderId = dropdown.dataset.orderid;
        const itemId = dropdown.dataset.itemid;
        const td = dropdown.closest('td');
        const badge = td.querySelector('.badge');
        const message = td.querySelector('.update-message');

        const result = await Swal.fire({
            title: 'Confirm Status Change',
            text: `Are you sure you want to change status to ${status}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            dropdown.selectedIndex = 0;
            return;
        }

        try {
            const res = await fetch(`/admin/orders/${orderId}/items/${itemId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            const data = await res.json();
            if (res.ok) {
                const updatedItem = data.order.items.find(i => i._id === itemId);
                badge.textContent = updatedItem.itemStatus;
                badge.className = 'badge rounded-pill mt-1 d-block ' + (statusClasses[updatedItem.itemStatus] || 'alert-primary');
                dropdown.remove();
                if (message) {
                    message.textContent = "Status updated successfully!";
                    setTimeout(() => { message.textContent = ''; }, 3000);
                }
                window.location.reload()
            } else {
                if (message) message.textContent = data.message || 'Error updating status';
                else alert(data.message || 'Error');
            }
        } catch (err) {
            console.error(err);
            if (message) message.textContent = 'Server error';
        }
    });
});
        