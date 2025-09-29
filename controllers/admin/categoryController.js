const Category=require('../../models/categoryModel');
const {categoryValidation}=require('../../validator/schema');

const getCategoryList=async(req,res)=>{

    try{
        
        const search=(req.query.search)||'';

        const page= Number(req.query.page) || 1;
        const limit=5;
        const filter={
            isDeleted:false,
            name:{$regex:search,$options:'i'}
        }
        const totalCategories=await Category.countDocuments(filter);
        const categories=await Category.find(filter)
                            .sort({createdAt:-1})
                            .skip((page-1)*limit)
                            .limit(limit)
        const totalPages=Math.ceil(totalCategories/limit);
       return res.render('category-list',{
            categories,
             currentPage:page,
             totalPages,
            search
        })


    }
    catch(error){
        console.error('error loading categories:',error);
      return   res.status(500).send('server error')
    }
}


const loadAddCategory = async (req, res) => {

    res.render("add-category", {
      formData: {},            
      error: "",               
    });
};




const postAddCategory = async (req, res) => {
  
  try {
    const { name, description } = req.body;


    const { error } = categoryValidation.validate({ name, description });

    if (error) {
      return res.render("add-category", {
        error: "All fields are required",
        formData: { name, description },
      });
    }

    const categoryExists = await Category.findOne({ name:  name });
    if (categoryExists) {
      return res.render("add-category", {
        error: "Category already exists",
        formData: { name, description },
      });
    }

    
    const category = new Category({
      name,
      description,
      isDeleted: false,
    });

    await category.save();

   res.redirect("/admin/categories/add?success=true");

  } catch (err) {
    console.error("Error in postAddCategory:", err.message);
    res.render("add-category", {
      error: "Server error. Please try again.",
      formData: { name: req.body.name, description: req.body.description },
    });
  }
};

const getEditCategory=async(req,res)=>{
  try{
    const categoryId=req.params.id;
    const category=await Category.findById(categoryId);
    if(!category){
       res.redirect('/admin/categories')
    }
    return res.render('edit-category', {
      category,            
      error: "",               
    }         
    )

  }
  catch(error){
    console.error('error fetching loading edit category page');

    
    return res.render('edit-category',{
      category:"",
      error:"error fetching category "
    })
  }
}

const postEditCategory=async(req,res)=>{
  try{
    const categoryId=req.params.id;
    const {name,description}=req.body;
    const {error}=categoryValidation.validate({name,description});
    if(error){
      return res.render('edit-category',{
        error:"All fields are required",
        category:{name,description}
      })
    }
    await Category.findByIdAndUpdate(categoryId,{name,description});
    res.redirect(`/admin/categories/edit/${categoryId}?success=true`)

  }
  catch(error){
    console.log("error edit category",error.message);
    return res.render('edit-category',{
      error:"error edit category",
      category:{name,description}
    })

  }
}

const toggleBlock=async(req,res)=>{
  try{
    const categoryId=req.params.id;
    const category=await Category.findById(categoryId);
    if(!category){
      return res.status(404).json({message:"Category not found"})
    }
    category.isBlocked=!category.isBlocked;
    await category.save();
    res.json({success:true,isBlocked:category.isBlocked})
  }
  catch(error){
    console.log("error toggling category:",error)
    res.status(500).json({message:"Internal server error"})
  }
}
const deleteCategory=async(req,res)=>{
  try{
      const categoryId=req.params.id;
      const category=await Category.findById(categoryId);
      if(!category){
        return res.status(404).json({success:false,message:"category not found"})
      }
      await Category.findByIdAndDelete(categoryId)
      res.json({success:true,message:"category deleted successfully"})
  }
  catch(error){
      console.log('error deleting category',error);
      res.status(500).json({success:false,messsage:"error deleting category"})
  }
}



module.exports={
    getCategoryList,
    loadAddCategory,
    postAddCategory,
    getEditCategory,
    postEditCategory,
    toggleBlock,
    deleteCategory
}