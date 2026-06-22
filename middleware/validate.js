const { z } = require('zod');

// Schema for registration validation
const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'admin']).optional().default('customer')
});

// Schema for login validation
const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Schema for order items
const orderItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

// Schema for shipping address
const shippingAddressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  zipCode: z.string().trim().min(1, 'Zip/Pin code is required'),
  country: z.string().trim().min(1, 'Country is required')
});

// Schema for order creation validation
const createOrderSchema = z.object({
  items: z.array(orderItemSchema).nonempty('Order must contain at least one item'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['UPI', 'COD', 'Card'])
});

// Schema for updating order status validation
const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered'])
});

// Generic validation middleware
const validate = (schema) => async (req, res, next) => {
  try {
    // Parse and sanitize payload
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors 
      });
    }
    next(error);
  }
};

// Schema for product creation validation
const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  stock: z.number().int().nonnegative('Stock cannot be negative').optional().default(0),
  category: z.string().trim().min(1, 'Category is required'),
  image: z.string().trim().optional()
});

// Schema for product update validation
const updateProductSchema = createProductSchema.partial();

// Schema for adding item to cart validation
const cartItemAddSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional().default(1)
});

// Schema for updating item quantity in cart validation
const cartItemUpdateSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer')
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createProductSchema,
  updateProductSchema,
  cartItemAddSchema,
  cartItemUpdateSchema
};
