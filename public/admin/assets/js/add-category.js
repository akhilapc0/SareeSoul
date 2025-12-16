
  let isSubmitting = false; // Prevent double submission

  document.getElementById("addCategoryForm").addEventListener("submit", function (e) {
    // Prevent double submission
    if (isSubmitting) {
      e.preventDefault();
      return;
    }

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const submitBtn = document.getElementById("submitBtn");

    let isValid = true;

    // Clear previous errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("descError").textContent = "";
    const backendError = document.getElementById('backendError');
    if (backendError) backendError.textContent = "";

    if (name.length < 3) {
      document.getElementById("nameError").textContent = "Category name should have at least 3 characters";
      isValid = false;
    }

    if (description.length < 10) {
      document.getElementById("descError").textContent = "Description should have at least 10 characters";
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // If valid, disable button and set submitting flag
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
  });






  
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');

  if (success === 'true') {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Category added successfully!',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      // Clear form after success
      document.getElementById('name').value = '';
      document.getElementById('description').value = '';
      
      const url = new URL(window.location);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url);
    });
  }
