import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RotateCw, User } from 'lucide-react';

export const IDCard3D = ({ cardData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});
  const cardRef = useRef(null);

  const data = {
    nicNumber:   cardData?.nicNumber   || '123432043440',
    fullNameEn:  cardData?.fullNameEn  || 'Thilina Sakalasooriya',
    fullNameSi:  cardData?.fullNameSi  || 'තිලිණ සකළසූරිය',
    fullNameTa:  cardData?.fullNameTa  || 'திலீன சகலசூரிய',
    gender:      cardData?.gender      || 'Male',
    dob:         cardData?.dob         || '2005-01-01',
    address:     cardData?.address     || 'No. 12, Main Street, Malabe, Colombo',
    signature:   cardData?.signature   || 'Thilina S.',
    photoUrl:    cardData?.photoUrl    || ''
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
    setGlareStyle({ background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 60%)` });
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

  /* gender text */
  const genderText = data.gender === 'Male'
    ? 'පුරුෂ / ஆண் / Male'
    : 'ස්ත්‍රී / பெண் / Female';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem', width:'100%', maxWidth:'520px', margin:'0 auto' }}>

      {/* 3-D CONTAINER */}
      <div
        style={{ perspective:'1200px', width:'100%', padding:'0.5rem', cursor:'pointer' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          style={{
            width:'100%', height:'300px',
            position:'relative',
            transformStyle:'preserve-3d',
            transition:'transform 0.65s cubic-bezier(0.23,1,0.32,1)',
            ...tiltStyle
          }}
          onClick={handleFlip}
        >
          {/* ──────────────────────────────────────────
              FRONT FACE  – Sri Lanka NIC real design
          ────────────────────────────────────────── */}
          <div style={{
            position:'absolute', inset:0,
            borderRadius:'12px',
            backfaceVisibility:'hidden',
            WebkitBackfaceVisibility:'hidden',
            overflow:'hidden',
            boxShadow:'0 24px 50px rgba(0,0,0,0.55), 0 0 28px rgba(59,130,246,0.2)',
            /* cream / parchment base */
            background:'linear-gradient(150deg, #e8dfc4 0%, #dfd4b0 40%, #d8ccab 70%, #e2d8bc 100%)',
            display:'flex', flexDirection:'column',
            fontFamily:'Arial, sans-serif',
          }}>
            {/* Security watermark grid overlay */}
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
              backgroundImage:`repeating-linear-gradient(0deg,rgba(160,140,100,0.08) 0px,rgba(160,140,100,0.08) 1px,transparent 1px,transparent 18px),
                               repeating-linear-gradient(90deg,rgba(160,140,100,0.08) 0px,rgba(160,140,100,0.08) 1px,transparent 1px,transparent 18px)`,
            }}/>
            {/* Subtle diagonal security watermark text */}
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
              overflow:'hidden', opacity:0.06,
              display:'flex', flexWrap:'wrap', gap:'24px',
              transform:'rotate(-30deg) scale(1.4)',
              transformOrigin:'center center',
              color:'#5a4a20', fontSize:'7px', fontWeight:'bold',
              letterSpacing:'2px',
            }}>
              {Array(120).fill('DEPARTMENT OF REGISTRATION OF PERSONS').map((t,i)=>(
                <span key={i} style={{whiteSpace:'nowrap'}}>{t}</span>
              ))}
            </div>

            {/* Glare overlay */}
            <div style={{ position:'absolute', inset:0, borderRadius:'12px', pointerEvents:'none', zIndex:20, ...glareStyle }} />

            {/* TOP HEADER BAR */}
            <div style={{
              position:'relative', zIndex:5,
              background:'linear-gradient(135deg,#1a6b1a 0%,#228b22 40%,#1e7e1e 100%)',
              padding:'0.45rem 0.75rem',
              display:'flex', alignItems:'center', gap:'0.6rem',
            }}>
              {/* Left: emblem */}
              <img
                src="/images/index/gov_logo.png"
                alt="Emblem"
                style={{ width:'38px', height:'38px', objectFit:'contain', filter:'brightness(1.2)' }}
                onError={e=>e.target.style.opacity='0'}
              />
              {/* Centre: tri-language title */}
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ color:'#fff8dc', fontSize:'0.62rem', fontWeight:'700', lineHeight:1.2 }}>
                  ශ්‍රී ලංකා | இலங்கை
                </div>
                <div style={{ color:'#ffffff', fontSize:'0.82rem', fontWeight:'900', letterSpacing:'1px', lineHeight:1.2 }}>
                  NATIONAL IDENTITY CARD
                </div>
                <div style={{ color:'#fff8dc', fontSize:'0.56rem', lineHeight:1 }}>
                  ජාතික හැඳුනුම්පත | தேசிய அடையாள அட்டை
                </div>
              </div>
              {/* Right: NIC number chip */}
              <div style={{
                background:'rgba(0,0,0,0.35)', borderRadius:'4px',
                padding:'3px 7px', fontFamily:'monospace',
                color:'#fffde7', fontSize:'0.72rem', fontWeight:'700', letterSpacing:'0.5px'
              }}>
                {data.nicNumber}
              </div>
            </div>

            {/* BODY */}
            <div style={{ position:'relative', zIndex:5, flex:1, display:'flex', gap:'0.65rem', padding:'0.6rem 0.75rem 0.5rem' }}>

              {/* PHOTO column */}
              <div style={{ width:'78px', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem' }}>
                <div style={{
                  width:'76px', height:'96px',
                  border:'2px solid #5a4a20',
                  background:'#b8a882',
                  borderRadius:'3px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  overflow:'hidden',
                }}>
                  {data.photoUrl
                    ? <img src={data.photoUrl} alt="Photo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ textAlign:'center', color:'#5a4a20', opacity:0.7 }}>
                        <User size={32} />
                        <div style={{ fontSize:'0.52rem', marginTop:'2px', fontFamily:'monospace' }}>PHOTO</div>
                      </div>
                  }
                </div>
                {/* signature */}
                <div style={{
                  width:'100%', textAlign:'center',
                  fontFamily:'"Brush Script MT", cursive',
                  fontSize:'0.88rem', color:'#1a3a6e',
                  borderBottom:'1.5px solid #5a4a20',
                  paddingBottom:'1px', lineHeight:1.1,
                }}>
                  {data.signature}
                </div>
                <div style={{ fontSize:'0.5rem', color:'#5a4a20', textAlign:'center' }}>
                  අත්සන / கையொப்பம்<br/>Holder's Signature
                </div>
              </div>

              {/* FIELDS column */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.28rem', fontSize:'0.64rem', color:'#1a1000' }}>

                {/* Name row – all 3 languages */}
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>නම:</span>
                  <span style={{ flex:1, fontWeight:'600', fontFamily:'serif' }}>{data.fullNameSi}</span>
                </div>
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>பெயர்:</span>
                  <span style={{ flex:1, fontWeight:'600' }}>{data.fullNameTa}</span>
                </div>
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>Name:</span>
                  <span style={{ flex:1, fontWeight:'700', fontSize:'0.7rem' }}>{data.fullNameEn}</span>
                </div>

                <div style={{ height:'1px', background:'rgba(90,74,32,0.2)', margin:'1px 0' }} />

                {/* Address */}
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>Address:</span>
                  <span style={{ flex:1, lineHeight:1.25 }}>{data.address}</span>
                </div>

                <div style={{ height:'1px', background:'rgba(90,74,32,0.2)', margin:'1px 0' }} />

                {/* Gender */}
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>Sex:</span>
                  <span style={{ fontWeight:'600' }}>{genderText}</span>
                </div>

                {/* DOB */}
                <div style={{ display:'flex', gap:'4px' }}>
                  <span style={{ color:'#5a4a20', width:'52px', flexShrink:0 }}>Date of Birth:</span>
                  <span style={{ fontWeight:'600', fontFamily:'monospace', color:'#1a1000' }}>{data.dob}</span>
                </div>

                <div style={{ marginTop:'auto' }}>
                  {/* Bottom NIC number strip */}
                  <div style={{
                    background:'rgba(90,74,32,0.12)', borderRadius:'3px',
                    padding:'2px 6px', display:'inline-block',
                    fontFamily:'monospace', fontWeight:'800',
                    fontSize:'0.72rem', color:'#1a3a6e', letterSpacing:'1px'
                  }}>
                    {data.nicNumber}
                  </div>
                </div>
              </div>

              {/* RIGHT EDGE: vertical colour stripe (Sri Lanka flag colours) */}
              <div style={{
                width:'10px', borderRadius:'0 0 4px 0',
                background:'linear-gradient(180deg,#8b0000 0%,#8b0000 50%,#228b22 50%,#228b22 100%)',
                flexShrink:0,
              }} />
            </div>

            {/* BOTTOM micro-strip */}
            <div style={{
              position:'relative', zIndex:5,
              background:'rgba(90,74,32,0.15)',
              padding:'2px 10px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              fontSize:'0.5rem', color:'#5a4a20',
            }}>
              <span>Department of Registration of Persons – Sri Lanka</span>
              <div style={{ background:'#fff', padding:'1px', borderRadius:'2px' }}>
                <QRCodeSVG value={`SRI_LANKA_NIC:${data.nicNumber}:${data.fullNameEn}`} size={22} />
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────
              BACK FACE
          ────────────────────────────────────────── */}
          <div style={{
            position:'absolute', inset:0,
            borderRadius:'12px',
            backfaceVisibility:'hidden',
            WebkitBackfaceVisibility:'hidden',
            transform:'rotateY(180deg)',
            overflow:'hidden',
            boxShadow:'0 24px 50px rgba(0,0,0,0.55)',
            background:'linear-gradient(150deg,#e2d9c0 0%,#d8ceae 60%,#d4c9a5 100%)',
            display:'flex', flexDirection:'column',
            fontFamily:'Arial, sans-serif',
          }}>
            {/* Security grid */}
            <div style={{
              position:'absolute', inset:0, pointerEvents:'none', zIndex:1,
              backgroundImage:`repeating-linear-gradient(0deg,rgba(160,140,100,0.08) 0px,rgba(160,140,100,0.08) 1px,transparent 1px,transparent 18px),
                               repeating-linear-gradient(90deg,rgba(160,140,100,0.08) 0px,rgba(160,140,100,0.08) 1px,transparent 1px,transparent 18px)`,
            }}/>
            {/* Glare */}
            <div style={{ position:'absolute', inset:0, borderRadius:'12px', pointerEvents:'none', zIndex:20, ...glareStyle }} />

            {/* Back top strip */}
            <div style={{
              position:'relative', zIndex:5,
              background:'linear-gradient(135deg,#1a6b1a,#228b22)',
              padding:'0.3rem 0.75rem',
              display:'flex', justifyContent:'space-between', alignItems:'center',
            }}>
              <span style={{ color:'#fff8dc', fontSize:'0.62rem', fontWeight:'700' }}>
                ශ්‍රී ලංකා / இலங்கை / Sri Lanka
              </span>
              <span style={{
                background:'rgba(0,0,0,0.35)', borderRadius:'3px',
                padding:'2px 7px', fontFamily:'monospace',
                color:'#fffde7', fontSize:'0.66rem', fontWeight:'700',
              }}>
                {/* Reference number */}
                {'FBP' + data.nicNumber.slice(-4) + '-N'}
              </span>
            </div>

            {/* Back body */}
            <div style={{ position:'relative', zIndex:5, flex:1, display:'flex', gap:'0.5rem', padding:'0.5rem 0.75rem' }}>

              {/* Left text fields */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.3rem', fontSize:'0.6rem', color:'#1a1000' }}>
                <div style={{ fontWeight:'700', fontSize:'0.64rem', color:'#5a4a20', marginBottom:'2px' }}>
                  ලිපිනය / முகவரி / Address
                </div>
                <div style={{ lineHeight:1.35, fontWeight:'500' }}>{data.address}</div>

                <div style={{ height:'1px', background:'rgba(90,74,32,0.2)', margin:'3px 0' }} />

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
                  <div>
                    <div style={{ color:'#5a4a20', fontSize:'0.54rem' }}>Date of Issue:</div>
                    <div style={{ fontWeight:'600', fontFamily:'monospace' }}>{new Date().toISOString().slice(0,10)}</div>
                  </div>
                  <div>
                    <div style={{ color:'#5a4a20', fontSize:'0.54rem' }}>Place of Birth:</div>
                    <div style={{ fontWeight:'600' }}>Sri Lanka</div>
                  </div>
                  <div>
                    <div style={{ color:'#5a4a20', fontSize:'0.54rem' }}>Civil Status:</div>
                    <div style={{ fontWeight:'600' }}>Single</div>
                  </div>
                  <div>
                    <div style={{ color:'#5a4a20', fontSize:'0.54rem' }}>Country of Birth:</div>
                    <div style={{ fontWeight:'600' }}>Sri Lanka</div>
                  </div>
                </div>

                <div style={{ height:'1px', background:'rgba(90,74,32,0.2)', margin:'3px 0' }} />

                <div style={{ fontSize:'0.52rem', color:'#5a4a20', lineHeight:1.3 }}>
                  This card is issued under the Registration of Persons Act No. 32 of 1968 and is the property of the Government of Sri Lanka.
                </div>
              </div>

              {/* Right: barcode + fingerprint area */}
              <div style={{
                width:'120px', flexShrink:0,
                display:'flex', flexDirection:'column', gap:'0.4rem', alignItems:'center',
              }}>
                {/* 2D Barcode (PDF417 simulation) */}
                <div style={{ width:'100%' }}>
                  <div style={{ fontSize:'0.5rem', color:'#5a4a20', marginBottom:'2px', textAlign:'center' }}>PDF417</div>
                  <div style={{
                    width:'100%', height:'52px',
                    background:'repeating-linear-gradient(90deg,#1a1000 0px,#1a1000 2px,transparent 2px,transparent 4px,#1a1000 4px,#1a1000 5px,transparent 5px,transparent 8px)',
                    borderRadius:'2px',
                  }}/>
                </div>

                {/* QR code */}
                <div style={{ background:'#fff', padding:'3px', borderRadius:'3px' }}>
                  <QRCodeSVG
                    value={`SRI_LANKA_NIC:${data.nicNumber}:${data.fullNameEn}:${data.dob}`}
                    size={52}
                  />
                </div>

                {/* Fingerprint simulation */}
                <div style={{ width:'100%', textAlign:'center' }}>
                  <div style={{ fontSize:'0.5rem', color:'#5a4a20', marginBottom:'2px' }}>Fingerprint</div>
                  <div style={{
                    width:'44px', height:'52px',
                    margin:'0 auto',
                    borderRadius:'50% 50% 40% 40%',
                    border:'1.5px solid #5a4a20',
                    background:'linear-gradient(180deg,transparent 0%,rgba(90,74,32,0.04) 100%)',
                    overflow:'hidden',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    position:'relative',
                  }}>
                    {/* concentric loop lines */}
                    {[18,15,12,9,6,3].map((r,i)=>(
                      <div key={i} style={{
                        position:'absolute',
                        width:`${r*2}px`, height:`${r*2.2}px`,
                        borderRadius:'50% 50% 40% 40%',
                        border:'0.8px solid rgba(90,74,32,0.4)',
                      }}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* MRZ strip */}
            <div style={{
              position:'relative', zIndex:5,
              background:'rgba(90,74,32,0.18)',
              padding:'3px 8px',
              fontFamily:'monospace', fontSize:'0.52rem',
              color:'#1a1000', letterSpacing:'0.5px',
              lineHeight:1.4,
            }}>
              <div>I&lt;LKA{data.nicNumber.padEnd(9,'<')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
              <div>{data.dob.replace(/-/g,'').slice(2)}&lt;{data.gender==='Male'?'M':'F'}&lt;&lt;{data.fullNameEn.toUpperCase().replace(/ /g,'<').padEnd(30,'<')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={handleFlip}
        style={{ fontSize:'0.8rem', borderRadius:'20px' }}
      >
        <RotateCw size={14} />
        {isFlipped ? 'View Front Side' : 'View Back Side'}
      </button>
    </div>
  );
};
