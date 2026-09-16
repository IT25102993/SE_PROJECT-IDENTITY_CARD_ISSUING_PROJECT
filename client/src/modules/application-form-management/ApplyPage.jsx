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
  "raluwage": "ராலுவகே",
  "imasha": "இமாஷா",
  "prabhani": "பிரபானி",
  "raluwage imasha prabhani": "ராலுவகே இமாஷா பிரபானி",
  "රළුවගේ ඉමාෂා ප්‍රභානී": "ராலுவகே இமாஷா பிரபானி",
  "රලුවගේ ඉමාෂා ප්‍රභානි": "ராலுவகே இமாஷா பிரபானி",
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
  "wickramasinghe": "விக்ரமசிங்க",
  "jayawardena": "ஜயவர்தன",
  "fernando": "பெர்னாண்டோ",
  "silva": "சில்வா",
  "de silva": "டி சில்வா",
  "rajapaksa": "ராஜபக்ஷ",
  "kasun": "கசுன்",
  "sandun": "சந்துன்",
  "pradeep": "பிரதீப்",
  "hasitha": "ஹசித",
  "dinesh": "தினேஷ்",
  "suresh": "சுரேஷ்"
};

const NAME_DICTIONARY_SI = {
  "thilina": "තිලිණ",
  "sakalasooriya": "සකළසූරිය",
  "thilina sakalasooriya": "තිලිණ සකළසූරිය",
  "raluwage": "රළුවගේ",
  "imasha": "ඉමාෂා",
  "prabhani": "ප්‍රභානී",
  "raluwage imasha prabhani": "රළුවගේ ඉමාෂා ප්‍රභානී",
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
  "rajapaksa": "රාජපක්ෂ",
  "kasun": "කසුන්",
  "sandun": "සඳුන්",
  "pradeep": "ප්‍රදීප්",
  "hasitha": "හසිත",
  "dinesh": "දිනේෂ්",
  "suresh": "සුරේෂ්"
};

const SINHALA_TO_TAMIL_MAP = {
  'අ': 'அ', 'ආ': 'ஆ', 'ඇ': 'அ', 'ඈ': 'ஆ', 'ඉ': 'இ', 'ඊ': 'ஈ', 'උ': 'உ', 'ඌ': 'ஊ',
  'එ': 'எ', 'ඒ': 'ஏ', 'ඓ': 'ஐ', 'ඔ': 'ஒ', 'ඕ': 'ஓ', 'ඖ': 'ஔ',
  'ක': 'க', 'ඛ': 'க', 'ග': 'க', 'ඝ': 'க', 'ඞ': 'ங',
  'ච': 'ச', 'ඡ': 'ச', 'ජ': 'ஜ', 'ඣ': 'ஜ', 'ඤ': 'ஞ',
  'ට': 'ட', 'ඨ': 'ட', 'ඩ': 'ட', 'ඪ': 'ட', 'ණ': 'ண',
  'ත': 'த', 'ථ': 'த', 'ද': 'த', 'ධ': 'த', 'න': 'ந',
  'ප': 'ப', 'ඵ': 'ப', 'බ': 'ப', 'භ': 'ப', 'ම': 'ம',
  'ය': 'ய', 'ර': 'ர', 'ල': 'ல', 'ව': 'வ', 'ශ': 'ஶ', 'ෂ': 'ஷ', 'ස': 'ச', 'හ': 'ஹ', 'ළ': 'ள', 'ෆ': 'ப',
  'ඳ': 'ந்த', 'ඟ': 'ங்க', 'ඬ': 'ண்ட', 'ඹ': 'ம்ப', 'ඥ': 'ஞ',
  'ා': 'ா', 'ැ': 'ா', 'ෑ': 'ா', 'ි': 'ி', 'ී': 'ீ',
  'ු': '\u0BC1', 'ූ': '\u0BC2',
  'ෘ': 'ிரு', 'ෙ': 'ெ', 'ේ': 'ே', 'ෛ': 'ை', 'ො': 'ொ', 'ෝ': 'ோ', 'ෞ': 'ௗ',
  '්': '\u0BCD', 'ං': 'ம்', 'ඃ': 'ஃ'
};

export const transliterateSinhalaToTamil = (word) => {
  if (!word) return '';
  const cleanWord = word.replace(/\u200D/g, '').trim();
  if (NAME_DICTIONARY_TA[cleanWord]) return NAME_DICTIONARY_TA[cleanWord];

  let result = '';
  for (let char of cleanWord) {
    result += SINHALA_TO_TAMIL_MAP[char] || char;
  }
  return result;
};

