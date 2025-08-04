import nodemailer from "nodemailer";


  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,  // Make sure this is correct
    },
  });

  

export default transporter;
