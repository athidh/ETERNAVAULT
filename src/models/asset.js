const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    platform: {
        type: String,
        required: [true, 'Please specify the social media platform'],
        trim: true,
    },
    profileUrl: {
        type: String,
        required: [true, 'Please provide the profile URL'],
        trim: true,
    },
    instruction: {
        type: String,
        required: true,
        enum: ['MEMORIALIZE', 'GRANT_ACCESS', 'REQUEST_DELETION'],
    },
    legacyContactEmail: {
        type: String,
        required: [true, 'Please provide a legacy contact email'],
        lowercase: true,
    },
    status: {
        type: String,
        enum: ['active', 'processing', 'completed', 'failed'],
        default: 'active',
    }
}, {
    timestamps: true
});

const Asset = mongoose.model('asset', assetSchema);

module.exports = Asset;
