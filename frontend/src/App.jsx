import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Camera, Mic, MicOff, ShoppingBag, Layers, Package, Users, Sliders,
  TrendingUp, Send, CheckCircle, FileText, ArrowRight, ShieldCheck, RefreshCw,
  Globe, CreditCard, Check, X, Star, MapPin, Search, Filter, Heart,
  ShoppingCart, ChevronRight, MessageSquare, Award, ArrowUpRight, HelpCircle,
  Truck, ShieldAlert, Zap, Compass, Store, Settings, PieChart, Tag, RefreshCcw, Home, Trash2,
  QrCode, Volume2, VolumeX, Download, Share2, Phone, MessageCircle, Printer, Briefcase
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8001/api/v1';

export default function App() {
  // Tab Persistence: Customer vs Artisan views
  const getInitialMode = () => {
    return localStorage.getItem('kaarvo_app_mode') || 'customer';
  };

  const getInitialCustomerTab = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['home', 'shop', 'ai_ask', 'stories'];
    if (valid.includes(hash)) return hash;
    return localStorage.getItem('kaarvo_customer_tab') || 'home';
  };

  const getInitialArtisanTab = () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['dashboard', 'copilot', 'studio', 'orders', 'customers', 'insights', 'marketing', 'settings'];
    if (valid.includes(hash)) return hash;
    return localStorage.getItem('kaarvo_artisan_tab') || 'dashboard';
  };

  const [mode, setMode] = useState(getInitialMode);
  const [customerTab, setCustomerTab] = useState(getInitialCustomerTab);
  const [artisanTab, setArtisanTab] = useState(getInitialArtisanTab);

  // DB State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kaarvo_cart')) || [];
    } catch (e) {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Customer AI Search & Shopping State
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [aiShoppingInput, setAiShoppingInput] = useState('');
  const [aiShoppingHistory, setAiShoppingHistory] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your Kaarvo AI Craft Assistant. Ask me to find authentic Indian handicrafts, unique gifts, or products within your budget!',
      recommendedIds: [1, 2]
    }
  ]);
  const [aiShoppingLoading, setAiShoppingLoading] = useState(false);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    name: 'Rohan Sharma',
    phone: '+91 98765 43210',
    address: 'Flat 402, Royal Residency, Malviya Nagar',
    city: 'Jaipur',
    pincode: '302017',
    paymentMethod: 'UPI'
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // --- PILLAR 1: AI STUDIO IMAGE ENHANCER STATES ---
  const [rawImageFile, setRawImageFile] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [imageEnhancing, setImageEnhancing] = useState(false);
  const [imageLightingInfo, setImageLightingInfo] = useState(null);

  // --- HACKATHON INNOVATION SUITE STATES ---
  // Feature 1: Digital Heritage Passport & Verifiable QR Certificate
  const [passportProduct, setPassportProduct] = useState(null);

  // Feature 2: WhatsApp Artisan Commerce Bot Simulator
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [whatsappTyping, setWhatsappTyping] = useState(false);
  const [whatsappMessages, setWhatsappMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '🙏 Namaste Mohan ji! Main Kaarvo AI Sahayak hu. Aap bol kar ya photo bhej kar apna craft sidha ONDC aur global customers ke liye list kar sakte hain.',
      time: '10:00 AM'
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Niche diye presets me se tap karein ya mic se bole:',
      time: '10:00 AM'
    }
  ]);

  // Feature 3: Voice Storytelling & Text-To-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSubtitle, setAudioSubtitle] = useState(null);

  // Feature 4: Social Media Marketing Flyer Generator
  const [flyerProduct, setFlyerProduct] = useState(null);

  // Feature 5: B2B Wholesale Export & Living-Wage AI Negotiator
  const [b2bUnits, setB2bUnits] = useState(500);
  const [b2bTargetPrice, setB2bTargetPrice] = useState(350);
  const [b2bAnalysis, setB2bAnalysis] = useState(null);
  const [b2bNegotiating, setB2bNegotiating] = useState(false);

  // Process image on HTML5 canvas with Adaptive AI Lighting & Photo Super-Enhancement
  const processCanvasImage = (rawUrl) => {
    if (!rawUrl) return;
    setImageEnhancing(true);

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const maxDim = 1200;
        let w = img.width || 800;
        let h = img.height || 800;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        // 1. Analyze initial photo brightness (luminance) from downsampled sample
        const sampleSize = 120;
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        const sCtx = sampleCanvas.getContext('2d');
        sCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imgData = sCtx.getImageData(0, 0, sampleSize, sampleSize).data;

        let totalLuminance = 0;
        const totalPixels = sampleSize * sampleSize;
        for (let i = 0; i < imgData.length; i += 4) {
          totalLuminance += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
        }
        const avgLuminance = Math.round(totalLuminance / totalPixels);

        // 2. Intelligent Adaptive Lighting Calibration
        // Requirement: agar photo ki brightness pehle se badiya hai, to over-brighten nahi karna
        let filterStr = '';
        let assessment = '';
        let badgeColor = '';
        let toastMsg = '';

        if (avgLuminance >= 165) {
          // High Key / Very Bright Daylight
          filterStr = 'contrast(1.02) brightness(0.99) saturate(1.03)';
          assessment = 'High Brightness Detected: Original exposure preserved (no artificial brightening)';
          badgeColor = '#059669';
          toastMsg = '✨ High brightness detected! Original exposure preserved without washout.';
        } else if (avgLuminance >= 115) {
          // Well-lit / Balanced Lighting (Good brightness initially)
          filterStr = 'contrast(1.05) brightness(1.01) saturate(1.07)';
          assessment = 'Optimal Natural Brightness: Micro-contrast & edge clarity enhanced (brightness kept natural)';
          badgeColor = '#10B981';
          toastMsg = '✨ Photo has great natural brightness! Enhanced clarity without over-exposure.';
        } else if (avgLuminance >= 75) {
          // Moderate indoor lighting
          filterStr = 'contrast(1.11) brightness(1.08) saturate(1.15)';
          assessment = 'Indoor Lighting Detected: Applied gentle shadow recovery & warm craft saturation';
          badgeColor = '#D97706';
          toastMsg = '✨ Mild indoor lighting: lifted shadows & boosted craft texture.';
        } else {
          // Underexposed / Dim photo
          filterStr = 'contrast(1.18) brightness(1.18) saturate(1.22)';
          assessment = 'Low-Light Photo Detected: Enhanced exposure, shadow detail & craft vibrance';
          badgeColor = '#DC2626';
          toastMsg = '✨ Low-light detected: boosted exposure, clarity & vibrant craft tones.';
        }

        setImageLightingInfo({
          luminance: avgLuminance,
          assessment: assessment,
          badgeColor: badgeColor
        });

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Apply calibrated adaptive filter
        ctx.filter = filterStr;
        ctx.drawImage(img, 0, 0, w, h);

        // Soft studio sharpening vignette frame
        ctx.filter = 'none';
        const rx = w / 2;
        const ry = h / 2;
        const vig = ctx.createRadialGradient(rx, ry, Math.min(w, h) * 0.45, rx, ry, Math.max(w, h) * 0.85);
        vig.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vig.addColorStop(1, 'rgba(30, 20, 10, 0.04)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setEnhancedImage(dataUrl);
        setImageEnhancing(false);
        showToast(toastMsg);
      } catch (err) {
        console.error(err);
        setEnhancedImage(rawUrl);
        setImageEnhancing(false);
      }
    };

    img.onerror = () => {
      setEnhancedImage(rawUrl);
      setImageEnhancing(false);
    };

    img.src = rawUrl;
  };

  // --- FEATURE 3 HELPER: Enhanced Native Voice Text-to-Speech (Hindi & English) ---
  const speakText = (text, lang = 'hi-IN') => {
    if (!('speechSynthesis' in window)) {
      showToast('⚠️ Speech synthesis not supported on this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAudioSubtitle(null);
      return;
    }
    window.speechSynthesis.cancel();
    try { window.speechSynthesis.resume(); } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices() || [];
    
    let targetVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
    if (!targetVoice && lang.startsWith('hi')) {
      targetVoice = voices.find(v => (v.lang && (v.lang.includes('IN') || v.lang.includes('hi'))));
    }
    if (targetVoice) utterance.voice = targetVoice;

    utterance.lang = targetVoice ? targetVoice.lang : (lang || 'en-US');
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAudioSubtitle({ text, lang });
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setAudioSubtitle(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setAudioSubtitle(null);
    };

    window.speechSynthesis.speak(utterance);
    setAudioSubtitle({ text, lang });
    setIsSpeaking(true);
    showToast(`🔊 ${lang.startsWith('hi') ? 'Hindi Audio' : 'Audio Story'} playing... Tap again to pause.`);
  };

// --- REAL MULTILINGUAL NEURAL & DOMAIN TRANSLATION ENGINE ---
  const cleanOfflineDomainTranslation = (input) => {
    const raw = (input || '').trim()
      .replace(/^(Authentic artisan product:\s*)+/gi, '')
      .replace(/^(Authentic:\s*)+/gi, '')
      .trim();
    if (!raw) return '';
    const lower = raw.toLowerCase();

    // 1. Region & Origin Detection
    let region = '';
    let regionShort = '';
    if (/kashmir|srinagar|कश्मीर|श्रीनगर/i.test(lower)) { region = 'Kashmir, India'; regionShort = 'Kashmir'; }
    else if (/jaipur|rajasthan|जयपुर|राजस्थान/i.test(lower)) { region = 'Jaipur, Rajasthan'; regionShort = 'Jaipur'; }
    else if (/banaras|varanasi|kashi|बनारस|वाराणसी|काशी/i.test(lower)) { region = 'Varanasi, Uttar Pradesh'; regionShort = 'Varanasi'; }
    else if (/channapatna|karnataka|चन्नापटना|कर्नाटक/i.test(lower)) { region = 'Channapatna, Karnataka'; regionShort = 'Channapatna'; }
    else if (/kanchipuram|tamil|कांचीपुरम/i.test(lower)) { region = 'Kanchipuram, Tamil Nadu'; regionShort = 'Kanchipuram'; }
    else if (/khurja|खुर्जा/i.test(lower)) { region = 'Khurja, Uttar Pradesh'; regionShort = 'Khurja'; }
    else if (/madhubani|mithila|bihar|मधुबनी|मिथिला/i.test(lower)) { region = 'Mithila, Bihar'; regionShort = 'Mithila'; }
    else if (/bengal|kolkata|shantiniketan|बंगाल/i.test(lower)) { region = 'Kolkata, West Bengal'; regionShort = 'Bengal'; }
    else if (/kutch|gujarat|कच्छ|गुजरात/i.test(lower)) { region = 'Kutch, Gujarat'; regionShort = 'Kutch'; }
    else if (/moradabad|मुरादाबाद/i.test(lower)) { region = 'Moradabad, Uttar Pradesh'; regionShort = 'Moradabad'; }
    else if (/saharanpur|सहारनपुर/i.test(lower)) { region = 'Saharanpur, Uttar Pradesh'; regionShort = 'Saharanpur'; }

    const isProcured = /mangaya|mangwaya|laya|procured|sourced|आयात|मंगाया|लाया/i.test(lower);
    const isHandmade = /banaya|bana hua|hath se|handcrafted|handmade|बनाया|हाथ से/i.test(lower);

    // 2. Product Detection
    let product = '';
    if (/matka|ghada|kalash|घड़ा|घड़ा|मटका|कलश/i.test(lower)) product = 'earthen terracotta water pot (matka)';
    else if (/surahi|सुराही/i.test(lower)) product = 'traditional long-neck earthen water flask (surahi)';
    else if (/saree|sari|साड़ी|साड़ी/i.test(lower)) product = 'heritage handloom saree';
    else if (/shawl|stole|pashmina|शॉल|पश्मीना/i.test(lower)) product = 'warm handwoven artisan shawl';
    else if (/toy|khilona|खिलौना/i.test(lower)) product = 'hand-carved wooden toy';
    else if (/diya|deepak|दीया|दीपक/i.test(lower)) product = 'hand-cast solid brass oil diya lamp';

    if (product) {
      let sentence = 'Authentic ';
      if (regionShort) sentence += `${regionShort} `;
      sentence += product;
      if (isProcured && region) sentence += `, sourced directly from ${region}`;
      return sentence.trim() + '.';
    }

    if (region) {
      return `Authentic handcrafted artisan piece, sourced directly from the heritage craft clusters of ${region}.`;
    }

    return raw;
  };

  const translateHindiSpeechToEnglish = async (input) => {
    let raw = (input || '').trim()
      .replace(/^(Authentic artisan product:\s*)+/gi, '')
      .replace(/^(Authentic:\s*)+/gi, '')
      .trim();
    if (!raw) return '';

    // Preprocess speech mishearings and common Hinglish phonetic words
    let preprocessed = raw
      .replace(/(होटल|हॉटेल)\s*(करनी|करना)/gi, 'ऑर्डर $2')
      .replace(/\bmangaya gaya hai\b/gi, 'mangwaya gaya hai')
      .replace(/\blaya gaya hai\b/gi, 'laya hai');

    // 1. Try Backend Translate API (127.0.0.1:8001)
    try {
      const res = await fetch('http://127.0.0.1:8001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: preprocessed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.translated) {
          return data.translated;
        }
      }
    } catch (err) {
      console.warn('Backend /api/translate error, trying direct Google API:', err);
    }

    // 2. Direct Google GTX API (Free, fast, CORS enabled)
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(preprocessed)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          let translated = data[0].map(item => item ? item[0] : '').join('').trim();
          if (translated) {
            translated = translated.charAt(0).toUpperCase() + translated.slice(1);
            if (!/[.!?]$/.test(translated)) translated += '.';
            return translated;
          }
        }
      }
    } catch (err) {
      console.warn('Google GTX fallback error:', err);
    }

    // 3. MyMemory Free API
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(preprocessed)}&langpair=hi|en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          let text = data.responseData.translatedText.trim();
          text = text.charAt(0).toUpperCase() + text.slice(1);
          if (!/[.!?]$/.test(text)) text += '.';
          return text;
        }
      }
    } catch (err) {
      console.warn('MyMemory fallback error:', err);
    }

    // 4. Offline domain fallback
    return cleanOfflineDomainTranslation(raw);
  };

    // --- FEATURE 2 HELPER: WhatsApp Artisan Bot Message Handler ---
  // WhatsApp Voice Speech Recognition with Real-Time Hindi-to-English Auto-Translation
  const [isWhatsappRecording, setIsWhatsappRecording] = useState(false);
  const [whatsappSpokenHindi, setWhatsappSpokenHindi] = useState('');
  const [isWhatsappTranslating, setIsWhatsappTranslating] = useState(false);
  const whatsappTranslateTimeoutRef = useRef(null);
  const whatsappSpeechRecRef = useRef(null);
  const whatsappMediaStreamRef = useRef(null);

  const stopWhatsappVoiceRecording = async () => {
    setIsWhatsappRecording(false);
    if (whatsappTranslateTimeoutRef.current) {
      clearTimeout(whatsappTranslateTimeoutRef.current);
    }
    if (whatsappSpeechRecRef.current) {
      try {
        whatsappSpeechRecRef.current.onend = null;
        whatsappSpeechRecRef.current.onerror = null;
        whatsappSpeechRecRef.current.stop();
      } catch (e) {}
      whatsappSpeechRecRef.current = null;
    }
    if (whatsappMediaStreamRef.current) {
      try {
        whatsappMediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      whatsappMediaStreamRef.current = null;
    }
    showToast('🔴 WhatsApp Mic Stopped.');

    // Flush final Hindi speech to proper English translation
    if (whatsappSpokenHindi && whatsappSpokenHindi.trim()) {
      setIsWhatsappTranslating(true);
      const english = await translateHindiSpeechToEnglish(whatsappSpokenHindi);
      if (english) {
        setWhatsappInput(english);
        showToast(`✨ Auto-translated to English: "${english.slice(0, 24)}..."`);
      }
      setIsWhatsappTranslating(false);
    }
  };

  const toggleWhatsappVoiceRecording = async () => {
    if (isWhatsappRecording) {
      stopWhatsappVoiceRecording();
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        whatsappMediaStreamRef.current = stream;
      }
    } catch (micErr) {
      console.warn('WhatsApp mic permission error:', micErr);
      showToast('⚠️ Kripya browser me mic permission allow karein!');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('⚠️ Aapka browser speech recognition support nahi karta. Type karein!');
      return;
    }

    try {
      if (whatsappSpeechRecRef.current) {
        try { whatsappSpeechRecRef.current.stop(); } catch (e) {}
      }

      const rec = new SpeechRecognition();
      whatsappSpeechRecRef.current = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'hi-IN'; // Speech spoken in Hindi!

      rec.onstart = () => {
        setIsWhatsappRecording(true);
        showToast('🎙️ WhatsApp Mic ACTIVE! Hindi me boliye, English me likha jayega...');
      };

      rec.onresult = (event) => {
        let transcript = '';
        let isFinal = false;
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0] && item[0].transcript) {
            transcript += item[0].transcript + ' ';
            if (item.isFinal) isFinal = true;
          }
        }
        const cleaned = transcript.trim();
        if (cleaned) {
          setWhatsappSpokenHindi(cleaned);

          if (whatsappTranslateTimeoutRef.current) {
            clearTimeout(whatsappTranslateTimeoutRef.current);
          }

          // Debounce translation: user speaks Hindi -> input gets proper English!
          whatsappTranslateTimeoutRef.current = setTimeout(async () => {
            setIsWhatsappTranslating(true);
            const english = await translateHindiSpeechToEnglish(cleaned);
            if (english) {
              setWhatsappInput(english);
              showToast(`✨ Translated: "${english.slice(0, 26)}..."`);
            }
            setIsWhatsappTranslating(false);
          }, isFinal ? 100 : 500);
        }
      };

      rec.onerror = (e) => {
        console.warn('WhatsApp speech rec error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          stopWhatsappVoiceRecording();
          showToast('⚠️ Mic access denied! Browser me mic enable karein.');
        }
      };

      rec.onend = () => {
        setIsWhatsappRecording(false);
      };

      rec.start();
    } catch (err) {
      console.error('WhatsApp mic error:', err);
      setIsWhatsappRecording(false);
      showToast('⚠️ Mic start nahi ho paya.');
    }
  };

  const handleWhatsappSend = async (customText) => {
    if (isWhatsappRecording) stopWhatsappVoiceRecording();
    let msg = (customText || whatsappInput).trim();
    if (!msg) return;

    // Auto-translate Hindi to English if text is in Hindi/Devanagari or Hinglish
    const hasHindi = /[\u0900-\u097F]|(\b(karni|karna|chahiye|mangaya|banaya|hai|hain|humne|hamne|hoga|karo)\b)/i.test(msg);
    if (hasHindi) {
      const translated = await translateHindiSpeechToEnglish(msg);
      if (translated) {
        msg = translated;
      }
    }

    const newMsg = {
      id: Date.now(),
      sender: 'artisan',
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setWhatsappMessages(prev => [...prev, newMsg]);
    setWhatsappInput('');
    setWhatsappTyping(true);

    setTimeout(() => {
      const { catalog, entities } = parseVoiceTextToCatalog(msg);
      const isListingIntent = /(matka|saree|sari|diya|wood|clay|silk|pot|list|bechna|rate|₹|rupaye|banaya|capacity|meter)/i.test(msg);

      let replyObj;
      if (isListingIntent) {
        const liveNewProduct = {
          id: `KAARVO-${Date.now().toString().slice(-6)}`,
          title: catalog.descriptor.name,
          category: catalog.category,
          price: catalog.price.suggested_range.min || 480,
          rating: 5.0,
          reviewsCount: 1,
          artisan: 'Verified Master Artisan (Mohan Lal)',
          location: entities.region || 'Jaipur, Rajasthan',
          description: catalog.descriptor.long_desc,
          materials: entities.material || 'Natural Kiln-Fired Clay / Pure Handloom',
          craftStory: catalog.descriptor.long_desc,
          image: enhancedImage || rawImageFile || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
          badge: 'ONDC Verified'
        };

        // IMMEDIATELY ADD TO STOREFRONT!
        setProducts(prev => [liveNewProduct, ...prev]);

        // Post to backend database
        fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: liveNewProduct.title,
            category: liveNewProduct.category,
            price: liveNewProduct.price,
            voice_text: msg
          })
        }).catch(() => {});

        replyObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `✨ Shandaar Mohan ji! Aapka product automatically ONDC standards me catalog ho gaya hai:\n\n📦 *${catalog.descriptor.name}*\n🏷️ *Price:* ₹${catalog.price.suggested_range.min}\n📍 *Origin:* ${entities.region}\n🧵 *Material:* ${entities.material}\n\n✅ Ye sidha Kaarvo Live Storefront aur ONDC Beckn network par live publish kar diya gaya hai!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          card: {
            title: catalog.descriptor.name,
            price: catalog.price.suggested_range.min,
            region: entities.region,
            image: liveNewProduct.image,
            productObj: liveNewProduct
          }
        };
      } else {
        replyObj = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Aapka sandesh mil gaya Mohan ji! Aapke orders ka total payout ₹${orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0) || '2,450'} safely process ho chuka hai. Naya craft bechne ke liye photo ya voice note bhejein!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      setWhatsappMessages(prev => [...prev, replyObj]);
      setWhatsappTyping(false);
    }, 800);
  };

  // --- FEATURE 5 HELPER: B2B Living-Wage AI Price Negotiator ---
  const runB2bNegotiation = () => {
    setB2bNegotiating(true);
    setTimeout(() => {
      const units = parseInt(b2bUnits) || 500;
      const target = parseFloat(b2bTargetPrice) || 350;
      
      const baseMat = 160;
      const fairWage = 140;
      const packExport = 50;
      const costFloor = baseMat + fairWage + packExport;
      
      const safeWholesalePrice = Math.round(costFloor * 1.25);
      const totalArtisanEarnings = Math.round(fairWage * units);
      const isTargetTooLow = target < costFloor;

      setB2bAnalysis({
        units,
        target,
        costFloor,
        safeWholesalePrice,
        totalArtisanEarnings,
        isTargetTooLow,
        counterOfferText: `Dear Global Procurement Team, thank you for your bulk inquiry of ${units} units. Under our Fair Trade & ONDC Living-Wage Charter, raw material and skilled craftsman wages require an essential cost floor of ₹${costFloor}/unit. For a volume order of ${units} pieces, our optimal wholesale quote is ₹${safeWholesalePrice}/unit (FOB Mumbai), guaranteeing 100% authentic GI-certified craftsmanship with zero middleman exploitation.`,
        netSavingsVsRetail: `₹${((1850 - safeWholesalePrice) * units).toLocaleString()} Saved by Buyer vs Retail`,
      });
      setB2bNegotiating(false);
      showToast('🤝 Autonomous B2B Living-Wage Negotiation Strategy Generated!');
    }, 800);
  };

  // --- FEATURE 4 HELPER: 1-Click Social Media Marketing Flyer Preview & Downloader ---
  const openFlyerModal = (product) => {
    if (!product) return;
    setFlyerProduct(product);
  };

  const generateAndDownloadFlyer = (product) => {
    if (!product) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // Heritage craft background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
      bgGrad.addColorStop(0, '#1E120A');
      bgGrad.addColorStop(0.5, '#2D1B11');
      bgGrad.addColorStop(1, '#0F0906');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Decorative Traditional Gold Borders
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 14;
      ctx.strokeRect(32, 32, 1016, 1016);

      ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 50, 980, 980);

      // Header Branding
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('KAARVO HERITAGE • VOCAL FOR LOCAL', 540, 115);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px sans-serif';
      const cleanTitle = (product.title || product.name || 'Handcrafted Artisan Craft').slice(0, 42);
      ctx.fillText(cleanTitle, 540, 175);

      ctx.fillStyle = '#E5E7EB';
      ctx.font = '24px sans-serif';
      ctx.fillText(`Direct from Master Artisans of ${product.location || 'Jaipur, Rajasthan'}`, 540, 222);

      // Draw stylized product display container
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(140, 260, 800, 500, 24);
      ctx.fill();

      // Inner craft art graphic
      const drawArtisanBadge = () => {
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(540, 480, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨', 540, 480);
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('100% HANDCRAFTED', 540, 530);

        // Price Tag Banner
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.roundRect(680, 680, 220, 70, 16);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${product.price}`, 790, 728);

        // Bottom Certifications
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.roundRect(140, 790, 800, 200, 20);
        ctx.fill();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('✓ 100% GI Authentic Craft', 180, 850);
        ctx.fillText('✓ Living-Wage Certified', 180, 900);
        ctx.fillText('✓ Direct ONDC Beckn Sync', 180, 950);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('SCAN TO BUY DIRECT', 900, 860);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '20px monospace';
        ctx.fillText(`ID: ${String(product.id || 'KAARVO-892').slice(0, 12)}`, 900, 900);
        ctx.fillText('www.kaarvo.in', 900, 940);

        // Trigger safe download
        try {
          const link = document.createElement('a');
          link.download = `Kaarvo-Flyer-${(product.title || 'Artisan').replace(/\s+/g, '-')}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.95);
          link.click();
          showToast('📥 High-Res WhatsApp Status Flyer Downloaded!');
        } catch (exportErr) {
          showToast('✨ Flyer preview generated!');
        }
      };

      // Try loading image safely
      if (product.image && product.image.startsWith('data:')) {
        const img = new Image();
        img.onload = () => {
          try {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(140, 260, 800, 500, 24);
            ctx.clip();
            ctx.drawImage(img, 140, 260, 800, 500);
            ctx.restore();
          } catch (e) {}
          drawArtisanBadge();
        };
        img.onerror = () => drawArtisanBadge();
        img.src = product.image;
      } else {
        drawArtisanBadge();
      }
    } catch (err) {
      console.error('Flyer generation notice:', err);
      showToast('📥 Generated flyer for your product!');
    }
  };
  // PILLAR 1: Dynamic AI Studio Image Enhancer
  const handleEnhanceImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    setImageEnhancing(true);

    reader.onload = (event) => {
      const rawUrl = event.target.result;
      setRawImageFile(rawUrl);
      processCanvasImage(rawUrl);
      showToast('✨ AI Photo Super-Enhancement & Lighting Boost Completed!');
    };

    reader.readAsDataURL(file);
  };

  // --- PILLAR 2: MULTILINGUAL VOICE AUTO-CATALOGER STATES ---
  const [voiceText, setVoiceText] = useState('');
  const [rawSpokenHindi, setRawSpokenHindi] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const speechTranslateTimeoutRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [extractedEntities, setExtractedEntities] = useState(null);
  const [generatedCatalog, setGeneratedCatalog] = useState(null);
  const [cataloging, setCataloging] = useState(false);

  // --- PILLAR 3: DYNAMIC COST-PLUS PRICING ASSISTANT STATES ---
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [craftCategory, setCraftCategory] = useState('Pottery / Terracotta');
  const [pricingResult, setPricingResult] = useState(null);

  // Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState([
    { sender: 'ai', content: 'Namaste! I am your Kaarvo Artisan Copilot. How can I help grow your craft business today?' }
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Category Markups
  const categoryMarkups = {
    'Textiles / Handloom': { min: 0.30, max: 0.45, label: '30% – 45%' },
    'Pottery / Terracotta': { min: 0.40, max: 0.60, label: '40% – 60%' },
    'Metal craft': { min: 0.35, max: 0.55, label: '35% – 55%' },
    'Woodwork': { min: 0.35, max: 0.50, label: '35% – 50%' },
    'Jewelry (traditional)': { min: 0.45, max: 0.70, label: '45% – 70%' }
  };

  // Fetch DB data from Django API
  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch(`${API_BASE}/products`);
      if (pRes.ok) {
        const data = await pRes.json();
        if (Array.isArray(data)) {
          const mapped = data.map(item => ({
            id: item.id,
            title: item.title || 'Handcrafted Artisan Product',
            category: item.category || 'Handicrafts',
            price: parseFloat(item.price) > 0 ? parseFloat(item.price) : (parseFloat(item.suggested_min_price) > 0 ? parseFloat(item.suggested_min_price) : 480),
            originalPrice: parseFloat(item.suggested_max_price) > 0 ? parseFloat(item.suggested_max_price) : null,
            rating: item.quality_score ? (item.quality_score / 20).toFixed(1) : 4.9,
            reviewsCount: item.views_count || 12,
            artisan: item.artisan_name || 'Verified Artisan',
            location: item.location || 'Jaipur, Rajasthan',
            description: item.description || item.voice_transcript || 'Authentic handcrafted item produced by verified master artisan.',
            materials: item.verified_facts?.materials || 'Natural Pure Clay / Handloom Silk',
            craftStory: item.pricing_explanation || 'Preserving centuries of traditional Indian craftsmanship with 100% fair trade direct market linkage.',
            image: (item.media && item.media.length > 0 && item.media[0].file_url)
              ? item.media[0].file_url
              : 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
            badge: item.verification_state === 'org_verified' ? 'Verified Heritage' : 'Fair Trade'
          }));
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }

      const oRes = await fetch(`${API_BASE}/orders`);
      if (oRes.ok) setOrders(await oRes.json());
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // No default pricing calculation until user enters costs
  }, []);

  useEffect(() => {
    localStorage.setItem('kaarvo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const switchMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('kaarvo_app_mode', newMode);
  };

  const switchCustomerTab = (tab) => {
    setCustomerTab(tab);
    localStorage.setItem('kaarvo_customer_tab', tab);
    window.location.hash = tab;
  };

  const switchArtisanTab = (tab) => {
    setArtisanTab(tab);
    localStorage.setItem('kaarvo_artisan_tab', tab);
    window.location.hash = tab;
  };

  // Cart operations
  const addToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.title.slice(0, 25)}..." to Cart!`);
  };

  const updateCartQty = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (id, e) => {
    if (e) e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 999 || cartSubtotal === 0 ? 0 : 99;
  const cartTotal = cartSubtotal + shippingFee;

  // Pricing formula
  const calculatePricing = (mat, lab, cat) => {
    const markup = categoryMarkups[cat] || categoryMarkups['Pottery / Terracotta'];
    const baseCost = (parseFloat(mat) || 0) + (parseFloat(lab) || 0);
    if (baseCost <= 0) {
      setPricingResult(null);
      return;
    }
    const minP = Math.round((baseCost * (1 + markup.min)) / 10) * 10;
    const maxP = Math.round((baseCost * (1 + markup.max)) / 10) * 10;

    setPricingResult({
      baseCost,
      min: minP,
      max: maxP,
      markupRange: markup.label
    });
  };



  // PILLAR 2: Web Speech API & Multilingual Voice Auto-Cataloger Logic
  const speechRecRef = useRef(null);
  const isRecordingRef = useRef(false);
  const mediaStreamRef = useRef(null);

  const stopVoiceRecording = async () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (speechTranslateTimeoutRef.current) {
      clearTimeout(speechTranslateTimeoutRef.current);
    }

    if (speechRecRef.current) {
      try {
        speechRecRef.current.onend = null;
        speechRecRef.current.onerror = null;
        speechRecRef.current.stop();
      } catch (e) {}
      speechRecRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }

    showToast('🔴 Mic Stopped.');

    if (rawSpokenHindi && rawSpokenHindi.trim()) {
      setIsTranslating(true);
      const english = await translateHindiSpeechToEnglish(rawSpokenHindi);
      if (english) {
        setVoiceText(english);
      }
      setIsTranslating(false);
    }
  };

    const toggleVoiceRecording = async () => {
    if (isRecordingRef.current) {
      stopVoiceRecording();
      return;
    }

    // 1. Explicitly request hardware Microphone stream permission from browser
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }
    } catch (micErr) {
      console.warn('getUserMedia mic error or permission denied:', micErr);
      showToast('⚠️ Please click "Allow" in your browser microphone permission pop-up!');
    }

    // 2. Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('⚠️ Speech recognition API not supported on this browser window. You can type or select a voice preset below!');
      return;
    }

    try {
      if (speechRecRef.current) {
        try { speechRecRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      speechRecRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        // Clear default terracotta placeholder text if present when starting a new mic recording
        setVoiceText(prev => {
          if (prev.includes('Yeh Jaipur ki pure terracotta clay water pot hai')) return '';
          return prev;
        });
        showToast(`🎙️ Mic ACTIVE (${selectedLanguage === 'hi-IN' ? 'Hindi' : selectedLanguage === 'bn-IN' ? 'Bengali' : selectedLanguage === 'ta-IN' ? 'Tamil' : 'English'}). Speak now!`);
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        let isFinalSegment = false;
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0] && item[0].transcript) {
            fullTranscript += item[0].transcript + ' ';
            if (item.isFinal) isFinalSegment = true;
          }
        }
        const cleaned = fullTranscript.trim();
        if (cleaned) {
          setRawSpokenHindi(cleaned);

          if (speechTranslateTimeoutRef.current) {
            clearTimeout(speechTranslateTimeoutRef.current);
          }

          // Debounce translation: wait 500ms after speech pause or trigger on final
          speechTranslateTimeoutRef.current = setTimeout(async () => {
            setIsTranslating(true);
            const englishText = await translateHindiSpeechToEnglish(cleaned);
            if (englishText) {
              setVoiceText(englishText);
              showToast(`✨ Auto-translated to English: "${englishText.slice(0, 28)}..."`);
            }
            setIsTranslating(false);
          }, isFinalSegment ? 100 : 500);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isRecordingRef.current = false;
          setIsRecording(false);
          showToast('⚠️ Mic access denied! Click the lock/mic icon in your address bar to enable mic.');
        } else if (event.error === 'no-speech') {
          // Ambient silence timeout, maintain recording
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setTimeout(() => {
              if (isRecordingRef.current) {
                try { recognition.start(); } catch (err) {}
              }
            }, 300);
          }
        } else {
          setIsRecording(false);
        }
      };

      isRecordingRef.current = true;
      setIsRecording(true);
      recognition.start();
    } catch (err) {
      console.error('Mic start error:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      showToast('⚠️ Could not open microphone. Please verify mic permissions.');
    }
  };

  const parseVoiceTextToCatalog = (text) => {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();

    // 1. Heritage Region Detection (Hindi, Hinglish & Devanagari)
    let region = 'Artisan Heritage Cluster, India';
    if (/jaipur|rajasthan|जयपुर|राजस्थान/i.test(lower)) region = 'Jaipur, Rajasthan';
    else if (/banaras|varanasi|बनारस|वाराणसी|काशी/i.test(lower)) region = 'Varanasi, Uttar Pradesh';
    else if (/channapatna|karnataka|चन्नापटना|कर्नाटक/i.test(lower)) region = 'Channapatna, Karnataka';
    else if (/kanchipuram|tamil|कांचीपुरम/i.test(lower)) region = 'Kanchipuram, Tamil Nadu';
    else if (/khurja|खुर्जा/i.test(lower)) region = 'Khurja, Uttar Pradesh';
    else if (/madhubani|mithila|bihar|मधुबनी|मिथिला/i.test(lower)) region = 'Mithila, Bihar';
    else if (/kashmir|srinagar|कश्मीर/i.test(lower)) region = 'Srinagar, Kashmir';
    else if (/bengal|kolkata|shantiniketan|बंगाल/i.test(lower)) region = 'Kolkata, West Bengal';
    else if (/kutch|gujarat|कच्छ|गुजरात/i.test(lower)) region = 'Kutch, Gujarat';
    else if (/moradabad|मुरादाबाद/i.test(lower)) region = 'Moradabad, Uttar Pradesh';
    else if (/saharanpur|सहारनपुर/i.test(lower)) region = 'Saharanpur, Uttar Pradesh';
    else if (/puri|odisha|ओडिशा|पुरी/i.test(lower)) region = 'Puri, Odisha';

    // 2. Category, Material, Technique & Standard English Product Name
    let category = 'Artisanal Handicrafts';
    let englishProduct = 'Artisan Heritage Craft Item';
    let primaryMaterial = 'Authentic Eco-Friendly Natural Material';
    let technique = 'Master Handcrafted Artisan Technique';
    let careInstructions = 'Wipe gently with a soft dry or slightly damp cloth. Avoid harsh chemical cleaners.';

    if (/(matka|ghada|kalash|surahi|pot|pottery|terracotta|clay|miti|mitti|ceramic|vase|planter|kulhad|handi|pitcher|घड़ा|घड़ा|मटका|कलश|मिट्टी|सुराही|गमला|कुल्हड़|कुल्हड़)/i.test(lower)) {
      category = 'Pottery / Terracotta';
      primaryMaterial = /ceramic|चीनी मिट्टी/i.test(lower) ? 'High-Grade Kiln-Fired Glazed Ceramic' : 'Natural Kiln-Fired Terracotta Clay';
      technique = 'Traditional Potter Wheel Shaping, Hand-Burnishing & Kiln Baking';
      careInstructions = 'Rinse with fresh water; sun dry naturally. Do not wash with harsh synthetic soaps or wire scrubbers.';

      if (/vase|फूलदान/i.test(lower)) englishProduct = 'Ceramic Floral Decorative Vase';
      else if (/surahi|सुराही/i.test(lower)) englishProduct = 'Earthen Long-Neck Water Flask (Surahi)';
      else if (/planter|gamla|गमला/i.test(lower)) englishProduct = 'Artisanal Terracotta Planter Pot';
      else if (/kulhad|cup|कुल्हड़|कुल्हड़/i.test(lower)) englishProduct = 'Traditional Clay Chai Kulhads';
      else if (/handi|हांडी/i.test(lower)) englishProduct = 'Clay Cooking Handi Pot';
      else englishProduct = 'Terracotta Clay Water Pot (Matka)';
    } else if (/(saree|sari|shawl|stole|dupatta|kurta|kurti|handloom|silk|cotton|fabric|cloth|weaving|zari|saadi|poshak|साड़ी|साड़ी|दुपट्टा|शॉल|सिल्क|रेशम|हथकरघा|कुर्ता|कपड़ा|कपड़ा)/i.test(lower)) {
      category = 'Textiles / Handloom';
      primaryMaterial = /cotton|khadi|सूती|कॉटन/i.test(lower) ? '100% Organic Handspun Khadi Cotton' : 'Pure Mulberry Handloom Silk with Natural Dyes';
      technique = 'Interlocking Pit-Loom / Shuttle Handloom Weaving';
      careInstructions = 'Dry clean recommended for silk and zari. Hand wash separately in cold water with mild detergent for organic cotton.';

      if (/saree|sari|साड़ी|साड़ी/i.test(lower)) englishProduct = 'Heritage Handloom Saree';
      else if (/dupatta|chunni|दुपट्टा/i.test(lower)) englishProduct = 'Artisanal Woven Dupatta Stole';
      else if (/shawl|stole|शॉल/i.test(lower)) englishProduct = 'Fine Artisan Winter Shawl';
      else if (/kurta|kurti|कुर्ता/i.test(lower)) englishProduct = 'Handwoven Tunic Kurta';
      else englishProduct = 'Handloom Woven Textile';
    } else if (/(wood|wooden|lakdi|timber|teak|sheesham|toy|khilona|carving|carved|channapatna|लकड़ी|लकड़ी|खिलौना|नक्काशी|शीशम)/i.test(lower)) {
      category = 'Woodwork';
      primaryMaterial = 'Natural Seasoned Hardwood (Teak / Sheesham) with Plant-Based Organic Lacquer';
      technique = 'Hand-Lathe Turning, Chisel Relief Carving & Natural Polish';
      careInstructions = 'Wipe with a clean dry microfiber cloth. Keep away from direct excessive moisture and prolonged sunlight.';

      if (/toy|khilona|elephant|हाथी|खिलौना/i.test(lower)) englishProduct = 'Eco-Friendly Hand-Carved Wooden Toy';
      else if (/box|dabba|sandook|डिब्बा/i.test(lower)) englishProduct = 'Intricately Carved Wooden Keepsake Box';
      else if (/stool|chowki|चौकी/i.test(lower)) englishProduct = 'Hand-Carved Traditional Wooden Chowki Stool';
      else englishProduct = 'Hand-Carved Hardwood Artifact';
    } else if (/(diya|deepak|peetal|brass|copper|taamba|thali|statue|idol|bell|metal|दीया|दिया|दीपक|पीतल|तांबा|मूर्ति|थाली|घंटी)/i.test(lower)) {
      category = 'Metal craft';
      primaryMaterial = /copper|तांबा/i.test(lower) ? 'Pure Hammered Copper' : 'Solid Sand-Cast Brass with Antique Luster';
      technique = 'Traditional Lost-Wax Sand Casting & Hand Chisel Engraving';
      careInstructions = 'Clean gently using pitambari powder, lemon juice, or salt-flour paste. Wipe dry immediately with cotton.';

      if (/diya|deepak|दीया|दीपक/i.test(lower)) englishProduct = 'Hand-Cast Solid Brass Oil Diya Lamp';
      else if (/thali|थाली/i.test(lower)) englishProduct = 'Engraved Brass Ritual Puja Thali';
      else if (/bell|ghanta|घंटी/i.test(lower)) englishProduct = 'Traditional Temple Gong Bell';
      else if (/idol|murti|statue|मूर्ति/i.test(lower)) englishProduct = 'Handcrafted Deity Brass Sculpture';
      else englishProduct = 'Traditional Cast Brass Artware';
    } else if (/(painting|canvas|madhubani|warli|pattachitra|art|चित्र|पेंटिंग|मधुबनी|वारली|चित्रकारी)/i.test(lower)) {
      category = 'Folk Paintings & Art';
      primaryMaterial = 'Handmade Cotton Rag Canvas & Mineral / Botanical Pigments';
      technique = 'Fine Bamboo Twig Nib Drawing & Natural Folk Brushwork';
      careInstructions = 'Frame under UV-resistant museum glass. Keep in a dry, ventilated indoor space.';

      if (/madhubani|मधुबनी/i.test(lower)) englishProduct = 'Authentic Madhubani Folk Art Painting';
      else if (/warli|वारली/i.test(lower)) englishProduct = 'Traditional Warli Tribal Canvas Art';
      else englishProduct = 'Hand-Painted Traditional Folk Painting';
    } else if (/(jhumka|jhumki|earring|necklace|haar|bangle|kangan|churi|silver|jewel|jewelry|झुमका|गहने|चांदी|कंगन|चूड़ी)/i.test(lower)) {
      category = 'Jewelry (traditional)';
      primaryMaterial = '925 Sterling Silver Finish / Antique Oxidized Alloy with Semi-Precious Stones';
      technique = 'Hand-Twisted Wire Filigree, Bezel Setting & Hand Stamping';
      careInstructions = 'Store in an airtight pouch away from perfumes and moisture. Polish with a soft jewelry cloth.';

      if (/jhumka|jhumki|earring|झुमका/i.test(lower)) englishProduct = 'Handcrafted Filigree Jhumka Earrings';
      else if (/necklace|haar|हार/i.test(lower)) englishProduct = 'Artisan Beaded Statement Necklace';
      else if (/bangle|kangan|churi|कंगन/i.test(lower)) englishProduct = 'Traditional Lac & Metal Bangles';
      else englishProduct = 'Handmade Traditional Ethnic Jewelry';
    }

    // 3. Motif & Embellishment Extraction
    let motif = '';
    if (/floral|phool|phul|flower|कमल|फूल/i.test(lower)) motif = 'Intricate Floral & Botanical Motifs';
    else if (/peacock|mor|mayur|मयूर|मोर/i.test(lower)) motif = 'Graceful Royal Peacock Motifs';
    else if (/elephant|haathi|gaj|हाथी/i.test(lower)) motif = 'Royal Heritage Elephant Engravings';
    else if (/zari|zardozi|जरी|कढ़ाई|embroidery/i.test(lower)) motif = 'Opulent Metallic Zari Embroidery';
    else if (/fish|machli|मछली/i.test(lower)) motif = 'Traditional Auspicious Fish Motifs';
    else if (/geometric|jaali|jali|जाली/i.test(lower)) motif = 'Fine Geometric Jaali Lattice Work';
    else if (/carved|nakshi|carving|नक्काशी/i.test(lower)) motif = 'Hand-Carved Relief Accents';

    // 4. Capacity / Dimension Extraction
    let dimensionStr = '';
    const capMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:liter|litre|l|ltr|लीटर)/i);
    if (capMatch) dimensionStr = `(${capMatch[1]}L)`;
    const lenMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:meter|metre|m|मीटर)/i);
    if (lenMatch) dimensionStr = `(${lenMatch[1]}m)`;
    const wtMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|gram|gm|g|किलो|ग्राम)/i);
    if (wtMatch && !dimensionStr) dimensionStr = `(${wtMatch[1]}${wtMatch[0].includes('k') ? 'kg' : 'g'})`;

    // 5. Build English Title (grammatically correct, clean standard ecommerce title)
    const regionName = region.split(',')[0].trim();
    const titleParts = ['Handcrafted'];
    if (regionName && regionName !== 'Artisan Heritage Cluster') {
      titleParts.push(regionName);
    }
    titleParts.push(englishProduct);
    if (motif) {
      titleParts.push(`with ${motif}`);
    }
    if (dimensionStr) {
      titleParts.push(dimensionStr);
    }
    const title = titleParts.join(' ');

    // 6. Build Grammatically Correct, Professional English Description
    const long_desc = `This ${title} is authentically handcrafted by master artisan families in ${region}. Expertly shaped and finished using ${primaryMaterial} with ${technique}${motif ? `, highlighting ${motif}` : ''}. Every piece preserves generations of living Indian craft heritage, offering 100% eco-friendly utility and fair-wage empowerment under verified ONDC standards. Care: ${careInstructions}`;

    // 7. Dynamic Pricing Calculation
    let minPrice = pricingResult?.min;
    let maxPrice = pricingResult?.max;

    if (!minPrice || minPrice === 0) {
      if (category.includes('Textiles')) { minPrice = 1850; maxPrice = 2400; }
      else if (category.includes('Pottery')) { minPrice = 480; maxPrice = 580; }
      else if (category.includes('Metal')) { minPrice = 1250; maxPrice = 1600; }
      else if (category.includes('Woodwork')) { minPrice = 650; maxPrice = 850; }
      else if (category.includes('Jewelry')) { minPrice = 950; maxPrice = 1350; }
      else { minPrice = 550; maxPrice = 750; }
    }

    const entities = {
      material: primaryMaterial,
      technique: technique,
      region: region,
      motif: motif || 'Traditional Heritage Design',
      care: careInstructions,
      use_case: `${category} Heritage Craft`
    };

    const catalog = {
      product_id: `KAARVO-${Math.floor(100000 + Math.random() * 900000)}`,
      artisan_id: 'ART-00456',
      category: category,
      descriptor: {
        name: title,
        long_desc: long_desc,
        images: [enhancedImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80']
      },
      price: {
        currency: 'INR',
        suggested_range: { min: minPrice, max: maxPrice },
        breakdown: {
          material_cost: materialCost || 180,
          labor_cost: laborCost || 150,
          category_margin_pct: 40
        }
      },
      ondc_beckn_compliant: true
    };

    return { entities, catalog };
  };

  const handleGenerateCatalogFromVoice = async () => {
    if (!voiceText || !voiceText.trim()) {
      showToast('⚠️ Please enter or record a voice note first!');
      return;
    }
    setCataloging(true);
    try {
      setTimeout(() => {
        const { entities, catalog } = parseVoiceTextToCatalog(voiceText);
        setExtractedEntities(entities);
        setGeneratedCatalog(catalog);
        setCataloging(false);
        showToast('✨ ONDC Beckn Catalog Schema Generated via AI Voice NLP!');
      }, 600);
    } catch (err) {
      console.error(err);
      setCataloging(false);
    }
  };

  // Save generated product to DB & Publish Live to Storefront for all customers
  const handleSaveCatalogToDB = async () => {
    // ALWAYS parse the latest voiceText and inputs from Pillar 1, 2, & 3
    const { catalog, entities } = parseVoiceTextToCatalog(voiceText || 'Handcrafted Artisan Product');
    setExtractedEntities(entities);
    setGeneratedCatalog(catalog);

    // Pick active image uploaded/enhanced in Pillar 1 or raw image file
    const activeImage = enhancedImage || rawImageFile || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80';

    // Pick active pricing from Pillar 3 or catalog calculated range
    const activePrice = pricingResult?.min || catalog.price.suggested_range.min || (parseFloat(materialCost || 0) + parseFloat(laborCost || 0)) * 1.4 || 480;

    const newP = {
      id: Date.now(),
      title: catalog.descriptor.name,
      description: catalog.descriptor.long_desc,
      price: Math.round(activePrice),
      originalPrice: Math.round(activePrice * 1.25),
      category: catalog.category,
      status: 'published',
      material_cost: materialCost || 180,
      labor_cost: laborCost || 150,
      artisan: 'Ramswaroop Prajapat',
      location: entities?.region || 'Jaipur, Rajasthan',
      rating: 5.0,
      reviewsCount: 1,
      image: activeImage,
      badge: 'Newly Posted'
    };

    // Prepend immediately to products array so it displays at the top of the Customer Storefront
    setProducts(prev => [newP, ...prev.filter(p => p.id !== newP.id)]);

    try {
      await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
    } catch (err) {
      console.warn('Backend save notice:', err);
    }

    showToast(`🎉 "${newP.title.slice(0, 30)}" Posted Live to Customer Store!`);
    
    // Refresh & Reset Studio form for next product listing
    setEnhancedImage(null);
    setRawImageFile(null);
    setVoiceText('');
    setExtractedEntities(null);
    setGeneratedCatalog(null);
    setMaterialCost('');
    setLaborCost('');
    setPricingResult(null);
    if (isRecordingRef.current) {
      stopVoiceRecording();
    }

    switchMode('customer');
    switchCustomerTab('shop');
  };

  // Delete product handler for artisan/user
  const handleDeleteProduct = async (productId, e) => {
    if (e) e.stopPropagation();

    const targetProduct = products.find(p => p.id === productId);
    const title = targetProduct ? targetProduct.title : 'this product';

    if (!window.confirm(`Are you sure you want to delete "${title}" from your store?`)) {
      return;
    }

    try {
      await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend delete notice:', err);
    }

    setProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
    showToast(`🗑️ Product "${title.slice(0, 22)}..." deleted successfully!`);
  };

  // Customer AI Shopping query handler
  const handleAiShoppingQuery = (promptText) => {
    const q = promptText || aiShoppingInput;
    if (!q.trim()) return;

    setAiShoppingInput('');
    setAiShoppingLoading(true);

    setTimeout(() => {
      let recs = products.slice(0, 2);
      if (q.toLowerCase().includes('gift') || q.toLowerCase().includes('1500')) {
        recs = products.filter(p => p.price <= 1500);
      } else if (q.toLowerCase().includes('silk') || q.toLowerCase().includes('saree')) {
        recs = products.filter(p => p.category.includes('Textiles'));
      } else if (q.toLowerCase().includes('pottery') || q.toLowerCase().includes('terracotta')) {
        recs = products.filter(p => p.category.includes('Pottery'));
      }

      setAiShoppingHistory(prev => [
        ...prev,
        { sender: 'user', text: q },
        {
          sender: 'ai',
          text: `Based on your query "${q}", here are authentic handcrafted recommendations directly from verified Indian artisans:`,
          recommendedProducts: recs.length > 0 ? recs : products.slice(0, 2)
        }
      ]);
      setAiShoppingLoading(false);
    }, 800);
  };

  // Artisan Copilot Send
  const handleCopilotSend = (prompt) => {
    const q = prompt || copilotInput;
    if (!q.trim()) return;
    setCopilotHistory(prev => [...prev, { sender: 'artisan', content: q }]);
    setCopilotInput('');
    setCopilotLoading(true);

    setTimeout(() => {
      setCopilotHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          content: `🤖 Kaarvo Copilot Recommendation: Analyzed your inventory and market trends for "${q}". Demand is up 24% for Rajasthan pottery. Recommended action: Increase pricing margin by 5% and publish a Diwali campaign.`
        }
      ]);
      setCopilotLoading(false);
    }, 700);
  };

  // Place Order
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const firstItem = cartItems[0] || products[0];
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: firstItem.id,
          quantity: cartItems.length || 1,
          customer_name: checkoutData.name,
          shipping_address: `${checkoutData.address}, ${checkoutData.city} ${checkoutData.pincode}`
        })
      });

      let placedOrder;
      if (res.ok) {
        placedOrder = await res.json();
      } else {
        placedOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_name: checkoutData.name,
          total_price: cartTotal || 480,
          status: 'paid'
        };
      }

      setOrders(prev => [placedOrder, ...prev]);
      setCartItems([]);
      setIsPlacingOrder(false);
      setCheckoutStep(4);
      showToast('🎉 Order Placed Successfully!');
    } catch (err) {
      console.error(err);
      setIsPlacingOrder(false);
      setCheckoutStep(4);
      setCartItems([]);
    }
  };

  // Filtered products list for Customer Shop View
  const filteredProducts = products.filter(p => {
    const q = customerSearchQuery.toLowerCase();
    const matchesCategory = activeCategoryFilter === 'All' || p.category === activeCategoryFilter;
    const matchesSearch = !q || (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.artisan && p.artisan.toLowerCase().includes(q))
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
      
      {/* GLOBAL TOP CONTROL BAR (MODE SWITCHER) */}
      <div style={{
        background: 'var(--bg-dark)',
        color: '#A8A29E',
        padding: '6px 28px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #292524'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
          <span style={{ color: '#F5F5F4', fontWeight: '600' }}>Kaarvo AI Commerce OS</span>
          <span style={{ color: '#78716C' }}>• SIH26090 MoSJE Market Linkage</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#292524', padding: '3px', borderRadius: '20px' }}>
          <button
            onClick={() => switchMode('customer')}
            style={{
              background: mode === 'customer' ? 'var(--primary)' : 'transparent',
              color: mode === 'customer' ? '#FFFFFF' : '#A8A29E',
              border: 'none',
              padding: '4px 14px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Store size={13} /> Customer Marketplace
          </button>
          <button
            onClick={() => switchMode('artisan')}
            style={{
              background: mode === 'artisan' ? 'var(--primary)' : 'transparent',
              color: mode === 'artisan' ? '#FFFFFF' : '#A8A29E',
              border: 'none',
              padding: '4px 14px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={13} /> Artisan Business OS
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION CONTAINER */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast-item">
            <CheckCircle size={16} color="#10B981" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: CUSTOMER MARKETPLACE & SHOPPING EXPERIENCE                        */}
      {/* ========================================================================= */}
      {mode === 'customer' && (
        <>
          {/* CUSTOMER STICKY NAVBAR */}
          <header style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '16px 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              {/* BRAND LOGO */}
              <div
                onClick={() => switchCustomerTab('home')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '22px'
                }}>
                  🪔
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: '1' }}>
                    Kaarvo<span style={{ color: 'var(--primary)' }}>.</span>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
                    CRAFTED BY HAND • AI POWERED
                  </div>
                </div>
              </div>

              {/* NAVIGATION LINKS */}
              <nav className="hide-mobile" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'shop', label: 'Explore Crafts' },
                  { id: 'ai_ask', label: '✨ Ask Kaarvo AI' },
                  { id: 'stories', label: 'Craft Stories' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => switchCustomerTab(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '15px',
                      fontWeight: customerTab === item.id ? '700' : '500',
                      color: customerTab === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '6px 0',
                      borderBottom: customerTab === item.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* ACTIONS: WISHLIST & CART */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => switchCustomerTab('shop')}
                  style={{ background: 'var(--bg-subtle)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Search size={18} color="var(--text-secondary)" />
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  style={{
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--primary)',
                    padding: '9px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShoppingCart size={17} />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span style={{ background: 'var(--primary)', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                      {cartItems.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  )}
                </button>

                <button
                  className="btn-artisan-secondary hide-mobile"
                  onClick={() => switchMode('artisan')}
                  style={{ fontSize: '13px', padding: '9px 16px' }}
                >
                  Start Selling →
                </button>
              </div>
            </div>
          </header>

          {/* MAIN CUSTOMER BODY */}
          <main style={{ flex: 1 }}>

            {/* VIEW 1: CUSTOMER HOME PAGE */}
            {customerTab === 'home' && (
              <div>
                
                {/* 1. TWO-COLUMN HERO SECTION */}
                <section style={{
                  padding: '60px 0 80px',
                  background: 'linear-gradient(180deg, #FAF9F5 0%, #F3F1E9 100%)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <div className="container-wide">
                    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
                      
                      {/* LEFT HERO COLUMN */}
                      <div>
                        <span className="badge-tag badge-terracotta" style={{ marginBottom: '16px' }}>
                          🇮🇳 MoSJE & ONDC Verified Artisan Network
                        </span>
                        
                        <h1 className="font-serif" style={{ fontSize: '54px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.12', marginBottom: '20px' }}>
                          Crafted by Hand. <br />
                          <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Powered by AI.</span>
                        </h1>
                        
                        <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '580px' }}>
                          Discover authentic handcrafted treasures directly from master Indian artisans. Powered by AI voice cataloging, fair trade pricing, and direct market linkage.
                        </p>

                        {/* HERO CTA BUTTONS */}
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '40px', flexWrap: 'wrap' }}>
                          <button className="btn-artisan-primary" onClick={() => switchCustomerTab('shop')} style={{ padding: '14px 32px', fontSize: '16px' }}>
                            Explore Products <ArrowRight size={18} />
                          </button>
                          <button className="btn-artisan-secondary" onClick={() => switchMode('artisan')} style={{ padding: '14px 28px', fontSize: '15px' }}>
                            Start Selling
                          </button>
                        </div>

                        {/* VISUALLY IMPORTANT AI SEARCH BOX */}
                        <div className="card-artisan" style={{ padding: '14px 18px', background: '#FFFFFF', boxShadow: '0 12px 32px rgba(28, 25, 23, 0.08)' }}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={16} /> ✨ Ask Kaarvo AI — What are you looking for?
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="text"
                              value={customerSearchQuery}
                              onChange={(e) => setCustomerSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && switchCustomerTab('shop')}
                              placeholder="e.g. 'Find me a handmade gift under ₹1500'"
                              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: 'var(--text-main)', background: 'transparent' }}
                            />
                            <button
                              className="btn-artisan-primary"
                              onClick={() => switchCustomerTab('shop')}
                              style={{ padding: '10px 20px', fontSize: '13px' }}
                            >
                              Search
                            </button>
                          </div>

                          {/* SUGGESTION CHIPS */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {[
                              'Handmade gift under ₹1500',
                              'Traditional Indian crafts',
                              'Home decor',
                              'Wedding gifts'
                            ].map(chip => (
                              <button
                                key={chip}
                                onClick={() => {
                                  setCustomerSearchQuery(chip);
                                  switchCustomerTab('shop');
                                }}
                                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '5px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', cursor: 'pointer' }}
                              >
                                "{chip}"
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* RIGHT HERO COLUMN: ARTISAN & PRODUCT COLLAGE */}
                      <div className="hide-mobile" style={{ position: 'relative' }}>
                        <div style={{ height: '480px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
                          <img
                            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80"
                            alt="Jaipur Terracotta Pottery"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        {/* FLOATING ARTISAN BADGE CARD */}
                        <div className="card-artisan" style={{ position: 'absolute', top: '24px', left: '-20px', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                            🏺
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '800' }}>Ramswaroop Prajapat</div>
                            <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>Master Potter • Jaipur, Rajasthan</div>
                          </div>
                        </div>

                        {/* FLOATING DIRECT PROCEEDS CARD */}
                        <div className="card-artisan" style={{ position: 'absolute', bottom: '24px', right: '-20px', padding: '16px 20px', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>FAIR TRADE COST TRANSPARENCY</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>₹480 <span style={{ fontSize: '12px', color: '#10B981' }}>(100% Direct to Artisan)</span></div>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* 2. IMAGE-FOCUSED CATEGORIES SECTION */}
                <section style={{ padding: '80px 0', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="container-wide">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                      <div>
                        <span className="badge-tag badge-gold" style={{ marginBottom: '8px' }}>Heritage Craftsmanship</span>
                        <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>Explore By Craft Category</h2>
                      </div>
                      <button className="btn-artisan-outline" onClick={() => switchCustomerTab('shop')}>
                        View All Categories →
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                      {[
                        { name: 'Pottery / Terracotta', count: '120+ Products', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Textiles / Handloom', count: '350+ Products', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Metal craft', count: '90+ Products', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Woodwork', count: '140+ Products', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80' },
                        { name: 'Jewelry (traditional)', count: '210+ Products', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' }
                      ].map(cat => (
                        <div
                          key={cat.name}
                          className="card-artisan"
                          onClick={() => {
                            setActiveCategoryFilter(cat.name);
                            switchCustomerTab('shop');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="product-card-img-wrapper" style={{ height: '180px' }}>
                            <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '16px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{cat.name}</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.count}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. TRENDING PRODUCTS GRID (4 CARDS PER ROW DESKTOP) */}
                <section style={{ padding: '80px 0' }}>
                  <div className="container-wide">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                      <div>
                        <span className="badge-tag badge-terracotta" style={{ marginBottom: '8px' }}>Direct Market Linkage</span>
                        <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>Trending Artisan Products</h2>
                      </div>
                      <button className="btn-artisan-outline" onClick={() => switchCustomerTab('shop')}>
                        Browse Shop Catalog →
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <div className="card-artisan" style={{ padding: '48px 24px', textAlign: 'center', background: '#FFFFFF' }}>
                        <Package size={42} color="var(--primary)" style={{ marginBottom: '14px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>No Published Products Yet</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px' }}>
                          Be the first artisan to publish authentic handicrafts using our 3-Pillar AI Studio (Photo & Voice auto-cataloger)!
                        </p>
                        <button className="btn-artisan-primary" onClick={() => switchMode('artisan')} style={{ padding: '12px 24px' }}>
                          + Catalog Product in 3-Pillar AI Studio
                        </button>
                      </div>
                    ) : (
                      <div className="desktop-grid-4">
                        {products.map(p => (
                        <div
                          key={p.id}
                          className="card-artisan"
                          onClick={() => setSelectedProduct(p)}
                          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                        >
                          <div>
                            {/* PRODUCT IMAGE & WISHLIST */}
                            <div className="product-card-img-wrapper" style={{ height: '240px' }}>
                              <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              
                              <button
                                onClick={(e) => toggleWishlist(p.id, e)}
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  right: '12px',
                                  background: 'rgba(255,255,255,0.85)',
                                  backdropFilter: 'blur(4px)',
                                  border: 'none',
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  zIndex: 2
                                }}
                              >
                                <Heart size={18} color={wishlist.includes(p.id) ? '#E11D48' : '#78716C'} fill={wishlist.includes(p.id) ? '#E11D48' : 'none'} />
                              </button>

                              <button
                                onClick={(e) => handleDeleteProduct(p.id, e)}
                                title="Delete Product"
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  left: '12px',
                                  background: 'rgba(239, 68, 68, 0.95)',
                                  color: '#FFFFFF',
                                  backdropFilter: 'blur(4px)',
                                  border: 'none',
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  zIndex: 2,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                              >
                                <Trash2 size={16} />
                              </button>

                              <span className="badge-tag badge-terracotta" style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(255,255,255,0.94)' }}>
                                {p.badge || 'Fair Trade'}
                              </span>
                            </div>

                            {/* CARD CONTENT */}
                            <div style={{ padding: '18px 18px 0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <MapPin size={12} /> {p.artisan || 'Master Artisan'}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '700', color: '#D97706' }}>
                                  <Star size={12} fill="#D97706" /> {p.rating || 4.9}
                                </span>
                              </div>

                              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.35', height: '42px', overflow: 'hidden' }}>
                                {p.title}
                              </h3>
                            </div>
                          </div>

                          {/* PRICE & ADD TO CART */}
                          <div style={{ padding: '16px 18px 18px', borderTop: '1px solid var(--border-subtle)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>₹{p.price}</span>
                              {p.originalPrice && (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>₹{p.originalPrice}</span>
                              )}
                            </div>

                            <button
                              className="btn-artisan-primary"
                              onClick={(e) => addToCart(p, e)}
                              style={{ padding: '8px 14px', fontSize: '13px' }}
                            >
                              <ShoppingCart size={15} /> Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </section>

                {/* 4. HOW KAARVO WORKS SECTION */}
                <section style={{ padding: '80px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="container-wide">
                    <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
                      <span className="badge-tag badge-gold" style={{ marginBottom: '8px' }}>Simple & Transparent</span>
                      <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>How Kaarvo Works</h2>
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Empowering artisans through AI innovation and transparent ONDC market linkage.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                      {[
                        { step: '01', title: 'Discover Crafts', desc: 'Browse verified handcrafted products cataloged directly from artisan clusters across India.', icon: '🏺' },
                        { step: '02', title: 'Ask Kaarvo AI', desc: 'Use natural voice or search queries to find exact products tailored to your occasion and budget.', icon: '✨' },
                        { step: '03', title: 'Direct Purchase', desc: 'Orders are processed directly to the artisan via ONDC Beckn protocol with 100% fair trade proceeds.', icon: '📦' }
                      ].map(item => (
                        <div key={item.step} className="card-artisan" style={{ padding: '32px', textAlign: 'center' }}>
                          <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                          <span className="badge-tag badge-terracotta" style={{ marginBottom: '12px' }}>Step {item.step}</span>
                          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{item.title}</h3>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 5. FEATURED ARTISANS SECTION */}
                <section style={{ padding: '80px 0' }}>
                  <div className="container-wide">
                    <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
                      <span className="badge-tag badge-terracotta" style={{ marginBottom: '8px' }}>Meet The Makers</span>
                      <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>Master Indian Artisans</h2>
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Meet the heritage craftspeople keeping ancient Indian arts alive.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
                      {[
                        {
                          name: 'Ramswaroop Prajapat',
                          craft: 'Master Terracotta Potter',
                          location: 'Jaipur, Rajasthan',
                          desc: '4th generation potter preserving eco-friendly clay water vessels with hand-carved relief motifs.',
                          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80'
                        },
                        {
                          name: 'Sunita Devi Weaver Guild',
                          craft: 'Chanderi Silk Weaver',
                          location: 'Chanderi, Madhya Pradesh',
                          desc: 'Weaving regal Chanderi sarees on handloom frames with gold zari heritage peacock motifs.',
                          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80'
                        },
                        {
                          name: 'Bishnu Jhara',
                          craft: 'Dhokra Metal Artisan',
                          location: 'Bastar, Chhattisgarh',
                          desc: 'Practicing 4,000-year-old lost-wax metal casting technique to create solid brass tribal figurines.',
                          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80'
                        }
                      ].map(artisan => (
                        <div key={artisan.name} className="card-artisan" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                            <img src={artisan.image} alt={artisan.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <span className="badge-tag badge-terracotta" style={{ fontSize: '10px', marginBottom: '4px' }}>Verified Artisan</span>
                              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{artisan.name}</h3>
                              <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>{artisan.craft}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {artisan.location}</p>
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>{artisan.desc}</p>
                          <button className="btn-artisan-outline" onClick={() => switchCustomerTab('shop')} style={{ width: '100%' }}>
                            View Artisan Products →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 6. DEDICATED PERSONAL CRAFT ASSISTANT SECTION */}
                <section style={{ padding: '80px 0', background: 'var(--primary-light)', borderTop: '1px solid var(--primary-border)', borderBottom: '1px solid var(--primary-border)' }}>
                  <div className="container-wide">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
                      <div>
                        <span className="badge-tag badge-terracotta" style={{ marginBottom: '12px' }}>AI Shopping Innovation</span>
                        <h2 className="font-serif" style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
                          Your Personal Craft Assistant
                        </h2>
                        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                          Ask Kaarvo AI anything using natural language voice or text. Get intelligent recommendations tailored to your exact budget, occasion, and style.
                        </p>
                        <button className="btn-artisan-primary" onClick={() => switchCustomerTab('ai_ask')} style={{ padding: '14px 28px' }}>
                          Try Ask Kaarvo AI →
                        </button>
                      </div>

                      <div className="card-artisan" style={{ padding: '24px', background: '#FFFFFF' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles size={16} /> Live AI Shopping Query Demo
                        </div>
                        <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', fontSize: '13px', color: 'var(--text-main)', marginBottom: '14px' }}>
                          "I need a traditional Jaipur gift under ₹1000 for a housewarming."
                        </div>
                        <div style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', marginBottom: '8px' }}>
                          ✓ AI Recommended Product:
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--primary-light)', padding: '12px', borderRadius: '10px' }}>
                          <img src={products[0]?.image} alt="Pottery" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700' }}>{products[0]?.title}</div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>₹{products[0]?.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 7. CRAFT STORIES SECTION */}
                <section style={{ padding: '80px 0', background: 'var(--bg-surface)' }}>
                  <div className="container-wide">
                    <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
                      <span className="badge-tag badge-gold" style={{ marginBottom: '8px' }}>Cultural Preservation</span>
                      <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>Authentic Craft Stories</h2>
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        The people and 4,000-year heritage behind every piece.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                      {[
                        {
                          title: '4,000 Years of Dhokra Metal Casting',
                          artisan: 'Bishnu Jhara • Bastar, Chhattisgarh',
                          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
                          content: 'Dhokra is one of the oldest non-ferrous metal casting techniques known to human civilization, dating back to the Indus Valley Dancing Girl figurine. Using beeswax thread sculpting and clay baking, each mold is broken open after cooling, making every single piece an irreplicable antique.'
                        },
                        {
                          title: 'Jaipur Natural Cooling Clay Pottery',
                          artisan: 'Ramswaroop Prajapat • Jaipur, Rajasthan',
                          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                          content: 'Crafted from rich alluvial Jaipur clay, these water pitchers utilize micro-porous capillary evaporation to naturally cool water down by 5-8°C without electricity or chemical filters.'
                        }
                      ].map((story, i) => (
                        <div key={i} className="card-artisan" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <img src={story.image} alt={story.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px', marginBottom: '20px' }} />
                          <div>
                            <span className="badge-tag badge-terracotta" style={{ marginBottom: '8px' }}>{story.artisan}</span>
                            <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>{story.title}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{story.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 8. STRONG FINAL PRE-FOOTER CTA */}
                <section style={{ padding: '80px 0', background: 'var(--bg-dark)', color: '#FFFFFF', textAlign: 'center' }}>
                  <div className="container-wide" style={{ maxWidth: '800px' }}>
                    <h2 className="font-serif" style={{ fontSize: '42px', fontWeight: '700', marginBottom: '16px' }}>
                      Discover something made differently.
                    </h2>
                    <p style={{ fontSize: '16px', color: '#A8A29E', lineHeight: '1.6', marginBottom: '32px' }}>
                      Support master Indian craftspeople directly with 100% transparent fair-trade pricing and verified heritage quality.
                    </p>
                    <button className="btn-artisan-primary" onClick={() => switchCustomerTab('shop')} style={{ padding: '16px 36px', fontSize: '16px' }}>
                      Explore Crafts Catalog <ArrowRight size={18} />
                    </button>
                  </div>
                </section>

                {/* FOOTER */}
                <footer style={{ background: '#141210', color: '#A8A29E', padding: '48px 0 24px', borderTop: '1px solid #292524' }}>
                  <div className="container-wide">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '36px' }}>
                      <div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#FFF', marginBottom: '8px' }}>
                          Kaarvo<span style={{ color: 'var(--primary)' }}>.</span>
                        </div>
                        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#78716C' }}>
                          AI-Native Commerce Operating System empowering Indian craftspeople under MoSJE Smart India Hackathon initiative.
                        </p>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', marginBottom: '12px' }}>Explore Crafts</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                          <span>Terracotta & Pottery</span>
                          <span>Handloom & Textiles</span>
                          <span>Dhokra Metal Art</span>
                          <span>Saharanpur Woodwork</span>
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', marginBottom: '12px' }}>Platform Standards</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                          <span>✓ ONDC Beckn Protocol</span>
                          <span>✓ Bhashini Multilingual Speech</span>
                          <span>✓ OpenCV Background Removal</span>
                          <span>✓ Transparent Cost-Plus Model</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #292524', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: '#78716C' }}>
                      © 2026 Kaarvo AI. Built for Smart India Hackathon SIH26090. All rights reserved.
                    </div>
                  </div>
                </footer>

              </div>
            )}

            {/* VIEW 2: CUSTOMER CATALOG / SHOP PAGE */}
            {customerTab === 'shop' && (
              <div className="container-wide" style={{ padding: '40px 28px 80px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h1 className="font-serif" style={{ fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>Explore Handcrafted Products</h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Direct market linkage connecting master artisans with customers nationwide.</p>
                </div>

                {/* SEARCH & FILTER CONTROLS */}
                <div className="card-artisan" style={{ padding: '16px 20px', marginBottom: '36px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input-artisan"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search by title, craft, material or artisan region..."
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['All', 'Pottery / Terracotta', 'Textiles / Handloom', 'Metal craft', 'Woodwork', 'Jewelry (traditional)'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                        className={activeCategoryFilter === cat ? 'btn-artisan-primary' : 'btn-artisan-secondary'}
                        style={{ padding: '8px 14px', fontSize: '12px' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PRODUCTS 4-COLUMN DESKTOP GRID */}
                {filteredProducts.length === 0 ? (
                  <div className="card-artisan" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <Search size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>No Products Found</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Try resetting your search query or category filters.</p>
                  </div>
                ) : (
                  <div className="desktop-grid-4">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        className="card-artisan"
                        onClick={() => setSelectedProduct(p)}
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                      >
                        <div>
                          <div className="product-card-img-wrapper" style={{ height: '240px' }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              onClick={(e) => handleDeleteProduct(p.id, e)}
                              title="Delete Product"
                              style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(239, 68, 68, 0.95)',
                                color: '#FFFFFF',
                                backdropFilter: 'blur(4px)',
                                border: 'none',
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>

                            <span className="badge-tag badge-terracotta" style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(255,255,255,0.94)' }}>
                              {p.category}
                            </span>
                          </div>

                          <div style={{ padding: '18px 18px 0' }}>
                            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                              📍 {p.artisan || 'Artisan Guild'} • {p.location || 'India'}
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.35', height: '42px', overflow: 'hidden' }}>
                              {p.title}
                            </h3>
                          </div>
                        </div>

                        <div style={{ padding: '16px 18px 18px', borderTop: '1px solid var(--border-subtle)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>₹{p.price}</span>
                          </div>

                          <button
                            className="btn-artisan-primary"
                            onClick={(e) => addToCart(p, e)}
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                          >
                            <ShoppingCart size={15} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: ASK KAARVO AI SHOPPING ASSISTANT */}
            {customerTab === 'ai_ask' && (
              <div className="container-wide" style={{ maxWidth: '960px', padding: '40px 28px 80px' }}>
                <div className="card-artisan" style={{ padding: '32px', marginBottom: '28px', background: 'linear-gradient(135deg, #FDF4EF, #F3F1E9)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ background: 'var(--primary)', color: '#FFF', padding: '12px', borderRadius: '14px' }}>
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h2 className="font-serif" style={{ fontSize: '28px', fontWeight: '700' }}>Ask Kaarvo AI Craft Assistant</h2>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>Get instant personalized recommendations directly from Indian master artisans.</p>
                    </div>
                  </div>

                  {/* QUICK SUGGESTIONS */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
                    {[
                      'Handmade gift under ₹1500',
                      'Traditional Indian crafts',
                      'Home decor',
                      'Wedding gifts'
                    ].map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handleAiShoppingQuery(prompt)}
                        className="btn-artisan-secondary"
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                      >
                        💡 "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONVERSATION HISTORY */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                  {aiShoppingHistory.map((m, idx) => (
                    <div
                      key={idx}
                      className="card-artisan"
                      style={{
                        padding: '24px',
                        background: m.sender === 'user' ? 'var(--primary-light)' : 'var(--bg-surface)',
                        borderColor: m.sender === 'user' ? 'var(--primary-border)' : 'var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: m.sender === 'user' ? 'var(--primary)' : 'var(--text-main)' }}>
                        {m.sender === 'user' ? '👤 You' : '🤖 Kaarvo AI Assistant'}
                      </div>

                      <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: m.recommendedProducts ? '16px' : '0' }}>
                        {m.text}
                      </p>

                      {/* RECOMMENDED PRODUCTS CARDS */}
                      {m.recommendedProducts && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '14px' }}>
                          {m.recommendedProducts.map(p => (
                            <div key={p.id} style={{ background: 'var(--bg-body)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                              <img src={p.image} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }} />
                              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{p.title}</div>
                              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>₹{p.price}</div>
                              <button className="btn-artisan-primary" onClick={(e) => addToCart(p, e)} style={{ width: '100%', padding: '8px', fontSize: '13px' }}>
                                Add to Cart
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {aiShoppingLoading && (
                    <div className="card-artisan" style={{ padding: '24px', textAlign: 'center', color: 'var(--primary)' }}>
                      <RefreshCw size={22} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
                      Kaarvo AI is searching verified artisan catalog...
                    </div>
                  )}
                </div>

                {/* AI INPUT BAR */}
                <div className="card-artisan" style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="input-artisan"
                    value={aiShoppingInput}
                    onChange={(e) => setAiShoppingInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiShoppingQuery()}
                    placeholder="Ask Kaarvo AI anything e.g. 'Show me traditional Indian crafts under ₹2000'..."
                    style={{ border: 'none' }}
                  />
                  <button className="btn-artisan-primary" onClick={() => handleAiShoppingQuery()} style={{ padding: '12px 24px' }}>
                    <Send size={16} /> Ask
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 4: CRAFT STORIES */}
            {customerTab === 'stories' && (
              <div className="container-wide" style={{ maxWidth: '1080px', padding: '40px 28px 80px' }}>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                  <span className="badge-tag badge-gold" style={{ marginBottom: '8px' }}>Cultural Preservation</span>
                  <h1 className="font-serif" style={{ fontSize: '38px', fontWeight: '700' }}>Heritage Craft Stories</h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Discover the ancient techniques, regional traditions, and artisan families behind every piece.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                  {[
                    {
                      title: '4,000 Years of Dhokra Metal Casting',
                      artisan: 'Bishnu Jhara • Bastar, Chhattisgarh',
                      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
                      content: 'Dhokra is one of the oldest non-ferrous metal casting techniques known to human civilization, dating back to the Indus Valley Dancing Girl figurine. Using beeswax thread sculpting and clay baking, each mold is broken open after cooling, making every single piece an irreplicable antique.'
                    },
                    {
                      title: 'Jaipur Natural Cooling Clay Pottery',
                      artisan: 'Ramswaroop Prajapat • Jaipur, Rajasthan',
                      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
                      content: 'Crafted from rich alluvial Jaipur clay, these water pitchers utilize micro-porous capillary evaporation to naturally cool water down by 5-8°C without electricity or chemical filters.'
                    }
                  ].map((story, i) => (
                    <div key={i} className="card-artisan" style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
                      <img src={story.image} alt={story.title} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '16px' }} />
                      <div>
                        <span className="badge-tag badge-terracotta" style={{ marginBottom: '10px' }}>{story.artisan}</span>
                        <h3 className="font-serif" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{story.title}</h3>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{story.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* PRODUCT DETAIL MODAL / VIEW */}
          {selectedProduct && (
            <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px' }}>
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-subtle)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
                  <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '18px' }} />

                  <div>
                    <span className="badge-tag badge-terracotta" style={{ marginBottom: '10px' }}>{selectedProduct.category}</span>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>{selectedProduct.title}</h2>
                    
                    <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', marginBottom: '14px' }}>
                      📍 Artisan: {selectedProduct.artisan || 'Master Artisan Guild'} • {selectedProduct.location || 'India'}
                    </div>

                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '18px' }}>
                      ₹{selectedProduct.price}
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                      {selectedProduct.description}
                    </p>

                    <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '18px' }}>
                      <div style={{ fontWeight: '700', marginBottom: '4px' }}>✨ Fair Trade Cost Breakdown</div>
                      <div style={{ color: 'var(--text-muted)' }}>Material: ₹180 | Artisan Labor: ₹150 | Fair Margin: 40%</div>
                    </div>

                    {/* HACKATHON INNOVATION BUTTONS: Audio Story, Digital Passport & Flyer */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      <button
                        type="button"
                        onClick={() => speakText(`${selectedProduct.title}. ${selectedProduct.description}. Authentic handcrafted provenance verified by Kaarvo Guild.`, 'en-IN')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '8px 12px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', cursor: 'pointer', color: '#1E293B' }}
                      >
                        <Volume2 size={14} /> 🎧 Listen to Craft Story
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassportProduct(selectedProduct)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '8px 12px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #10B981', cursor: 'pointer', color: '#059669' }}
                      >
                        <QrCode size={14} /> 📜 Digital Passport & QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlyerProduct(selectedProduct)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '8px 12px', borderRadius: '8px', background: '#FEF3C7', border: '1px solid #D97706', cursor: 'pointer', color: '#B45309' }}
                      >
                        <Share2 size={14} /> 🎨 WhatsApp Flyer
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-artisan-primary"
                        onClick={(e) => {
                          addToCart(selectedProduct, e);
                          setSelectedProduct(null);
                        }}
                        style={{ flex: 1, padding: '14px' }}
                      >
                        <ShoppingCart size={18} /> Add to Cart
                      </button>
                      <button
                        className="btn-artisan-secondary"
                        onClick={(e) => {
                          addToCart(selectedProduct, e);
                          setSelectedProduct(null);
                          setIsCartOpen(true);
                        }}
                        style={{ flex: 1, padding: '14px' }}
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={(e) => handleDeleteProduct(selectedProduct.id, e)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={18} /> Delete Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CART DRAWER & CHECKOUT */}
          {isCartOpen && (
            <div className="modal-backdrop" onClick={() => setIsCartOpen(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Your Shopping Cart ({cartItems.length})</h3>
                  <button onClick={() => setIsCartOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={22} />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                    <ShoppingCart size={54} style={{ marginBottom: '16px' }} />
                    <p style={{ fontSize: '15px' }}>Your cart is empty.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '320px', overflowY: 'auto', marginBottom: '24px' }}>
                      {cartItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'var(--bg-subtle)', padding: '12px', borderRadius: '12px' }}>
                          <img src={item.image} alt={item.title} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.title}</div>
                            <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800' }}>₹{item.price}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateCartQty(item.id, -1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>-</button>
                            <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span>Subtotal</span>
                        <span>₹{cartSubtotal}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span>Delivery</span>
                        <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '10px' }}>
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>

                    <button
                      className="btn-artisan-primary"
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                    >
                      Proceed to Checkout →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHECKOUT MODAL WITH PROGRESS INDICATOR */}
          {isCheckoutOpen && (
            <div className="modal-backdrop" onClick={() => setIsCheckoutOpen(false)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                
                {/* PROGRESS INDICATOR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', position: 'relative' }}>
                  {['Address', 'Delivery', 'Payment', 'Confirmation'].map((stepName, i) => (
                    <div key={stepName} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: checkoutStep >= (i + 1) ? 'var(--primary)' : 'var(--bg-subtle)',
                        color: checkoutStep >= (i + 1) ? '#FFF' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '13px',
                        margin: '0 auto 6px'
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: checkoutStep >= (i + 1) ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {stepName}
                      </span>
                    </div>
                  ))}
                </div>

                {/* STEP 1: ADDRESS */}
                {checkoutStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px' }}>Shipping Address</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                      <input type="text" className="input-artisan" value={checkoutData.name} onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })} placeholder="Full Name" />
                      <input type="text" className="input-artisan" value={checkoutData.phone} onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })} placeholder="Mobile Number" />
                      <input type="text" className="input-artisan" value={checkoutData.address} onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })} placeholder="Street Address" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <input type="text" className="input-artisan" value={checkoutData.city} onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })} placeholder="City" />
                        <input type="text" className="input-artisan" value={checkoutData.pincode} onChange={(e) => setCheckoutData({ ...checkoutData, pincode: e.target.value })} placeholder="Pincode" />
                      </div>
                    </div>
                    <button className="btn-artisan-primary" onClick={() => setCheckoutStep(2)} style={{ width: '100%', padding: '14px' }}>
                      Continue to Delivery →
                    </button>
                  </div>
                )}

                {/* STEP 2: DELIVERY */}
                {checkoutStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px' }}>Delivery Option</h3>
                    <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '20px', borderRadius: '14px', marginBottom: '24px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '15px' }}>🚀 Standard Direct Artisan Shipping</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Dispatched directly from artisan studio in Jaipur. Estimated 3-5 business days.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn-artisan-secondary" onClick={() => setCheckoutStep(1)} style={{ padding: '14px 20px' }}>Back</button>
                      <button className="btn-artisan-primary" onClick={() => setCheckoutStep(3)} style={{ flex: 1, padding: '14px' }}>Continue to Payment →</button>
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT */}
                {checkoutStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px' }}>Payment Method</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {['UPI (PhonePe / GPay)', 'Cash on Delivery', 'Credit / Debit Card'].map(pm => (
                        <div
                          key={pm}
                          onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: pm })}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: checkoutData.paymentMethod === pm ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                            background: checkoutData.paymentMethod === pm ? 'var(--primary-light)' : 'var(--bg-surface)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '15px'
                          }}
                        >
                          {pm}
                        </div>
                      ))}
                    </div>
                    <button className="btn-artisan-primary" onClick={handlePlaceOrder} disabled={isPlacingOrder} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                      {isPlacingOrder ? 'Processing...' : `Confirm & Pay ₹${cartTotal}`}
                    </button>
                  </div>
                )}

                {/* STEP 4: SUCCESS */}
                {checkoutStep === 4 && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <CheckCircle size={64} color="#10B981" style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Order Placed Successfully!</h2>
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                      Order notification sent directly to the artisan's ONDC Beckn Gateway.
                    </p>
                    <button className="btn-artisan-primary" onClick={() => setIsCheckoutOpen(false)} style={{ padding: '14px 28px' }}>
                      Return to Marketplace
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ARTISAN BUSINESS OS & 3-PILLAR CATALOGER                           */}
      {/* ========================================================================= */}
      {mode === 'artisan' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 35px)' }}>
          
          {/* ARTISAN SIDEBAR NAVIGATION */}
          <aside style={{
            width: '270px',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '28px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* SIDEBAR HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                  🎨
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '16px' }}>Artisan Business OS</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MoSJE SIH26090 Platform</div>
                </div>
              </div>

              {/* NAVIGATION LINKS */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
                  { id: 'studio', label: '✨ 3-Pillar AI Studio', icon: Sparkles },
                  { id: 'copilot', label: '🤖 AI Business Copilot', icon: Mic },
                  { id: 'orders', label: '🛒 Customer Orders', icon: ShoppingBag },
                  { id: 'customers', label: '👥 Customer 360', icon: Users },
                  { id: 'insights', label: '📈 Analytics & Profit', icon: PieChart },
                  { id: 'marketing', label: '📣 Social Campaigns', icon: Zap },
                  { id: 'settings', label: '⚙️ Business Settings', icon: Settings }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = artisanTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => switchArtisanTab(item.id)}
                      style={{
                        background: isActive ? 'var(--primary-light)' : 'transparent',
                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SWITCH BACK TO MARKETPLACE */}
            <button
              className="btn-artisan-secondary"
              onClick={() => switchMode('customer')}
              style={{ width: '100%', fontSize: '13px', padding: '12px' }}
            >
              ← Back to Customer Store
            </button>
          </aside>

          {/* MAIN ARTISAN OS BODY */}
          <main style={{ flex: 1, padding: '36px', maxWidth: '1280px', margin: '0 auto' }}>

            {/* ARTISAN VIEW 1: DASHBOARD OVERVIEW */}
            {artisanTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* HERO STATS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div className="card-artisan" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Published Products</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)' }}>{products.length}</div>
                    <span className="badge-tag badge-teal" style={{ marginTop: '8px' }}>✓ ONDC Beckn Live</span>
                  </div>

                  <div className="card-artisan" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Customer Orders</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{orders.length}</div>
                    <span className="badge-tag badge-terracotta" style={{ marginTop: '8px' }}>✓ Real-time Sync</span>
                  </div>

                  <div className="card-artisan" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Artisan Revenue</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#10B981' }}>
                      ₹{orders.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0) || 1850}
                    </div>
                    <span className="badge-tag badge-gold" style={{ marginTop: '8px' }}>✓ Direct Bank Transfer</span>
                  </div>

                  <div className="card-artisan" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Quality Audit Score</div>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#D97706' }}>98/100</div>
                    <span className="badge-tag badge-gold" style={{ marginTop: '8px' }}>✓ MoSJE Certified</span>
                  </div>
                </div>

                {/* AI INSIGHTS & ATTENTION REQUIRED */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="card-artisan" style={{ padding: '28px', background: 'var(--primary-light)', borderColor: 'var(--primary-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>
                      <Sparkles size={18} /> AI Business Opportunity
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Diwali Demand Spike Detected</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Demand for handcrafted terracotta jugs in Rajasthan & Delhi is up 34%. Recommended: Use Cost-Plus Assistant to launch a 5% promotional bundle.
                    </p>
                    <button className="btn-artisan-primary" onClick={() => switchArtisanTab('studio')} style={{ padding: '8px 18px', fontSize: '13px' }}>
                      + Open 3-Pillar AI Studio
                    </button>
                  </div>

                  <div className="card-artisan" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: '700', marginBottom: '8px' }}>
                      <ShieldAlert size={18} /> Attention Required
                    </div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Pending Shipping Pickup</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Order #ORD-1045 requires packaging dispatch label print for courier pickup in Jaipur.
                    </p>
                    <button className="btn-artisan-secondary" onClick={() => switchArtisanTab('orders')} style={{ padding: '8px 18px', fontSize: '13px' }}>
                      View Orders →
                    </button>
                  </div>
                </div>

                {/* RECENT ORDERS TABLE */}
                <div className="card-artisan" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px' }}>Recent Order Activity</h3>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No order activity yet.
                    </div>
                  ) : (
                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px', fontWeight: '700', color: 'var(--primary)' }}>ORD-{i + 1}</td>
                            <td style={{ padding: '12px' }}>{o.customer_name}</td>
                            <td style={{ padding: '12px', fontWeight: '800' }}>₹{o.total_price}</td>
                            <td style={{ padding: '12px' }}><span className="badge-tag badge-teal">Paid</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* PUBLISHED PRODUCTS INVENTORY MANAGEMENT TABLE */}
                <div className="card-artisan" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Your Published Products & Catalog ({products.length})</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Manage your live published items, view ONDC Beckn compliance, or unlist/delete products.
                      </p>
                    </div>
                    <button className="btn-artisan-primary" onClick={() => switchArtisanTab('studio')} style={{ padding: '8px 16px', fontSize: '12px' }}>
                      + Add New Product
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No products published yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Price</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={p.image} alt={p.title} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div>
                                  <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.title}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{p.id} • {p.artisan}</div>
                                </div>
                              </td>
                              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.category}</td>
                              <td style={{ padding: '12px', fontWeight: '800', color: 'var(--text-main)' }}>₹{p.price}</td>
                              <td style={{ padding: '12px' }}>
                                <span className="badge-tag badge-teal">✓ ONDC Live</span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button
                                  onClick={(e) => handleDeleteProduct(p.id, e)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ARTISAN VIEW 2: 3-PILLAR AI STUDIO (SIH26090 CORE SOLUTION) */}
            {artisanTab === 'studio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <span className="badge-tag badge-terracotta" style={{ marginBottom: '6px' }}>SIH26090 Core Solution</span>
                  <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: '700' }}>3-Pillar Smart Cataloger Studio</h1>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Turn phone photos & regional voice notes into studio catalog & ONDC Beckn schema.</p>
                </div>

                {/* 3 PILLARS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
                  
                  {/* PILLAR 1 */}
                  <div className="card-artisan" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                      <Camera size={22} color="var(--primary)" />
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 1: AI Studio Image Enhancer</h3>
                    </div>

                    <label style={{ border: '2px dashed var(--border-strong)', padding: '20px', borderRadius: '14px', display: 'block', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-subtle)', marginBottom: '16px' }}>
                      <input type="file" accept="image/*" onChange={handleEnhanceImage} style={{ display: 'none' }} />
                      <Camera size={32} color="var(--text-muted)" style={{ marginBottom: '6px' }} />
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{rawImageFile ? 'Change / Upload New Photo' : 'Upload Raw Artisan Photo'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Select any image file from your device</div>
                    </label>

                    {/* AUTOMATED AI PHOTO ENHANCER BADGE */}
                    <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>AI Photo Super-Enhance Active</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Auto-boosts exposure, color vibrance & sharpness while preserving original scene</div>
                      </div>
                    </div>

                    {imageEnhancing && (
                      <div style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '13px', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                        <RefreshCw size={20} className="animate-spin" style={{ display: 'inline', marginRight: '8px' }} />
                        Boosting photo exposure, sharpness & color vibrance...
                      </div>
                    )}

                    {/* INTELLIGENT LIGHTING ANALYSIS BADGE */}
                    {imageLightingInfo && !imageEnhancing && (
                      <div style={{ background: 'var(--bg-subtle)', border: `1px solid ${imageLightingInfo.badgeColor}`, padding: '10px 14px', borderRadius: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color={imageLightingInfo.badgeColor} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: imageLightingInfo.badgeColor }}>
                            Lighting Calibration: {imageLightingInfo.assessment.split(':')[0]}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {imageLightingInfo.assessment.split(':')[1] || imageLightingInfo.assessment}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BEFORE vs AFTER COMPARISON VIEW */}
                    {rawImageFile && enhancedImage && !imageEnhancing && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> ✨ Photo Exposure, Color & Resolution Enhanced
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>RAW CAMERA UPLOAD</div>
                            <img src={rawImageFile} alt="Raw Input" style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '10px', background: '#F3F1E9', border: '1px solid var(--border-subtle)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', marginBottom: '4px' }}>AI STUDIO ENHANCED POST</div>
                            <img src={enhancedImage} alt="Enhanced Result" style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '10px', background: '#FAF9F6', border: '2px solid var(--primary)', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PILLAR 2 */}
                  <div className="card-artisan" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                      <Mic size={22} color="var(--primary)" />
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 2: Multilingual Voice Cataloger</h3>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                      <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="input-artisan" style={{ flex: 1 }}>
                        <option value="hi-IN">🇮🇳 Hindi (हिंदी)</option>
                        <option value="bn-IN">🇮🇳 Bengali (বাংলা)</option>
                        <option value="ta-IN">🇮🇳 Tamil (தமிழ்)</option>
                        <option value="en-IN">🇬🇧 English (India)</option>
                      </select>
                      <button 
                        className="btn-artisan-secondary" 
                        onClick={toggleVoiceRecording}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          background: isRecording ? 'rgba(239, 68, 68, 0.1)' : undefined,
                          borderColor: isRecording ? '#ef4444' : undefined,
                          color: isRecording ? '#ef4444' : undefined
                        }}
                      >
                        <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
                        {isRecording ? 'Listening...' : 'Record'}
                      </button>
                    </div>

                    {isRecording && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>
                          🎙️ Live Mic Hardware Active — Listening... Speak your craft details!
                        </span>
                      </div>
                    )}



                    {/* LIVE TRANSLATION NOTIFICATION BADGE */}
                    {rawSpokenHindi && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong>🎙️ Spoken Hindi:</strong> <em>"{rawSpokenHindi}"</em>
                          <span style={{ color: '#047857', fontWeight: '700', marginLeft: '6px' }}>➔ Proper English below:</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={isTranslating}
                          onClick={async () => {
                            setIsTranslating(true);
                            const english = await translateHindiSpeechToEnglish(rawSpokenHindi || voiceText);
                            if (english) setVoiceText(english);
                            setIsTranslating(false);
                            showToast('✨ Re-translated to proper English!');
                          }}
                          style={{ background: '#059669', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                        >
                          {isTranslating ? '⏳ Translating...' : 'Re-Translate'}
                        </button>
                      </div>
                    )}

                    <div style={{ position: 'relative' }}>
                      <textarea
                        rows={3}
                        className="input-artisan"
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        placeholder="Speak or type product details..."
                        style={{ resize: 'none', marginBottom: '8px', paddingRight: '120px' }}
                      />
                      <button
                        type="button"
                        disabled={isTranslating}
                        onClick={async () => {
                          setIsTranslating(true);
                          const translated = await translateHindiSpeechToEnglish(voiceText);
                          if (translated) setVoiceText(translated);
                          setIsTranslating(false);
                          showToast('✨ Converted to proper, grammatically correct English!');
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: isTranslating ? '#9CA3AF' : 'linear-gradient(135deg, #D97706, #B45309)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: isTranslating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)'
                        }}
                      >
                        <Sparkles size={12} /> {isTranslating ? 'Translating...' : 'Translate'}
                      </button>
                    </div>

                    {/* Auto-Translate Hint (Devanagari + Hinglish detection) */}
                    {(/[ऀ-ॿ]|((hai|h|hain|ka|ki|ke|se|mangaya|banaya|yeh|ye|jisko|hath|humne|hamne))/i.test(voiceText)) && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', background: '#FEF3C7', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', color: '#92400E' }}>
                        <span>💡 Hindi/Hinglish text detected. Convert to proper English:</span>
                        <button
                          type="button"
                          disabled={isTranslating}
                          onClick={async () => {
                            setIsTranslating(true);
                            const translated = await translateHindiSpeechToEnglish(voiceText);
                            if (translated) setVoiceText(translated);
                            setIsTranslating(false);
                            showToast('✨ Translated into fluent English copy!');
                          }}
                          style={{ background: '#D97706', color: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', cursor: isTranslating ? 'not-allowed' : 'pointer' }}
                        >
                          {isTranslating ? '⏳ Translating...' : 'Convert to English →'}
                        </button>
                      </div>
                    )}

                    <button className="btn-artisan-primary" onClick={handleGenerateCatalogFromVoice} disabled={cataloging} style={{ width: '100%', padding: '12px' }}>
                      {cataloging ? '✨ Extracting AI Entities...' : 'Generate Auto-Catalog'}
                    </button>
                  </div>

                  {/* PILLAR 3 */}
                  <div className="card-artisan" style={{ padding: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                      <Sliders size={22} color="var(--primary)" />
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Pillar 3: Cost-Plus Pricing Engine</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Material Cost (₹)</label>
                        <input 
                          type="number" 
                          className="input-artisan" 
                          placeholder="e.g. 180" 
                          value={materialCost} 
                          onChange={(e) => { setMaterialCost(e.target.value); calculatePricing(e.target.value, laborCost, craftCategory); }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Labor Cost (₹)</label>
                        <input 
                          type="number" 
                          className="input-artisan" 
                          placeholder="e.g. 150" 
                          value={laborCost} 
                          onChange={(e) => { setLaborCost(e.target.value); calculatePricing(materialCost, e.target.value, craftCategory); }} 
                        />
                      </div>
                    </div>

                    {pricingResult && (
                      <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '14px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
                          Suggested: ₹{pricingResult.min} – ₹{pricingResult.max}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* ALWAYS-VISIBLE POST PRODUCT LIVE ACTION CARD */}
                <div 
                  className="card-artisan" 
                  style={{ 
                    padding: '28px 32px', 
                    background: 'linear-gradient(135deg, #FFF7ED, #FFFFFF)', 
                    border: '2px solid var(--primary)', 
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(217, 119, 6, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="badge-tag badge-terracotta">✓ Ready to Post Live</span>
                        <span className="badge-tag badge-teal">✓ ONDC Beckn Sync</span>
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                        {generatedCatalog ? generatedCatalog.descriptor.name : 'Publish Handcrafted Product to Kaarvo Store'}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {generatedCatalog ? generatedCatalog.descriptor.long_desc : 'Click the button to post your product live so all customer users across India can view & purchase it!'}
                      </p>

                      {/* QUICK ACTION BUTTONS: Audio, Passport & Social Flyer */}
                      {generatedCatalog && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => speakText(`Aapka product ${generatedCatalog.descriptor.name} safalta-purvak list ho gaya hai. Recommended price hai rupaye ${generatedCatalog.price.suggested_range.min}. Shuddh hastkala pramanit!`, 'hi-IN')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            <Volume2 size={14} /> 🔊 Suniye (Hindi Audio)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPassportProduct({
                              id: generatedCatalog.product_id,
                              title: generatedCatalog.descriptor.name,
                              category: generatedCatalog.category,
                              price: generatedCatalog.price.suggested_range.min,
                              location: extractedEntities?.region || 'Jaipur, Rajasthan',
                              image: enhancedImage || rawImageFile || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                              materials: extractedEntities?.material || 'Natural Clay / Silk',
                              craftStory: generatedCatalog.descriptor.long_desc,
                              artisan: 'Verified Master Artisan (Mohan Lal)'
                            })}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #10B981', cursor: 'pointer', color: '#059669' }}
                          >
                            <QrCode size={14} /> 📜 Digital Passport & QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlyerProduct({
                              id: generatedCatalog.product_id,
                              title: generatedCatalog.descriptor.name,
                              price: generatedCatalog.price.suggested_range.min,
                              location: extractedEntities?.region || 'Jaipur, Rajasthan',
                              image: enhancedImage || rawImageFile || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
                            })}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', background: '#FEF3C7', border: '1px solid #D97706', cursor: 'pointer', color: '#B45309' }}
                          >
                            <Share2 size={14} /> 🎨 WhatsApp Status Flyer
                          </button>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        className="btn-artisan-primary" 
                        onClick={handleSaveCatalogToDB} 
                        style={{ 
                          padding: '14px 28px', 
                          fontSize: '15px', 
                          fontWeight: '700',
                          borderRadius: '12px',
                          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Send size={18} />
                        Post Product Live to All Customers →
                      </button>
                    </div>
                  </div>
                </div>

                {/* PILLAR 5: B2B WHOLESALE EXPORT & LIVING-WAGE AI NEGOTIATOR */}
                <div className="card-artisan" style={{ padding: '28px', border: '2px solid #3B82F6', borderRadius: '16px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={22} color="#2563EB" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Pillar 5: Autonomous B2B Wholesale & Export AI Negotiator</h3>
                        <p style={{ fontSize: '12px', color: '#64748B' }}>Protects artisan living wages during bulk wholesale buyer negotiations (US/EU/Global retail chains)</p>
                      </div>
                    </div>
                    <span className="badge-tag badge-teal" style={{ background: '#DBEAFE', color: '#1E40AF', borderColor: '#93C5FD' }}>
                      ⚡ Living-Wage Protection Active
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>SIMULATED GLOBAL BUYER RFQ</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>Nordic Living Stores, Stockholm (Sweden)</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>Target Item: Handcrafted Heritage Artifacts</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: '#64748B' }}>Bulk Quantity (Units):</label>
                          <input 
                            type="number" 
                            className="input-artisan" 
                            value={b2bUnits} 
                            onChange={(e) => setB2bUnits(e.target.value)} 
                            style={{ padding: '8px', fontSize: '13px', marginTop: '2px' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '11px', color: '#64748B' }}>Buyer Initial Bid (₹/unit):</label>
                          <input 
                            type="number" 
                            className="input-artisan" 
                            value={b2bTargetPrice} 
                            onChange={(e) => setB2bTargetPrice(e.target.value)} 
                            style={{ padding: '8px', fontSize: '13px', marginTop: '2px' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>ETHICAL LIVING WAGE BENCHMARK</div>
                      <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                        • Raw Material Floor: <strong>₹160/unit</strong><br />
                        • Skilled Artisan Living Wage: <strong>₹140/unit</strong><br />
                        • Sea-Freight Export Crating: <strong>₹50/unit</strong><br />
                        • Minimum Ethical Floor: <strong style={{ color: '#DC2626' }}>₹350/unit</strong>
                      </div>
                      <button 
                        className="btn-artisan-primary" 
                        onClick={runB2bNegotiation}
                        disabled={b2bNegotiating}
                        style={{ marginTop: '12px', padding: '10px 16px', fontSize: '13px', background: '#2563EB', borderColor: '#2563EB' }}
                      >
                        {b2bNegotiating ? '⚡ Running Living-Wage Algorithm...' : '🤝 Generate AI Living-Wage Counter-Offer'}
                      </button>
                    </div>
                  </div>

                  {b2bAnalysis && (
                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '20px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} /> Autonomous AI Counter-Proposal (Living-Wage Preserved)
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#166534', fontWeight: '700' }}>
                            Net Artisan Earnings: ₹{b2bAnalysis.totalArtisanEarnings.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: '#DBEAFE', color: '#1E40AF', fontWeight: '700' }}>
                            Optimal FOB Quote: ₹{b2bAnalysis.safeWholesalePrice}/unit
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#1E293B', lineHeight: '1.6', background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #DBEAFE', fontStyle: 'italic' }}>
                        "{b2bAnalysis.counterOfferText}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                        <button 
                          onClick={() => speakText(b2bAnalysis.counterOfferText, 'en-IN')}
                          style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', fontWeight: '700', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Volume2 size={14} /> 🔊 Listen English Pitch
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard?.writeText(b2bAnalysis.counterOfferText);
                            showToast('📋 Export Quote copied to clipboard!');
                          }}
                          style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', background: '#2563EB', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                        >
                          Send Official ONDC Export Quote →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ARTISAN VIEW 3: AI BUSINESS COPILOT */}
            {artisanTab === 'copilot' && (
              <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div className="card-artisan" style={{ padding: '32px', background: 'var(--primary-light)', borderColor: 'var(--primary-border)' }}>
                  <h2 className="font-serif" style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>How can I help your business today?</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Ask Kaarvo Copilot about sales analytics, pricing strategy, inventory or campaigns.</p>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['+ Create Product', '📊 Analyze Sales', '🏷️ Suggest Price', '📣 Create Campaign', '📦 Check Inventory'].map(act => (
                      <button key={act} onClick={() => handleCopilotSend(act)} className="btn-artisan-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {copilotHistory.map((m, i) => (
                    <div key={i} className="card-artisan" style={{ padding: '24px', background: m.sender === 'artisan' ? 'var(--bg-subtle)' : 'var(--bg-surface)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: m.sender === 'artisan' ? 'var(--text-muted)' : 'var(--primary)', marginBottom: '8px' }}>
                        {m.sender === 'artisan' ? '👤 Artisan' : '🤖 Kaarvo Copilot'}
                      </div>
                      <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{m.content}</p>
                    </div>
                  ))}
                </div>

                <div className="card-artisan" style={{ padding: '14px', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="input-artisan"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                    placeholder="Ask Kaarvo anything about your craft business..."
                    style={{ border: 'none' }}
                  />
                  <button className="btn-artisan-primary" onClick={() => handleCopilotSend()} style={{ padding: '12px 24px' }}>
                    <Send size={16} /> Send
                  </button>
                </div>
              </div>
            )}

            {/* ARTISAN VIEW 4: ORDERS */}
            {artisanTab === 'orders' && (
              <div className="card-artisan" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>Customer Orders Dashboard</h2>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>No customer orders found.</div>
                ) : (
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Shipping Address</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Total Amount</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px', fontWeight: '700', color: 'var(--primary)' }}>ORD-{idx + 1}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{o.customer_name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{o.shipping_address || 'Jaipur, Rajasthan'}</td>
                          <td style={{ padding: '12px', fontWeight: '800', color: '#10B981' }}>₹{o.total_price}</td>
                          <td style={{ padding: '12px' }}><span className="badge-tag badge-teal">Paid</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ARTISAN VIEW 5: CUSTOMERS / INSIGHTS / MARKETING / SETTINGS STUBS */}
            {['customers', 'insights', 'marketing', 'settings'].includes(artisanTab) && (
              <div className="card-artisan" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {artisanTab} Module Active
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                  Integrated with Kaarvo Master AI Loop & ONDC Beckn Network.
                </p>
              </div>
            )}

          </main>
        </div>
      )}


      {/* ============================================================ */}
      {/* FEATURE 1 MODAL: DIGITAL HERITAGE PASSPORT & VERIFIABLE QR */}
      {/* ============================================================ */}
      {passportProduct && (
        <div className="modal-backdrop" onClick={() => setPassportProduct(null)} style={{ zIndex: 9999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', background: '#FFFDF9', border: '2px solid #D97706', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button
              onClick={() => setPassportProduct(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(0,0,0,0.05)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', borderBottom: '2px dashed #E5E7EB', paddingBottom: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FEF3C7', padding: '6px 14px', borderRadius: '20px', marginBottom: '10px' }}>
                <ShieldCheck size={16} color="#D97706" />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ONDC & GI Verified Provenance Passport
                </span>
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '800', color: '#1E120A' }}>
                Certificate of Authentic Craftsmanship
              </h2>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                Official Digital Heritage Passport • Direct-from-Artisan Guarantee
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
              <img 
                src={passportProduct.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'} 
                alt={passportProduct.title} 
                style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #D97706' }} 
              />
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#1E120A', marginBottom: '6px' }}>{passportProduct.title}</h3>
                <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '1.6' }}>
                  <div>📍 <strong>Heritage Cluster:</strong> {passportProduct.location || 'Jaipur, Rajasthan'}</div>
                  <div>👤 <strong>Master Artisan:</strong> {passportProduct.artisan || 'Verified Master Artisan (Mohan Lal)'}</div>
                  <div>🏷️ <strong>Category:</strong> {passportProduct.category || 'Handicrafts'}</div>
                  <div>💰 <strong>Fair-Wage Value:</strong> ₹{passportProduct.price}</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748B' }}>GI Tag Status:</span>
                <div style={{ fontWeight: '700', color: '#059669' }}>✓ Registered Geographical Indication</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Eco Footprint:</span>
                <div style={{ fontWeight: '700', color: '#059669' }}>✓ 100% Biodegradable / Zero Plastic</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Artisan Wage Guarantee:</span>
                <div style={{ fontWeight: '700', color: '#2563EB' }}>100% Fair-Trade Direct Payout</div>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>ONDC Beckn Hash:</span>
                <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#475569' }}>ONDC-GI-{String(passportProduct.id || '9823').slice(0, 8)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBEB', border: '1px dashed #F59E0B', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* 100% Offline Vector SVG QR Code with Finder Patterns */}
                <div style={{ width: '88px', height: '88px', background: '#FFFFFF', border: '2px solid #D97706', borderRadius: '10px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges">
                    {/* Corner 1 */}
                    <rect x="0" y="0" width="30" height="30" fill="#1E120A" />
                    <rect x="5" y="5" width="20" height="20" fill="#FFFFFF" />
                    <rect x="10" y="10" width="10" height="10" fill="#D97706" />
                    {/* Corner 2 */}
                    <rect x="70" y="0" width="30" height="30" fill="#1E120A" />
                    <rect x="75" y="5" width="20" height="20" fill="#FFFFFF" />
                    <rect x="80" y="10" width="10" height="10" fill="#D97706" />
                    {/* Corner 3 */}
                    <rect x="0" y="70" width="30" height="30" fill="#1E120A" />
                    <rect x="5" y="75" width="20" height="20" fill="#FFFFFF" />
                    <rect x="10" y="80" width="10" height="10" fill="#D97706" />
                    {/* Data Cells & Timing Marks */}
                    <rect x="36" y="8" width="6" height="6" fill="#1E120A" />
                    <rect x="48" y="8" width="6" height="6" fill="#1E120A" />
                    <rect x="8" y="36" width="6" height="6" fill="#1E120A" />
                    <rect x="8" y="48" width="6" height="6" fill="#1E120A" />
                    <rect x="36" y="36" width="28" height="28" fill="#FEF3C7" />
                    <rect x="42" y="42" width="16" height="16" fill="#D97706" />
                    <rect x="44" y="76" width="6" height="6" fill="#1E120A" />
                    <rect x="56" y="76" width="6" height="6" fill="#1E120A" />
                    <rect x="76" y="44" width="6" height="6" fill="#1E120A" />
                    <rect x="76" y="56" width="6" height="6" fill="#1E120A" />
                    <rect x="86" y="86" width="8" height="8" fill="#D97706" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400E' }}>Instant Authenticity QR Code</div>
                  <div style={{ fontSize: '11px', color: '#B45309', marginTop: '2px' }}>
                    Government-compliant provenance hash: <strong>SHA256-{String(passportProduct.id || 'KAARVO-892').slice(0, 8)}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                    ✓ 100% Offline & Blockchain Ready
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  window.print();
                  showToast('🖨️ Opening print dialogue for certificate label...');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#D97706', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
              >
                <Printer size={16} /> Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FEATURE 2: WHATSAPP ARTISAN COMMERCE BOT SIMULATOR           */}
      {/* ============================================================ */}
      <button
        type="button"
        onClick={() => setIsWhatsappOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#25D366',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          cursor: 'pointer',
          zIndex: 9000,
          fontWeight: '800',
          fontSize: '13px'
        }}
      >
        <MessageCircle size={20} />
        <span>WhatsApp Artisan Bot</span>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFFFFF', animation: 'pulse 1s infinite' }} />
      </button>

      {isWhatsappOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '380px',
            height: '540px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9001,
            overflow: 'hidden',
            border: '2px solid #25D366'
          }}
        >
          {/* WHATSAPP HEADER */}
          <div style={{ background: '#075E54', color: '#FFFFFF', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#FFFFFF', fontSize: '16px' }}>
                कार्वो
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>Kaarvo AI Sahayak</div>
                <div style={{ fontSize: '11px', color: '#A7F3D0' }}>🟢 Online • ONDC Certified Bot</div>
              </div>
            </div>
            <button
              onClick={() => setIsWhatsappOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div style={{ flex: 1, padding: '16px', background: '#ECE5DD', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {whatsappMessages.map(m => (
              <div 
                key={m.id} 
                style={{
                  alignSelf: m.sender === 'artisan' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'artisan' ? '#DCF8C6' : '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  color: '#1E293B',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
                {m.card && (
                  <div style={{ marginTop: '8px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px', fontSize: '12px' }}>
                    <img src={m.card.image} alt={m.card.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '800', color: '#1E293B', fontSize: '13px' }}>{m.card.title}</div>
                    <div style={{ color: '#059669', fontWeight: '800', marginTop: '2px', fontSize: '13px' }}>Live Price: ₹{m.card.price}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>📍 {m.card.region} • ✓ ONDC Beckn Sync</div>
                    <button
                      type="button"
                      onClick={() => {
                        if (m.card.productObj) setSelectedProduct(m.card.productObj);
                        setMode('customer');
                        setCustomerTab('shop');
                        setIsWhatsappOpen(false);
                        showToast('✨ Opened live product in Storefront!');
                      }}
                      style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '6px', background: '#059669', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}
                    >
                      🛍️ View Live on Storefront →
                    </button>
                  </div>
                )}
                <div style={{ fontSize: '9px', color: '#64748B', textAlign: 'right', marginTop: '4px' }}>
                  {m.time} {m.sender === 'artisan' ? '✓✓' : ''}
                </div>
              </div>
            ))}
            {whatsappTyping && (
              <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', padding: '8px 14px', borderRadius: '12px', fontSize: '11px', color: '#64748B' }}>
                ✍️ Kaarvo AI Sahayak typing...
              </div>
            )}
          </div>

          {/* QUICK PRESET BUTTONS */}
          <div style={{ padding: '8px 12px', background: '#F0F2F5', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '6px', overflowX: 'auto' }}>
            <button
              onClick={() => handleWhatsappSend('Yeh Jaipur ki 15 terracotta clay matka ban gaye hain, rate ₹450')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🏺 15 Matka (₹450)
            </button>
            <button
              onClick={() => handleWhatsappSend('Varanasi pure silk handloom saree list karo, rate ₹2400')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🥻 Silk Saree (₹2400)
            </button>
            <button
              onClick={() => handleWhatsappSend('Mera payment aur order dispatch kab hoga?')}
              style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              📦 Order Status?
            </button>
          </div>

          {/* LIVE RECORDING & AUTO-TRANSLATION BADGE INSIDE WHATSAPP */}
          {(isWhatsappRecording || isWhatsappTranslating || whatsappSpokenHindi) && (
            <div style={{ padding: '8px 14px', background: '#ECFDF5', borderTop: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#065F46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isWhatsappRecording ? '#DC2626' : '#059669', animation: 'pulse 1s infinite' }} />
                <div>
                  <strong>{isWhatsappRecording ? '🎙️ Spoken Hindi: ' : '✨ Auto-Translated: '}</strong>
                  <span style={{ fontStyle: 'italic' }}>"{whatsappSpokenHindi || whatsappInput}"</span>
                </div>
              </div>
              {isWhatsappRecording ? (
                <button 
                  type="button" 
                  onClick={stopWhatsappVoiceRecording}
                  style={{ background: '#DC2626', color: '#FFFFFF', border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                >
                  Stop Mic
                </button>
              ) : isWhatsappTranslating ? (
                <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700' }}>⏳ Translating...</span>
              ) : null}
            </div>
          )}

          {/* INPUT BAR */}
          <div style={{ padding: '10px 14px', background: '#F0F2F5', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Hindi me likhe ya mic se bole..." 
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWhatsappSend()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#FFFFFF' }}
            />
            {/* WHATSAPP MIC BUTTON */}
            <button
              type="button"
              onClick={toggleWhatsappVoiceRecording}
              title={isWhatsappRecording ? 'Stop Recording' : 'Record Voice in Hindi'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isWhatsappRecording ? '#DC2626' : '#25D366',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: isWhatsappRecording ? '0 0 10px rgba(220, 38, 38, 0.5)' : 'none'
              }}
            >
              {isWhatsappRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {/* SEND BUTTON */}
            <button
              type="button"
              onClick={() => handleWhatsappSend()}
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#075E54', color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* FEATURE 4 MODAL: SOCIAL MEDIA MARKETING FLYER PREVIEW & DOWNLOAD */}
      {/* ============================================================ */}
      {flyerProduct && (
        <div className="modal-backdrop" onClick={() => setFlyerProduct(null)} style={{ zIndex: 9999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', background: '#1E120A', color: '#FFFFFF', border: '2px solid #D97706', borderRadius: '24px', padding: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button
              onClick={() => setFlyerProduct(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            {/* FLYER PREVIEW CARD */}
            <div style={{ border: '3px solid #D97706', borderRadius: '16px', padding: '20px', background: 'linear-gradient(180deg, #2D1B11, #120A06)', textAlign: 'center', boxShadow: 'inset 0 0 30px rgba(217, 119, 6, 0.15)', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', letterSpacing: '0.1em', marginBottom: '6px' }}>
                KAARVO HERITAGE • VOCAL FOR LOCAL
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
                {flyerProduct.title || 'Handcrafted Artisan Craft'}
              </h3>
              <div style={{ fontSize: '12px', color: '#E5E7EB', marginBottom: '14px' }}>
                Direct from Master Artisans of {flyerProduct.location || 'Jaipur, Rajasthan'}
              </div>

              <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #D97706', marginBottom: '14px', background: '#0F0906' }}>
                <img 
                  src={flyerProduct.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'} 
                  alt="Product Flyer" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#D97706', color: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }}>
                  ₹{flyerProduct.price}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left', fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '10px 14px', borderRadius: '10px', color: '#E5E7EB' }}>
                <div style={{ color: '#10B981', fontWeight: '700' }}>✓ 100% GI Authentic</div>
                <div style={{ color: '#10B981', fontWeight: '700' }}>✓ Fair-Wage Certified</div>
                <div style={{ color: '#F59E0B' }}>✓ ONDC Beckn Synced</div>
                <div style={{ color: '#F59E0B' }}>✓ Direct Heritage Provenance</div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => generateAndDownloadFlyer(flyerProduct)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#D97706', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)' }}
              >
                <Download size={16} /> Download Status Poster (JPG)
              </button>
              <button
                type="button"
                onClick={() => {
                  const shareText = encodeURIComponent(`Namaste! Check out authentic ${flyerProduct.title} handcrafted in ${flyerProduct.location || 'India'} for ₹${flyerProduct.price}. Support local artisans on Kaarvo ONDC!`);
                  window.open(`https://wa.me/?text=${shareText}`, '_blank');
                  showToast('📲 Opening WhatsApp to share!');
                }}
                style={{ padding: '12px 16px', borderRadius: '12px', background: '#25D366', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FEATURE 3 AUDIO WAVEFORM & SUBTITLE PLAYER PILL             */}
      {/* ============================================================ */}
      {audioSubtitle && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 9999,
          maxWidth: '92%',
          border: '1.5px solid #38BDF8',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {/* Animated Audio Equalizer Bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '22px' }}>
            <span style={{ width: '4px', height: '14px', background: '#38BDF8', borderRadius: '2px', animation: 'pulse 0.6s infinite alternate' }} />
            <span style={{ width: '4px', height: '22px', background: '#38BDF8', borderRadius: '2px', animation: 'pulse 0.4s infinite alternate' }} />
            <span style={{ width: '4px', height: '10px', background: '#38BDF8', borderRadius: '2px', animation: 'pulse 0.8s infinite alternate' }} />
            <span style={{ width: '4px', height: '18px', background: '#38BDF8', borderRadius: '2px', animation: 'pulse 0.5s infinite alternate' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔊 {audioSubtitle.lang?.startsWith('hi') ? 'Hindi Artisan Voice' : 'English Craft Story'} Active
            </div>
            <div style={{ fontSize: '13px', color: '#F8FAFC', maxWidth: '460px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {audioSubtitle.text}
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setAudioSubtitle(null);
            }}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFFFFF', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Stop Audio"
          >
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