export const transliterateEnglishToTamil = (word) => {
  if (!word) return '';
  const lower = word.toLowerCase().trim();
  if (NAME_DICTIONARY_TA[lower]) return NAME_DICTIONARY_TA[lower];

  let str = lower;
  let prefix = '';
  if (str.startsWith('pr')) {
    prefix = 'பிர';
    str = str.slice(2);
  } else if (str.startsWith('kr')) {
    prefix = 'கிர';
    str = str.slice(2);
  } else if (str.startsWith('tr')) {
    prefix = 'திர';
    str = str.slice(2);
  }

  const vowels = ['aa', 'ai', 'au', 'ee', 'ea', 'ii', 'oo', 'ou', 'uu', 'a', 'e', 'i', 'o', 'u'];
  const consonants = [
    'ksh', 'sh', 'th', 'ch', 'kh', 'gh', 'dh', 'ph', 'bh', 'ng', 'gn', 'ny', 'zh',
    'k', 'g', 'c', 'j', 't', 'd', 'n', 'p', 'b', 'm', 'y', 'r', 'l', 'v', 'w', 's', 'z', 'h', 'f'
  ];

  const INDEPENDENT_VOWELS = {
    'aa': 'ஆ', 'a': 'அ', 'ee': 'ஈ', 'ea': 'ஏ', 'ii': 'ஈ', 'i': 'இ',
    'oo': 'ஊ', 'uu': 'ஊ', 'u': 'உ', 'e': 'எ', 'ai': 'ஐ', 'au': 'ஔ', 'ou': 'ஔ', 'o': 'ஒ'
  };

  const DEPENDENT_VOWELS = {
    'aa': 'ா', 'a': 'ா', 'ee': 'ே', 'ea': 'ே', 'ii': 'ீ', 'i': 'ி',
    'oo': 'ோ', 'uu': 'ூ', 'u': '\u0BC1', 'e': 'ே', 'ai': 'ை', 'au': 'ௌ', 'ou': 'ௌ', 'o': 'ோ'
  };

  const CONSONANTS = {
    'ksh': 'க்ஷ', 'sh': 'ஷ', 'th': 'த', 'ch': 'ச', 'kh': 'க', 'gh': 'க', 'dh': 'த',
    'ph': 'ப', 'bh': 'ப', 'ng': 'ங', 'gn': 'ஞ', 'ny': 'ஞ', 'zh': 'ழ',
    'k': 'க', 'g': 'க', 'c': 'க', 'j': 'ஜ', 't': 'த', 'd': 'த', 'n': 'ந',
    'p': 'ப', 'b': 'ப', 'm': 'ம', 'y': 'ய', 'r': 'ர', 'l': 'ல', 'v': 'ව' ? 'வ' : 'வ', 'w': 'வ',
    's': 'ச', 'z': 'ஸ', 'h': 'ஹ', 'f': 'ப'
  };

  let res = prefix;
  let i = 0;

  while (i < str.length) {
    if (res === '' && i === 0) {
      let matchedV = vowels.find(v => str.startsWith(v, i));
      if (matchedV) {
        res += INDEPENDENT_VOWELS[matchedV] || '';
        i += matchedV.length;
        continue;
      }
    }

    let matchedC = consonants.find(c => str.startsWith(c, i));
    if (matchedC) {
      let baseC = CONSONANTS[matchedC];
      i += matchedC.length;

      let matchedV = vowels.find(v => str.startsWith(v, i));
      if (matchedV) {
        i += matchedV.length;
        if (matchedV === 'a') {
          if (i >= str.length || (matchedC === 'r' && i <= 3) || (matchedC === 'sh')) {
            res += baseC + 'ா';
          } else {
            res += baseC;
          }
        } else {
          res += baseC + DEPENDENT_VOWELS[matchedV];
        }
      } else {
        if (i >= str.length && matchedC === 'n') {
          res += 'ன்';
        } else if (i >= str.length && matchedC === 'l') {
          res += 'ல்';
        } else if (i >= str.length && matchedC === 'r') {
          res += 'ர்';
        } else {
          res += baseC + '\u0BCD';
        }
      }
    } else {
      let matchedV = vowels.find(v => str.startsWith(v, i));
      if (matchedV) {
        res += INDEPENDENT_VOWELS[matchedV] || '';
        i += matchedV.length;
      } else {
        res += str[i];
        i++;
      }
    }
  }

  return res;
};

