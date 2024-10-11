const nodemailer = require('nodemailer');

require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});

// Define a function to send email
async function sendEmail(to, subject, html) {

  try {
    // Compose the email
    const mailOptions = {
      from: 'kpoudel_be21@thapar.edu',
      to: to,
      subject: subject,
      html: html,

    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
module.exports = sendEmail;