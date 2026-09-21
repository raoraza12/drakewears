const nodemailer = require('nodemailer');

// Create transporter - configure via ENV variables
const createTransporter = () => {
  // Default to Gmail SMTP if no custom SMTP is set
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.ADMIN_EMAIL,
      pass: process.env.SMTP_PASS
    }
  };

  if (!config.auth.user || !config.auth.pass) {
    console.warn('[Mailer] SMTP credentials not configured. Email notifications disabled.');
    return null;
  }

  return nodemailer.createTransport(config);
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SMTP_USER || '';
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@drakewears.com';

/**
 * Send order notification email to admin
 */
const sendOrderNotification = async (order, items = [], type = 'website') => {
  const transporter = createTransporter();
  if (!transporter || !ADMIN_EMAIL) {
    console.log('[Mailer] Skipping email - SMTP not configured');
    return false;
  }

  const orderSource = type === 'whatsapp' ? '📱 WhatsApp Order' : '🛒 Website Order';
  const customerName = order.shippingAddress?.name || 'N/A';
  const customerPhone = order.shippingAddress?.phone || 'N/A';
  const customerCity = order.shippingAddress?.city || 'N/A';
  
  // Build items HTML
  let itemsHtml = '';
  if (items && items.length > 0) {
    itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.name || 'Product'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.size || '-'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.color || '-'}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          Rs. ${(item.price || 0).toLocaleString()}
        </td>
      </tr>
    `).join('');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">DRAKEWEARS</h1>
          <p style="color: #cccccc; margin: 8px 0 0; font-size: 14px;">${orderSource}</p>
        </div>
        
        <!-- Order Info -->
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 24px; font-size: 20px; color: #333;">New Order Received! 🎉</h2>
          
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Customer Details</h3>
            <p style="margin: 4px 0; font-size: 15px;"><strong>Name:</strong> ${customerName}</p>
            <p style="margin: 4px 0; font-size: 15px;"><strong>Phone:</strong> ${customerPhone}</p>
            <p style="margin: 4px 0; font-size: 15px;"><strong>City:</strong> ${customerCity}</p>
            <p style="margin: 4px 0; font-size: 15px;"><strong>Payment:</strong> ${order.paymentMethod || 'N/A'}</p>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #000000; color: #ffffff;">
                <th style="padding: 12px; text-align: left; font-size: 13px;">Item</th>
                <th style="padding: 12px; text-align: center; font-size: 13px;">Size</th>
                <th style="padding: 12px; text-align: center; font-size: 13px;">Color</th>
                <th style="padding: 12px; text-align: center; font-size: 13px;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 13px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- Totals -->
          <div style="border-top: 2px solid #000; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #666;">Subtotal:</span>
              <span style="font-size: 14px;">Rs. ${(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 14px; color: #666;">Shipping:</span>
              <span style="font-size: 14px;">${order.shippingFee === 0 ? 'FREE' : `Rs. ${(order.shippingFee || 0).toLocaleString()}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #eee;">
              <span style="font-size: 18px; font-weight: bold;">TOTAL:</span>
              <span style="font-size: 18px; font-weight: bold; color: #000;">Rs. ${(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
          
          <!-- Shipping Address -->
          ${order.shippingAddress?.street ? `
          <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</h3>
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''} ${order.shippingAddress.zip || ''}<br>
              ${order.shippingAddress.country || 'Pakistan'}
            </p>
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #000000; padding: 20px; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 12px;">DRAKEWEARS © ${new Date().getFullYear()} — Order Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"DRAKEWEARS Store" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🛍️ New Order Received #${String(order.id).slice(-6).toUpperCase()} - Rs. ${(order.total || 0).toLocaleString()}`,
      html
    });
    console.log('[Mailer] Order notification sent to admin:', info.messageId);
    return true;
  } catch (err) {
    console.error('[Mailer] Error sending order notification:', err.message);
    return false;
  }
};

/**
 * Send order confirmation email directly to the customer
 */
