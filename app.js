const express = require('express');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.path}`);
    next();
});


app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to the Eternavault API!",
        status: "healthy"
    });
});


module.exports = app;

