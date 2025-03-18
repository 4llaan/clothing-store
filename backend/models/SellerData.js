const mongoose = require('mongoose');

const SellerDataSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.Mixed  // Can be number or string (for kids)
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
    userInfo: {
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
        },
        document: {
            type: String,
            required: true
        },
        address: {
            phone: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    stock: {
        type: String,
        enum: ['in_stock', 'out_of_stock'],
        default: 'in_stock'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('SellerData', SellerDataSchema); 