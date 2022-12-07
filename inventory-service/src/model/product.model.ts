import * as mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    inventory: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true, versionKey: false})

export const Product = mongoose.model('product', productSchema);