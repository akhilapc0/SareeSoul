import Category from '../../models/categoryModel.js';
import  {categoryValidation} from '../../validator/schema.js';

const getCategoryList=async(req,res)=>{

    try{
        
        const search=(req.query.search?.trim())||'';

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

const currentDate =new Date();
const categoriesWithOfferStatus=categories.map((cat)=>{
  let isOfferActive=false;
  let isOfferUpcoming=false;
  let isOfferExpired=false;

  if(cat.offer){
    const start=new Date(cat.offer.startDate);
    const end=new Date(cat.offer.endDate);

    if(currentDate >=start && currentDate <=end) isOfferActive=true;
    else if(currentDate < start) isOfferUpcoming=true;
    else if(currentDate > end) isOfferExpired=true;
  }

  return {
    ...cat.toObject(),
    isOfferActive,
    isOfferUpcoming,
    isOfferExpired
  }
})


        const totalPages=Math.ceil(totalCategories/limit);
        
       return res.render('category-list',{
            categories:categoriesWithOfferStatus,
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
    


    const  { error,value } = categoryValidation.validate(req.body);

    if (error) {
      return res.render("add-category", {
        error: "All fields are required",
        formData: req.body,
      });
    }

    const {name,description}=value;

    const existingCategory=await Category.findOne({name,isDeleted:false});
    if(existingCategory){
      return res.render('add-category',{
        error:"Category already exists",
        formData:req.body,
      })
    }
      
   await Category.create({name,description});
   
   return  res.redirect("/admin/categories?success=true")
  
    

  } catch (err) {
    
    console.error('Error in postAddCategory:',err.message);

    if(err.code === 11000){
      return res.render("add-category",{
        error:"Category already exists",
        formData:{name:req.body.name,description:req.body.description}
      })
    }

   return  res.render("add-category",{
      error:"server error.please try again",
      formData:{name:req.body.name,description:req.body.description}
    })
  }
};

const getEditCategory=async(req,res)=>{
  try{
    const categoryId=req.params.id;
    const category=await Category.findById(categoryId);
    if(!category){
      return  res.redirect('/admin/categories')
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
    let {name,description}=req.body;
    const {error}=categoryValidation.validate({name,description});
    if(error){
      return res.render('edit-category',{
        error:"All fields are required",
        category:{name,description,_id:categoryId}
      })
    }
    name=name.toLowerCase().trim();
    description=description.trim();

    const existingCategory=await Category.findOne({
      name,
      isDeleted:false,
      _id:{$ne:categoryId}
    })

    if(existingCategory){
      return res.render('edit-category',{
        error:'Category alreday exists',
        category:{name:req.body.name,description,_id:categoryId}
      });
    }

    await Category.findByIdAndUpdate(categoryId,{name,description});
    res.redirect(`/admin/categories/edit/${categoryId}?success=true`)

  }
  catch(error){
    console.log("error edit category",error.message);

    if(error.code ===11000){
      return res.render('edit-category',{
        error:"category already exists",
        category:{name:req.body.name,description:req.body.description,_id:categoryId}

      });
    }
    return res.render('edit-category',{
      error:"error edit category",
      category:{name:req.body.name,description:req.body.description,_id:categoryId}
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
      await Category.findByIdAndUpdate(categoryId,{isDeleted:true})
      res.json({success:true,message:"category deleted successfully"})
  }
  catch(error){
      console.log('error deleting category',error);
      res.status(500).json({success:false,messsage:"error deleting category"})
  }
}



const categoryController={
    getCategoryList,
    loadAddCategory,
    postAddCategory,
    getEditCategory,
    postEditCategory,
    toggleBlock,
    deleteCategory
}


export default categoryController;