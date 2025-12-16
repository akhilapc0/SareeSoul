const editCategoryForm = document.getElementById("editCategoryForm");

let isSubmitting = false;

if (editCategoryForm) {
  editCategoryForm.addEventListener("submit", function (e) {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const submitBtn = document.getElementById("submitBtn");

    // Clear errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("descError").textContent = "";
    const backendError = document.getElementById("backendError");
    if (backendError) backendError.textContent = "";

    let isValid = true;

    if (name.length < 3) {
      document.getElementById("nameError").textContent =
        "Category name should have at least 3 characters";
      isValid = false;
    }

    if (description.length < 10) {
      document.getElementById("descError").textContent =
        "Description should have at least 10 characters";
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // prevent double submit
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Updating...';
  });
}

/* Success alert from URL */
const urlParams = new URLSearchParams(window.location.search);
const success = urlParams.get("success");

if (success === "true") {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: "Category updated successfully!",
  }).then(() => {
    const url = new URL(window.location);
    url.searchParams.delete("success");
    window.history.replaceState({}, document.title, url);
  });
}
