import  Joi from 'joi';

export const registerValidation = Joi.object({
  firstName: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .trim()
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
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .min(2)
    .max(30)
    .required()
    .messages({
      'string.empty': 'last name is required',
      "string.pattern.base": "Enter a valid last name",
      'string.min': 'last name must be atleast 2  characters',
      'string.max': 'last name must be less than 30 characters'
    }),
  email: Joi.string()
    .trim()
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
      'string.max': 'password must be less than or equal to 20 characters',
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
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'phone number is required',
      'string.pattern.base': 'phone number must be exactly 10 digits'
    })


})


export const categoryValidation = Joi.object({
  name: Joi.string().min(3).max(50).required().lowercase().trim(),
  description: Joi.string().min(3).max(500).required()
})

export const brandValidation = Joi.object({
  name: Joi.string().min(3).max(50).required().lowercase().trim(),
  description: Joi.string().min(3).max(500).required()
})

export const productValidation = Joi.object({
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
export const variantValidation = Joi.object({
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

export const personalInfoValidation = Joi.object({
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

export const requestEmailOtpValidation = Joi.object({
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

export const verifyEmailOtpValidation = Joi.object({
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

export const changePasswordValidation = Joi.object({
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

export const addressValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens, apostrophes
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be less than 50 characters",
      "string.pattern.base": "Name can only contain letters, spaces, hyphens, and apostrophes"
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone must be exactly 10 digits"
    }),

  house: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "string.empty": "House number is required",
      "string.max": "House number must be less than 100 characters"
    }),

  street: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Street is required",
      "string.min": "Street must be at least 2 characters",
      "string.max": "Street must be less than 100 characters"
    }),

  city: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens, apostrophes
    .required()
    .messages({
      "string.empty": "City is required",
      "string.min": "City must be at least 2 characters",
      "string.max": "City must be less than 50 characters",
      "string.pattern.base": "City can only contain letters, spaces, hyphens, and apostrophes"
    }),

  state: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/) // Only letters, spaces, hyphens, apostrophes
    .required()
    .messages({
      "string.empty": "State is required",
      "string.min": "State must be at least 2 characters",
      "string.max": "State must be less than 50 characters",
      "string.pattern.base": "State can only contain letters, spaces, hyphens, and apostrophes"
    }),

  pincode: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.empty": "Pincode is required",
      "string.pattern.base": "Pincode must be exactly 6 digits"
    }),
});



