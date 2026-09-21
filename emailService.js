const nodemailer = require('nodemailer');

let transporter = null;
let isEthereal = false;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass && user.trim().length > 0 && pass.trim().length > 0) {
    // Configured real SMTP
    if (host && host.includes('gmail')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
      console.log(`📧 Configured Native Gmail SMTP Transporter for ${user}`);
    } else {
      transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port,
        secure: port === 465,
        auth: { user, pass }
      });
      console.log(`📧 Configured Real SMTP Transporter (${host}:${port}) for ${user}`);
    }
  } else {
    // Zero-config Ethereal / Test Transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isEthereal = true;
      console.log('📧 No SMTP credentials in .env — Initialized Ethereal Test Mailer.');
      console.log('💡 Tip: Enter SMTP_USER and SMTP_PASS in .env to send real emails to inboxes.');
    } catch (e) {
      // Fallback direct transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      console.log('📧 Initialized Fallback JSON Mailer logger.');
    }
  }

  return transporter;
}

function buildAlertEmailHtml({ stationName, state, riskScore, riskLevel, rainfallToday, rainfall7d, whyFactors, triggerSource }) {
  const isCritical = riskLevel === 'CRITICAL' || riskScore >= 75;
  const alertColor = isCritical ? '#dc2626' : '#ea580c';
  const alertBadge = isCritical ? '🔴 CRITICAL RED ALERT' : '🟠 HIGH RISK WARNING';
  const isDemo = triggerSource === 'simulation' || triggerSource === 'demo';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${alertBadge} - Raksha360</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1329;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <div style="max-width:620px;margin:24px auto;background:#111e38;border:1px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Top banner -->
    <div style="background:${alertColor};padding:16px 24px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:16px;font-weight:800;letter-spacing:0.5px;color:#ffffff;">
        🛡️ RAKSHA360 — DISASTER EARLY WARNING
      </span>
      <span style="background:rgba(0,0,0,0.25);color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;">
        ${alertBadge}
      </span>
    </div>

    ${isDemo ? `
    <div style="background:#451a03;border-bottom:1px solid #78350f;padding:8px 24px;color:#fde68a;font-size:11.5px;font-weight:600;letter-spacing:0.4px;">
      🧪 [DEMO / SIMULATION MODE] — Automated early warning triggered for SIH 2026 Evaluation.
    </div>
    ` : ''}

    <!-- Main Content -->
    <div style="padding:28px 24px;">
      <h2 style="margin:0 0 8px 0;font-size:22px;color:#ffffff;font-weight:700;">
        Landslide Hazard Escalation in <span style="color:${alertColor};">${stationName}, ${state}</span>
      </h2>
      <p style="margin:0 0 20px 0;font-size:14px;color:#94a3b8;line-height:1.5;">
        The AI Predictive Hazard Engine has detected dangerous slope conditions exceeding emergency thresholds. Immediate vigilance and precautionary action are advised.
      </p>

      <!-- Key Metrics Box -->
      <div style="background:#172554;border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:18px;margin-bottom:22px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#93c5fd;font-size:13px;">Assessed Risk Score:</td>
            <td style="padding:6px 0;text-align:right;font-size:20px;font-weight:800;color:${alertColor};">
              ${riskScore} / 100
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#93c5fd;font-size:13px;">Risk Category:</td>
            <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:700;color:#ffffff;">
              ${riskLevel}
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#93c5fd;font-size:13px;">Precipitation (Past 24h):</td>
            <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;color:#f8fafc;">
              ${rainfallToday || '–'} mm
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#93c5fd;font-size:13px;">7-Day Cumulative Rainfall:</td>
            <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:600;color:#f8fafc;">
              ${rainfall7d || '–'} mm
            </td>
          </tr>
        </table>
      </div>

      <!-- Explainable AI Factors -->
      <div style="margin-bottom:22px;">
        <h4 style="margin:0 0 10px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;">
          🔍 Explainable AI (XAI) Attribution:
        </h4>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px;font-size:13px;line-height:1.6;color:#cbd5e1;">
          ${whyFactors || '• Significant soil pore-water saturation from antecedent rainfall.<br>• Steep slope geometry and active drainage convergence.'}
        </div>
      </div>

      <!-- Actionable Advisories -->
      <div style="background:#1e1b4b;border-left:4px solid #818cf8;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
        <h4 style="margin:0 0 6px 0;font-size:13.5px;color:#c7d2fe;font-weight:700;">
          ⚠️ Recommended Standard Operating Procedures (SOPs):
        </h4>
        <ul style="margin:0;padding-left:20px;font-size:12.5px;color:#e0e7ff;line-height:1.6;">
          <li>Avoid transit along identified slope-cut roads and vulnerable arterial routes.</li>
          <li>Residents near unstable retaining walls or slope toes should move to pre-designated community shelters.</li>
          <li>Keep emergency disaster kits ready with torch, battery backup, first aid, and drinking water.</li>
        </ul>
      </div>

      <!-- Emergency Helpline -->
      <div style="text-align:center;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;">
        <span style="font-size:13px;color:#94a3b8;">State Disaster Management Helpline:</span><br>
        <span style="font-size:20px;font-weight:800;color:#38bdf8;letter-spacing:1px;">📞 1070 / 112</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px;background:#0d1527;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#64748b;line-height:1.5;">
      You received this automated notification because your email is registered for early warnings in <strong>${stationName}</strong> on the Raksha360 Decision Support System.<br>
      Automated AI Risk Engine · North Eastern Region (NER) · Smart India Hackathon 2026.
    </div>
  </div>
</body>
</html>
  `;
}

async function sendAutomatedRiskEmail({
  recipients,
  stationName,
  state,
  riskScore,
  riskLevel,
  rainfallToday,
  rainfall7d,
  whyFactors,
  triggerSource = 'automated'
}) {
  if (!recipients || recipients.length === 0) {
    return {
      success: false,
      reason: 'No active subscribers found for this station.'
    };
  }

  const fromName = process.env.ALERT_FROM_NAME || 'Raksha360 Early Warning System';
  const fromEmail = process.env.ALERT_FROM_EMAIL || 'onboarding@resend.dev';

  const subject = `🚨 [${riskLevel} ALERT] Landslide Warning for ${stationName}, ${state} (Risk: ${riskScore}/100)`;
  const html = buildAlertEmailHtml({
    stationName,
    state,
    riskScore,
    riskLevel,
    rainfallToday,
    rainfall7d,
    whyFactors,
    triggerSource
  });

  // 1. Try Resend API first if configured
  const resendApiKey = process.env.RESEND_API_KEY;
  const pendingRecipientsForSmtp = [];

  if (resendApiKey && resendApiKey.startsWith('re_')) {
    try {
      const fromFormatted = `Raksha360 <${fromEmail}>`;
      let resendSuccessCount = 0;
      let lastResendId = null;

      for (const recipient of recipients) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: fromFormatted,
              to: [recipient],
              subject: subject,
              html: html
            })
          });

          const resData = await res.json();
          if (res.ok) {
            resendSuccessCount++;
            lastResendId = resData.id;
            console.log(`✅ [Resend] Dispatched Real Email to ${recipient} (ID: ${resData.id})`);
          } else {
            console.warn(`⚠️ [Resend] Notice for ${recipient}:`, resData.message || resData);
            pendingRecipientsForSmtp.push(recipient);
          }
        } catch (fetchErr) {
          console.warn(`⚠️ [Resend] Request failed for ${recipient}:`, fetchErr.message);
          pendingRecipientsForSmtp.push(recipient);
        }
      }

      if (resendSuccessCount > 0 && pendingRecipientsForSmtp.length === 0) {
        return {
          success: true,
          provider: 'Resend',
          messageId: lastResendId,
          recipients: recipients,
          timestamp: new Date()
        };
      }
    } catch (resendErr) {
      console.warn('⚠️ [Resend] Network error, falling back to Nodemailer:', resendErr.message);
    }
  }

  // 2. Fallback to Nodemailer / SMTP / Ethereal for remaining recipients
  const fallbackRecipients = pendingRecipientsForSmtp.length > 0 ? pendingRecipientsForSmtp : recipients;
  if (fallbackRecipients.length === 0) {
    return {
      success: true,
      provider: 'Resend',
      recipients: recipients,
      timestamp: new Date()
    };
  }

  const mailTransporter = await getTransporter();
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: fallbackRecipients.join(', '),
    subject: subject,
    html: html
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    let previewUrl = null;
    if (isEthereal && nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('🔗 [Ethereal Preview URL]:', previewUrl);
    }

    console.log(`✅ [Nodemailer] Dispatched Email to ${recipients.length} recipients: ${recipients.join(', ')}`);

    return {
      success: true,
      provider: 'Nodemailer',
      messageId: info.messageId,
      previewUrl: previewUrl,
      recipients: recipients,
      timestamp: new Date()
    };
  } catch (err) {
    console.error('❌ Failed to dispatch email alert:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getTransporter,
  sendAutomatedRiskEmail
};
