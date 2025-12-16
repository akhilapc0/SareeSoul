
// TOGGLE COUPON (Block / Unblock)


  
    async function toggleCoupon(couponId, currentStatus) {
 
      const action = currentStatus ? 'block' : 'unblock';
      
      const result = await Swal.fire({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Coupon?`,
        text: `Are you sure you want to ${action} this coupon?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#008B8B',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(`/admin/coupons/toggle/${couponId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.json();

          if (data.success) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: data.message,
              confirmButtonColor: '#008B8B'
            }).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: data.message,
              confirmButtonColor: '#008B8B'
            });
          }
        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong!',
            confirmButtonColor: '#008B8B'
          });
        }
      }
    }
  