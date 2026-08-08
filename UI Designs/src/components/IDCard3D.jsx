import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RotateCw, User } from 'lucide-react';

export const IDCard3D = ({ cardData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});
  const cardRef = useRef(null);

  const data = {
    nicNumber:  cardData?.nicNumber  || '123432043440',
    fullNameEn: cardData?.fullNameEn || 'Thilina Sakalasooriya',
    fullNameSi: cardData?.fullNameSi || 'තිලිණ සකළසූරිය',
    fullNameTa: cardData?.fullNameTa || 'திலீன சகலசூரிய',
    gender:     cardData?.gender     || 'Male',
    dob:        cardData?.dob        || '2005-01-01',
    address:    cardData?.address    || 'No. 12, Main Street, Malabe, Colombo',
    signature:  cardData?.signature  || 'Thilina S.',
    photoUrl:   cardData?.photoUrl   || ''
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -12;
    const rotateY = ((x - rect.width  / 2) / (rect.width  / 2)) * 12;
    const glareX  = (x / rect.width)  * 100;
    const glareY  = (y / rect.height) * 100;
    setTiltStyle({ transform: `rotateX(${rotateX}deg) rotateY(${(isFlipped ? 180 : 0) + rotateY}deg)` });
    setGlareStyle({ background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)` });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ transform: `rotateX(0deg) rotateY(${isFlipped ? 180 : 0}deg)` });
    setGlareStyle({});
  };

  const handleFlip = (e) => {
    e.stopPropagation();
    const next = !isFlipped;
    setIsFlipped(next);
    setTiltStyle({ transform: `rotateX(0deg) rotateY(${next ? 180 : 0}deg)` });
  };

  const genderText = data.gender === 'Male' ? 'පුරුෂ / ஆண் / Male' : 'ස්ත්‍රී / பெண் / Female';

  /* ── shared card face wrapper styles ── */
  const faceBase = {
    position: 'absolute', inset: 0,
    borderRadius: '14px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    overflow: 'hidden',
    boxShadow: '0 28px 55px rgba(0,0,0,0.65), 0 0 32px rgba(59,130,246,0.22)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '520px', margin: '0 auto' }}>

      {/* ── 3-D perspective container ── */}
      <div
        style={{ perspective: '1200px', width: '100%', padding: '0.5rem', cursor: 'pointer' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          style={{
            width: '100%', height: '308px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.23,1,0.32,1)',
            ...tiltStyle
          }}
          onClick={handleFlip}
        >

          {/* ══════════════════════════════════════════════
              FRONT – graphic image as texture + live data overlay
          ══════════════════════════════════════════════ */}
          <div style={{ ...faceBase, fontFamily: 'Arial, sans-serif' }}>

            {/* Exact NIC graphic as full-bleed background */}
            <img
              src="/images/index/nic_front.png"
              alt="Sri Lanka NIC Front"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
            />

            {/* ── Live data overlay on top of the graphic ── */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 5 }}>

              {/* Top strip: NIC number overlay */}
              <div style={{
                height: '46px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '10px',
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.45)', borderRadius: '4px',
                  padding: '2px 8px', fontFamily: 'monospace',
                  color: '#fffde7', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '1.5px'
                }}>
                  {data.nicNumber}
                </div>
              </div>

              {/* Body overlay */}
              <div style={{ flex: 1, display: 'flex', gap: '0', padding: '4px 8px 4px 8px' }}>

                {/* Photo zone */}
                <div style={{ width: '88px', flexShrink: 0, paddingTop: '4px' }}>
                  <div style={{
                    width: '78px', height: '96px',
                    border: '2px solid rgba(90,74,20,0.5)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    background: 'rgba(184,168,130,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {data.photoUrl
                      ? <img src={data.photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ textAlign: 'center', color: 'rgba(90,74,20,0.8)', fontSize: '0.55rem' }}>
                          <User size={28} color="rgba(90,74,20,0.6)" />
                          <div style={{ fontFamily: 'monospace' }}>PHOTO</div>
                        </div>
                    }
                  </div>

                  {/* Signature */}
                  <div style={{
                    marginTop: '6px', width: '78px',
                    fontFamily: '"Brush Script MT", cursive',
                    fontSize: '0.92rem', color: '#1a3a6e',
                    borderBottom: '1.5px solid rgba(90,74,20,0.5)',
                    textAlign: 'center', lineHeight: 1.15
                  }}>
                    {data.signature}
                  </div>
                </div>

                {/* Text fields overlay — transparent, rides on top of the printed field lines */}
                <div style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', gap: '3px',
                  fontSize: '0.63rem', color: '#0d0800',
                  paddingLeft: '2px', paddingTop: '2px',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>නම / Name:</span>
                    <span style={{ fontWeight: '700', fontSize: '0.7rem' }}>{data.fullNameEn}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>Name (Si):</span>
                    <span style={{ fontWeight: '600', fontFamily: 'serif' }}>{data.fullNameSi}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>பெயர்:</span>
                    <span style={{ fontWeight: '600' }}>{data.fullNameTa}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>Address:</span>
                    <span style={{ lineHeight: 1.25 }}>{data.address}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>Sex:</span>
                    <span style={{ fontWeight: '600' }}>{genderText}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ color: '#5a4010', width: '48px', flexShrink: 0, fontSize: '0.58rem' }}>DOB:</span>
                    <span style={{ fontWeight: '700', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{data.dob}</span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                    <div style={{ background: '#fff', padding: '2px', borderRadius: '2px' }}>
                      <QRCodeSVG value={`SRI_LANKA_NIC:${data.nicNumber}:${data.fullNameEn}`} size={26} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Glare overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', pointerEvents: 'none', zIndex: 20, ...glareStyle }} />
          </div>

          {/* ══════════════════════════════════════════════
              BACK – graphic image + data overlay
          ══════════════════════════════════════════════ */}
          <div style={{ ...faceBase, transform: 'rotateY(180deg)', fontFamily: 'Arial, sans-serif' }}>

            {/* Exact NIC back graphic */}
            <img
              src="/images/index/nic_back.png"
              alt="Sri Lanka NIC Back"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
            />

            {/* Live data overlay */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', zIndex: 5 }}>

              {/* Reference number overlay */}
              <div style={{
                height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '10px',
              }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: '800',
                  color: '#1a1000', letterSpacing: '0.5px',
                  background: 'rgba(255,255,255,0.6)', padding: '1px 6px', borderRadius: '3px'
                }}>
                  {'FBP' + data.nicNumber.slice(-4) + '-N'}
                </span>
              </div>

              {/* Body */}
              <div style={{ flex: 1, display: 'flex', gap: '0.4rem', padding: '4px 8px' }}>

                {/* Left address block */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.58rem', color: '#0d0800' }}>
                  <div style={{ fontWeight: '700', color: '#3a2a00', fontSize: '0.6rem' }}>ලිපිනය / முகவரி / Address</div>
                  <div style={{ lineHeight: 1.35 }}>{data.address}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
                    <div>
                      <div style={{ color: '#5a4010', fontSize: '0.5rem' }}>Date of Issue</div>
                      <div style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.6rem' }}>
                        {new Date().toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#5a4010', fontSize: '0.5rem' }}>Place of Birth</div>
                      <div style={{ fontWeight: '600' }}>Sri Lanka</div>
                    </div>
                    <div>
                      <div style={{ color: '#5a4010', fontSize: '0.5rem' }}>Civil Status</div>
                      <div style={{ fontWeight: '600' }}>Single</div>
                    </div>
                    <div>
                      <div style={{ color: '#5a4010', fontSize: '0.5rem' }}>Country of Birth</div>
                      <div style={{ fontWeight: '600' }}>Sri Lanka</div>
                    </div>
                  </div>
                </div>

                {/* Right side: QR code (sits on top of the graphic's barcode/fingerprint zones) */}
                <div style={{ width: '90px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
                  <div style={{ background: '#fff', padding: '3px', borderRadius: '3px' }}>
                    <QRCodeSVG
                      value={`SRI_LANKA_NIC:${data.nicNumber}:${data.fullNameEn}:${data.dob}`}
                      size={54}
                    />
                  </div>
                  <div style={{ fontSize: '0.5rem', color: '#3a2a00', textAlign: 'center', fontFamily: 'monospace' }}>
                    DIGITAL<br/>IDENTITY
                  </div>
                </div>
              </div>

              {/* MRZ strip overlay */}
              <div style={{
                background: 'rgba(255,255,255,0.55)',
                padding: '3px 8px',
                fontFamily: '"Courier New", monospace', fontSize: '0.5rem',
                color: '#0a0a0a', letterSpacing: '0.8px', lineHeight: 1.45,
              }}>
                <div>I&lt;LKA{data.nicNumber.padEnd(9, '<').slice(0, 9)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div>{data.dob.replace(/-/g, '').slice(2)}&lt;{data.gender === 'Male' ? 'M' : 'F'}&lt;&lt;{data.fullNameEn.toUpperCase().replace(/ /g, '<').slice(0, 30).padEnd(30, '<')}</div>
              </div>
            </div>

            {/* Glare */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', pointerEvents: 'none', zIndex: 20, ...glareStyle }} />
          </div>

        </div>
      </div>

      {/* Flip button */}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={handleFlip}
        style={{ fontSize: '0.8rem', borderRadius: '20px' }}
      >
        <RotateCw size={14} />
        {isFlipped ? 'View Front Side' : 'View Back Side'}
      </button>
    </div>
  );
};
