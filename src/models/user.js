const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['active', 'deceased'],
        default: 'active',
    },
    statusConfirmedAt: {
        type: Date,
    }
}, {
    timestamps: true 
});

userSchema.pre('save', async function(next) {
    
    if (!this.isModified('password')) {
        return next();
    }

    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
