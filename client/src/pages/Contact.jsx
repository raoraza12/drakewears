import React, { useState } from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiClock, FiMapPin } from 'react-icons/fi';
import './Contact.css';

const Contact = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "What are your delivery times across Pakistan?",
      a: "Standard delivery takes 3 to 5 business days for major cities (Karachi, Lahore, Islamabad) and 4-6 days for other regions."
    },
    {
      q: "How do I claim Free Shipping?",
      a: "All orders over Rs. 4000 automatically qualify for Free Standard Shipping at checkout!"
    },
    {
      q: "Can I exchange for a different size?",
      a: "Yes! We offer hassle-free size exchanges within 7 days of delivery as long as the tag remains intact."
    }
  ];

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-info">
              <h1 className="h1" style={{ marginBottom: '16px' }}>Get in Touch</h1>
              <p className="text-body" style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
                Have a question about our oversized drop shoulder tees or baggy trousers? Reach out directly via WhatsApp, email, or fill out the form.
              </p>
              
              <div className="info-block" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiMail size={18} />
                  </div>
                  <h3 className="h3" style={{ fontSize: '1.1rem', margin: 0 }}>Official Email</h3>
                </div>
                <p className="text-body" style={{ fontWeight: 500, paddingLeft: '50px' }}>raoraza5417@gmail.com</p>
              </div>

              <div className="info-block" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPhone size={18} />
                  </div>
                  <h3 className="h3" style={{ fontSize: '1.1rem', margin: 0 }}>Contact & Support</h3>
                </div>
                <p className="text-body" style={{ fontWeight: 500, paddingLeft: '50px' }}>0345 8999091</p>
              </div>

              <div className="info-block" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiClock size={18} />
                  </div>
                  <h3 className="h3" style={{ fontSize: '1.1rem', margin: 0 }}>Working Hours</h3>
                </div>
                <p className="text-body" style={{ paddingLeft: '50px' }}>24/7 Online Support Available (Always Open)</p>
              </div>

              <a 
                href="https://api.whatsapp.com/send?phone=923458999091" 
                onClick={(e) => {
                  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                  if (isMobile) {
                    e.preventDefault();
                    window.location.href = "whatsapp://send?phone=923458999091";
                  }
                }}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', textDecoration: 'none' }}
              >
                <FiMessageCircle size={20} /> Chat on WhatsApp
              </a>
            </div>
            
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent.'); }}>
                <h3 className="h3" style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Send Us a Message</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" className="form-input" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" className="form-input" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" className="form-input" rows="5" required></textarea>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '12px', width: '100%' }}>Send Message</button>
              </form>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="contact-faq-section" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-light)' }}>
            <h2 className="h2" style={{ marginBottom: '24px', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div className="faq-list" style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-primary)' }}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    style={{
                      width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '1rem'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span>{activeFaq === idx ? '−' : '+'}</span>
                  </button>
                  {activeFaq === idx && (
                    <div style={{ padding: '0 20px 16px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