export const transliterateEnglishToSinhala = (word) => {
  if (!word) return '';
  const lower = word.toLowerCase().trim();
  if (NAME_DICTIONARY_SI[lower]) return NAME_DICTIONARY_SI[lower];

  const VOWELS = {
    'aa': 'ආ', 'a': 'අ', 'ae': 'ඇ', 'ii': 'ඊ', 'ee': 'ඊ', 'i': 'ඉ',
    'uu': 'ඌ', 'oo': 'ඌ', 'u': 'උ', 'ea': 'ඒ', 'e': 'එ', 'ai': 'ඓ', 'o': 'ඔ', 'au': 'ඖ'
  };
  const DEP_VOWELS = {
    'aa': 'ා', 'a': '', 'ae': 'ැ', 'ii': 'ී', 'ee': 'ී', 'i': 'ි',
    'uu': 'ූ', 'oo': 'ූ', 'u': 'ු', 'ea': 'ේ', 'e': 'ෙ', 'ai': 'ෛ', 'o': 'ො', 'au': 'ෞ'
  };
  const CONSONANTS = {
    'sh': 'ෂ', 'th': 'ත', 'ch': 'ච', 'kh': 'ඛ', 'gh': 'ඝ', 'dh': 'ධ', 'ph': 'ඵ', 'bh': 'භ',
    'ng': 'ඟ', 'nd': 'ඳ', 'mb': 'ඹ',
    'k': 'ක', 'g': 'ග', 'c': 'ක', 'j': 'ජ', 't': 'ට', 'd': 'ද', 'n': 'න',
    'p': 'ප', 'b': 'බ', 'm': 'ම', 'y': 'ය', 'r': 'ර', 'l': 'ල', 'v': 'ව', 'w': 'ව',
    's': 'ස', 'h': 'හ', 'f': 'ෆ'
  };

  const vKeys = Object.keys(VOWELS).sort((a,b) => b.length - a.length);
  const cKeys = Object.keys(CONSONANTS).sort((a,b) => b.length - a.length);

  let res = '';
  let i = 0;

  if (lower.startsWith('pr')) {
    res += 'ප්‍ර';
    i = 2;
  } else if (lower.startsWith('kr')) {
    res += 'ක්‍ර';
    i = 2;
  } else if (lower.startsWith('tr')) {
    res += 'ත්‍ර';
    i = 2;
  }

  while (i < lower.length) {
    if (res === '' && i === 0) {
      let matchedV = vKeys.find(v => lower.startsWith(v, i));
      if (matchedV) {
        res += VOWELS[matchedV];
        i += matchedV.length;
        continue;
      }
    }

    let matchedC = cKeys.find(c => lower.startsWith(c, i));
    if (matchedC) {
      let baseC = CONSONANTS[matchedC];
      i += matchedC.length;

      let matchedV = vKeys.find(v => lower.startsWith(v, i));
      if (matchedV) {
        i += matchedV.length;
        if (matchedV === 'a') {
          if (i >= lower.length) {
            res += baseC + 'ා';
          } else {
            res += baseC;
          }
        } else {
          res += baseC + DEP_VOWELS[matchedV];
        }
      } else {
        res += baseC + '්';
      }
    } else {
      let matchedV = vKeys.find(v => lower.startsWith(v, i));
      if (matchedV) {
        res += VOWELS[matchedV];
        i += matchedV.length;
      } else {
        res += lower[i];
        i++;
      }
    }
  }

  return res;
};

export const autoGenerateTamilName = (nameEn = '', nameSi = '') => {
  // If user entered Sinhala text with Sinhala Unicode characters:
  if (nameSi && /[\u0D80-\u0DFF]/.test(nameSi)) {
    const siLower = nameSi.trim();
    if (NAME_DICTIONARY_TA[siLower]) return NAME_DICTIONARY_TA[siLower];
    const wordsSi = nameSi.trim().split(/\s+/);
    return wordsSi.map(w => {
      const wClean = w.trim();
      if (NAME_DICTIONARY_TA[wClean]) return NAME_DICTIONARY_TA[wClean];
      return transliterateSinhalaToTamil(wClean);
    }).join(' ');
  }

  // Otherwise, transliterate from English:
  if (nameEn && nameEn.trim()) {
    const enLower = nameEn.toLowerCase().trim();
    if (NAME_DICTIONARY_TA[enLower]) return NAME_DICTIONARY_TA[enLower];
    const wordsEn = nameEn.trim().split(/\s+/);
    return wordsEn.map(w => {
      const wLower = w.toLowerCase().trim();
      if (NAME_DICTIONARY_TA[wLower]) return NAME_DICTIONARY_TA[wLower];
      return transliterateEnglishToTamil(wLower);
    }).join(' ');
  }

  return '';
};

