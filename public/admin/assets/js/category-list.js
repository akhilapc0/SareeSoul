     
        
        // Search Input: Clear Button Handler

        function toggleClearButton() {
          const input = document.getElementById('searchInput');
          const clearBtn = document.getElementById('clearSearchBtn');
          clearBtn.classList.toggle('visible', input.value.trim().length > 0);
        }

        function clearSearch() {
          const input = document.getElementById('searchInput');
          input.value = '';
          document.querySelector('form').submit();
        }

        toggleClearButton();

        
        // Add Category Offer
        async function addCategoryOffer(categoryId) {
          const { value: formValues } = await Swal.fire({
            title: 'Add Category Offer',
            html: `
              <div style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Discount Percentage (%)</label>
                <input id="discount" type="number" min="1" max="100" class="swal2-input" placeholder="Enter discount %" style="width: 90%;">
                
                <label style="display: block; margin-top: 15px; margin-bottom: 5px; font-weight: 600;">Start Date</label>
                <input id="startDate" type="date" class="swal2-input" style="width: 90%;">
                
                <label style="display: block; margin-top: 15px; margin-bottom: 5px; font-weight: 600;">End Date</label>
                <input id="endDate" type="date" class="swal2-input" style="width: 90%;">
              </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Add Offer',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            preConfirm: () => {
  const discount = document.getElementById('discount').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!discount || !startDate || !endDate) {
    Swal.showValidationMessage('All fields are required!');
    return false;
  }

  if (discount < 1 || discount > 100) {
    Swal.showValidationMessage('Discount must be between 1-100%');
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start < tomorrow) {
    Swal.showValidationMessage('Start date must be at least tomorrow or later');
    return false;
  }

  if (end <= start) {
    Swal.showValidationMessage('End date must be after start date');
    return false;
  }

  return { discount, startDate, endDate };
}

          });

          if (formValues) {
            try {
              const res = await fetch(`/admin/offer/category/add-offer/${categoryId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  discountPercentage: formValues.discount,
                  startDate: formValues.startDate,
                  endDate: formValues.endDate
                })
              });

              const data = await res.json();

              if (data.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Category Offer Added!',
                  text: data.message,
                  timer: 1500,
                  showConfirmButton: false
                }).then(() => location.reload());
              } else {
                Swal.fire('Error', data.message, 'error');
              }
            } catch (err) {
              Swal.fire('Error', 'Server error: ' + err, 'error');
            }
          }
        }

        // Remove Category Offer
        async function removeCategoryOffer(categoryId) {
          const result = await Swal.fire({
            title: 'Remove Category Offer?',
            text: 'This will affect all products in this category!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, remove it!'
          });

          if (result.isConfirmed) {
            try {
              const res = await fetch(`/admin/offer/category/remove-offer/${categoryId}`, {
                method: 'DELETE'
              });

              const data = await res.json();

              if (data.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Category Offer Removed!',
                  text: data.message,
                  timer: 1500,
                  showConfirmButton: false
                }).then(() => location.reload());
              } else {
                Swal.fire('Error', data.message, 'error');
              }
            } catch (err) {
              Swal.fire('Error', 'Server error: ' + err, 'error');
            }
          }
        }

        // BLOCK UNBLOCK CATEGORY

        async function toggleBlock(categoryId, block) {
          try {
            const res = await fetch(`/admin/categories/toggle/${categoryId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isBlocked: block })
            });
            const data = await res.json();

            if (!res.ok) {
              Swal.fire({ icon: "error", title: "Error", text: data.message || "Something went wrong" });
              return;
            }

            Swal.fire({ icon: "success", title: block ? "Blocked" : "Unblocked", text: data.message })
              .then(() => window.location.reload());
          } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: "Server error: " + err });
          }
        }
      
// DELETE CATEGORY

        document.querySelectorAll('.delete-category-btn').forEach(button => {
          button.addEventListener('click', async () => {
            const categoryId = button.getAttribute('data-category-id');

            const result = await Swal.fire({
              title: `Are you sure?`,
              text: `You are about to delete this category.`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#aaa',
              confirmButtonText: `Yes, delete it!`
            });

            if (result.isConfirmed) {
              try {
                const res = await fetch(`/admin/categories/delete/${categoryId}`, {
                  method: 'DELETE'
                });

                const data = await res.json();

                if (data.success) {
                  Swal.fire({
                    icon: 'success',
                    title: `Category deleted successfully`,
                    showConfirmButton: false,
                    timer: 1500
                  }).then(() => location.reload());
                } else {
                  Swal.fire('Error', data.message || 'Failed to delete', 'error');
                }
              } catch (err) {
                Swal.fire('Error', 'Something went wrong', 'error');
              }
            }
          });
        });
    