const mongoose = require('mongoose');

const deathConfirmationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
    },
    confirmationDate: {
        type: Date,
        default: null
    },
    confirmedBy: {
        type: String,
        default: 'admin'
    },
    deathCertificate: {
        type: String, // URL or file path
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    nomineesNotified: [{
        nominee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'nominee'
        },
        email: String,
        name: String,
        notificationSent: {
            type: Boolean,
            default: false
        },
        notificationDate: {
            type: Date,
            default: null
        }
    }],
    assetsReleased: [{
        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'asset'
        },
        platform: String,
        instruction: String,
        nomineeEmail: String,
        releaseDate: {
            type: Date,
            default: null
        }
    }]
}, {
    timestamps: true
});

const DeathConfirmation = mongoose.model('deathConfirmation', deathConfirmationSchema);

module.exports = DeathConfirmation;
