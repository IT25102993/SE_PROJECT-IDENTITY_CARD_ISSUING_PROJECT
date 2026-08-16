import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { IDCard3D } from '../../components/IDCard3D';
import {
  User,
  MapPin,
  Camera,
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Sparkles,
  Languages
} from 'lucide-react';

// Dictionaries & Transliteration Helpers for English, Sinhala & Tamil
const NAME_DICTIONARY_TA = {
  "thilina": "திலீன",
  "sakalasooriya": "சகலசூரிய",
  "thilina sakalasooriya": "திலீன சகலசூரிய",
  "තිලිණ සකළසූරිය": "திலீன சகலசூரிய",
  "kavindi": "காவிந்தி",
  "perera": "பெரேரா",
  "kavindi perera": "காவிந்தி பெரேரா",
  "කාවින්දි පෙරේරා": "காவிந்தி பெரேரா",
  "dilshan": "தில்ஷான்",
  "senanayake": "சேனாநாயக்க",
  "dilshan senanayake": "தில்ஷான் சேனாநாயக்க",
  "දිල්ෂාන් සේනානායක": "தில்ஷான் சேனாநாயக்க",
  "nimal": "நிமால்",
  "kamal": "கமால்",
  "sunil": "சுனில்",
  "bandara": "பண்டார",
  "wickramasinghe": "விக்ரමසිங்க",
  "jayawardena": "ஜயவர்தன",
  "fernando": "பெර්නාண்டෝ",
  "silva": "சில்வா",
  "de silva": "டி சில்வா",
  "rajapaksa": "ராஜபக்ஷ"
};

const NAME_DICTIONARY_SI = {
  "thilina": "තිලිණ",
  "sakalasooriya": "සකළසූරිය",
  "thilina sakalasooriya": "තිලිණ සකළසූරිය",
  "kavindi": "කාවින්දි",
  "perera": "පෙරේරා",
  "kavindi perera": "කාවින්දි පෙරේරා",
  "dilshan": "දිල්ෂාන්",
  "senanayake": "සේනානායක",
  "dilshan senanayake": "දිල්ෂාන් සේනානායක",
  "nimal": "නිමාල්",
  "kamal": "කමාල්",
  "sunil": "සුනිල්",
  "bandara": "බණ්ඩාර",
  "wickramasinghe": "වික්‍රමසිංහ",
  "jayawardena": "ජයවර්ධන",
  "fernando": "ප්‍රනාන්දු",
  "silva": "සිල්වා",
  "de silva": "ද සිල්වා",
  "rajapaksa": "රාජපක්ෂ"
};

const SINHALA_TO_TAMIL_MAP = {
  'අ': 'அ', 'ආ': 'ஆ', 'ඇ': 'அ', 'ඉ': 'இ', 'ඊ': 'ஈ', 'උ': 'உ', 'ඌ': 'ஊ',
  'එ': 'எ', 'ඒ': 'ஏ', 'ඓ': 'ஐ', 'ඔ': 'ஒ', 'ඕ': 'ஓ', 'ඖ': 'ஔ',
  'ක': 'க', 'ඛ': 'க', 'ග': 'க', 'ඝ': 'க', 'ඞ': 'ங',
  'ච': 'ச', 'ඡ': 'ச', 'ජ': 'ஜ', 'ඣ': 'ஜ', 'ඤ': 'ஞ',
  'ට': 'ட', 'ඨ': 'ட', 'ඩ': 'ட', 'ඪ': 'ட', 'ණ': 'ண',
  'ත': 'த', 'ථ': 'த', 'ද': 'த', 'ධ': 'த', 'න': 'ந',
  'ප': 'ப', 'ඵ': 'ப', 'බ': 'ப', 'භ': 'ப', 'ම': 'ம',
  'ය': 'ய', 'ර': 'ர', 'ල': 'ல', 'ව': 'வ', 'ශ': 'ஶ', 'ෂ': 'ஷ', 'ස': 'ச', 'හ': 'ஹ', 'ළ': 'ள', 'ෆ': 'ப',
  'ා': 'ா', 'ැ': 'ா', 'ි': 'ி', 'ී': 'ீ', 'ු': 'ු', 'ූ': 'ූ',
  'ෘ': 'ிரு', 'ෙ': 'ெ', 'ේ': 'ே', 'ෛ': 'ை', 'ො': 'ொ', 'ෝ': 'ோ', 'ෞ': 'ௗ',
  '්': '්', 'ං': 'ம்', 'ඃ': 'ஃ'
};

