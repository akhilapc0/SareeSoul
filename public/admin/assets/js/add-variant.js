

  // Main Script 
  
    document.addEventListener("DOMContentLoaded", () => {
      const imagesInput = document.getElementById("images");
      const previewDiv = document.getElementById("imagePreview");
      const form = document.getElementById("addVariantForm");
      const submitBtn = document.getElementById("submitBtn");
      const imagesError = document.getElementById("imagesError");

      let imageFiles = []; // Final storage
      let cropper;
      let fileQueue = []; // Temporary file storage for selected images
      const MAX_IMAGES = '<%=maxImageSize%>';

      // File input change
      imagesInput.addEventListener("change", () => {
        const newFiles = Array.from(imagesInput.files);
        const totalImages = imageFiles.length + newFiles.length;

        // Check if total images exceed the limit
        if (totalImages > MAX_IMAGES) {
          imagesError.textContent = `You can only upload up to ${MAX_IMAGES} images.`;
          imagesInput.value = ""; // Clear the input
          return;
        }

        imagesError.textContent = ""; // Clear any previous error
        fileQueue = newFiles; // Update fileQueue with new files
        if (fileQueue.length > 0) {
          startCropping();
        }
      });

      function startCropping() {
        if (fileQueue.length === 0) return; // Nothing left to crop

        const file = fileQueue.shift(); // Take first from queue
        const reader = new FileReader();

        reader.onload = (e) => {
          document.getElementById("cropperImage").src = e.target.result;
          document.getElementById("cropperModal").style.display = "flex";

          if (cropper) cropper.destroy();
          cropper = new Cropper(document.getElementById("cropperImage"), {
            aspectRatio: NaN, // No fixed aspect ratio for full saree capture
            viewMode: 0, // Allow crop box to extend beyond image bounds if needed
            autoCropArea: 1.0, // Start with the full image selected
            scalable: true,
            zoomable: true,
            movable: true
          });
        };

        reader.readAsDataURL(file);
      }

      function closeCropper() {
        document.getElementById("cropperModal").style.display = "none";
        if (cropper) cropper.destroy();
        setTimeout(() => startCropping(), 300); // Move to next image
      }

      document.getElementById("cropConfirm").addEventListener("click", () => {
        // Check if adding a new image would exceed the limit
        if (imageFiles.length >= MAX_IMAGES) {
          document.getElementById("cropperModal").style.display = "none";
          imagesError.textContent = `You can only upload up to ${MAX_IMAGES} images.`;
          fileQueue = []; // Clear remaining files in queue
          return;
        }

        cropper.getCroppedCanvas({ width: 300, height: 600 }).toBlob((blob) => { // Adjusted for taller saree images
          const croppedFile = new File([blob], "cropped_" + Date.now() + ".jpg", { type: "image/jpeg" });
          imageFiles.push(croppedFile);

          renderPreviews();

          closeCropper();
        }, "image/jpeg");
      });

      function renderPreviews() {
        previewDiv.innerHTML = "";
        imageFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const container = document.createElement("div");
            container.style.position = "relative";

            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "img-thumb";
            img.style.height = "200px"; // preview height

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.textContent = "×";
            removeBtn.onclick = () => {
              imageFiles.splice(index, 1);
              renderPreviews();
              imagesError.textContent = ""; // Clear error when an image is removed
            };

            container.appendChild(img);
            container.appendChild(removeBtn);
            previewDiv.appendChild(container);
          };
          reader.readAsDataURL(file);
        });
      }

      // Submit handler
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const colour = document.getElementById("colour").value.trim();
        const stock = document.getElementById("stock").value.trim();

        document.getElementById("colourError").textContent = "";
        document.getElementById("stockError").textContent = "";
        document.getElementById("imagesError").textContent = "";
        document.getElementById("backendError").textContent = "";

        let isValid = true;
        if (!colour) {
          document.getElementById("colourError").textContent = "Colour is required";
          isValid = false;
        }
        if (!stock || isNaN(stock) || stock < 0) {
          document.getElementById("stockError").textContent = "Stock must be ≥ 0";
          isValid = false;
        }
        if (imageFiles.length === 0) {
          document.getElementById("imagesError").textContent = "At least one image is required";
          isValid = false;
        }
        if (imageFiles.length > MAX_IMAGES) {
          document.getElementById("imagesError").textContent = `You can only upload up to ${MAX_IMAGES} images`;
          isValid = false;
        }
        if (!isValid) return;

        submitBtn.disabled = true;

        try {
          const formData = new FormData();
          formData.append("colour", colour);
          formData.append("stock", stock);
          imageFiles.forEach(file => formData.append("images", file));

          const productId=document.getElementById("productId").value;
          const res = await fetch(`/admin/products/${productId}/variants/add`, {
            method: "POST",
            body: formData
          });

          const data = await res.json();

          if (!res.ok) {
            document.getElementById("backendError").textContent = data.message || "Something went wrong";
            return;
          }

          Swal.fire({
            icon: "success",
            title: "Success",
            text: data.message || "Variant added successfully!",
            confirmButtonColor: "#3085d6"
          }).then(() => {
            form.reset();
            imageFiles = [];
            renderPreviews();
          });

        } catch (err) {
          document.getElementById("backendError").textContent = "Server error: " + err;
        } finally {
          submitBtn.disabled = false;
        }
      });
    });
  