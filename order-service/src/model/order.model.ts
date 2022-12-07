import * as mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
    },
    transactionId: {
        type: String,
        require: true,
    },
    productId: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    dtime: {
        type: Number,
        require: false,
    }
}, { timestamps: true, versionKey: false })

export const Order = mongoose.model('order', orderSchema);