const transliterateWordToTamil = (word) => {
  if (!word) return '';
  const lower = word.toLowerCase().trim();
  if (NAME_DICTIONARY_TA[lower]) return NAME_DICTIONARY_TA[lower];

  if (/[\u0D80-\u0DFF]/.test(word)) {
    let result = '';
    for (let char of word) {
      result += SINHALA_TO_TAMIL_MAP[char] || char;
    }
    return result;
  }

  let str = lower;
  str = str.replace(/th/g, 'த')
           .replace(/sh/g, 'ஷ')
           .replace(/ch/g, 'ச')
           .replace(/kh/g, 'க')
           .replace(/ph/g, 'ப')
           .replace(/bh/g, 'ப')
           .replace(/dh/g, 'த')
           .replace(/gh/g, 'க')
           .replace(/ng/g, 'ங்');

  let res = '';
  for (let char of str) {
    switch (char) {
      case 'a': res += 'ா'; break;
      case 'b': res += 'ப'; break;
      case 'c': res += 'க'; break;
      case 'd': res += 'த'; break;
      case 'e': res += 'ே'; break;
      case 'f': res += 'ப'; break;
      case 'g': res += 'க'; break;
      case 'h': res += 'ஹ'; break;
      case 'i': res += 'ீ'; break;
      case 'j': res += 'ஜ'; break;
      case 'k': res += 'க'; break;
      case 'l': res += 'ல'; break;
      case 'm': res += 'ம'; break;
      case 'n': res += 'ந'; break;
      case 'o': res += 'ோ'; break;
      case 'p': res += 'ப'; break;
      case 'q': res += 'க'; break;
      case 'r': res += 'ர'; break;
      case 's': res += 'ச'; break;
      case 't': res += 'த'; break;
      case 'u': res += 'ූ'; break;
      case 'v': res += 'வ'; break;
      case 'w': res += 'வ'; break;
      case 'x': res += 'க்ஷ'; break;
      case 'y': res += 'ய'; break;
      case 'z': res += 'ஸ'; break;
      default: res += char; break;
    }
  }

  if (res.startsWith('ா')) res = 'அ' + res.slice(1);
  if (res.startsWith('ි') || res.startsWith('ී')) res = 'இ' + res.slice(1);
  if (res.startsWith('ෙ') || res.startsWith('ේ')) res = 'எ' + res.slice(1);
  if (res.startsWith('ො') || res.startsWith('ෝ')) res = 'ஒ' + res.slice(1);

  return res;
};

export const autoGenerateTamilName = (nameEn = '', nameSi = '') => {
  if (nameSi.trim()) {
    const siLower = nameSi.trim();
    if (NAME_DICTIONARY_TA[siLower]) return NAME_DICTIONARY_TA[siLower];
    const wordsSi = nameSi.trim().split(/\s+/);
    return wordsSi.map(w => transliterateWordToTamil(w)).join(' ');
  }

  if (nameEn.trim()) {
    const enLower = nameEn.toLowerCase().trim();
    if (NAME_DICTIONARY_TA[enLower]) return NAME_DICTIONARY_TA[enLower];
    const wordsEn = nameEn.trim().split(/\s+/);
    return wordsEn.map(w => transliterateWordToTamil(w)).join(' ');
  }

  return '';
};

export const autoGenerateSinhalaName = (nameEn = '') => {
  if (!nameEn.trim()) return '';
  const enLower = nameEn.toLowerCase().trim();
  if (NAME_DICTIONARY_SI[enLower]) return NAME_DICTIONARY_SI[enLower];

  const words = nameEn.trim().split(/\s+/);
  return words.map(word => {
    const wLower = word.toLowerCase();
    if (NAME_DICTIONARY_SI[wLower]) return NAME_DICTIONARY_SI[wLower];
    return word;
  }).join(' ');
};

