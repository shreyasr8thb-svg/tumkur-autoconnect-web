import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, text, html } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields: to, subject' });
  }

  // Create a transporter using Gmail SMTP
  // The password here must be an App Password, NOT the regular account password.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tumkuru.connect@gmail.com',
      pass: process.env.EMAIL_PASSWORD, // Configured in Vercel Environment Variables
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Tumkuru Connect" <tumkuru.connect@gmail.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
