import * as mongoose from "mongoose";
const shippingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    product: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
}, { timestamps: true, versionKey: false })

export const Shipping = mongoose.model('shipping', shippingSchema);