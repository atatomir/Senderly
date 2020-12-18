const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'AOL',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});


/*
let info = await transporter.sendMail({
   from: '"Fred Foo 👻" <foo@example.com>', // sender address
   to: "bar@example.com, baz@example.com", // list of receivers
   subject: "Hello ✔", // Subject line
   text: "Hello world?", // plain text body
   html: "<b>Hello world?</b>", // html body
 });
 */

 module.exports = transporter;
