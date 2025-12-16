
// image preview

document.getElementById("brandImage").addEventListener("change", function () {
    let file = this.files[0]; 
    let preview = document.getElementById("previewImage");

    if (file) {
      let reader = new FileReader(); 

      reader.onload = function (event) {
        preview.src = event.target.result;
        preview.style.display = "block"; 
      };

      reader.readAsDataURL(file); 
    } else {
      preview.style.display = "none"; 
    }
  });



  // FORM SUBMISSION + VALIDATION



        document.getElementById("addBrandForm").addEventListener("submit", async function (e) {
          e.preventDefault();
          const formData=new FormData();
         
          const name=document.getElementById("name").value.trim();
          formData.append('name',name);
          const description=document.getElementById("description").value.trim();
          formData.append('description',description);
          const brandImage=document.getElementById('brandImage').files[0];
          formData.append('brandImage',brandImage);
          let isValid = true;
          document.getElementById("nameError").textContent = "";
          document.getElementById("descError").textContent = "";
          document.getElementById("backendError").textContent = "";

          if (name.length < 3) {
            document.getElementById("nameError").textContent = "Brand name should have at least 3 characters";
            isValid = false;
          }
          if (description.length < 10) {
            document.getElementById("descError").textContent = "Description should have at least 10 characters";
            isValid = false;
          }
          if(!brandImage){
            document.getElementById("imageError").textContent="Image is required";
          }
          if (!isValid) return;
         
          const submitBtn = document.getElementById("submitBtn");
          submitBtn.disabled = true;
          try {
            const res = await fetch("/admin/brands/add", {
              method: "POST",
             
              body: formData,
            });

            
            const data = await res.json();
            if (!res.ok) {
              document.getElementById("backendError").textContent = data.error || "Something went wrong";
              return;
            }

            Swal.fire({
              icon: "success",
              title: "Success",
              text: data.message || "Brand added successfully!",
              confirmButtonColor: "#3085d6"
            }).then(() => {
              document.getElementById("addBrandForm").reset();
            });
          } catch (err) {
            document.getElementById("backendError").textContent = "Server error. Try again." + err;
          }finally{
            submitBtn.disabled=false;
          }
        });
      
