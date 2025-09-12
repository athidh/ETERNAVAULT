const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
    
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user,
            pass: testAccount.pass, 
        },
    });

    //  Define the email 
    const mailOptions = {
        from: '"Eternavault" <no-reply@eternavault.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    // send mail
    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

const sendLegacyContactNotification = async (email, data) => {
    const subject = `An Important Message Regarding the Digital Legacy of ${data.userName}`;
    const html = `
        <p>Dear Legacy Contact,</p>
        <p>This email is sent to you by Eternavault on behalf of ${data.userName}.</p>
        <p>${data.userName} designated you as their trusted Legacy Contact for their ${data.platform} profile.</p>
        <p>As per their final wishes, you have been requested to carry out the following instruction: <strong>${data.instruction}</strong>.</p>
        <p><strong>Platform:</strong> ${data.platform}</p>
        <p><strong>Profile URL:</strong> <a href="${data.profileUrl}">${data.profileUrl}</a></p>
        <p>Please handle this responsibility with care. We understand this is a difficult time, and we thank you for helping to fulfill their final wishes.</p>
        <p>Sincerely,<br>The Eternavault Team</p>
    `;

    await sendEmail({
        to: email,
        subject,
        html,
    });
};

const sendMemorializationRequest = async (data) => {
    const subject = `[SIMULATION] Memorialization Request for ${data.userName}`;
    const html = `
        <h1>Simulated Platform Request</h1>
        <p>This is a simulated email to a social media platform's support inbox.</p>
        <p><strong>Action Requested:</strong> Memorialize Account</p>
        <p><strong>User:</strong> ${data.userName}</p>
        <p><strong>Profile URL:</strong> <a href="${data.profileUrl}">${data.profileUrl}</a></p>
    `;
    
    
    await sendEmail({
        to: 'platform-requests@example.com',
        subject,
        html,
    });
};


module.exports = {
    sendLegacyContactNotification,
    sendMemorializationRequest,
};
