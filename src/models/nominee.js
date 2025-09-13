const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nomineeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
    },
    relationship: {
        type: String,
        required: [true, 'Please provide relationship to the deceased'],
        trim: true,
        enum: ['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Other']
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'verified'],
        default: 'active',
    },
    assignedAssets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'asset'
    }],
    verificationDocuments: [{
        documentType: String,
        documentUrl: String,
        uploadedAt: Date,
        verified: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true 
});

nomineeSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Nominee = mongoose.model('nominee', nomineeSchema);

module.exports = Nominee;
