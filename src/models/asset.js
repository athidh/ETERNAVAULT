const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user' 
    },
    platform: {
        type: String,
        required: [true, 'Please provide the social media platform'],
        trim: true
    },
    profileUrl: {
        type: String,
        required: [true, 'Please provide the profile URL'],
        trim: true
    },
    
    instruction: {
        type: String,
        required: true,
        enum: ['Memorialize', 'Grant Access', 'Request Deletion']
    },
    legacyContactEmail: {
        type: String,
        required: [true, 'Please provide a legacy contact email'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Transferred', 'Blocked', 'Deleted'],
        default: 'Active'
    }
}, {
    timestamps: true 
});

const Asset = mongoose.model('asset', assetSchema);

module.exports = Asset;

