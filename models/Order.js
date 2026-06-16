const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  shippingAddress: { type: Object, required: true },
  paymentMethod: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);