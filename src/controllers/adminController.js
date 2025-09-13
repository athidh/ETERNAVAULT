const User = require('../models/user');
const Nominee = require('../models/nominee');
const Asset = require('../models/asset');
const DeathConfirmation = require('../models/deathConfirmation');
const sendEmail = require('../utils/email');

// Get all pending death confirmations
const getPendingConfirmations = async (req, res) => {
    try {
        const confirmations = await DeathConfirmation.find({ status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(confirmations);
    } catch (error) {
        console.error('Error getting pending confirmations:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all death confirmations
const getAllConfirmations = async (req, res) => {
    try {
        const confirmations = await DeathConfirmation.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(confirmations);
    } catch (error) {
        console.error('Error getting all confirmations:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Confirm death and notify nominees
const confirmDeath = async (req, res) => {
    try {
        const { id: confirmationId } = req.params; // Get ID from URL params
        const { notes, deathCertificate } = req.body;
        
        const confirmation = await DeathConfirmation.findById(confirmationId)
            .populate('user', 'name email');
        
        if (!confirmation) {
            return res.status(404).json({ message: 'Death confirmation not found' });
        }
        
        // Update confirmation status
        confirmation.status = 'confirmed';
        confirmation.confirmationDate = new Date();
        confirmation.notes = notes;
        confirmation.deathCertificate = deathCertificate;
        
        // Get user's assets
        const userAssets = await Asset.find({ owner: confirmation.user._id });
        
        // Find nominees for each asset
        const nomineeEmails = [...new Set(userAssets.map(asset => asset.legacyContactEmail))];
        const nominees = await Nominee.find({ email: { $in: nomineeEmails } });
        
        // Prepare nominee notifications
        confirmation.nomineesNotified = nominees.map(nominee => ({
            nominee: nominee._id,
            email: nominee.email,
            name: nominee.name,
            notificationSent: false,
            notificationDate: null
        }));
        
        // Prepare asset releases
        confirmation.assetsReleased = userAssets.map(asset => ({
            asset: asset._id,
            platform: asset.platform,
            instruction: asset.instruction,
            nomineeEmail: asset.legacyContactEmail,
            releaseDate: null
        }));
        
        await confirmation.save();
        
        // Send notification emails to nominees
        for (const nominee of nominees) {
            try {
                const nomineeAssets = userAssets.filter(asset => 
                    asset.legacyContactEmail === nominee.email
                );
                
                await sendEmail({
                    to: nominee.email,
                    subject: 'Digital Asset Access Notification - Eternavault',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #64ffda;">Eternavault - Digital Asset Access</h2>
                            <p>Dear ${nominee.name},</p>
                            <p>We are writing to inform you that you have been designated as a nominee for digital assets belonging to <strong>${confirmation.user.name}</strong>.</p>
                            <p>Following the confirmation of their passing, you now have access to the following digital assets:</p>
                            
                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3>Assigned Digital Assets:</h3>
                                ${nomineeAssets.map(asset => `
                                    <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px;">
                                        <strong>Platform:</strong> ${asset.platform}<br>
                                        <strong>URL:</strong> ${asset.profileUrl}<br>
                                        <strong>Instruction:</strong> ${asset.instruction}
                                    </div>
                                `).join('')}
                            </div>
                            
                            <p>You can access your nominee dashboard at: <a href="https://your-frontend-url.com/nominee_dashboard.html">Nominee Dashboard</a></p>
                            
                            <p>If you have any questions or need assistance, please contact our support team.</p>
                            
                            <p>Best regards,<br>Eternavault Team</p>
                        </div>
                    `
                });
                
                // Update notification status
                const nomineeNotification = confirmation.nomineesNotified.find(n => 
                    n.email === nominee.email
                );
                if (nomineeNotification) {
                    nomineeNotification.notificationSent = true;
                    nomineeNotification.notificationDate = new Date();
                }
                
            } catch (emailError) {
                console.error('Error sending email to nominee:', emailError);
            }
        }
        
        await confirmation.save();
        
        res.json({
            message: 'Death confirmed and nominees notified',
            confirmation: confirmation,
            nomineesNotified: nominees.length
        });
        
    } catch (error) {
        console.error('Error confirming death:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Reject death confirmation
const rejectDeathConfirmation = async (req, res) => {
    try {
        const { id: confirmationId } = req.params; // Get ID from URL params
        const { notes } = req.body;
        
        const confirmation = await DeathConfirmation.findById(confirmationId);
        
        if (!confirmation) {
            return res.status(404).json({ message: 'Death confirmation not found' });
        }
        
        confirmation.status = 'rejected';
        confirmation.notes = notes;
        confirmation.confirmationDate = new Date();
        
        await confirmation.save();
        
        res.json({ message: 'Death confirmation rejected', confirmation });
        
    } catch (error) {
        console.error('Error rejecting death confirmation:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalNominees = await Nominee.countDocuments();
        const totalAssets = await Asset.countDocuments();
        const pendingConfirmations = await DeathConfirmation.countDocuments({ status: 'pending' });
        const confirmedDeaths = await DeathConfirmation.countDocuments({ status: 'confirmed' });
        
        res.json({
            totalUsers,
            totalNominees,
            totalAssets,
            pendingConfirmations,
            confirmedDeaths
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Create death confirmation request (for testing)
const createDeathConfirmation = async (req, res) => {
    try {
        const { userEmail, notes } = req.body;
        
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if confirmation already exists
        const existingConfirmation = await DeathConfirmation.findOne({ user: user._id });
        if (existingConfirmation) {
            return res.status(400).json({ message: 'Death confirmation already exists for this user' });
        }
        
        const confirmation = await DeathConfirmation.create({
            user: user._id,
            userEmail: user.email,
            userName: user.name,
            notes: notes
        });
        
        res.status(201).json({
            message: 'Death confirmation request created',
            confirmation
        });
        
    } catch (error) {
        console.error('Error creating death confirmation:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Send test email
const sendTestEmail = async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        await sendEmail({
            to: to,
            subject: subject || 'Test Email from Eternavault Admin',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #64ffda;">Eternavault Admin Test Email</h2>
                    <p>${message || 'This is a test email from the Eternavault admin system.'}</p>
                    <p>If you received this email, the email system is working correctly.</p>
                    <p>Best regards,<br>Eternavault Admin Team</p>
                </div>
            `
        });
        
        res.json({ message: 'Test email sent successfully' });
        
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getPendingConfirmations,
    getAllConfirmations,
    confirmDeath,
    rejectDeathConfirmation,
    getDashboardStats,
    createDeathConfirmation,
    sendTestEmail
};
