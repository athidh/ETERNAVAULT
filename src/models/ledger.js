const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    previousHash: {
        type: String,
        required: true,
    },
    currentHash: {
        type: String,
        required: true,
    },
}, {
    
    timestamps: { createdAt: true, updatedAt: false },
});

const Ledger = mongoose.model('ledger', ledgerSchema);

module.exports = Ledger;
