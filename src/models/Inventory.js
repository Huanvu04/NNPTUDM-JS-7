const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true, 
        unique: true // 1 product chỉ có 1 inventory duy nhất
    },
    stock: { type: Number, default: 0, min: [0, 'Stock không được < 0'] },
    reserved: { type: Number, default: 0, min: [0, 'Reserved không được < 0'] },
    soldCount: { type: Number, default: 0, min: [0, 'SoldCount không được < 0'] }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);