const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: `"PropertyFlow" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email failed:', error);
      throw error;
    }
  }

  async sendComplaintStatusUpdate(userEmail, userName, complaintTitle, newStatus, note = '') {
    const subject = `Complaint Update - ${complaintTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Complaint Status Update</h2>
        <p>Hi ${userName},</p>
        <p>Your complaint "${complaintTitle}" has been updated to: <strong>${newStatus}</strong></p>
        ${note ? `<p>Note: ${note}</p>` : ''}
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Login to view full details.</p>
        <p>- PropertyFlow Team</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendImportantNoticeAlert(userEmail, userName, noticeTitle, noticeContent) {
    const subject = `Important Notice - ${noticeTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Important Notice</h2>
        <p>Hi ${userName},</p>
        <h3>${noticeTitle}</h3>
        <p>${noticeContent}</p>
        <p>Check the notice board for more details.</p>
        <p>- PropertyFlow Team</p>
      </div>
    `;

    return this.sendEmail(userEmail, subject, html);
  }
}

module.exports = new EmailService();