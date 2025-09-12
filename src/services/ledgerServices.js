const Ledger = require('../models/ledger');
const { createHash } = require('../utils/hashGeneration');

const findLastHashForUser = async (userId) => {
    const lastEntry = await Ledger.findOne({ user: userId }).sort({ timestamp: -1 });
    if (lastEntry) {
        return lastEntry.currentHash;
    }
    // Return a genesis hash if no entries exist
    return '0000000000000000000000000000000000000000000000000000000000000000';
};

const createLedgerEntry = async (userId, asset, actionDescription, previousHash) => {
    const timestamp = new Date();
    
    const dataToHash = previousHash + timestamp.toISOString() + asset._id + actionDescription;
    const currentHash = createHash(dataToHash);

    const entry = await Ledger.create({
        user: userId,
        asset: asset._id,
        action: actionDescription,
        timestamp,
        previousHash,
        currentHash,
    });

    console.log(`Ledger entry created for asset ${asset.platform}`);
    return entry.currentHash;
};

module.exports = {
    findLastHashForUser,
    createLedgerEntry,
};
