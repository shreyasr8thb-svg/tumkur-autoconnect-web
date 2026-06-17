export const sendSecurityEmail = async (email, type) => {
  if (!email) return;

  let subject = '';
  let text = '';
  let actionText = '';

  switch (type) {
    case 'signin':
      subject = 'Security Alert: New Sign-In to Tumkuru Connect';
      text = 'You have successfully signed in to your Tumkuru Connect account.';
      actionText = 'We detected a new sign-in to your Tumkuru Connect account.';
      break;
    case 'signout':
      subject = 'Security Alert: Sign-Out from Tumkuru Connect';
      text = 'You have successfully signed out of your Tumkuru Connect account.';
      actionText = 'We detected a sign-out from your Tumkuru Connect account.';
      break;
    case 'delete':
      subject = 'Security Alert: Account Deleted from Tumkuru Connect';
      text = 'Your Tumkuru Connect account has been successfully deleted.';
      actionText = 'We confirm that your Tumkuru Connect account and all associated data have been permanently deleted.';
      break;
    default:
      return;
  }

  try {
    // Explicitly use the absolute URL to ensure it works on native Android / Capacitor
    await fetch('https://tumkur-autoconnect-web.vercel.app/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject,
        text,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://tumkur-autoconnect-web.vercel.app/logo.png" alt="Tumkuru Connect" style="width: 80px; height: 80px; border-radius: 15px;" />
            </div>
            <h2 style="color: #1e293b; text-align: center;">${subject.split(':')[0]}</h2>
            <p style="color: #475569; font-size: 16px;">Hello,</p>
            <p style="color: #475569; font-size: 16px;">${actionText}</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Account:</strong> ${email}</p>
              <p style="margin: 5px 0 0 0; color: #334155; font-size: 14px;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #475569; font-size: 14px;">If this was you, no further action is required.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Tumkuru Connect. All rights reserved.</p>
          </div>
        `
      })
    });
  } catch(e) { 
    console.error('Failed to send security email', e); 
  }
};
