const Joi = require('joi');

const registerValidation = Joi.object({
  firstName: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.pattern.base": "First name must contain only letters",
      'string.empty': 'First name is required',
      'string.min': 'first name must be atleast 3 characters',
      'string.max': 'first name must be less than 50 characters'
    }),
  lastName: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'last name is required',
      "string.pattern.base": "Enter a valid last name",
      'string.min': 'last name must be atleast 2  characters',
      'string.max': 'last name must be less than 50 characters'
    }),
  email: Joi.string()
    .email()
    .max(50)
    .required()
    .messages({
      'string.empty': 'email is required',
      'string.email': 'please enter a valid email address',
      'string.max': 'Email must be less than or equal to 50 characters'
    }),
  password: Joi.string()
    .pattern(/[A-Z]/)
    .pattern(/[!@#$%^&*(),.?":{}|<>]/)
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.empty': 'password is required',
      'string.min': 'password must be atleast  6 charaters',
      'string-max': 'password must be less than or equal to 20 characters',
      "string.pattern.base": "Password must include a capital letter and special character"
    }),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required"
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'phone number is required',
      'string.pattern.base': 'phone number must be exactly 10 digits'
    })


})

const categoryValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(3).max(500).required()
})

const brandValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(3).max(500).required()
})

const productValidation = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Product name is required",
    "string.min": "Product name must have at least 2 characters",
    "string.max": "Product name cannot be longer than 100 characters"
  }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Product description is required",
    "string.min": "Description must be at least 10 characters",
    "string.max": "Description cannot be longer than 1000 characters"
  }),

  actualPrice: Joi.number().min(0).required().messages({
    "number.base": "Actual price must be a number",
    "number.min": "Actual price cannot be negative"
  }),

  salesPrice: Joi.number().min(0).required().less(Joi.ref("actualPrice")).messages({
    "number.base": "Sales price must be a number",
    "number.min": "Sales price cannot be negative",
    "number.less": "Sales price must be less than actual price"
  }),

  brandId: Joi.string().required().messages({
    "string.empty": "Brand is required"
  }),

  categoryId: Joi.string().required().messages({
    "string.empty": "Category is required"
  })
});
const variantValidation = Joi.object({
  colour: Joi.string().trim().required().messages({
    "string.empty": "Colour is required"
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required"
  }),
  existingImages: Joi.array().items(
    Joi.string().uri().messages({
      "string.uri": "Each image must be a valid URL"
    })
  ).optional()
});

;

const personalInfoValidation = Joi.object({
  firstName: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.pattern.base": "First name must contain only letters",
      'string.empty': 'First name is required',
      'string.min': 'first name must be atleast 3 characters',
      'string.max': 'first name must be less than 50 characters'
    }),
  lastName: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'last name is required',
      "string.pattern.base": "Enter a valid last name",
      'string.min': 'last name must be atleast 2  characters',
      'string.max': 'last name must be less than 50 characters'
    }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'phone number is required',
      'string.pattern.base': 'phone number must be exactly 10 digits'
    })
});

const requestEmailOtpValidation = Joi.object({
    newEmail: Joi.string()
    .email()
    .max(50)
    .required()
    .messages({
      'string.empty': 'email is required',
      'string.email': 'please enter a valid email address',
      'string.max': 'Email must be less than or equal to 50 characters'
    }),
});

const verifyEmailOtpValidation = Joi.object({
  newEmail: Joi.string()
    .email()
    .max(50)
    .required()
    .messages({
      'string.empty': 'email is required',
      'string.email': 'please enter a valid email address',
      'string.max': 'Email must be less than or equal to 50 characters'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
    }),
});

const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'current password is required'
    }),

  newPassword: Joi.string()
    .pattern(/[A-Z]/) // at least one capital letter
    .pattern(/[!@#$%^&*(),.?":{}|<>]/) // at least one special character
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.empty': 'new password is required',
      'string.min': 'password must be at least 6 characters',
      'string.max': 'password must be less than or equal to 20 characters',
      'string.pattern.base': 'password must include a capital letter and special character'
    }),

  confirmNewPassword: Joi.any()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      'any.only': 'passwords do not match',
      'any.required': 'confirm new password is required'
    }),
});

const addressValidation = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "name is required"
  }),
  phone: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
    "string.empty": "phone is required",
    "string.pattern.base": "phone must be 10 digits"
  }),
  pincode: Joi.string().trim().pattern(/^[0-9]{6}$/).required().messages({
    "string.empty": "pincode is required",
    "string.pattern.base": "pincode must be 6 digits"
  }),
  house: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "house is required"
  }),
  street: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "street is required"
  }),
  city: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "city is required"
  }),
  state: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "state is required"
  }),
  isDefault: Joi.boolean().default(false)
});

module.exports = {
  registerValidation,
  categoryValidation,
  brandValidation,
  productValidation,
  variantValidation,
  personalInfoValidation,
  requestEmailOtpValidation,
  verifyEmailOtpValidation ,
  changePasswordValidation,
  addressValidation,

}

