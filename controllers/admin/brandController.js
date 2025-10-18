import  Brand from '../../models/brandModel.js';
import  {brandValidation} from '../../validator/schema.js';

const getBrandList=async(req,res)=>{

    try{

        const search=(req.query.search)||'';

        const page= Number(req.query.page) || 1;
        const limit=5;
        const filter={
            isDeleted:false,
            name:{$regex:search,$options:'i'}
        }
        const totalBrands=await Brand.countDocuments(filter);
        const brands=await Brand.find(filter)
                            .sort({createdAt:-1})
                            .skip((page-1)*limit)
                            .limit(limit)
        const totalPages=Math.ceil(totalBrands/limit);
       return res.render('brand-list',{
            brands,
             currentPage:page,
             totalPages,
            search
        })


    }
    catch(error){
        console.error('error loading brands:',error);
      return   res.status(500).send('server error')
    }
}


const loadAddBrand = async (req, res) => {

    res.render("add-brand", {
      formData: {},            
      error: "",               
    });
};


const postAddBrand = async (req, res) => {
  try {
    
    const { name, description } = req.body;
       const imageUrl = req.file?.path; 
    
    const { error } = brandValidation.validate({ name, description });
    if (error) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!imageUrl) {
      return res.status(400).json({ error: "All fields including image are required" });
    }

    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
      return res.status(409).json({ error: "Brand already exists" });
    }

    const brand = new Brand({
      name,
      description,
      image:imageUrl,
      isDeleted: false,
    });

    await brand.save();

    return res.json({ success: true, message: "Brand added successfully!" });

  } catch (err) {
    console.error("Error in postAddBrand:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};


const getEditBrand=async(req,res)=>{
  try{
    const brandId=req.params.id;
    const brand=await Brand.findById(brandId);
    if(!brand){
       res.redirect('/admin/brands')
    }
    return res.render('edit-brand', {
      brand,            
      error: "",               
    }         
    )

  }
  catch(error){
    console.error('error fetching loading edit brand page');

    
    return res.render('edit-brand',{
      category:"",
      error:"error fetching brand "
    })
  }
}

const postEditBrand=async(req,res)=>{
  try{
    const brandId=req.params.id;
    const {name,description}=req.body;
    const imageUrl = req.file?.path; 

    const {error}=brandValidation.validate({name,description});
    if(error){
      return res.status(400).json({error:"all fields are required"})
    }

    const brand=await Brand.findById(brandId);


    if (!imageUrl && !brand?.image) {
      return res.status(400).json({ error: "All fields including image are required" });
    }

    await Brand.findByIdAndUpdate(brandId,{name,description,image:imageUrl});
    return res.status(200).json("brand edited successfully")
  }
  catch(error){
    console.log("error edit brand",error.message);
    return res.status(500).json({error:"server error ,something went wrong"})
  }
}

const toggleBlock=async(req,res)=>{
  try{
    const brandId=req.params.id;
    const brand=await Brand.findById(brandId);
    if(!brand){
      return res.status(404).json({message:"Brand not found"})
    }
    brand.isBlocked=!brand.isBlocked;
    await brand.save();
    res.json({success:true,isBlocked:brand.isBlocked})
  }
  catch(error){
    console.log("error toggling brand:",error)
    res.status(500).json({message:"Internal server error"})
  }
}
const deleteBrand=async(req,res)=>{
  try{
      const brandId=req.params.id;
      const brand=await Brand.findById(brandId);
      if(!brand){
        return res.status(404).json({success:false,message:"brand  not found"})
      }
      await Brand.findByIdAndDelete(brandId)
      res.json({success:true,message:"brand deleted successfully"})
  }
  catch(error){
      console.log('error deleting brand',error);
      res.status(500).json({success:false,messsage:"error deleting brand"})
  }
}





const brandController={
    getBrandList,
    loadAddBrand,
    postAddBrand,
    getEditBrand,
    postEditBrand,
    deleteBrand,
    toggleBlock
}

export default brandController;