export const autoGenerateSinhalaName = (nameEn = '') => {
  if (!nameEn.trim()) return '';
  const enLower = nameEn.toLowerCase().trim();
  if (NAME_DICTIONARY_SI[enLower]) return NAME_DICTIONARY_SI[enLower];

  const words = nameEn.trim().split(/\s+/);
  return words.map(word => {
    const wLower = word.toLowerCase().trim();
    if (NAME_DICTIONARY_SI[wLower]) return NAME_DICTIONARY_SI[wLower];
    return transliterateEnglishToSinhala(wLower);
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

  const handlePrefillFromBirthCertificate = () => {
    setFormData(prev => ({
      ...prev,
      fullNameEn: 'Thilina Srimal Sakalasooriya',
      fullNameSi: 'තිලිණ ශ්‍රීමාල් සකළසූරිය',
      fullNameTa: 'திலீன ஸ்ரீமால் சகலசூரிய',
      dob: '2005-05-31',
      gender: 'Male',
      civilStatus: 'Single',
      address: 'No. 45, Station Road, Ragama, Gampaha District',
      district: 'Gampaha',
      divisionalSecretariat: 'Ragama',
      gnDivision: 'Ragama Town (412A)',
      phone: '+94 77 123 4567',
      email: 'spokenengadamin@gmail.com',
      signature: 'T. S. Sakalasooriya',
      documents: [
        {
          document_type: 'Birth Certificate (Original Scan)',
          file_name: 'birthcerificate.pdf',
          file_size: '174 KB',
          file_path: '/uploads/documents/birthcerificate.pdf'
        }
      ]
    }));
    setIsSiManuallyEdited(true);
    setIsTaManuallyEdited(true);
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

                    {/* Official birthcerificate.pdf Specimen Helper */}
                    <div
                      style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          Specimen Available: <strong style={{ color: 'var(--text-primary)' }}>birthcerificate.pdf</strong> (Thilina Srimal Sakalasooriya, 2005-05-31, Male, Gampaha)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePrefillFromBirthCertificate}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Fill application form with exact details matching birthcerificate.pdf"
                      >
                        <Sparkles size={13} /> Prefill from birthcerificate.pdf
                      </button>
                    </div>

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
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} color="var(--accent-primary)" /> Supporting Documents
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      Upload scans of required verification documents. Supported: PDF, JPG, PNG (max 10MB each).
                    </p>

                    {[
                      'Birth Certificate (Original Scan)',
                      'Grama Niladhari Certificate (Form DRP-1)',
                      'Police Clearance Report (For Lost NIC)',
                      'Marriage Certificate (If Name Changed)'
                    ].map((docName, idx) => {
                      const attached = formData.documents.find(d => (d.document_type || d) === docName);
                      return (
                        <div key={idx} style={{ padding: '0.85rem 1rem', background: attached ? 'rgba(16,185,129,0.07)' : 'rgba(0,0,0,0.2)', border: `1px solid ${attached ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', transition: 'all 0.2s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={16} color={attached ? 'var(--accent-emerald)' : 'var(--text-muted)'} />
                              <span style={{ fontSize: '0.88rem', color: attached ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: attached ? 600 : 400 }}>{docName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {attached && (
                                <>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <CheckCircle2 size={13} /> {attached.file_name} ({attached.file_size})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, documents: prev.documents.filter(d => (d.document_type || d) !== docName) }))}
                                    style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: '6px', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                  >Remove</button>
                                </>
                              )}
                              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                                <Upload size={13} /> {attached ? 'Replace' : 'Attach File'}
                                <input
                                  type="file"
                                  hidden
                                  accept=".pdf,.png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const docObj = {
                                        document_type: docName,
                                        file_name: file.name,
                                        file_size: file.size > 1024 * 1024 ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : (file.size / 1024).toFixed(0) + ' KB',
                                        file_data: reader.result,
                                        preview_url: reader.result
                                      };
                                      setFormData(prev => ({
                                        ...prev,
                                        documents: [
                                          ...prev.documents.filter(d => (d.document_type || d) !== docName),
                                          docObj
                                        ]
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          {/* Inline preview for image attachments */}
                          {attached && attached.preview_url && attached.file_name && !attached.file_name.toLowerCase().endsWith('.pdf') && (
                            <div style={{ marginTop: '0.6rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '140px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}>
                              <img src={attached.preview_url} alt={attached.file_name} style={{ maxHeight: '140px', objectFit: 'contain', width: '100%' }} />
                            </div>
                          )}
                          {attached && attached.file_name && attached.file_name.toLowerCase().endsWith('.pdf') && (
                            <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                              <FileText size={14} /> PDF document ready for submission.
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {formData.documents.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', fontSize: '0.83rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={14} /> {formData.documents.length} document{formData.documents.length > 1 ? 's' : ''} attached and ready for upload.
                      </div>
                    )}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Documents Attached:</span>
                        <span style={{ fontWeight: 700, color: formData.documents.length > 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                          {formData.documents.length > 0 ? `✓ ${formData.documents.length} document${formData.documents.length > 1 ? 's' : ''}` : 'None attached'}
                        </span>
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
