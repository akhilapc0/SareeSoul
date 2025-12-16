
// Search Clear Button Handling

  
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
  

    // Block / Unblock Brand

     async function toggleBlock(brandId, block) {
  try {
    const res = await fetch(`/admin/brands/toggle/${brandId}`, {
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

// Delete Brand

 document.querySelectorAll('.delete-brand-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const brandId = button.getAttribute('data-brand-id');

        const result = await Swal.fire({
          title: `Are you sure?`,
          text: `You are about to delete this brand.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#aaa',
          confirmButtonText: `Yes, delete it!`
        });

        if (result.isConfirmed) {
          try {
            const res = await fetch(`/admin/brands/delete/${brandId}`, { method: 'DELETE' }); 
            const data = await res.json();

            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: `Brand deleted successfully`,
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
    
