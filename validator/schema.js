const Joi=require('joi');

const categoryValidation=Joi.object({
    name:Joi.string().min(3).max(50).required(),
    description:Joi.string().min(3).max(500).required()
})

const brandValidation=Joi.object({
    name:Joi.string().min(3).max(50).required(),
    description:Joi.string().min(3).max(500).required()
})




module.exports={
    categoryValidation,
    brandValidation
}