import React, { useState, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, RotateCw, User, CheckCircle2 } from 'lucide-react';
import { generateSriLankan12DigitNIC } from '../context/AppContext';

export const IDCard3D = ({ cardData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});
  const cardRef = useRef(null);

  // Generate a unique random serial ONCE per card mount (stable across re-renders/hover)
  const serialRef = useRef(Math.floor(1000 + Math.random() * 9000));

  // Memoize computed NIC so mouse movement / tilt hover does NOT recalculate random serial
  const computedNic = useMemo(() => {
    if (cardData?.nicNumber) return cardData.nicNumber;
    return generateSriLankan12DigitNIC(cardData?.dob || '2005-01-01', cardData?.gender || 'Male', serialRef.current);
  }, [cardData?.nicNumber, cardData?.dob, cardData?.gender]);

  const defaultData = useMemo(() => ({
    nicNumber: computedNic,
    fullNameEn: cardData?.fullNameEn || 'Thilina Sakalasooriya',
    fullNameSi: cardData?.fullNameSi || 'තිලිණ සකළසූරිය',
    fullNameTa: cardData?.fullNameTa || 'திலீன சகலசூரிய',
    gender: cardData?.gender || 'Male',
    dob: cardData?.dob || '2005-01-01',
    address: cardData?.address || 'No. 12, Main Street, Malabe, Colombo',
    signature: cardData?.signature || 'Thilina',
    photoUrl: cardData?.photoUrl || '',
    phone: cardData?.phone || '',
    email: cardData?.email || '',
    civilStatus: cardData?.civilStatus || 'Single',
    district: cardData?.district || '',
    divisionalSecretariat: cardData?.divisionalSecretariat || '',
    gnDivision: cardData?.gnDivision || ''
  }), [computedNic, cardData?.fullNameEn, cardData?.fullNameSi, cardData?.fullNameTa, cardData?.gender, cardData?.dob, cardData?.address, cardData?.signature, cardData?.photoUrl, cardData?.phone, cardData?.email, cardData?.civilStatus, cardData?.district, cardData?.divisionalSecretariat, cardData?.gnDivision]);

  // Full card details QR payload (memoized so it never changes on hover)
  const qrPayload = useMemo(() => [
    `NIC:${defaultData.nicNumber}`,
    `NAME_EN:${defaultData.fullNameEn}`,
    `NAME_SI:${defaultData.fullNameSi}`,
    `NAME_TA:${defaultData.fullNameTa}`,
    `DOB:${defaultData.dob}`,
    `GENDER:${defaultData.gender}`,
    `CIVIL_STATUS:${defaultData.civilStatus}`,
    `ADDRESS:${defaultData.address}`,
    `DISTRICT:${defaultData.district}`,
    `DS_DIVISION:${defaultData.divisionalSecretariat}`,
    `GN_DIVISION:${defaultData.gnDivision}`,
    `PHONE:${defaultData.phone}`,
    `EMAIL:${defaultData.email}`,
    `ISSUED_BY:Department of Registration of Persons, Sri Lanka`,
    `ISSUE_DATE:${new Date().toISOString().split('T')[0]}`
  ].join('|'), [defaultData]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    const baseFlip = isFlipped ? 180 : 0;
    setTiltStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${baseFlip + rotateY}deg)`
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 65%)`
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
          <div className="id-card-face front">
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
                <div style={{ fontSize: '0.55rem', color: '#000000', textAlign: 'center' }}>
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
                  <div style={{ fontSize: '0.55rem', color: '#000000', opacity: 0.8 }}>
                    ★ Department of Registration of Persons
                  </div>
                  <div style={{ background: '#ffffff', padding: '3px', borderRadius: '4px' }}>
                    <QRCodeSVG
                      value={qrPayload}
                      size={36}
                      level="M"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="id-card-face back">
            <div className="nic-header">
              <div className="nic-header-titles">
                <div className="nic-main-title">DEPARTMENT OF REGISTRATION OF PERSONS</div>
                <div className="nic-native-sub">ලිපිනය සහ නිකුත් කළ දිනය | முகவரி & வழங்கப்பட்ட திகதி</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, padding: '0.5rem 0' }}>
              <div>
                <div style={{ fontSize: '0.62rem', color: '#000000', fontWeight: "bold" }}>ස්ථායී ලිපිනය / Address:</div>
                <div style={{ fontSize: '0.75rem', color: '#000000' }}>
                  {defaultData.address}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.65rem' }}>
                <div>
                  <div style={{ color: '#000000', fontWeight: "bold" }}>නිකුත් කළ දිනය / Issue Date:</div>
                  <div style={{ color: '#000000' }}>
                    {new Date().toISOString().split('T')[0]}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#000000', fontWeight: "bold" }}>ස්ථානය / Place:</div>
                  <div style={{ color: '#000000' }}>Battaramulla, Sri Lanka</div>
                </div>
              </div>

              {/* Barcode & Security */}
              <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.4)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.55rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <CheckCircle2 size={12} /> CRYPTOGRAPHICALLY SECURED IDENTITY PAYLOAD
                </div>
                <div style={{
                  height: '24px',
                  background: 'repeating-linear-gradient(90deg, #fff 0, #fff 2px, #000 2px, #000 5px)',
                  borderRadius: '2px'
                }} />
                <div style={{ fontSize: '0.55rem', textAlign: 'center', color: '#000000', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
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
