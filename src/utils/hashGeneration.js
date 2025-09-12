const crypto = require('crypto');

const createHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
    createHash,
};