const sendCustomerOrderConfirmation = async (order, items = []) => {
  const customerEmail = order.shippingAddress?.email || (order.user?.email && !order.user.email.includes('@drakewearsbrand.local') && !order.user.email.includes('@drakewears.pk') ? order.user.email : null);
  if (!customerEmail) {
    console.log('[Mailer] Skipping customer confirmation: No valid customer email provided.');
    return false;
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Mailer] Skipping customer email: SMTP credentials not configured.');
    return false;
  }

  const customerName = order.shippingAddress?.name || 'Valued Customer';
  const customerPhone = order.shippingAddress?.phone || 'N/A';
  const orderNumber = order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id).slice(-8).toUpperCase()}`;

  let itemsHtml = '';
  if (items && items.length > 0) {
    itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #eee;">
          <strong>${item.name || 'Product'}</strong>
          ${item.size ? `<br><small style="color: #999;">Size: ${item.size}</small>` : ''}
          ${item.color ? `<br><small style="color: #999;">Color: ${item.color}</small>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #222; text-align: center; color: #eee;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #222; text-align: right; color: #c9a84c; font-weight: bold;">
          Rs. ${(item.price || 0).toLocaleString()}
        </td>
      </tr>
    `).join('');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0b0e; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #121217; border: 1px solid #282830; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background-color: #0a0a0e; padding: 28px 24px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 26px; letter-spacing: 3px; font-weight: 800;">DRAKEWEARS</h1>
          <p style="color: #888; margin: 6px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Official Order Confirmation</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 10px; font-size: 20px; color: #fff;">Order Confirmed! 🎉</h2>
          <p style="color: #aaa; font-size: 15px; margin: 0 0 20px; line-height: 1.5;">
            Hi <strong>${customerName}</strong>, thank you for choosing DRAKEWEARS. Your order <strong style="color: #c9a84c;">${orderNumber}</strong> has been received and is being prepared with utmost care.
          </p>

          <!-- Delivery Guarantee Banner -->
          <div style="background: rgba(85, 198, 136, 0.08); border: 1px solid rgba(85, 198, 136, 0.25); border-radius: 8px; padding: 14px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #55c688;">🚚 Estimated Delivery: 2 to 4 Working Days</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: #aaa;">Your package will be delivered directly to your doorstep in max 4 days.</p>
          </div>

          <!-- Customer & Delivery Snapshot -->
          <div style="background-color: #181820; border-radius: 8px; padding: 16px; margin-bottom: 20px; border: 1px solid #222;">
            <p style="margin: 0 0 6px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Delivery Details</p>
            <p style="margin: 3px 0; font-size: 14px; color: #ddd;"><strong>Recipient:</strong> ${customerName}</p>
            <p style="margin: 3px 0; font-size: 14px; color: #ddd;"><strong>Contact Phone:</strong> ${customerPhone}</p>
            <p style="margin: 3px 0; font-size: 14px; color: #ddd;"><strong>Address:</strong> ${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state || 'Pakistan'}</p>
            <p style="margin: 3px 0; font-size: 14px; color: #ddd;"><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash on Delivery'}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #0f0f14; border-bottom: 1px solid #333;">
                <th style="padding: 10px; text-align: left; font-size: 12px; color: #a0a0a8; text-transform: uppercase;">Item</th>
                <th style="padding: 10px; text-align: center; font-size: 12px; color: #a0a0a8; text-transform: uppercase;">Qty</th>
                <th style="padding: 10px; text-align: right; font-size: 12px; color: #a0a0a8; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 1px solid #333; padding-top: 14px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #aaa; font-size: 14px;">
              <span>Subtotal:</span>
              <span>Rs. ${(order.subtotal || 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #aaa; font-size: 14px;">
              <span>Shipping:</span>
              <span>${order.shippingFee === 0 ? 'FREE' : `Rs. ${(order.shippingFee || 0).toLocaleString()}`}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #55c688; font-size: 14px;">
              <span>Discount:</span>
              <span>- Rs. ${(order.discount || 0).toLocaleString()}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #444; font-size: 18px; font-weight: bold; color: #c9a84c;">
              <span>Total Payable:</span>
              <span>Rs. ${(order.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <p style="font-size: 13px; color: #888; text-align: center; margin: 0;">
            If you need to change your delivery address or contact number, please message us on WhatsApp (+92 321 8254922) immediately with your Order ${orderNumber}.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #0a0a0e; padding: 18px; text-align: center; border-top: 1px solid #222;">
          <p style="color: #666; margin: 0; font-size: 12px;">DRAKEWEARS • Modern Luxury Streetwear • Lahore, Pakistan</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"DRAKEWEARS" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Confirmed #${orderNumber} — DRAKEWEARS`,
      html
    });
    console.log(`[Mailer] Order confirmation sent to customer: ${customerEmail}`);
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send customer confirmation:', err.message);
    return false;
  }
};

/**
 * Send order cancellation confirmation email to customer
 */
