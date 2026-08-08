import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, RotateCw, User, CheckCircle2, Compass, Layers } from 'lucide-react';

export const IDCard3D = ({ cardData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStyleMode, setCardStyleMode] = useState('sketch'); // 'sketch' | 'pvc'
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});
  const cardRef = useRef(null);

  const defaultData = {
    nicNumber: cardData?.nicNumber || '200512345678',
    fullNameEn: cardData?.fullNameEn || 'Thilina Sakalasooriya',
    fullNameSi: cardData?.fullNameSi || 'තිලිණ සකළසූරිය',
    fullNameTa: cardData?.fullNameTa || 'திலீன சகலசூரிய',
    gender: cardData?.gender || 'Male',
    dob: cardData?.dob || '2005-01-01',
    address: cardData?.address || 'No. 12, Main Street, Malabe, Colombo',
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

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    const baseFlip = isFlipped ? 180 : 0;
    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${baseFlip + rotateY}deg)`
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`
    });
  };

  const handleMouseLeave = () => {
    const baseFlip = isFlipped ? 180 : 0;
    setTiltStyle({
      transform: `rotateX(0deg) rotateY(${baseFlip}deg)`
    });
    setGlareStyle({
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%)'
    });
  };

  const toggleFlip = (e) => {
    e.stopPropagation();
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    setTiltStyle({
      transform: `rotateX(0deg) rotateY(${nextFlipped ? 180 : 0}deg)`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
      {/* 3D Perspective Container */}
      <div
        className="card-perspective-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className={`id-card-3d ${isFlipped ? 'flipped' : ''}`}
          style={tiltStyle}
          onClick={toggleFlip}
          title="Click card to flip front/back"
        >
          {/* Glare Overlay */}
          <div className="glare-overlay" style={glareStyle} />

          {/* FRONT FACE */}
          <div className={`id-card-face front ${cardStyleMode === 'sketch' ? 'sketch-mode' : ''}`}>
            {/* Technical Sketch Crosshairs */}
            {cardStyleMode === 'sketch' && (
              <>
                <span className="sketch-crosshair tl">+</span>
                <span className="sketch-crosshair tr">+</span>
                <span className="sketch-crosshair bl">+</span>
                <span className="sketch-crosshair br">+</span>
              </>
            )}

            {/* Header */}
            <div className="nic-header">
              <img
                src="/images/index/gov_logo.png"
                alt="Sri Lanka Emblem"
                className="nic-emblem"
                onError={(e) => {
                  e.target.style.opacity = '0.5';
                }}
              />
              <div className="nic-header-titles">
                <div className="nic-native-sub">ශ්‍රී ලංකා | இலங்கை</div>
                <div className="nic-native-sub">ජාතික හැඳුනුම්පත | தேசிய அடையாள அட்டை</div>
                <div className="nic-main-title">
                  SRI LANKA NATIONAL IDENTITY CARD
                  {cardStyleMode === 'sketch' && <span style={{ fontSize: '0.55rem', color: '#60a5fa', marginLeft: '6px' }}>[SKETCH-3D]</span>}
                </div>
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
                    <div style={{ textAlign: 'center', opacity: 0.7 }}>
                      <User size={34} color={cardStyleMode === 'sketch' ? '#60a5fa' : '#94a3b8'} />
                      <div style={{ fontSize: '0.58rem', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>PHOTO_SPEC</div>
                    </div>
                  )}
                </div>
                <div className="nic-signature">
                  {defaultData.signature || 'Signature'}
                </div>
                <div style={{ fontSize: '0.55rem', color: cardStyleMode === 'sketch' ? '#93c5fd' : '#94a3b8', textAlign: 'center' }}>
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
                  <div style={{ fontSize: '0.55rem', color: cardStyleMode === 'sketch' ? '#93c5fd' : '#fbbf24', opacity: 0.85, fontFamily: 'var(--font-mono)' }}>
                    ★ Dept of Registration of Persons
                  </div>
                  <div style={{ background: '#ffffff', padding: '3px', borderRadius: '4px' }}>
                    <QRCodeSVG
                      value={`SRI_LANKA_NIC:${defaultData.nicNumber || 'NEXUS_GOV'}:${defaultData.fullNameEn}`}
                      size={34}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className={`id-card-face back ${cardStyleMode === 'sketch' ? 'sketch-mode' : ''}`}>
            {cardStyleMode === 'sketch' && (
              <>
                <span className="sketch-crosshair tl">+</span>
                <span className="sketch-crosshair tr">+</span>
                <span className="sketch-crosshair bl">+</span>
                <span className="sketch-crosshair br">+</span>
              </>
            )}

            <div className="nic-header">
              <Shield size={20} color={cardStyleMode === 'sketch' ? '#60a5fa' : '#eab308'} />
              <div className="nic-header-titles">
                <div className="nic-main-title">DEPARTMENT OF REGISTRATION OF PERSONS</div>
                <div className="nic-native-sub">ලිපිනය සහ නිකුත් කළ දිනය | முகவரி & வழங்கப்பட்ட திகதி</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, padding: '0.5rem 0' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: cardStyleMode === 'sketch' ? '#93c5fd' : '#94a3b8' }}>ස්ථායී ලිපිනය / Address:</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>
                  {defaultData.address}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.65rem' }}>
                <div>
                  <div style={{ color: cardStyleMode === 'sketch' ? '#93c5fd' : '#94a3b8' }}>නිකුත් කළ දිනය / Issue Date:</div>
                  <div style={{ fontWeight: 600, color: cardStyleMode === 'sketch' ? '#60a5fa' : '#fbbf24' }}>
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div>
                  <div style={{ color: cardStyleMode === 'sketch' ? '#93c5fd' : '#94a3b8' }}>ස්ථානය / Place:</div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>Battaramulla, Sri Lanka</div>
                </div>
              </div>

              {/* Barcode & Security */}
              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.4)', padding: '0.5rem', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '0.55rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <CheckCircle2 size={12} /> CRYPTOGRAPHICALLY SECURED IDENTITY PAYLOAD
                </div>
                <div style={{
                  height: '22px',
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

      {/* Control Buttons: Flip + 3D Aesthetics Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={toggleFlip}
          style={{ fontSize: '0.8rem', borderRadius: '20px' }}
        >
          <RotateCw size={14} /> {isFlipped ? 'View Front Side' : 'Flip Back Side'}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setCardStyleMode(cardStyleMode === 'sketch' ? 'pvc' : 'sketch')}
          style={{
            fontSize: '0.8rem',
            borderRadius: '20px',
            borderColor: cardStyleMode === 'sketch' ? 'var(--accent-primary)' : 'var(--border-color)',
            color: cardStyleMode === 'sketch' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
          }}
          title="Toggle between Technical Blueprint Sketch 3D & Realistic PVC 3D"
        >
          {cardStyleMode === 'sketch' ? (
            <>
              <Compass size={14} color="var(--accent-cyan)" /> Style: Blueprint Sketch 3D
            </>
          ) : (
            <>
              <Layers size={14} /> Style: Realistic PVC 3D
            </>
          )}
        </button>
      </div>
    </div>
  );
};
