import * as mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
    services: {
        type: Array<String>,
        require: true,
    },
    successFlow: {
        type: Array<String>,
        require: true,
    },
    failFlow: {
        type: Array<String>,
        require: true,
    },
    status: {
        type: String,
        require: true,
    },
    data:  {}
}, { timestamps: true, versionKey: false })

export const Transaction = mongoose.model('transactions', TransactionSchema);