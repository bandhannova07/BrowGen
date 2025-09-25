import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

// Initialize email providers
let sendgridClient = null;
let resendClient = null;

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sendgridClient = sgMail;
  console.log('[EMAIL] SendGrid initialized');
}

if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('[EMAIL] Resend initialized');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@browgen.com';
const FROM_NAME = process.env.FROM_NAME || 'BrowGen Team';

// Email templates
const TEMPLATES = {
  welcome: {
    subject: 'Welcome to BrowGen! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BrowGen!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your learning journey starts here</p>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{name}}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            We're excited to have you join the BrowGen community! You're now part of a platform designed to help students and youth learn, grow, and belong.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's next?</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Explore our course catalog</li>
              <li>Connect with mentors</li>
              <li>Join community discussions</li>
              <li>Track your learning progress</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            Happy learning!<br>
            The BrowGen Team
          </p>
        </div>
      </div>
    `
  },
  
  password_reset: {
    subject: 'Reset Your BrowGen Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 40px 20px; text-align: center;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{name}},</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your BrowGen account. If you didn't make this request, you can safely ignore this email.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_url}}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all;">{{reset_url}}</span>
          </p>
        </div>
      </div>
    `
  },
  
  mentor_booking_confirmation: {
    subject: 'Mentor Session Confirmed! 📅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Confirmed!</h1>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{student_name}}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your mentorship session has been confirmed.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Session Details</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Mentor:</strong> {{mentor_name}}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Date & Time:</strong> {{session_datetime}}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Duration:</strong> {{duration}} minutes</p>
            {{#if meeting_link}}
            <p style="color: #666; margin: 5px 0;"><strong>Meeting Link:</strong> <a href="{{meeting_link}}">Join Session</a></p>
            {{/if}}
          </div>
          <p style="color: #666; line-height: 1.6;">
            We'll send you a reminder 24 hours before your session. Come prepared with questions and goals for your mentorship discussion!
          </p>
        </div>
      </div>
    `
  },
  
  weekly_digest: {
    subject: 'Your Weekly Learning Summary 📊',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Weekly Summary</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Keep up the great work!</p>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333;">Hi {{name}}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Here's what you accomplished this week:
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #667eea;">{{modules_completed}}</div>
                <div style="color: #666; font-size: 14px;">Modules Completed</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{points_earned}}</div>
                <div style="color: #666; font-size: 14px;">Points Earned</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">{{streak_days}}</div>
                <div style="color: #666; font-size: 14px;">Day Streak</div>
              </div>
            </div>
          </div>
          {{#if new_badges}}
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">🏆 New Badges Earned!</h3>
            <ul style="color: #856404;">
              {{#each new_badges}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          {{/if}}
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Continue Learning
            </a>
          </div>
        </div>
      </div>
    `
  }
};

// Template rendering helper
function renderTemplate(template, data) {
  let html = template.html;
  let subject = template.subject;
  
  // Simple template replacement (in production, use a proper template engine)
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value || '');
    subject = subject.replace(regex, value || '');
  }
  
  return { html, subject };
}

// Main email sending function
export async function sendEmail({ to, template, data = {} }) {
  if (!TEMPLATES[template]) {
    throw new Error(`Template '${template}' not found`);
  }
  
  const { html, subject } = renderTemplate(TEMPLATES[template], data);
  
  const emailData = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html
  };
  
  // Try SendGrid first, then Resend
  if (sendgridClient) {
    try {
      await sendgridClient.send(emailData);
      console.log(`[EMAIL] Sent via SendGrid to ${to}: ${subject}`);
      return { success: true, provider: 'sendgrid' };
    } catch (error) {
      console.error('[EMAIL] SendGrid error:', error);
      // Fall through to Resend
    }
  }
  
  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html
      });
      console.log(`[EMAIL] Sent via Resend to ${to}: ${subject}`);
      return { success: true, provider: 'resend' };
    } catch (error) {
      console.error('[EMAIL] Resend error:', error);
    }
  }
  
  // If no providers available or all failed
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] DEV MODE - Would send to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    return { success: true, provider: 'dev' };
  }
  
  throw new Error('No email provider available');
}

// Specific email functions
export async function sendWelcomeEmail(userEmail, userName) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
  
  return sendEmail({
    to: userEmail,
    template: 'welcome',
    data: {
      name: userName,
      dashboard_url: dashboardUrl
    }
  });
}

export async function sendPasswordResetEmail(userEmail, userName, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: userEmail,
    template: 'password_reset',
    data: {
      name: userName,
      reset_url: resetUrl
    }
  });
}

export async function sendMentorBookingConfirmation(studentEmail, studentName, mentorName, sessionDatetime, duration, meetingLink) {
  return sendEmail({
    to: studentEmail,
    template: 'mentor_booking_confirmation',
    data: {
      student_name: studentName,
      mentor_name: mentorName,
      session_datetime: sessionDatetime,
      duration: duration,
      meeting_link: meetingLink
    }
  });
}

export async function sendWeeklyDigest(userEmail, userName, stats) {
  const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
  
  return sendEmail({
    to: userEmail,
    template: 'weekly_digest',
    data: {
      name: userName,
      dashboard_url: dashboardUrl,
      ...stats
    }
  });
}