export const ApplyPage = () => {
  const { submitNewApplication, triggerLoading } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSiManuallyEdited, setIsSiManuallyEdited] = useState(false);
  const [isTaManuallyEdited, setIsTaManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    fullNameEn: '',
    fullNameSi: '',
    fullNameTa: '',
    dob: '',
    gender: 'Male',
    civilStatus: 'Single',
    address: '',
    district: 'Colombo',
    divisionalSecretariat: 'Kaduwela',
    gnDivision: 'Malabe (482B)',
    phone: '',
    email: '',
    photoUrl: '',
    signature: '',
    documents: []
  });

  const [submittedId, setSubmittedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fullNameTa') {
      setIsTaManuallyEdited(value.trim().length > 0);
      setFormData(prev => ({ ...prev, fullNameTa: value }));
      return;
    }

    if (name === 'fullNameSi') {
      setIsSiManuallyEdited(value.trim().length > 0);
      setFormData(prev => {
        const updated = { ...prev, fullNameSi: value };
        if (!isTaManuallyEdited) {
          updated.fullNameTa = autoGenerateTamilName(prev.fullNameEn, value);
        }
        return updated;
      });
      return;
    }

    if (name === 'fullNameEn') {
      setFormData(prev => {
        const updated = { ...prev, fullNameEn: value };
        
        let currentSi = prev.fullNameSi;
        if (!isSiManuallyEdited) {
          currentSi = autoGenerateSinhalaName(value);
          updated.fullNameSi = currentSi;
        }

        if (!isTaManuallyEdited) {
          updated.fullNameTa = autoGenerateTamilName(value, currentSi);
        }

        return updated;
      });
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.fullNameEn || !formData.dob)) {
      alert('Please fill in required personal details (Full Name & DOB).');
      return;
    }
    if (step === 2 && (!formData.address || !formData.phone)) {
      alert('Please fill in address and phone number.');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => setStep(prev => Math.max(1, prev - 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerLoading({
      message: 'Filing Application to Database...',
      subtext: 'Department of Registration of Persons',
      duration: 1500,
      onComplete: async () => {
        const trackingId = await submitNewApplication(formData);
        setSubmittedId(trackingId);
      }
    });
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, padding: '2rem 0 4rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-printed" style={{ marginBottom: '0.5rem' }}>
            Official Citizen Registration
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            National Identity Card Application
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Complete the 5-step wizard to register your identity into the national database.
          </p>
        </div>

        {submittedId ? (
          <div className="glass-card animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={40} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Application Submitted Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your application has been registered in the government identity database.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>YOUR TRACKING ID</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                {submittedId}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/track?id=${submittedId}`)}
              >
                Track Status Now
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSubmittedId(null);
                  setStep(1);
                  setIsSiManuallyEdited(false);
                  setIsTaManuallyEdited(false);
                }}
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                {[
                  { s: 1, label: 'Details', icon: User },
                  { s: 2, label: 'Address', icon: MapPin },
                  { s: 3, label: 'Photo', icon: Camera },
                  { s: 4, label: 'Docs', icon: FileText },
                  { s: 5, label: 'Review', icon: CreditCard }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = step === item.s;
                  const isDone = step > item.s;

                  return (
                    <div
                      key={item.s}
                      onClick={() => item.s < step && setStep(item.s)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: isDone ? 'pointer' : 'default',
                        opacity: isActive ? 1 : isDone ? 0.8 : 0.4
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--gradient-primary)' : isDone ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={20} color="var(--accent-primary)" /> Personal Information
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Full Name in English *</label>
                      <input
                        type="text"
                        name="fullNameEn"
                        className="form-control"
                        placeholder="e.g. Thilina Sakalasooriya"
                        value={formData.fullNameEn}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Full Name in Sinhala (සම්පූර්ණ නම)</span>
                        <span style={{ fontSize: '0.72rem', color: isSiManuallyEdited ? 'var(--accent-primary)' : 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Languages size={12} /> {isSiManuallyEdited ? 'Custom Input' : 'Auto-Transliterating'}
                        </span>
                      </label>
                      <input
                        type="text"
                        name="fullNameSi"
                        className="form-control"
                        placeholder="e.g. තිලිණ සකළසූරිය"
                        value={formData.fullNameSi}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Full Name in Tamil (முழு பெயர்)</span>
                        <span style={{ fontSize: '0.72rem', color: isTaManuallyEdited ? 'var(--accent-primary)' : 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Languages size={12} /> {isTaManuallyEdited ? 'Custom Input' : 'Auto-Transliterating'}
                        </span>
                      </label>
                      <input
                        type="text"
                        name="fullNameTa"
                        className="form-control"
                        placeholder="e.g. திலீன சகலசூரிய"
                        value={formData.fullNameTa}
                        onChange={handleChange}
                      />
                      <div style={{ fontSize: '0.75rem', color: isTaManuallyEdited ? 'var(--accent-primary)' : 'var(--text-muted)', marginTop: '0.3rem' }}>
                        {isTaManuallyEdited
                          ? '✓ Custom manual Tamil input active (Clear field to re-enable auto-typing)'
                          : '⚡ Auto-typed using both English & Sinhala names. You can also edit Tamil directly anytime.'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Date of Birth *</label>
                        <input
                          type="date"
                          name="dob"
                          className="form-control"
                          value={formData.dob}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender *</label>
                        <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                          <option value="Male">Male (පුරුෂ / ஆண்)</option>
                          <option value="Female">Female (ස්ත්‍රී / பெண்)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Civil Status</label>
                      <select name="civilStatus" className="form-select" value={formData.civilStatus} onChange={handleChange}>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={20} color="var(--accent-primary)" /> Address & Contact Details
                    </h3>

                    <div className="form-group">
                      <label className="form-label">Permanent Residential Address *</label>
                      <textarea
                        name="address"
                        rows={3}
                        className="form-textarea"
                        placeholder="e.g. No. 12, Main Street, Malabe, Colombo"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">District</label>
                        <select name="district" className="form-select" value={formData.district} onChange={handleChange}>
                          <option value="Colombo">Colombo</option>
                          <option value="Gampaha">Gampaha</option>
                          <option value="Kalutara">Kalutara</option>
                          <option value="Kandy">Kandy</option>
                          <option value="Galle">Galle</option>
                          <option value="Jaffna">Jaffna</option>
                          <option value="Kurunegala">Kurunegala</option>
                          <option value="Matara">Matara</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Divisional Secretariat</label>
                        <input
                          type="text"
                          name="divisionalSecretariat"
                          className="form-control"
                          placeholder="e.g. Kaduwela"
                          value={formData.divisionalSecretariat}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grama Niladhari Division & No.</label>
                      <input
                        type="text"
                        name="gnDivision"
                        className="form-control"
                        placeholder="e.g. Malabe East (482B)"
                        value={formData.gnDivision}
                        onChange={handleChange}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Mobile Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="+94 77 123 4567"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Camera size={20} color="var(--accent-primary)" /> Photo & Signature Upload
                    </h3>

                    <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px border var(--border-color)' }}>
                      <label className="form-label">Passport Specification Photo Upload</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={16} /> Choose Photo File
                          <input type="file" accept="image/*" hidden onChange={(e) => handleFileUpload(e, 'photoUrl')} />
                        </label>
                        {formData.photoUrl && <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>✓ Image Loaded</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Digital Signature Text / Specimen</label>
                      <input
                        type="text"
                        name="signature"
                        className="form-control"
                        placeholder="e.g. T. Sakalasooriya"
                        value={formData.signature}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} color="var(--accent-primary)" /> Supporting Documents
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      Upload digital scans of required verification documents.
                    </p>

                    {[
                      'Birth Certificate (Original Scan)',
                      'Grama Niladhari Certificate (Form DRP-1)',
                      'Police Clearance Report (For Lost NIC)',
                      'Marriage Certificate (If Name Changed)'
                    ].map((docName, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{docName}</span>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} /> Attach
                          <input type="file" hidden onChange={() => {
                            if (!formData.documents.includes(docName)) {
                              setFormData(prev => ({ ...prev, documents: [...prev.documents, docName] }));
                            }
                          }} />
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {step === 5 && (
                  <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={20} color="var(--accent-emerald)" /> Review & Confirm Application
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Full Name (En):</span>
                        <span style={{ fontWeight: 600 }}>{formData.fullNameEn || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Full Name (Si):</span>
                        <span style={{ fontWeight: 600 }}>{formData.fullNameSi || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Full Name (Ta):</span>
                        <span style={{ fontWeight: 600 }}>{formData.fullNameTa || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>DOB & Gender:</span>
                        <span style={{ fontWeight: 600 }}>{formData.dob} ({formData.gender})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                        <span style={{ fontWeight: 600 }}>{formData.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  {step > 1 ? (
                    <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                      <ArrowLeft size={16} /> Back
                    </button>
                  ) : <div />}

                  {step < 5 ? (
                    <button type="button" className="btn btn-primary" onClick={handleNext}>
                      Next Step <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-emerald btn-lg">
                      <CheckCircle2 size={20} /> Submit Application
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={16} color="#eab308" /> Live Dynamic NIC Preview
              </div>
              <div style={{ width: '100%', maxWidth: '480px' }}>
                <IDCard3D cardData={formData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyPage;
