import * as mongoose from "mongoose";
const shippingSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    product: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: false,
    },
    totalPrice: {
        type: Number,
        required: false,
    },
}, { timestamps: true, versionKey: false })

export const Shipping = mongoose.model('shipping', shippingSchema);