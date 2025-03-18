const express = require('express');
const router = express.Router();
const SellerData = require('../models/SellerData');
const ApprovedProduct = require('../models/ApprovedProduct');
const fetchuser = require('../middleware/fetchuser');
const Users = require('../models/Users');

// Route to submit seller data
router.post('/submit', fetchuser, async (req, res) => {
    try {
        // First get the user details
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Validate required user information
        if (!user.upiId || !user.document || !user.address) {
            return res.status(400).json({
                success: false,
                message: "Missing required user information (UPI ID, document, or address)"
            });
        }

        const {
            name,
            price,
            description,
            category,
            type,
            size,
            waist,
            length,
            images
        } = req.body;

        // Create new seller data with user information
        const sellerData = new SellerData({
            productName: name,
            price,
            productDetails: description,
            category,
            type,
            size,
            waist,
            length,
            images,
            userInfo: {
                userId: user._id,
                name: user.name,
                email: user.email,
                upiId: user.upiId,
                document: user.document,
                address: {
                    phone: user.address?.phone || '',
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || '',
                    country: user.address?.country || ''
                }
            }
        });

        // Save to database
        await sellerData.save();

        res.json({ 
            success: true, 
            message: 'Seller data submitted successfully',
            data: sellerData
        });

    } catch (error) {
        console.error('Error submitting seller data:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
});

// Get all seller data (with pagination)
router.get('/all', async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        // If status is provided, filter by it
        if (status) {
            query.status = status;
        }

        const sellerData = await SellerData.find(query)
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: sellerData
        });
    } catch (error) {
        console.error('Error fetching seller data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller data'
        });
    }
});

// Get approved products
router.get('/approved-products', async (req, res) => {
    try {
        const { stock } = req.query;
        let query = { status: 'approved' };
        
        // Add stock filter if specified
        if (stock && stock !== 'all') {
            query.stock = stock;
        }

        const approvedProducts = await SellerData.find(query)
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: approvedProducts
        });
    } catch (error) {
        console.error('Error fetching approved products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching approved products'
        });
    }
});

// Get seller data by ID
router.get('/:id', async (req, res) => {
    try {
        const sellerData = await SellerData.findById(req.params.id);
        if (!sellerData) {
            return res.status(404).json({
                success: false,
                message: 'Seller data not found'
            });
        }
        res.json({
            success: true,
            data: sellerData
        });
    } catch (error) {
        console.error('Error fetching seller data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching seller data'
        });
    }
});

// Get seller data by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const sellerData = await SellerData.find({
            'userInfo.userId': req.params.userId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: sellerData
        });
    } catch (error) {
        console.error('Error fetching user seller data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user seller data'
        });
    }
});

// Update seller data status
router.put('/status/:id', fetchuser, async (req, res) => {
    try {
        const { status, paymentInfo } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const sellerData = await SellerData.findById(req.params.id);
        
        if (!sellerData) {
            return res.status(404).json({
                success: false,
                message: 'Seller data not found'
            });
        }

        // If status is being set to approved, create an ApprovedProduct
        if (status === 'approved') {
            const approvedProduct = new ApprovedProduct({
                originalProductId: sellerData._id,
                productName: sellerData.productName,
                price: sellerData.price,
                category: sellerData.category,
                type: sellerData.type,
                size: sellerData.size,
                waist: sellerData.waist,
                length: sellerData.length,
                productDetails: sellerData.productDetails,
                images: sellerData.images,
                sellerInfo: {
                    userId: sellerData.userInfo.userId,
                    name: sellerData.userInfo.name,
                    email: sellerData.userInfo.email,
                    upiId: sellerData.userInfo.upiId
                },
                paymentInfo: paymentInfo
            });

            await approvedProduct.save();
        }

        // Update the original seller data
        sellerData.status = status;
        sellerData.updatedAt = new Date();
        await sellerData.save();

        res.json({
            success: true,
            data: sellerData
        });
    } catch (error) {
        console.error('Error updating seller data status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// Delete seller data
router.delete('/:id', fetchuser, async (req, res) => {
    try {
        const sellerData = await SellerData.findById(req.params.id);
        
        if (!sellerData) {
            return res.status(404).json({
                success: false,
                message: 'Seller data not found'
            });
        }

        // Check if the user is the owner of the data
        if (sellerData.userInfo.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this data'
            });
        }

        await SellerData.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Seller data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting seller data:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting seller data'
        });
    }
});

// Update the stock update route
router.put('/update-stock/:id', fetchuser, async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (!['in_stock', 'out_of_stock'].includes(stock)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid stock status'
            });
        }

        const product = await SellerData.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.stock = stock;
        await product.save();

        // Broadcast the stock update
        // You could implement WebSocket here for real-time updates

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error updating stock status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock status'
        });
    }
});

// Delete approved product (without authentication)
router.delete('/delete-approved/:id', async (req, res) => {
    try {
        const product = await SellerData.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete the product
        await SellerData.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});

module.exports = router; 