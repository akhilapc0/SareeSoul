const editProductForm = document.getElementById("editProductForm");

if (editProductForm) {
  editProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const description = document.getElementById("description").value.trim();
    const actualPrice = document.getElementById("actualPrice").value.trim();
    const salesPrice = document.getElementById("salesPrice").value.trim();
    const categoryId = document.getElementById("categoryId").value;
    const brandId = document.getElementById("brandId").value;
    const submitBtn = document.getElementById("submitBtn");

    // clear errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("descError").textContent = "";
    document.getElementById("actualPriceError").textContent = "";
    document.getElementById("salesPriceError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("brandError").textContent = "";
    document.getElementById("backendError").textContent = "";

    let isValid = true;

    if (!name) {
      document.getElementById("nameError").textContent =
        "Product name is required";
      isValid = false;
    }

    if (!description) {
      document.getElementById("descError").textContent =
        "Product description is required";
      isValid = false;
    }

    if (!actualPrice || isNaN(actualPrice) || actualPrice < 0) {
      document.getElementById("actualPriceError").textContent =
        "Actual price must be ≥ 0";
      isValid = false;
    }

    if (!salesPrice || isNaN(salesPrice) || salesPrice < 0) {
      document.getElementById("salesPriceError").textContent =
        "Sales price must be ≥ 0";
      isValid = false;
    }

    if (Number(salesPrice) > Number(actualPrice)) {
      document.getElementById("salesPriceError").textContent =
        "Sales price cannot be greater than actual price";
      isValid = false;
    }

    if (!categoryId) {
      document.getElementById("categoryError").textContent =
        "Category is required";
      isValid = false;
    }

    if (!brandId) {
      document.getElementById("brandError").textContent =
        "Brand is required";
      isValid = false;
    }

    if (!isValid) return;

    const productId = editProductForm.dataset.productid;
    submitBtn.disabled = true;

    try {
      const res = await fetch(`/admin/products/edit/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          actualPrice,
          salesPrice,
          categoryId,
          brandId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        document.getElementById("backendError").textContent =
          data.message || "Something went wrong";
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message || "Product updated successfully",
      }).then(() => {
        window.location.href = "/admin/products";
      });
    } catch (err) {
      document.getElementById("backendError").textContent =
        "Server error";
    } finally {
      submitBtn.disabled = false;
    }
  });
}
