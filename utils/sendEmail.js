const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: (process.env.MAIL_PASS || "").replace(/\s/g, ""),
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending error:", error);
  }
};

module.exports = sendEmail;
