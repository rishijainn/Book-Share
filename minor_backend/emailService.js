const nodemailer = require("nodemailer");

// Function to send a plain text email
const sendEmail = async (to, subject, text) => {
  try {
    // Create reusable transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Set up mail options for plain text only
    const mailOptions = {
      from: process.env.SMTP_USER, // Sender's email from env
      to: to, // Recipient's email
      subject: subject, // Email subject
      text: text, // Plain text version
    };

    // Send the email and await the result
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`, info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw to allow handling by the caller
  }
};

module.exports = { sendEmail };