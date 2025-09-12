const express = require('express');
const userRoutes = require('./src/routes/user'); 
const app = express();



app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});


app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Eternavault API!",
        status: "healthy"
    });
});


app.use('/routes/user', userRoutes);


module.exports = app;

