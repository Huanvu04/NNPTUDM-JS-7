const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');

// Quản lý Product (và tự tạo inventory)
router.post('/products', invController.createProduct);

// Tra cứu Inventory
router.get('/inventories', invController.getAllInventories);
router.get('/inventories/:id', invController.getInventoryById);

// Các thao tác kho (Yêu cầu là POST)
router.post('/inventories/add-stock', invController.addStock);
router.post('/inventories/remove-stock', invController.removeStock);
router.post('/inventories/reservation', invController.reservation);
router.post('/inventories/sold', invController.sold);

module.exports = router;