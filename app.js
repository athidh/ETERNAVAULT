const express = require('express');
const cors = require('cors'); 
const userRoutes = require('./src/routes/user');
const nomineeRoutes = require('./src/routes/nominee');
const app = express();

app.use(cors()); 

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Eternavault API!",
        status: "healthy"
    });
});

app.use('/routes/user', userRoutes);
app.use('/routes/nominee', nomineeRoutes);

module.exports = app;

