const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.sendMessage = async (msg) => {
    try {
        await sgMail.send(msg);
    } catch (err) {
        console.log(err);
        if (err.response) {
            console.error(err.response.body);
        }
    }

};