const sendCustomerOrderCancellation = async (order, items = [], reason = '') => {
  const customerEmail = order.shippingAddress?.email || (order.user?.email && !order.user.email.includes('@drakewearsbrand.local') && !order.user.email.includes('@drakewears.pk') ? order.user.email : null);
  if (!customerEmail) {
    console.log('[Mailer] Skipping cancellation email: No valid customer email provided.');
    return false;
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Mailer] Skipping cancellation email: SMTP credentials not configured.');
    return false;
  }

  const customerName = order.shippingAddress?.name || 'Valued Customer';
  const orderNumber = String(order.id).slice(-8).toUpperCase();
  const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'refund_pending';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0d0d11; font-family: 'Helvetica Neue', Arial, sans-serif; color: #fff;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #16161d; border: 1px solid #2a2a35; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0a0a0e; padding: 28px; text-align: center; border-bottom: 1px solid #e05555;">
          <h1 style="color: #e05555; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 800;">ORDER CANCELLED</h1>
          <p style="color: #a0a0a8; margin: 6px 0 0; font-size: 13px; text-transform: uppercase;">Order #${orderNumber}</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; margin: 0 0 8px; font-size: 19px;">Hello ${customerName},</h2>
          <p style="color: #a0a0a8; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">
            As requested, your order <strong>#${orderNumber}</strong> has been cancelled. Any items reserved for this order have been returned to our inventory.
          </p>

          <div style="background: #1e1e27; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #333;">
            <p style="margin: 3px 0; font-size: 13px; color: #aaa;"><strong>Cancellation Reason:</strong> <span style="color: #fff;">${reason || 'Customer request'}</span></p>
            <p style="margin: 3px 0; font-size: 13px; color: #aaa;"><strong>Order Total:</strong> <span style="color: #c9a84c;">Rs. ${(order.total || 0).toLocaleString()}</span></p>
            <p style="margin: 3px 0; font-size: 13px; color: #aaa;"><strong>Payment Mode:</strong> <span style="color: #fff;">${order.paymentMethod || 'Cash on Delivery'}</span></p>
            ${isPaid ? `
              <p style="margin: 8px 0 3px; font-size: 13px; color: #55c688; font-weight: bold;">
                Refund Status: A refund has been requested and will be processed back to your account within 2-3 business days.
              </p>
            ` : `
              <p style="margin: 8px 0 3px; font-size: 13px; color: #aaa;">
                Payment Status: No payment was charged for this Cash on Delivery order.
              </p>
            `}
          </div>

          <p style="font-size: 13px; color: #888; text-align: center; margin: 0;">
            We hope to serve you again soon. If you have any questions, feel free to reply to this email or message us on WhatsApp.
          </p>
        </div>

        <div style="background-color: #0a0a0e; padding: 18px; text-align: center; border-top: 1px solid #222;">
          <p style="color: #666; margin: 0; font-size: 12px;">DRAKEWEARS • Modern Luxury Streetwear • Lahore, Pakistan</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"DRAKEWEARS" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Cancelled #${orderNumber} — DRAKEWEARS`,
      html
    });
    console.log(`[Mailer] Order cancellation sent to customer: ${customerEmail}`);
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send customer cancellation:', err.message);
    return false;
  }
};

/**
 * Send cancellation notification email to admin
 */
const sendAdminCancellationNotification = async (order, reason = '', cancelledBy = 'Customer') => {
  const transporter = createTransporter();
  if (!transporter || !ADMIN_EMAIL) return false;
  const orderNumber = String(order.id).slice(-8).toUpperCase();
  const customerName = order.shippingAddress?.name || 'Customer';
  const customerPhone = order.shippingAddress?.phone || 'N/A';

  try {
    await transporter.sendMail({
      from: `"DRAKEWEARS Store" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `⚠️ Order Cancelled by ${cancelledBy} #${orderNumber} - Rs. ${(order.total || 0).toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #0f0f14; color: #fff; border-radius: 8px;">
          <h2 style="color: #e05555; margin-top: 0;">Order #${orderNumber} Cancelled</h2>
          <p><strong>Cancelled By:</strong> ${cancelledBy}</p>
          <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerPhone})</p>
          <p><strong>Total:</strong> Rs. ${(order.total || 0).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
          <p style="color: #55c688; margin-top: 15px;">✓ All ordered items have been automatically returned to inventory stock.</p>
        </div>
      `
    });
    console.log(`[Mailer] Cancellation notification sent to admin for order #${orderNumber}`);
    return true;
  } catch (err) {
    console.error('[Mailer] Failed to send admin cancellation notification:', err.message);
    return false;
  }
};

module.exports = { 
  sendOrderNotification, 
  sendCustomerOrderConfirmation, 
  sendCustomerOrderCancellation,
  sendAdminCancellationNotification
};
