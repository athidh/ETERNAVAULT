require('dotenv').config(); 
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;


const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection FAILED:', error.message);
        
        process.exit(1);
    }
};



const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Eternavault server is running on http://localhost:${PORT}`);
    });
};

startServer();

