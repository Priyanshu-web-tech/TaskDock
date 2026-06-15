const Joi = require("joi");

const passwordSchema = Joi.string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  )
  .min(8)
  .max(30)
  .required()
  .messages({
    "string.pattern.base":
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character.",
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  });

const login = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
  deviceId: Joi.string().required().messages({
    "any.required": "Device ID is required.",
    "string.empty": "Device ID is required.",
  }),
});

const register = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
  password: passwordSchema,
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required.",
  }),
  deviceId: Joi.string().required().messages({
    "any.required": "Device ID is required.",
    "string.empty": "Device ID is required.",
  }),
});

const forgotPassword = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  }),
});

const verifyOtp = Joi.object({
  otp: Joi.string()
    .pattern(/^\d+$/)
    .length(Number(process.env.OTP_DIGIT) || 6)
    .required()
    .messages({
      "string.length": `OTP must be ${Number(process.env.OTP_DIGIT) || 6} digits.`,
      "string.pattern.base": "OTP must contain only digits.",
      "any.required": "OTP is required.",
    }),
});

const resetPassword = Joi.object({
  password: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
    "any.required": "Please confirm your password.",
  }),
});

const updateProfile = Joi.object({
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required.",
  }),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
  }),
  newPassword: passwordSchema,
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match.",
      "any.required": "Please confirm your new password.",
    }),
});

const createTask = Joi.object({
  title: Joi.string().trim().max(255).required().messages({
    "string.empty": "Title is required.",
    "any.required": "Title is required.",
    "string.max": "Title must be at most 255 characters.",
  }),
  description: Joi.string().trim().allow(null, "").optional(),
  status: Joi.string()
    .valid("todo", "in_progress", "completed")
    .optional()
    .messages({
      "any.only": "Status must be either 'todo', 'in_progress', or 'completed'.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .optional()
    .messages({
      "any.only": "Priority must be either 'low', 'medium', or 'high'.",
    }),
  dueDate: Joi.date().iso().allow(null).optional().messages({
    "date.format": "Due date must be a valid ISO date.",
  }),
});

const updateTask = Joi.object({
  title: Joi.string().trim().max(255).optional().messages({
    "string.empty": "Title cannot be empty.",
    "string.max": "Title must be at most 255 characters.",
  }),
  description: Joi.string().trim().allow(null, "").optional(),
  status: Joi.string()
    .valid("todo", "in_progress", "completed")
    .optional()
    .messages({
      "any.only": "Status must be either 'todo', 'in_progress', or 'completed'.",
    }),
  priority: Joi.string()
    .valid("low", "medium", "high")
    .optional()
    .messages({
      "any.only": "Priority must be either 'low', 'medium', or 'high'.",
    }),
  dueDate: Joi.date().iso().allow(null).optional().messages({
    "date.format": "Due date must be a valid ISO date.",
  }),
});

const taskIdParam = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "Task ID must be a valid number.",
    "any.required": "Task ID is required.",
  }),
});

const getTasksQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  size: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid("todo", "in_progress", "completed").optional(),
  search: Joi.string().trim().allow("").optional(),
  sortBy: Joi.string().valid("dueDate", "priority", "createdAt").optional(),
  sortOrder: Joi.string().valid("asc", "desc", "ASC", "DESC").optional(),
});

module.exports = {
  login,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
  createTask,
  updateTask,
  taskIdParam,
  getTasksQuery,
};
