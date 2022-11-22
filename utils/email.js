// const nodemailer = require("nodemailer");

// const sendEmail = async (options) => {
//   // 1. Create a transport
//   var smtpTransport = nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: "somerealemail@gmail.com",
//       pass: "realpasswordforaboveaccount",
//     },
//   });

//   //2. Define the email optins
//   var mailOptions = {
//     from: "Natours <natours.com>",
//     to: options.eamil,
//     subject: options.subject,
//     text: options.message,
//   };
//   //3. Actual send the email

//   await smtpTransport.sendMail(mailOptions);
// };

// module.exports = sendEmail;
