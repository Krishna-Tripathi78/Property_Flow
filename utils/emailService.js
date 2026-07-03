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
        from: `"Society Management" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendComplaintStatusUpdate(userEmail, userName, complaintTitle, newStatus, note = '') {
    const subject = `Complaint Status Update - ${complaintTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Complaint Status Update</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Dear ${userName},</h3>
          
          <p>Your complaint has been updated:</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Complaint:</strong> ${complaintTitle}<br>
            <strong>New Status:</strong> <span style="color: ${this.getStatusColor(newStatus)}; font-weight: bold;">${newStatus}</span><br>
            ${note ? `<strong>Note:</strong> ${note}<br>` : ''}
            <strong>Updated:</strong> ${new Date().toLocaleDateString()}
          </div>
          
          <p>You can view your complaint details by logging into the Society Management Portal.</p>
          
          <p style="margin-bottom: 0;">Best regards,<br>Society Management Team</p>
        </div>
      </div>
    `;

    const text = `
      Complaint Status Update
      
      Dear ${userName},
      
      Your complaint "${complaintTitle}" has been updated to: ${newStatus}
      ${note ? `Note: ${note}` : ''}
      Updated: ${new Date().toLocaleDateString()}
      
      Please log into the Society Management Portal to view full details.
      
      Best regards,
      Society Management Team
    `;

    return this.sendEmail(userEmail, subject, html, text);
  }

  async sendImportantNoticeAlert(userEmail, userName, noticeTitle, noticeContent) {
    const subject = `Important Notice - ${noticeTitle}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">🚨 Important Notice</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Dear ${userName},</h3>
          
          <p>A new important notice has been posted:</p>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0;">
            <h4 style="color: #856404; margin-top: 0;">${noticeTitle}</h4>
            <p style="color: #856404; margin-bottom: 0;">${noticeContent}</p>
          </div>
          
          <p>Please check the notice board on the Society Management Portal for full details.</p>
          
          <p style="margin-bottom: 0;">Best regards,<br>Society Management Team</p>
        </div>
      </div>
    `;

    const text = `
      Important Notice
      
      Dear ${userName},
      
      ${noticeTitle}
      
      ${noticeContent}
      
      Please check the notice board on the Society Management Portal for full details.
      
      Best regards,
      Society Management Team
    `;

    return this.sendEmail(userEmail, subject, html, text);
  }

  getStatusColor(status) {
    switch (status) {
      case 'Open': return '#dc3545';
      case 'In Progress': return '#ffc107';
      case 'Resolved': return '#28a745';
      default: return '#6c757d';
    }
  }
}

module.exports = new EmailService();