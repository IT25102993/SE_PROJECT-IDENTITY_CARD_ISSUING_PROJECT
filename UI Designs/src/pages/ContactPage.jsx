import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';

export const ContactPage = () => {
  const { addToast } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      alert('Please complete all required contact fields.');
      return;
    }
    setSubmitted(true);
    addToast('Support inquiry sent successfully! Ticket #TCK-2026-981', 'success');
  };

  const FAQS = [
    {
      q: 'What documents are required for a first-time National Identity Card application?',
      a: 'You need an original Birth Certificate, Grama Niladhari Certificate (Form DRP-1 signed by GN and countersigned by Divisional Secretary), and a standard passport-size digital photo.'
    },
    {
      q: 'How long does standard processing take?',
      a: 'Standard online processing takes 3 to 5 business days from document verification to PVC printing and post office dispatch.'
    },
    {
      q: 'How can I track my application status online?',
      a: 'Navigate to the "Track Status" page and enter your 10-digit Tracking ID (e.g. NEX-2026-90412) to view real-time stage updates.'
    },
    {
      q: 'What should I do if my existing NIC is lost or damaged?',
      a: 'Submit a "Card Renewal / Replacement" application on the portal, attach a copy of the Police Report (for lost NIC) or the original damaged card details.'
    }
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>Customer Support</span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Have Questions? We're Here to Help.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Reach out with technical issues, tracking questions, or document verification inquiries.
          </p>
        </div>

        {/* Contact Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
          {/* Left Info */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Official Support Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', borderRadius: '10px' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Email Support</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@nexusgov.lk</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response within 24 business hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', borderRadius: '10px' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Hotline / Telephone</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+94 11 234 5678 / 1919 (Toll-Free)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Government Information Center</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', borderRadius: '10px' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Operating Hours</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monday – Friday: 8:30 AM – 4:30 PM</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closed on Government Holidays</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', borderRadius: '10px' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Headquarters Location</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Department of Registration of Persons, Suhurupaya, Battaramulla, Sri Lanka.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Message Received!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your support ticket #TCK-2026-981 has been created. A support officer will contact you shortly.
                </p>
                <button className="btn btn-secondary btn-sm" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Send Support Inquiry</h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Category</label>
                  <select
                    className="form-select"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Application Status">Application Status</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Data Correction">Data Correction</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details *</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe your inquiry or issue..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <Send size={18} /> Submit Inquiry Ticket
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={22} color="var(--accent-primary)" /> Frequently Asked Questions (FAQ)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: 'rgba(0,0,0,0.15)',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {openFaq === i && (
                  <div style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
