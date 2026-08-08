import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, RotateCw, User, CheckCircle2 } from 'lucide-react';

export const IDCard3D = ({ cardData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [transformStyle, setTransformStyle] = useState('rotateX(0deg) rotateY(0deg)');
  const [glareStyle, setGlareStyle] = useState({});
  const cardRef = useRef(null);

  const defaultData = {
    nicNumber: cardData?.nicNumber || '200512345678',
    fullNameEn: cardData?.fullNameEn || 'Thilina Sakalasooriya',
    fullNameSi: cardData?.fullNameSi || 'තිලිණ සකළසූරිය',
    fullNameTa: cardData?.fullNameTa || 'திலீன சகலசூரிய',
    gender: cardData?.gender || 'Male',
    dob: cardData?.dob || '2005-01-01',
    address: cardData?.address || 'No. 12, Main Street, Malabe',
    signature: cardData?.signature || 'Thilina Sakalasooriya',
    photoUrl: cardData?.photoUrl || ''
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    const flipRotation = isFlipped ? ' rotateY(180deg)' : '';
    setTransformStyle(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)${flipRotation}`);

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`
    });
  };

  const handleMouseLeave = () => {
    const flipRotation = isFlipped ? ' rotateY(180deg)' : '';
    setTransformStyle(`rotateX(0deg) rotateY(0deg)${flipRotation}`);
    setGlareStyle({
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 60%)'
    });
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div
        className="card-perspective-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className={`id-card-3d ${isFlipped ? 'flipped' : ''}`}
          style={{ transform: transformStyle }}
          onClick={toggleFlip}
          title="Click to flip front/back"
        >
          {/* Glare Overlay */}
          <div className="glare-overlay" style={glareStyle} />

          {/* FRONT FACE */}
          <div className="id-card-face front">
            {/* Header */}
            <div className="nic-header">
              <img
                src="/images/index/gov_logo.png"
                alt="Sri Lanka Emblem"
                className="nic-emblem"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="nic-header-titles">
                <div className="nic-native-sub">ශ්‍රී ලංකා | இலங்கை</div>
                <div className="nic-native-sub">ජාතික හැඳුනුම්පත | தேசிய அடையாள அட்டை</div>
                <div className="nic-main-title">SRI LANKA NATIONAL IDENTITY CARD</div>
              </div>
            </div>

            {/* Body */}
            <div className="nic-body">
              {/* Photo & Signature */}
              <div className="nic-photo-col">
                <div className="nic-photo-box">
                  {defaultData.photoUrl ? (
                    <img src={defaultData.photoUrl} alt="Applicant" />
                  ) : (
                    <div style={{ textAlign: 'center', opacity: 0.6 }}>
                      <User size={36} />
                      <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>PHOTO</div>
                    </div>
                  )}
                </div>
                <div className="nic-signature">
                  {defaultData.signature || 'Signature'}
                </div>
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', textAlign: 'center' }}>
                  අත්සන / Signature
                </div>
              </div>

              {/* Details */}
              <div className="nic-details-col">
                <div className="nic-field-row">
                  <span className="nic-label">අංකය / No:</span>
                  <span>:</span>
                  <span className="nic-value nic-id-number">
                    {defaultData.nicNumber || 'PENDING'}
                  </span>
                </div>

                <div className="nic-field-row">
                  <span className="nic-label">නම:</span>
                  <span>:</span>
                  <span className="nic-value" style={{ fontFamily: 'var(--font-sinhala)' }}>
                    {defaultData.fullNameSi}
                  </span>
                </div>

                <div className="nic-field-row">
                  <span className="nic-label">பெயர்:</span>
                  <span>:</span>
                  <span className="nic-value">{defaultData.fullNameTa}</span>
                </div>

                <div className="nic-field-row">
                  <span className="nic-label">Name:</span>
                  <span>:</span>
                  <span className="nic-value">{defaultData.fullNameEn}</span>
                </div>

                <div className="nic-field-row">
                  <span className="nic-label">Sex:</span>
                  <span>:</span>
                  <span className="nic-value">
                    {defaultData.gender === 'Male' ? 'පුරුෂ / Male' : 'ස්ත්‍රී / Female'}
                  </span>
                </div>

                <div className="nic-field-row">
                  <span className="nic-label">DOB:</span>
                  <span>:</span>
                  <span className="nic-value">{defaultData.dob}</span>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '0.55rem', color: '#fbbf24', opacity: 0.8 }}>
                    ★ Department of Registration of Persons
                  </div>
                  <div style={{ background: '#ffffff', padding: '3px', borderRadius: '4px' }}>
                    <QRCodeSVG
                      value={`SRI_LANKA_NIC:${defaultData.nicNumber || 'NEXUS_GOV'}:${defaultData.fullNameEn}`}
                      size={36}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="id-card-face back">
            <div className="nic-header">
              <Shield size={20} color="#eab308" />
              <div className="nic-header-titles">
                <div className="nic-main-title">DEPARTMENT OF REGISTRATION OF PERSONS</div>
                <div className="nic-native-sub">ලිපිනය සහ නිකුත් කළ දිනය | முகவரி & வழங்கப்பட்ட திகதி</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, padding: '0.5rem 0' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>ස්ථායී ලිපිනය / Address:</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>
                  {defaultData.address}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.65rem' }}>
                <div>
                  <div style={{ color: '#94a3b8' }}>නිකුත් කළ දිනය / Issue Date:</div>
                  <div style={{ fontWeight: 600, color: '#fbbf24' }}>
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>ස්ථානය / Place:</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>Battaramulla, Sri Lanka</div>
                </div>
              </div>

              {/* Barcode & Hologram Security Simulation */}
              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.55rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <CheckCircle2 size={12} /> CRYPTOGRAPHICALLY SECURED IDENTITY PAYLOAD
                </div>
                <div style={{
                  height: '24px',
                  background: 'repeating-linear-gradient(90deg, #fff 0, #fff 2px, #000 2px, #000 5px)',
                  borderRadius: '2px'
                }} />
                <div style={{ fontSize: '0.55rem', textAlign: 'center', color: '#94a3b8', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                  *PDF417-{defaultData.nicNumber || 'NEXUS-GOV-2026'}*
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={toggleFlip}
        style={{ fontSize: '0.8rem', borderRadius: '20px' }}
      >
        <RotateCw size={14} /> {isFlipped ? 'View Front Side' : 'View Back Side (Click Card)'}
      </button>
    </div>
  );
};
