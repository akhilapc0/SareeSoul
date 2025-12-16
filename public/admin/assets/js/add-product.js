
  //Frontend Validation & Fetch 

   
    document.getElementById("addProductForm").addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const description = document.getElementById("description").value.trim();
      const actualPrice = document.getElementById("actualPrice").value.trim();
      const salesPrice = document.getElementById("salesPrice").value.trim();
      const categoryId = document.getElementById("categoryId").value;
      const brandId = document.getElementById("brandId").value;

      let isValid = true;

      // Clear errors
      document.getElementById("nameError").textContent = "";
      document.getElementById("descError").textContent = "";
      document.getElementById("actualPriceError").textContent = "";
      document.getElementById("salesPriceError").textContent = "";
      document.getElementById("categoryError").textContent = "";
      document.getElementById("brandError").textContent = "";
      document.getElementById("backendError").textContent = "";

      // Client-side Validation (mirroring Joi)
      if (!name) {
        document.getElementById("nameError").textContent = "Product name is required";
        isValid = false;
      }
      if (!description) {
        document.getElementById("descError").textContent = "Product description is required";
        isValid = false;
      }
      if (!actualPrice || isNaN(actualPrice) || actualPrice < 0) {
        document.getElementById("actualPriceError").textContent = "Actual price must be a valid number ≥ 0";
        isValid = false;
      }
      if (!salesPrice || isNaN(salesPrice) || salesPrice < 0) {
        document.getElementById("salesPriceError").textContent = "Sales price must be a valid number ≥ 0";
        isValid = false;
      }
      if (Number(salesPrice) > Number(actualPrice)) {
        document.getElementById("salesPriceError").textContent = "Sales price cannot be greater than actual price";
        isValid = false;
      }
      if (!categoryId) {
        document.getElementById("categoryError").textContent = "Category is required";
        isValid = false;
      }
      if (!brandId) {
        document.getElementById("brandError").textContent = "Brand is required";
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;

      try {
        const res = await fetch("/admin/products/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, actualPrice, salesPrice, categoryId, brandId })
        });

        if(res.redirected){
          window.location = res.url
        }
        const data = await res.json();

        if (!res.ok) {
          
          document.getElementById("backendError").textContent = data.message || "Something went wrong";
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Product added successfully!",
          confirmButtonColor: "#3085d6"
        }).then(() => {
          document.getElementById("addProductForm").reset();
        });

      } catch (err) {
        document.getElementById("backendError").textContent = "Server error. Try again. " + err;
      } finally {
        submitBtn.disabled = false;
      }
    });
  