
const app = require('./app');

const PORT = process.env.PORT || 3000;

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Eternavault server is running on http://localhost:${PORT}`);
});

