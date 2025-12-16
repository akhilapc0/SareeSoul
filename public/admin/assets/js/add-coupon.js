
        const form = document.getElementById('addCouponForm');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const formData = {
            code: form.code.value.trim().toUpperCase(),
            discountValue: Number(form.discountValue.value),
            minCartAmount: Number(form.minCartAmount.value),
            maxDiscount: Number(form.maxDiscount.value),
            validityDate: form.validityDate.value,
            usageLimit: Number(form.usageLimit.value)
          };

          try {
            const response = await fetch('/admin/coupons/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });

            console.log("response is:", response)
            const data = await response.json();

            console.log("data is :", data)

            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message,
                confirmButtonColor: '#008B8B'
              }).then(() => {
                window.location.href = '/admin/coupons';
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
        });


        // Set minimum date to tomorrow
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const minDate = tomorrow.toISOString().split('T')[0];
          document.getElementById('validityDate').setAttribute('min', minDate);

          // Date validation on change
          const dateInput = document.getElementById('validityDate');
          dateInput.addEventListener('change', function () {
            const selectedDate = new Date(this.value);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const hint = document.getElementById('dateHint');

            if (selectedDate < tomorrow) {
              this.style.borderColor = '#dc3545';
              hint.style.color = '#dc3545';
              hint.textContent = 'Date must be at least tomorrow or later';
            } else {
              this.style.borderColor = '';
              hint.style.color = '#666';
              hint.textContent = 'Coupon expiry date (must be a future date)';
            }
          });

