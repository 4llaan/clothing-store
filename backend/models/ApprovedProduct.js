const mongoose = require('mongoose');

const ApprovedProductSchema = new mongoose.Schema({
    originalProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerData',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['mens', 'womens', 'kids']
    },
    type: {
        type: String,
        required: true,
        enum: ['tops', 'bottoms']
    },
    size: {
        type: String
    },
    waist: {
        type: mongoose.Schema.Types.Mixed
    },
    length: {
        type: Number
    },
    productDetails: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    sellerInfo: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        upiId: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        paymentDate: Date
    },
    approvedAt: {
        type: Date,
        default: Date.now
    },
    stock: {
        type: String,
        enum: ['in_stock', 'out_of_stock'],
        default: 'in_stock'
    }
});

module.exports = mongoose.model('ApprovedProduct', ApprovedProductSchema); 