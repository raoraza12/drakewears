import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container" style={{ maxWidth: '800px', padding: '80px 24px 120px' }}>
          <h1 className="h1" style={{ marginBottom: '40px' }}>Privacy Policy</h1>
          
          <div className="privacy-content text-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p><strong>Last Updated: August 2026</strong></p>
            
            <p>At drakewears, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information when you visit or make a purchase from our website.</p>
            
            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>1. Information We Collect</h3>
            <p>When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, when you make a purchase, we collect certain information from you, including your name, billing address, shipping address, payment information, email address, and phone number.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>2. How We Use Your Information</h3>
            <p>We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to communicate with you and screen our orders for potential risk or fraud.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>3. Sharing Your Information</h3>
            <p>We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use third-party payment processors and shipping partners to fulfill your orders. We may also share your Personal Information to comply with applicable laws and regulations, or to otherwise protect our rights.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>4. Data Retention</h3>
            <p>When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>5. Your Rights</h3>
            <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.</p>

            <h3 className="h3" style={{ color: 'var(--text-primary)', marginTop: '16px' }}>6. Contact Us</h3>
            <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at support@drake.com or visit our <Link to="/contact" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Contact Page</Link>.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
