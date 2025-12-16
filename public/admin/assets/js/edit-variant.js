const form = document.getElementById("editVariantForm");

if (!form) {
  console.warn("Edit variant form not found");
} else {

  const MAX_IMAGES = Number(form.dataset.maximages);
  const productId = form.dataset.productid;
  const variantId = form.dataset.variantid;

  let newFiles = [];
  let cropper;

  // remove existing image
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-existing")) {
      e.target.parentElement.remove();
    }
  });

  const imagesInput = document.getElementById("images");
  const newPreview = document.getElementById("newImagePreview");
  const cropperModal = document.getElementById("cropperModal");
  const cropperImage = document.getElementById("cropperImage");
  const cropConfirm = document.getElementById("cropConfirm");

  imagesInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      cropperImage.src = ev.target.result;
      cropperModal.style.display = "flex";

      if (cropper) cropper.destroy();
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
      });
    };
    reader.readAsDataURL(file);

    imagesInput.value = "";
  });

  function closeCropper() {
    cropperModal.style.display = "none";
    if (cropper) cropper.destroy();
  }

  document.querySelector("#cropperBox .btn-secondary").onclick = closeCropper;

  cropConfirm.addEventListener("click", () => {
    cropper.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {

      const file = new File(
        [blob],
        "cropped_" + Date.now() + ".jpg",
        { type: "image/jpeg" }
      );

      const keptImages = document.querySelectorAll(
        "input[name='existingImages']"
      ).length;

      if (keptImages + newFiles.length + 1 > MAX_IMAGES) {
        alert(`Max ${MAX_IMAGES} images allowed`);
        closeCropper();
        return;
      }

      newFiles.push(file);
      previewNewImage(file);
      closeCropper();
    });
  });

  function previewNewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement("div");
      div.style.position = "relative";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "img-thumb";

      const btn = document.createElement("button");
      btn.className = "remove-btn";
      btn.textContent = "×";
      btn.onclick = () => {
        newFiles = newFiles.filter((f) => f !== file);
        div.remove();
      };

      div.appendChild(img);
      div.appendChild(btn);
      newPreview.appendChild(div);
    };
    reader.readAsDataURL(file);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const colour = document.getElementById("colour").value.trim();
    const stock = document.getElementById("stock").value.trim();

    const keptImages = Array.from(
      document.querySelectorAll("input[name='existingImages']")
    ).map((i) => i.value);

    document.getElementById("imagesError").textContent = "";
    document.getElementById("backendError").textContent = "";

    const totalImages = keptImages.length + newFiles.length;

    if (totalImages === 0) {
      document.getElementById("imagesError").textContent =
        "At least one image is required";
      return;
    }

    if (totalImages > MAX_IMAGES) {
      document.getElementById("imagesError").textContent =
        `Max ${MAX_IMAGES} images allowed`;
      return;
    }

    const formData = new FormData();
    formData.append("colour", colour);
    formData.append("stock", stock);
    keptImages.forEach((img) => formData.append("existingImages", img));
    newFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(
        `/admin/products/${productId}/variants/edit/${variantId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        document.getElementById("backendError").textContent =
          data.message || "Something went wrong";
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: data.message,
      }).then(() => {
        window.location.href = `/admin/products/${productId}/variants`;
      });

    } catch (err) {
      document.getElementById("backendError").textContent =
        "Server error";
    }
  });

}
