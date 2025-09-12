const User = require('../models/user');
const Asset = require('../models/asset');
const ledgerService = require('./ledgerServices');
const emailService = require('../utils/email');

const initiateProtocol = async (userId) => {
    console.log(`Initiating protocol for user: ${userId}`);
    
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    if (user.status === 'deceased') {
        console.log('Protocol already initiated for this user.');
        return;
    }
    user.status = 'deceased';
    await user.save();
    console.log(`User ${user.email} marked as deceased.`);

    
    const assets = await Asset.find({ owner: userId });
    console.log(`Found ${assets.length} assets to process.`);

    
    let lastHash = await ledgerService.findLastHashForUser(userId);

    
    for (const asset of assets) {
        let actionDescription = '';

        const emailData = {
            userName: user.email,
            platform: asset.platform,
            profileUrl: asset.profileUrl,
            instruction: asset.instruction,
        };

        
        switch (asset.instruction) {
            case 'Memorialize':
                console.log(`Processing 'Memorialize' for ${asset.platform}`);
                await emailService.sendMemorializationRequest(emailData);
                actionDescription = `Simulated request sent to ${asset.platform} to memorialize profile.`;
                break;
            
            case 'Grant Access for Final Post':
                console.log(`Processing 'Grant Access' for ${asset.platform}`);
                if (asset.legacyContactEmail) {
                    await emailService.sendLegacyContactNotification(asset.legacyContactEmail, emailData);
                    actionDescription = `Notification sent to Legacy Contact (${asset.legacyContactEmail}) for ${asset.platform}.`;
                } else {
                    actionDescription = `Instruction was 'Grant Access' for ${asset.platform}, but no Legacy Contact was provided.`;
                }
                break;

            case 'Request Deletion':
                 console.log(`Processing 'Request Deletion' for ${asset.platform}`);

                
                 await emailService.sendMemorializationRequest({ ...emailData, instruction: 'Delete' }); // Re-using for demo
                 actionDescription = `Simulated request sent to ${asset.platform} to delete profile.`;
                break;
            
            default:
                console.log(`Unknown instruction: ${asset.instruction}`);
                actionDescription = `Unknown instruction '${asset.instruction}' for asset ${asset.platform}.`;
        }

    
        if(actionDescription) {
             lastHash = await ledgerService.createLedgerEntry(userId, asset, actionDescription, lastHash);
        }
    }

    console.log('Protocol finished for user:', userId);
    return { success: true, message: 'Protocol completed successfully.' };
};


module.exports = {
    initiateProtocol,
};
