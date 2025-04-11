import { MailService } from '@sendgrid/mail';

// Vérifier si l'API key est présente
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be limited to logging.");
}

const mailService = new MailService();

// Configurer SendGrid seulement si l'API key est présente
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY as string);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // Si l'API key n'est pas configurée, simuler un envoi réussi mais logger un avertissement
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API Key not configured. Would have sent the following email:');
    console.log(`To: ${params.to}`);
    console.log(`From: ${params.from}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Content: ${params.text.substring(0, 100)}...`);
    return true;
  }

  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text
    };
    
    if (params.html) {
      emailData.html = params.html;
    }
    
    await mailService.send(emailData);
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Send game code email to customer
 */
export async function sendGameCodeEmail(
  to: string,
  gameName: string,
  platform: string,
  gameCode: string,
  orderNumber: string
): Promise<boolean> {
  const fromEmail = "noreply@sou9digital.ma";
  const subject = `Your Game Code for ${gameName} (${platform}) - Order #${orderNumber}`;

  // HTML email template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1c2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #f4ce14; margin: 0;">Sou9Digital</h1>
        <p style="color: #fff; margin-top: 5px;">Your Game Code is Ready!</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
        <p>Thank you for your purchase from Sou9Digital!</p>
        
        <p>Here is your game code for <strong>${gameName}</strong> on <strong>${platform}</strong>:</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-family: monospace; font-size: 18px; letter-spacing: 1px; border: 1px dashed #ccc;">
          ${gameCode}
        </div>
        
        <h3>How to redeem your code:</h3>
        <ol>
          <li>Log in to your ${platform} account</li>
          <li>Navigate to the "Redeem Code" or "Activate Product" section</li>
          <li>Enter the code exactly as shown above (including any hyphens or special characters)</li>
          <li>Download and enjoy your game!</li>
        </ol>
        
        <p>If you encounter any issues with your code, please contact our support team at support@sou9digital.ma with your order number (${orderNumber}).</p>
        
        <p>Thank you for choosing Sou9Digital for your gaming needs!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>© Sou9Digital - Morocco's Premier Gaming Marketplace</p>
          <p>This email was sent regarding your order #${orderNumber}. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;

  // Plain text fallback version
  const text = `
    Your Game Code from Sou9Digital
    ===============================
    
    Thank you for your purchase from Sou9Digital!
    
    Here is your game code for ${gameName} on ${platform}:
    
    ${gameCode}
    
    How to redeem your code:
    1. Log in to your ${platform} account
    2. Navigate to the "Redeem Code" or "Activate Product" section
    3. Enter the code exactly as shown above (including any hyphens or special characters)
    4. Download and enjoy your game!
    
    If you encounter any issues with your code, please contact our support team at support@sou9digital.ma with your order number (${orderNumber}).
    
    Thank you for choosing Sou9Digital for your gaming needs!
    
    © Sou9Digital - Morocco's Premier Gaming Marketplace
    This email was sent regarding your order #${orderNumber}. Please do not reply to this email.
  `;

  return sendEmail({
    to,
    from: fromEmail,
    subject,
    html,
    text
  });
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  customerName: string,
  paymentMethod: string,
  totalAmount: number,
  products: Array<{ name: string; platform: string; quantity: number; price: number }>
): Promise<boolean> {
  const fromEmail = "noreply@sou9digital.ma";
  const subject = `Order Confirmation - Sou9Digital #${orderNumber}`;
  
  // Create the product list for the email
  const productList = products.map(product => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name} (${product.platform})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${product.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${product.price.toFixed(2)} MAD</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(product.price * product.quantity).toFixed(2)} MAD</td>
    </tr>
  `).join('');

  // Next steps instructions based on payment method
  let nextSteps = '';
  if (paymentMethod === 'bank_transfer') {
    nextSteps = `
      <h3>Next Steps:</h3>
      <ol>
        <li>Transfer the full amount (${totalAmount.toFixed(2)} MAD) to our bank account</li>
        <li>Include your order number (${orderNumber}) as a reference in the transfer</li>
        <li>Take a screenshot of your transfer confirmation</li>
        <li>Contact our support team with your confirmation screenshot</li>
      </ol>
      <p><strong>Important:</strong> Your order will be processed and game codes sent once payment is confirmed.</p>
    `;
  } else if (paymentMethod === 'cash_on_delivery') {
    nextSteps = `
      <h3>Next Steps:</h3>
      <p>Our team will contact you shortly to confirm your order. Once confirmed, you'll receive your game codes by email.</p>
    `;
  }

  // HTML email template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1c2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #f4ce14; margin: 0;">Sou9Digital</h1>
        <p style="color: #fff; margin-top: 5px;">Order Confirmation</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
        <p>Hello ${customerName},</p>
        
        <p>Thank you for your order from Sou9Digital! We're processing your order now.</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order Number:</strong> #${orderNumber}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}</p>
          <p><strong>Total Amount:</strong> ${totalAmount.toFixed(2)} MAD</p>
        </div>
        
        <h3>Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold;">${totalAmount.toFixed(2)} MAD</td>
            </tr>
          </tfoot>
        </table>
        
        ${nextSteps}
        
        <p>If you have any questions about your order, please contact our support team at support@sou9digital.ma.</p>
        
        <p>Thank you for choosing Sou9Digital for your gaming needs!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>© Sou9Digital - Morocco's Premier Gaming Marketplace</p>
          <p>This email was sent regarding your order #${orderNumber}. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;

  // Plain text fallback version
  const text = `
    Order Confirmation - Sou9Digital
    ===============================
    
    Hello ${customerName},
    
    Thank you for your order from Sou9Digital! We're processing your order now.
    
    Order Number: #${orderNumber}
    Payment Method: ${paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
    Total Amount: ${totalAmount.toFixed(2)} MAD
    
    Order Summary:
    ${products.map(p => `- ${p.name} (${p.platform}) x${p.quantity}: ${(p.price * p.quantity).toFixed(2)} MAD`).join('\n')}
    
    Total: ${totalAmount.toFixed(2)} MAD
    
    ${paymentMethod === 'bank_transfer' 
      ? `Next Steps:
    1. Transfer the full amount (${totalAmount.toFixed(2)} MAD) to our bank account
    2. Include your order number (${orderNumber}) as a reference in the transfer
    3. Take a screenshot of your transfer confirmation
    4. Contact our support team with your confirmation screenshot
    
    Important: Your order will be processed and game codes sent once payment is confirmed.`
      : `Next Steps:
    Our team will contact you shortly to confirm your order. Once confirmed, you'll receive your game codes by email.`}
    
    If you have any questions about your order, please contact our support team at support@sou9digital.ma.
    
    Thank you for choosing Sou9Digital for your gaming needs!
    
    © Sou9Digital - Morocco's Premier Gaming Marketplace
    This email was sent regarding your order #${orderNumber}. Please do not reply to this email.
  `;

  return sendEmail({
    to,
    from: fromEmail,
    subject,
    html,
    text
  });
}

/**
 * Send payment confirmation email to customer
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  orderNumber: string,
  customerName: string
): Promise<boolean> {
  const fromEmail = "noreply@sou9digital.ma";
  const subject = `Payment Confirmed - Order #${orderNumber}`;

  // HTML email template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1c2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #f4ce14; margin: 0;">Sou9Digital</h1>
        <p style="color: #fff; margin-top: 5px;">Payment Confirmation</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
        <p>Hello ${customerName},</p>
        
        <p>Great news! We've confirmed your payment for order #${orderNumber}.</p>
        
        <p>Your game codes will be delivered to your email shortly. If you've already received your game codes, you can ignore this message.</p>
        
        <p>If you haven't received your game codes within the next 30 minutes, please contact our support team at support@sou9digital.ma with your order number.</p>
        
        <p>Thank you for choosing Sou9Digital for your gaming needs!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>© Sou9Digital - Morocco's Premier Gaming Marketplace</p>
          <p>This email was sent regarding your order #${orderNumber}. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;

  // Plain text fallback version
  const text = `
    Payment Confirmation - Sou9Digital
    =================================
    
    Hello ${customerName},
    
    Great news! We've confirmed your payment for order #${orderNumber}.
    
    Your game codes will be delivered to your email shortly. If you've already received your game codes, you can ignore this message.
    
    If you haven't received your game codes within the next 30 minutes, please contact our support team at support@sou9digital.ma with your order number.
    
    Thank you for choosing Sou9Digital for your gaming needs!
    
    © Sou9Digital - Morocco's Premier Gaming Marketplace
    This email was sent regarding your order #${orderNumber}. Please do not reply to this email.
  `;

  return sendEmail({
    to,
    from: fromEmail,
    subject,
    html,
    text
  });
}