// Image preview
const brandImageInput = document.getElementById("brandImage");
const previewImage = document.getElementById("previewImage");
const previewBox = document.getElementById("previewBox");

if (previewBox) {
  previewBox.style.display = "none";
}

if (brandImageInput) {
  brandImageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) return;

    previewBox.style.display = "block";

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Form submit
const editBrandForm = document.getElementById("editBrandForm");

if (editBrandForm) {
  editBrandForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const brandImage = document.getElementById("brandImage").files[0];
    const brandId = editBrandForm.dataset.brandid;
    const currentImage = editBrandForm.dataset.currentimage;
    const submitBtn = document.getElementById("submitBtn");

    // Clear errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("descError").textContent = "";
    document.getElementById("imageError").textContent = "";
    document.getElementById("backendError").textContent = "";

    let isValid = true;

    if (name.length < 3) {
      document.getElementById("nameError").textContent =
        "Brand name should have 3 characters";
      isValid = false;
    }

    if (description.length < 10) {
      document.getElementById("descError").textContent =
        "Description should have at least 10 characters";
      isValid = false;
    }

    if (!brandImage && !currentImage) {
      document.getElementById("imageError").textContent =
        "Image is required";
      isValid = false;
    }

    if (!isValid) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (brandImage) {
      formData.append("brandImage", brandImage);
    }

    try {
      submitBtn.disabled = true;

      const res = await fetch(`/admin/brands/edit/${brandId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        document.getElementById("backendError").textContent =
          data.error || "Something went wrong";
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message || "Brand edited successfully",
      }).then(() => {
        window.location.reload();
      });
    } catch (err) {
      document.getElementById("backendError").textContent =
        "Server error";
    } finally {
      submitBtn.disabled = false;
    }
  });
}
