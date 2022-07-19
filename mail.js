const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: "cudddan@gmail.com",
      pass: "zsfjhoyzbsuyqvlv",
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
);

const sendEmail = (options, message) => {
  mailOptions = {
    from: options.from,
    to: options.to,
    subject: message.subject,
    html: message.body,
  };

  transporter.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(response);
    }
  });
};
module.exports = { sendEmail };
