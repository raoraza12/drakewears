import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container" style={{ maxWidth: '800px', padding: '80px 24px 120px' }}>
          <h1 className="h1" style={{ marginBottom: '40px' }}>Terms of Service</h1>
          
          <div className="terms-content text-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p><strong>Effective Date: 2026</strong></p>
            
            <p>Welcome to <strong>DRAKEWEARS</strong>. By visiting our store, accessing our website, or purchasing our streetwear and apparel, you agree to be bound by the following terms and conditions.</p>
            
            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>1. Orders & Pricing</h3>
            <p>All prices listed on our website are in Pakistani Rupees (PKR) and include all applicable taxes unless otherwise noted. We reserve the right to adjust prices or discontinue any product at any time without prior notice. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>2. Cash on Delivery (COD) & Verification</h3>
            <p>For Cash on Delivery orders, DRAKEWEARS reserves the right to call or message customers via WhatsApp to confirm the order and delivery address before dispatch. Orders that remain unconfirmed after reasonable attempts may be cancelled.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>3. Shipping & Delivery</h3>
            <p>We deliver nationwide across Pakistan via trusted courier services (TCS, Leopard, Trax). Standard delivery takes 3 to 5 business days for major cities and 4 to 6 business days for remote areas. Orders over Rs. 5,000 qualify for free standard shipping.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>4. Exchanges & Returns</h3>
            <p>We take pride in our craftsmanship. If you receive an incorrect size or a defective garment, you may request an exchange within 7 days of receiving your parcel. The item must be unworn, unwashed, and in its original condition with tags intact.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>5. Intellectual Property</h3>
            <p>All designs, graphics, branding, product names, photography, and text on this website are the intellectual property of DRAKEWEARS and may not be reproduced, modified, or distributed without written permission.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>6. Contact & Inquiries</h3>
            <p>If you have any questions regarding these terms, please contact our support team via WhatsApp at +92 321 8254922 or visit our <Link to="/contact" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Contact Page</Link>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
