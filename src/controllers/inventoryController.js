const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// 2.6.1: Tạo Product & Tự động tạo Inventory tương ứng
exports.createProduct = async (req, res) => {
    try {
        // 1. Tạo và lưu Product
        const product = new Product(req.body);
        await product.save();

        // 2. Tạo Inventory tương ứng với productID vừa tạo
        const inventory = new Inventory({ product: product._id });
        await inventory.save();

        res.status(201).json({
            success: true,
            message: "Product và Inventory đã được tạo.",
            data: { product, inventory }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 2.6.2: Get All Inventories (có join với product)
exports.getAllInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find().populate('product');
        res.json({ success: true, count: inventories.length, data: inventories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2.6.3: Get Inventory by ID (có join với product)
exports.getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id).populate('product');
        if (!inventory) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Inventory' });
        }
        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2.6.4: Add_stock (POST: Tăng stock)
exports.addStock = async (req, res) => {
    const { product, quantity } = req.body;
    try {
        // Tìm và cập nhật nguyên tử (atomic update) dùng findOneAndUpdate với $inc
        const inventory = await Inventory.findOneAndUpdate(
            { product: product }, // Tìm theo productID
            { $inc: { stock: quantity } }, // Tăng stock
            { new: true, runValidators: true } // Trả về bản ghi mới, chạy validator
        );

        if (!inventory) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại trong kho' });
        
        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 2.6.5: Remove_stock (POST: Giảm stock)
exports.removeStock = async (req, res) => {
    const { product, quantity } = req.body;
    try {
        // Dùng arithmetic check để đảm bảo stock không nhỏ hơn 0 một cách an toàn
        // (Cách này tốt hơn là $inc âm rồi bắt lỗi validate Schema)
        const inventory = await Inventory.findOne({ product: product });
        if (!inventory) return res.status(404).json({ success: false, message: 'Không tìm thấy kho' });

        if (inventory.stock < quantity) {
            return res.status(400).json({ success: false, error: `Không đủ hàng. Hiện có: ${inventory.stock}` });
        }

        inventory.stock -= quantity;
        await inventory.save(); // save() kích hoạt validation `min: 0` của schema lần nữa cho chắc
        
        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// 2.6.6: Reservation (POST: Giảm stock, tăng reserved)
// Logic: Chuyển lượng hàng có sẵn sang trạng thái 'chờ giao'
exports.reservation = async (req, res) => {
    const { product, quantity } = req.body;
    try {
        // 1. Tìm kho
        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Không tìm thấy kho' });

        // 2. Kiểm tra hàng có sẵn
        if (inventory.stock < quantity) {
            return res.status(400).json({ error: `Không đủ stock để đặt trước. Hiện có: ${inventory.stock}` });
        }

        // 3. Thực hiện chuyển đổi
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        
        res.json({ success: true, message: "Đã đặt trước hàng.", data: inventory });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2.6.7: Sold (POST: Giảm reservation, tăng soldCount)
// Logic: Hàng từ 'chờ giao' chuyển sang 'đã bán hoàn tất'
exports.sold = async (req, res) => {
    const { product, quantity } = req.body;
    try {
        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Không tìm thấy kho' });

        // Kiểm tra lượng đặt trước có đủ để chuyển sang 'bán' không
        if (inventory.reserved < quantity) {
            return res.status(400).json({ error: `Số lượng đặt trước không đủ. Hiện có: ${inventory.reserved}` });
        }

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        
        res.json({ success: true, message: "Hàng đã được bán.", data: inventory });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};