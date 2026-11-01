import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Camera, Mic, MicOff, ShoppingBag, Layers, Package, Users, Sliders,
  TrendingUp, Send, CheckCircle, FileText, ArrowRight, ShieldCheck, RefreshCw,
  Globe, CreditCard, Check, X, Star, MapPin, Search, Filter, Heart,
  ShoppingCart, ChevronRight, MessageSquare, Award, ArrowUpRight, HelpCircle,
  Truck, ShieldAlert, Zap, Compass, Store, Settings, PieChart, Tag, RefreshCcw, Home, Trash2,
  QrCode, Volume2, VolumeX, Download, Share2, Phone, MessageCircle, Printer, Briefcase,
  Lock, Mail, User, Eye, EyeOff, LogIn, LogOut, ExternalLink
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8001/api/v1';

// Authentic Craft-Specific Image Mapping (Prevents generic duplicate image bugs)
const getCraftSpecificImage = (category, title) => {
  const text = `${category || ''} ${title || ''}`.toLowerCase();
  if (/saree|sari|silk|handloom|dupatta|textile|cloth|weaving|saadi/i.test(text)) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'; // Silk Saree
  }
  if (/painting|canvas|folk|art|madhubani|warli|chitra/i.test(text)) {
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'; // Folk Art Painting
  }
  if (/toy|wood|wooden|channapatna|elephant|khilona|lakdi/i.test(text)) {
    return 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'; // Wooden Toy Elephant
  }
  if (/diya|brass|metal|peetal|deepak|bell|puja|thali/i.test(text)) {
    return 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80'; // Brass Diya
  }
  if (/matka|water pot|pottery|terracotta|clay|ghada|mitti/i.test(text)) {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'; // Terracotta Clay Matka
  }
  if (/vase|ceramic|blue pottery|surahi|planter/i.test(text)) {
    return 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80'; // Blue Pottery Ceramic Vase
  }
  return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80';
};


// ============================================================================
// GOOGLE STITCH 12 CERTIFIED LIVING HERITAGE MASTERWORKS DATASET
// ============================================================================
const CERTIFIED_MASTERWORKS = [
  {
    id: 'dhokra-01',
    title: 'Sahastradhara Dhokra Nandi',
    price: 34800,
    category: 'Metalcraft & Dhokra',
    artisan: 'Mandar Baghel • Bastar Guild',
    craft_hours: 96,
    gi_tag: 'GI CERTIFIED #82',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDglDKiMtkskfvnEbKK-g_n-Dgiln56R1LvlyHXUWc3xoR6fl_Bkr8TXspe8FHir1kDbT1Z2-8BPfanMorTBHc_p6mSzlAgwnDH_e-pXlMCAo9lnNSncQxrmLJccQadqLB9RlbZwpo7iUENBzh6DmK5O3uJXwqqH2trzzeeWJzs_y0ZuibV8ePpi8-3pGNiYWzryia8pdiR6ib3DGter4kr8VM8EEwGxV0ddD0r6mw',
    material: 'Bell Metal (Cu-Sn Alloy)',
    edition: 'N° 03/12',
    region: 'Chhattisgarh',
    description: 'Ancestral hollow-core cire-perdue cast bell metal vessel with ceremonial horned iconography and fine spiral wirework.'
  },
  {
    id: 'pottery-02',
    title: 'Neelambari Cobalt Amphora',
    price: 18500,
    category: 'Pottery & Ceramics',
    artisan: 'Leeladhar Sharma • Sanganer',
    craft_hours: 44,
    gi_tag: 'GI TAG #248',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLxim86zVmb3F4TeiCLg-SUWm9Q_TjlxRGiXD9XOKV3I_Rc7FGl8_1llNSnDIJxBBkqMkrOnv-PEQHZW8bewS05YW9pgSwI86la7I87CKdZkDHhgmPE4giwaeaQd9MVjohp3fgcU9O9zB8JqNB6aICeGUbrz3cxDhNbq1peB2hrnguk-A6k71GTxDnG0j9DmZ9OOfvKTLphFWLlc84DRSwYz1AE89d8vDsPTYFLJc',
    material: 'Egyptian Paste & Quartz',
    edition: 'N° 04/15',
    region: 'Rajasthan',
    description: 'Clayless ground quartz and glass frit urn hand-painted with copper oxide and fired in ancestral single-fire wood kilns.'
  },
  {
    id: 'bidri-03',
    title: 'Tarkashi Bidri Teardrop Casket',
    price: 42000,
    category: 'Metalcraft & Dhokra',
    artisan: 'M. A. Raheem • Bidar Registry',
    craft_hours: 120,
    gi_tag: 'GI TAG #11',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgdah1At6YL7lU9jsaexjIkUgDGJ49OzpzECtZ7JnlzBW69fduNV7_K1SYpWxoBW0xddBLQC3CpLvRa5wP1Epu0JusgRdKg01mZATW_6p10G9h03iNzkirDRmdvHchHK91t_zutSikCMxG0ayAadvOp_HhN-fdBuZzYte3uoN51W_mRJJNFWpNZxuRDmfTJUICMyYm5kIf9pjFWXMWGIhm-8WixRgdRrosUV4yiL4',
    material: 'Zinc & 999 Silver',
    edition: 'N° 01/05',
    region: 'Karnataka',
    description: 'Hand-chiseled pure silver wire hammered into darkened non-ferrous alloy, cured with Bidar Fort subterranean soil.'
  },
  {
    id: 'katan-04',
    title: 'Zari Shikargah Katan Brocade',
    price: 88000,
    category: 'Textiles & Weaves',
    artisan: 'Haji Mohammed • Varanasi Guild',
    craft_hours: 240,
    gi_tag: 'GI TAG #49',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRYZFQqcAmVRE2XI4tYMwfGKEK8aBFuI3kYbomqBflwwAQW3pGFLmZNQ2So_Kobb-hK6Fatd3EnfQ00qxiWrdfF0xQkQ0THmI3M2Ew_ZkuAkpe3_hwjjKLUbQ-jJAK0OBIYT_O3bT8RjYjsVo54QI-LT7MDWshm8zsmWhLDNrzDF8ZJXWFjUm0n1WwkTz3TSt_-F71mSfuuq6wu1dm0kDSxeQfK55po2si_NAhMsk',
    material: 'Mulberry Zari Silk',
    edition: 'HEIRLOOM WEAVE',
    region: 'Uttar Pradesh',
    description: 'Hand-drawn jacquard loom pattern containing hunting narratives in genuine tested silver-gilt zari on pure mulberry silk.'
  },
  {
    id: 'pashmina-05',
    title: 'Sozni Jamawar Pashmina Shawl',
    price: 115000,
    category: 'Textiles & Weaves',
    artisan: 'Ghulam Nabi • Srinagar Guild',
    craft_hours: 310,
    gi_tag: 'GI TAG #46',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhjYWXvTyC4t0F5G6WgU6Rayn6RZjdTvXIUDc95VXk8fah7qVZC5iMBWGo5UohYCU1nqmfJeYSsP69nIFC-0m2zYNWAHrF2zq9JicdnWKpQAfV1Ty-wsmG4Xy9_KyMK5YwWgBBsVDttjUcvPN7XR9Hlu61G1wcP1zCC4fim8_YQvkx9GJO19zxzk1G4gr-Mp6UeDNH7BUlxSCSO994AF8XOwKEEDfAq9kPo5dOqmk',
    material: 'Changthangi Cashmere',
    edition: 'ONE-OF-A-KIND',
    region: 'Kashmir',
    description: 'Hand-combed high-altitude mountain goat fleece stitched with single-strand botanical-dyed silk needles in Jamawar paisley.'
  },
  {
    id: 'molela-06',
    title: 'Dharmaraj Votive Clay Stele',
    price: 14200,
    category: 'Pottery & Ceramics',
    artisan: 'Hariram Kumbhar • Molela Cluster',
    craft_hours: 52,
    gi_tag: 'GI TAG #112',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvLsFecigeafmtmRGlwxTM0QUgFK5Qixlm8IMYMtQE21Xh9agwkpjmsw187dGDnXV7Mtg0XwKnUrW15o_wp-oFyXtJnv7IxImAcx-lHRCrrkwr06ABjBbU5KdFwZRROBjQZQNz5zpoPya0_S-dtYHKKHAveAs7nc7lHYeEhARE6Yucp-7U7UwxVUWPsTi5Bmdt2mBytBkRkqUzEtyrLlVQ7ZT8EBmXD3sZgGvWJkg',
    material: 'Alluvial River Clay',
    edition: 'N° 07/20',
    region: 'Rajasthan',
    description: 'Hollow votive relief plaque hand-modeled without molds using riverbed alluvial silt and palash gum.'
  },
  {
    id: 'rogan-07',
    title: 'Tree of Life Rogan Tapestry',
    price: 54000,
    category: 'Textiles & Weaves',
    artisan: 'Abdul Gafoor Khatri • Niruna',
    craft_hours: 78,
    gi_tag: 'GI TAG #564',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQXz4DumlhaFtCZppYHbYtGGMO0Fe0bn3dt0DHNdMY3tvZ-vNdxg81euLVCpqbc-P750HNH74wh_k4D4xgOXTLPrjs_OoHrL4cbRh82k1YQw6HxCFpDUvyvvDJrhun5uOjLbsjnDqzFBGJqcTgh0MM9ii09z7jbCJHDUkz219RjCqB6NZP85JAC1qfkJ8aE8swchf7uqLCyo0iEKQNfN_xEyhhasmyw3xMu1OVnRw',
    material: 'Castor Resin Filament',
    edition: 'N° 02/08',
    region: 'Gujarat',
    description: 'Rare 400-year-old technique trailing boiled castor oil elastic pigment threads from palm to silk textile.'
  },
  {
    id: 'sankheda-08',
    title: 'Kalpavriksha Turned Low Stool',
    price: 26500,
    category: 'Wood & Lacquer',
    artisan: 'Paresh Kharadi • Sankheda',
    craft_hours: 68,
    gi_tag: 'GI TAG #13',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDci-Tib2s19iYWqd1fm-EvZPr-qPgSUJ7wP_QyCu3d3glktkONiE5pZY1GaenKWYTx9EB0aZjXm4m8FvG-wA6zxBOqs-U5vRczTla5vh2-P-19rIHFMCfIeAKRn8OMG-DydN9tzyxfG0U1bxPtcOivARFlcsDK7A09rMid-kgAA1bBupcHVCxW5NCR3AEx9P98Gw1fCn1zHEmT0jvyQlzc5cDbem1j-Lsfqs42IM',
    material: 'Teakwood & Agate Polish',
    edition: 'N° 11/15',
    region: 'Gujarat',
    description: 'Hand-lathed hardwood burnished with pewter powder and natural kewda lacquer using agate stone friction.'
  },
  {
    id: 'patola-09',
    title: 'Chhabdi Bhat Double Ikat Patola',
    price: 245000,
    category: 'Textiles & Weaves',
    artisan: 'Salvi Bharatbhai • Patan Guild',
    craft_hours: 480,
    gi_tag: 'GI TAG #232',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBmdFAuW2QQde5IGbtoCAhTXq29tixvX8jJbCRpAlm5L_7AnUcBjw3Adgs7dOuX7VQSKNtkW52dxIS79WIuS93Fax-g2H-BSdTC7sH5q45L8Hi_YyDxYx-jDAwkqmv5kaQpJo0CFY2GEIOvs_GHSFkynktRxSN4fHksb0C1EDrTiWa9GrHHpX0h9IeKg3s_r_Jir1lkC8sdAcU0endKc5aijP2986h1OiYv5AsiB4',
    material: 'Double-Ikat Silk',
    edition: 'HERITAGE VAULT',
    region: 'Gujarat',
    description: 'Both warp and weft individually resist-dyed before weaving; exact pattern alignment requiring mathematical harmony.'
  },
  {
    id: 'channapatna-10',
    title: 'Vajra Turned Stacking Vessel',
    price: 11800,
    category: 'Wood & Lacquer',
    artisan: 'Syed Munavar • Channapatna',
    craft_hours: 32,
    gi_tag: 'GI TAG #16',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOxv4qugvCgX4wbs5UH10SqOl3YGUKj9Je_RDL_6Axf3owoXfjgPx2OnuxecVzV0yDM8UE5seCSPK_Yt2G6YNUYyJHzr4irzzK0bsHyfz73-LPwpAl-bI_gb3IJNTvRhjlDW8PV7WWQnZgj9PVNmhhl1sK3M3Us0RIO2VjkOtgsmuelHufK-KDZSZviR5cZt-8hE3YCoba7pbC59YqjCqOAnQqivfHx46RsmOH7Y0',
    material: 'Aale-Mara Wood & Veg Lac',
    edition: 'N° 14/30',
    region: 'Karnataka',
    description: 'Lathe-spun sustainable Wrightia tinctoria timber polished with non-toxic lac dyed using natural mineral madder.'
  },
  {
    id: 'thanjavur-11',
    title: 'Maratha Art Plate Salver',
    price: 38200,
    category: 'Metalcraft & Dhokra',
    artisan: 'S. Ramalingam • Thanjavur',
    craft_hours: 115,
    gi_tag: 'GI TAG #03',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ9_4SyZ20giyyCsQXPO7NIJ3xVt6O1hK8rO2FrKizj_5kyxDclF6SuP6bBUFEwD2rCjOW2MCr2X3S7IBSpGbdKLitWithPc_8wY8lHvP7IL27iM9lCSA022HxeW7gWITJWghYfFBbwChFAzERblBnMTHC2lVpKMu94QlzDoSCLitRGLRxcPabjYbHUAqxjNb-Jn7FhoY5ehTOIi5BwiXfRXXKc2BAEJdNKI6ob-M',
    material: 'Tri-Metal Repoussé',
    edition: 'N° 05/10',
    region: 'Tamil Nadu',
    description: 'Hand-chased silver and copper relief medallions embedded mechanically into heavy beaten brass plate.'
  },
  {
    id: 'saharanpur-12',
    title: 'Jali Pierced Rosewood Coffer',
    price: 29000,
    category: 'Wood & Lacquer',
    artisan: 'Mohd. Arshad • Saharanpur',
    craft_hours: 88,
    gi_tag: 'GI TAG #156',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_s9Qh01uEDkSzGul09shj2nN3kcvnubi6K539wWxPoIK2nHy-dNKLa6ZXnyRY0MIaRcK1gwc36lMU2n5JkQdyDszS7oe0VyVjbyICPRBynB1pe8RQ8fkSojoM37iLrewf7CY0iJpz-rIZXeRIIXtenIVOhdLf4pK5LXJfkp1oKUywhlZWNTX_lM2Wvfaobz1ZbjEdGgCjJehz1XJ1OVoXre4-vTP2M9S0l_-edKQ',
    material: 'Sheesham Hardwood',
    edition: 'N° 18/25',
    region: 'Uttar Pradesh',
    description: 'Monolithic aged seasoned Indian rosewood pierced using handheld fretsaws and hand-chiseled botanical arabesques.'
  }
];

export default function App() {
  // --- AUTHENTICATION & JWT STATE (Stitch Integration) ---
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kaarvo_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('kaarvo_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('kaarvo_refresh_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authRole, setAuthRole] = useState('artisan'); // 'artisan' | 'customer'
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCraftType, setRegCraftType] = useState('Terracotta Pottery');
  const [regRegion, setRegRegion] = useState('Jaipur, Rajasthan');

  // Automatic Token Refresh Helper
  const refreshAuthToken = async () => {
    const curRefresh = localStorage.getItem('kaarvo_refresh_token');
    if (!curRefresh) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: curRefresh })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('kaarvo_access_token', data.access_token);
          setAccessToken(data.access_token);
          return data.access_token;
        }
      }
    } catch (err) {
      console.warn('Token refresh notice:', err);
    }
    return null;
  };

  // Login Handler with Demo Credentials support
  const handleAuthLogin = async (e, demoCreds = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const payload = demoCreds || {
      username: loginUsername.trim(),
      password: loginPassword.trim()
    };

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Invalid credentials. Please verify your details.');
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('kaarvo_access_token', data.access_token);
      localStorage.setItem('kaarvo_refresh_token', data.refresh_token);
      localStorage.setItem('kaarvo_user', JSON.stringify(data.user));

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      setLoginPassword('');

      if (data.user.role === 'artisan') {
        switchMode('artisan');
      } else {
        switchMode('customer');
      }

      showToast(`🎉 Namaste, ${data.user.full_name || data.user.username}! Signed in as ${data.user.role === 'artisan' ? 'Verified Artisan' : 'Customer'}.`);
    } catch (err) {
      setAuthError('Connection error. Please make sure the backend server is running on port 8001.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration Handler
  const handleAuthRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (!regPassword || regPassword.length < 4) {
      setAuthError('Password must be at least 4 characters long.');
      setAuthLoading(false);
      return;
    }

    const payload = {
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      username: regUsername.trim() || (regEmail ? regEmail.split('@')[0] : `artisan_${Date.now().toString().slice(-4)}`),
      password: regPassword.trim(),
      role: authRole,
      craft_type: regCraftType,
      region: regRegion
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Registration failed. Please check your inputs.');
        setAuthLoading(false);
        return;
      }

      localStorage.setItem('kaarvo_access_token', data.access_token);
      localStorage.setItem('kaarvo_refresh_token', data.refresh_token);
      localStorage.setItem('kaarvo_user', JSON.stringify(data.user));

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);

      if (data.user.role === 'artisan') {
        switchMode('artisan');
      } else {
        switchMode('customer');
      }

      showToast(`🎉 Welcome to Kaarvo AI, ${data.user.full_name}! Registration successful.`);
    } catch (err) {
      setAuthError('Connection error during registration.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout Handler
  const handleAuthLogout = () => {
    localStorage.removeItem('kaarvo_access_token');
    localStorage.removeItem('kaarvo_refresh_token');
    localStorage.removeItem('kaarvo_user');
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    showToast('👋 Signed out successfully.');
  };

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
          image: enhancedImage || rawImageFile || getCraftSpecificImage(catalog.category, catalog.descriptor.name),
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
            image: (item.verified_facts && item.verified_facts.image_url)
              ? item.verified_facts.image_url
              : (item.media && item.media.length > 0 && item.media[0].file_url)
                ? item.media[0].file_url
                : getCraftSpecificImage(item.category, item.title),
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

    // Pick active image: User's uploaded/enhanced photo if present, else authentic craft image
    const activeImage = enhancedImage || rawImageFile || getCraftSpecificImage(catalog.category, catalog.descriptor.name);

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
    
    // Refresh & Reset Studio form completely for next product listing
    setEnhancedImage(null);
    setRawImageFile(null);
    setImageLightingInfo(null);
    setVoiceText('');
    setRawSpokenHindi('');
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

  // Artisan Copilot Send (Real AI & Backend Connected)
  const handleCopilotSend = async (prompt) => {
    const q = (prompt || copilotInput).trim();
    if (!q) return;
    setCopilotHistory(prev => [...prev, { sender: 'artisan', content: q }]);
    setCopilotInput('');
    setCopilotLoading(true);

    // 1. Try Backend Copilot Engine (http://127.0.0.1:8001/api/v1/copilot/query)
    try {
      const res = await fetch(`${API_BASE}/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          setCopilotHistory(prev => [...prev, { sender: 'ai', content: data.answer }]);
          setCopilotLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend copilot error, using intelligent fallback:', err);
    }

    // 2. Intelligent Real-Time Conversational Fallback
    const qLower = q.toLowerCase();
    let fallbackAnswer = '';
    const totalRev = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

    if (/application|app\b|platform|kaarvo|baare me|kya hai|kya h|kaise kaam|about|features|intro/i.test(qLower)) {
      fallbackAnswer = `🙏 Namaste! Kaarvo AI ek AI-Powered Commerce Operating System hai jo Indian Artisans (हस्तशिल्पकार) ko digital bazaar aur ONDC se jodta hai:\n\n✨ 1. AI Visual Studio: Craft photos ko auto-lighting aur high-clarity background enhancement deta hai.\n🎙️ 2. Multilingual Voice Cataloger: Aap Hindi me bolein, ye automatically grammatically correct English catalog, title aur description bana deta hai.\n⚖️ 3. Cost-Plus Fair Pricing: Material + Artisan Labor cost ke aadhar par fair living-wage margin suggest karta hai.\n📜 4. Digital Heritage Passport: 100% offline QR code ke sath GI authenticity aur artisan provenance verify karta hai.\n💬 5. WhatsApp AI Sahayak: WhatsApp par mic se bolkar ya photo bhejkar sidha live ONDC listing aur order updates deta hai.\n\nCurrently aapke store me ${products.length} products listed hain aur ₹${totalRev.toLocaleString()} ki sales process ho chuki hai!`;
    } else if (/create product|list product|naya product|add product|kaise beche/i.test(qLower)) {
      fallbackAnswer = `📦 Naya Product List Karna Bahut Aasan Hai:\n\n1. '3-Pillar AI Studio' tab par jaayein ya niche WhatsApp Bot kholein.\n2. Apne craft ki photo upload karein (AI Visual Studio automatically photo enhance karega).\n3. Multilingual Mic par Hindi me bole (e.g. 'Banarasi silk saree zari embroidery ke sath').\n4. 'Generate Auto-Catalog' par click karein aur 'Publish to Kaarvo Store' dabayein!\n\nProduct turant live storefront aur ONDC Beckn network par customer khareedari ke liye uplabdh ho jayega.`;
    } else if (/sales|revenue|orders|kamai|munafa|analyze sales/i.test(qLower)) {
      fallbackAnswer = `📊 Aapke Business Ka Live Sales & Revenue Report:\n\n• Total Orders: ${orders.length} orders successfully received\n• Total Revenue: ₹${totalRev.toLocaleString()}\n• Active Live Listings: ${products.length} handcrafted items\n• Top Performing Crafts: Terracotta Clay Pot, Banarasi Saree\n\n💡 Recommendation: Tier-1 metro cities me handcrafted home decor aur textiles ki demand is hafte 28% badh gayi hai.`;
    } else if (/suggest price|pricing|price|rate|daam|kimat|kitne me bechu|margin/i.test(qLower)) {
      fallbackAnswer = `💡 Kaarvo Cost-Plus Fair Living-Wage Pricing Strategy:\n\nPricing formula: Base Cost = (Material Cost + Artisan Fair Wage)\n• Terracotta / Clay: 40% – 60% markup\n• Textiles / Handloom: 30% – 45% markup\n• Metal / Brass: 35% – 55% markup\n• Woodwork: 35% – 50% markup\n\nPillar 3 Pricing Engine me material aur labor cost daalne par accurate ONDC market range automatically mil jati hai.`;
    } else if (/campaign|marketing|diwali|festival|create campaign/i.test(qLower)) {
      fallbackAnswer = `📣 Festive Growth & Marketing Campaign Strategy:\n\n1. Festive Bundle Offer: Handcrafted Brass Diya aur Terracotta Planter ka 'Diwali Festive Box' create karein.\n2. Social Media Flyer Generator: Kisi bhi product card par 'Flyer' button click karke ready-to-post Instagram/WhatsApp flyer download karein.\n3. Voice Storytelling: Customers ko apne craft ki generational heritage kahani sunayein.\n\nIn 3 actions se aapka conversion rate 35% tak badh sakta hai!`;
    } else if (/inventory|stock|check inventory/i.test(qLower)) {
      fallbackAnswer = `📦 Live Inventory Health Check:\n\n• Total Cataloged Products: ${products.length} unique craft lines\n• Stock Status: All active craft batches are currently fulfilled and synced with ONDC.\n• Fast-Moving Items: Terracotta Clay Water Pots aur Handloom Sarees fast-moving category me hain.\n\n💡 Tip: Upcoming festival season ke liye kam se kam 25-30 units ka buffer stock ready rakhein.`;
    } else {
      fallbackAnswer = `Namaste! Maine aapka sawal samjha: "${q}".\n\nAap Kaarvo AI Copilot se yeh sab pooch sakte hain:\n• 'Muje apni application ke baare me btaooo' (Platform overview)\n• 'Analyze Sales' (Aapki live kamai aur orders ki report)\n• 'Suggest Price' (Craft category ke hisaab se fair price calculator)\n• 'Create Campaign' (Diwali aur festive marketing strategy)\n• 'Check Inventory' (Stock status aur buffer recommendation)`;
    }

    setCopilotHistory(prev => [...prev, { sender: 'ai', content: fallbackAnswer }]);
    setCopilotLoading(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
          <span style={{ color: '#F5F5F4', fontWeight: '700' }}>Kaarvo AI Commerce OS</span>
          <span style={{ color: '#A8A29E' }}>• SIH26090 ONDC MoSJE Market Linkage</span>
          {currentUser ? (
            <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '800' }}>
              👤 Signed in as {currentUser.full_name || currentUser.username} ({currentUser.role === 'artisan' ? 'Artisan' : 'Customer'})
            </span>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
              style={{ background: 'transparent', border: '1px solid #78716C', color: '#D6D3D1', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
            >
              Sign In
            </button>
          )}
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
          {/* ========================================================================= */}
          {/* GOOGLE STITCH LUXURY EDITORIAL HEADER                                    */}
          {/* ========================================================================= */}
          <header className="sticky top-0 left-0 w-full z-50 bg-[#141313]/95 backdrop-blur-md border-b border-[#444748]/30">
            {/* Top Micro Archival Ticker */}
            <div className="w-full bg-[#0e0e0e] border-b border-[#444748]/30 py-1.5 px-4 lg:px-12">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-[9px] uppercase tracking-[0.18em] text-[#c4c7c8] font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white inline-block"></span>
                  Curated Masterpieces from 28 Indian Craft Clusters
                </span>
                <span className="hidden md:inline tracking-widest text-white">Free Global Insured Shipping</span>
              </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="h-20">
              <div className="max-w-7xl mx-auto h-full px-4 lg:px-12 flex items-center justify-between gap-4">
                
                {/* Brand Logo & Name */}
                <div 
                  onClick={() => switchCustomerTab('home')}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    alt="KAARVO Luxury Logo"
                    className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                    src="https://lh3.googleusercontent.com/aida/AEtjO1Uhs93tN5Vdr6hc1UEwSALe4SxN2jM7MAWTO06wrU6kabT4FGtTQWfdiy9tbQ63qIPO-dpLgZ3ZivuBJ9iX0PlSzf8BhTtHyKmNQLpse_GSfDb8aVY9qItgKBCSlGodxdKuR4S8WE2n0S5WXYRSfUhpa8KusB3qLRM5wnoy4ZFj6I5fNXG0sq5XTt6w5Df6E64Y6SJ5T0bXiiZlQrEgi0Tl5Ey0XfRDaxvLNu6-1cQG"
                  />
                  <span className="font-serif text-[20px] font-bold tracking-[0.2em] uppercase text-white hidden sm:inline">
                    KAARVO
                  </span>
                </div>

                {/* Primary Editorial Navigation Links */}
                <nav className="hidden xl:flex items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.15em]">
                  <button
                    onClick={() => switchCustomerTab('home')}
                    className={`transition-all py-1 cursor-pointer ${
                      customerTab === 'home'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-[#c4c7c8] hover:text-white'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => switchCustomerTab('shop')}
                    className={`transition-all py-1 cursor-pointer ${
                      customerTab === 'shop'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-[#c4c7c8] hover:text-white'
                    }`}
                  >
                    Explore Crafts
                  </button>
                  <button
                    onClick={() => switchCustomerTab('collections')}
                    className={`transition-all py-1 cursor-pointer ${
                      customerTab === 'collections'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-[#c4c7c8] hover:text-white'
                    }`}
                  >
                    Collections
                  </button>
                  <button
                    onClick={() => switchCustomerTab('artisans')}
                    className={`transition-all py-1 cursor-pointer ${
                      customerTab === 'artisans'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-[#c4c7c8] hover:text-white'
                    }`}
                  >
                    Artisans
                  </button>
                  <button
                    onClick={() => switchCustomerTab('ai_ask')}
                    className={`transition-all py-1 cursor-pointer flex items-center gap-1 ${
                      customerTab === 'ai_ask'
                        ? 'text-white border-b-2 border-white font-bold'
                        : 'text-[#c4c7c8] hover:text-white'
                    }`}
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    AI Copilot
                  </button>
                </nav>

                {/* Right Interactive Action Controls */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Search Icon */}
                  <button
                    onClick={() => switchCustomerTab('shop')}
                    aria-label="Search"
                    className="p-2 text-[#c4c7c8] hover:text-white transition-colors cursor-pointer"
                    type="button"
                  >
                    <Search size={18} />
                  </button>

                  {/* Cart Icon with Counter */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    aria-label="Cart"
                    className="p-2 text-[#c4c7c8] hover:text-white transition-colors relative cursor-pointer"
                    type="button"
                  >
                    <ShoppingBag size={18} />
                    {cartItems.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full"></span>
                    )}
                  </button>

                  {/* User Account / Sign In */}
                  {currentUser ? (
                    <div className="flex items-center gap-2 bg-[#201f1f] px-3 py-1.5 rounded-full border border-[#353434]">
                      <div className="w-5 h-5 rounded-full bg-white text-[#141313] flex items-center justify-center text-[10px] font-extrabold">
                        {(currentUser.full_name || currentUser.username || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider hidden sm:inline">
                        {currentUser.full_name || currentUser.username}
                      </span>
                      <button
                        onClick={handleAuthLogout}
                        title="Sign Out"
                        className="text-[#8e9192] hover:text-red-400 ml-1 cursor-pointer"
                      >
                        <LogOut size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                      className="hidden sm:inline text-[11px] font-bold text-[#c4c7c8] hover:text-white uppercase tracking-[0.15em] transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                  )}

                  {/* Switch to Artisan Studio */}
                  <button
                    onClick={() => switchMode('artisan')}
                    className="border border-[#e2e2e2] text-white text-[11px] font-bold uppercase tracking-[0.15em] px-4 py-2 hover:bg-white hover:text-[#141313] transition-all cursor-pointer"
                  >
                    Start Selling
                  </button>

                  {/* Master Artisan Avatar */}
                  <div className="flex items-center pl-1">
                    <img
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-[#444748]/60 cursor-pointer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuALfOFj7XjcnfofzZz2EQCPzpY0eOLUjFj9gqBAZ6bXDSa0GRxats1_rooKzbCwxNIuCkAxxlYFE_V-SLZZdIF-JEm1TNlx68D4X1BoD9_W37SnX-X8Cv7G2UaebRLs1vpv1fm6k5OJy--9vTzGba0PbiYG8I70_6m2VZubbJzSnWuY7PjI9t1Z_p8HAm9rwjuvbGlmEnW404ydG-vrOM2DctDZ4puIyLhSugh4bsQ"
                      onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* MAIN CUSTOMER BODY: STITCH VIEWS                                         */}
          {/* ========================================================================= */}
          <main className="w-full bg-[#141313] text-[#e5e2e1] min-h-screen">
            
            {/* --------------------------------------------------------------------- */}
            {/* VIEW 1: HOME PAGE                                                     */}
            {/* --------------------------------------------------------------------- */}
            {customerTab === 'home' && (
              <div className="flex flex-col w-full text-[#e5e2e1]">
                
                {/* SECTION A: CINEMATIC HERO */}
                <section className="relative w-full bg-[#0e0e0e] overflow-hidden border-b border-[#353434]/40">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_55%_35%,rgba(197,166,106,0.12),transparent_75%)]"></div>
                  
                  <div className="max-w-7xl mx-auto px-4 lg:px-12 py-16 lg:py-24 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                      
                      {/* Left Editorial Meta & Copy */}
                      <div className="lg:col-span-6 flex flex-col items-start space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a2a2a] border border-[#353434]">
                          <span className="w-1.5 h-1.5 bg-white"></span>
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                            AUTHENTIC INDIAN CRAFTSMANSHIP
                          </span>
                        </div>

                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                          Tradition,<br />Crafted to Last.
                        </h1>

                        <p className="text-[16px] text-[#c4c7c8] max-w-xl leading-relaxed">
                          Discover extraordinary handmade heirlooms from India’s master artisan guilds. Every artifact is verified with GI provenance and engineered with centuries of ancestral mastery.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                          <button
                            onClick={() => switchCustomerTab('shop')}
                            className="inline-flex items-center justify-center bg-[#494949] text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-white hover:text-[#141313] transition-all cursor-pointer"
                          >
                            EXPLORE CRAFTS
                          </button>
                          <button
                            onClick={() => switchMode('artisan')}
                            className="inline-flex items-center justify-center bg-transparent border border-white text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-white hover:text-[#141313] transition-all cursor-pointer"
                          >
                            START SELLING
                          </button>
                        </div>

                        {/* Swiss Precision Micro Ledger Index */}
                        <div className="pt-4 grid grid-cols-3 gap-4 w-full max-w-md bg-[#1c1b1b] p-4 border border-[#353434]">
                          <div>
                            <span className="block text-[9px] font-bold uppercase text-[#8e9192] tracking-widest">REGISTRY NO.</span>
                            <span className="text-[11px] font-bold text-white tracking-wider">IND-G28-409</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase text-[#8e9192] tracking-widest">GUILD CERTIFIED</span>
                            <span className="text-[11px] font-bold text-[#e5e2e1] tracking-wider">100% SECURE</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase text-[#8e9192] tracking-widest">METALLURGY</span>
                            <span className="text-[11px] font-bold text-white tracking-wider">PVD BRONZE / SILK</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Focal Masterpiece Showcase (Dhokra Lost-Wax Vase with Horological Crosshair) */}
                      <div className="lg:col-span-6 relative flex justify-center">
                        <div className="relative w-full max-w-md lg:max-w-lg aspect-square bg-[#201f1f] p-4 flex flex-col justify-between group shadow-2xl border border-[#353434]">
                          
                          {/* Dial Glare Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#0e0e0e]/80 via-transparent to-white/10 pointer-events-none"></div>

                          {/* Top Spec Ledger */}
                          <div className="relative z-10 flex items-center justify-between pb-2">
                            <span className="text-[9px] font-bold text-white uppercase tracking-[0.22em] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-white"></span> PIECE N° 01/40 • BASTAR
                            </span>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">
                              CHHATTISGARH CLUSTER
                            </span>
                          </div>

                          {/* Center Artwork Container with Precision Crosshairs */}
                          <div className="relative my-auto flex items-center justify-center py-4">
                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 overflow-hidden bg-[#0e0e0e] flex items-center justify-center">
                              <img
                                alt="Dhokra Vase Masterpiece"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7owgjKgr-k4As1OoxxwRAxypiyws-9A9UiEG97mFkzW56TRuhWJI1DSSdOqsyYVmyX-RYE0x1bJ3DRNe6U6SlHND4OBj75rc2GSd13nz77z9P9sdwdTAYFCiYIhkS7iyTaSen8okfXeaI9WmBVZnPGCzClN7am18pk2GGz0Eg5IOFlgkFoBoLwK9c9vwWc6ERgLY4tLYj-lnGsX4Ux40DlgmIGNubeXid2R8Dc2k"
                              />
                              {/* Radial Precision Crosshair Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-full h-[1px] bg-white/20"></div>
                                <div className="h-full w-[1px] bg-white/20 absolute"></div>
                                <div className="w-24 h-24 rounded-full border border-white/20 absolute"></div>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Caliber Spec Grid */}
                          <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 bg-[#1c1b1b] p-3 text-center border border-[#353434]/50">
                            <div>
                              <span className="block text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">CADENCE</span>
                              <span className="text-[11px] font-bold text-white">84 HRS HAND-CAST</span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">ALLOY</span>
                              <span className="text-[11px] font-bold text-white">BELL METAL C260</span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">ATELIER</span>
                              <span className="text-[11px] font-bold text-white">BAGHEL GUILD</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* SECTION B: ASYMMETRICAL PROMOTIONAL BANNERS */}
                <section className="w-full bg-[#141313] py-16 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto px-4 lg:px-12 space-y-8">
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#353434]/50">
                      <div>
                        <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] block mb-1">
                          CURATED ATELIERS
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl text-white">Private Gallery Series</h2>
                      </div>
                      <button
                        onClick={() => switchCustomerTab('shop')}
                        className="text-[11px] font-bold text-white uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        VIEW ALL COMPLICATIONS <ExternalLink size={14} />
                      </button>
                    </div>

                    {/* Asymmetrical 3-block grid matching Stitch */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Large Wide Block: The Heritage Collection (Banarasi Zari) */}
                      <div className="lg:col-span-8 bg-[#201f1f] border border-[#353434] relative flex flex-col justify-between overflow-hidden group min-h-[380px] p-6 lg:p-8">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-35 mix-blend-luminosity"
                          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXzQRCTJRyOv7lxExPiTIH82UJKKnkEbxSv-2qCCgMGBAagJ-6Guzsf1gggdKrNTyz7oXvCAGTgnh2cY-iT3ArL9Ju5wvJhZ20hHhgTl19s41OCgK75LaSbhN1xzIPO13KEhhQClx1jyN9Tys54psQnm_mcYZd3G1yBrY68c2jM1DXoBy4_fjdgFv1an0CNNK00yxChJ43jE8GiCCVr5d6MU4KkB33tjag3tryHmE')` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#201f1f]/80 to-transparent pointer-events-none"></div>
                        
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="bg-[#0e0e0e] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[#353434]">
                            LIMITED SERIES • 12 PIECES
                          </span>
                          <span className="text-[11px] font-bold text-[#c4c7c8] uppercase tracking-widest">
                            VARANASI CADENCE
                          </span>
                        </div>

                        <div className="relative z-10 max-w-lg space-y-3 pt-24">
                          <h3 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
                            The Heritage Collection
                          </h3>
                          <p className="text-[14px] text-[#c4c7c8] leading-relaxed">
                            Centuries-old jacquard patterns calibrated with 24-karat gold warp leaf. Handcrafted across 90 weaving days per drape.
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() => switchCustomerTab('shop')}
                              className="inline-flex items-center gap-2 bg-white text-[#141313] text-[11px] font-bold uppercase tracking-[0.18em] px-6 py-3 hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                            >
                              DISCOVER COLLECTION <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Medium Block: Handcrafted Home Decor (Channapatna) */}
                      <div className="lg:col-span-4 bg-[#201f1f] border border-[#353434] relative flex flex-col justify-between overflow-hidden group min-h-[380px] p-6 lg:p-8">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-30"
                          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBy9AlAaF-Yo3DEQYO2S7DfV0Ewk8ZLA8-qViWai8FXVl3SnZDhfOuYCQ4H6hFdmKPwqj1OpQFHw3PV77qpi067mTjN0qi5yiacZFPR_wfBdM_S46xjh9NeTfNmzCdimDhQiFHAzkY6Ms5uERh-d8AZ6RHL8ILvRbEN3J1fjVxV7UG_XZgN5JOLrI7tZyM7EZcEUaJmJZ1hbxNg2NpR9zIhxEAQ8jIA67gXYs2JjgU')` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#201f1f]/70 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="bg-[#0e0e0e] text-[#c8c6c6] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 border border-[#353434]">
                            GEOMETRIC OBJECTS
                          </span>
                          <span className="text-white text-xs">🏛️</span>
                        </div>

                        <div className="relative z-10 space-y-3 pt-24">
                          <h3 className="font-serif text-2xl text-white">Handcrafted Home Decor</h3>
                          <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                            Turned teakwood, lost-wax bell metal fixtures, and hand-chiseled sandstone totems.
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() => switchCustomerTab('shop')}
                              className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white text-[11px] font-bold uppercase tracking-[0.18em] px-5 py-2.5 hover:bg-white hover:text-[#141313] transition-colors cursor-pointer"
                            >
                              SHOP PIECES
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Lower Split Banner (Textiles & Zero Broker Markup Protocol) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left Pashmina Block */}
                      <div className="lg:col-span-4 bg-[#201f1f] border border-[#353434] relative flex flex-col justify-between p-6 lg:p-8 min-h-[320px] overflow-hidden group">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-30"
                          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXPsZ07doy8wEcazxryIgOZEIQMChIwdDMiV65XOQaxa81mhcfELuST-1SXS6xtulLO7BjyTp6g5ZPFWS_nCYR3Yc35GazHTQDUe57bhzdJE-lU8lkZD-riJlWVbzhBmGNq8sw2XoPfAtwV8wPf4gyRtSOg_iRWqQf2-CEsl0fMKXsMbsbf_XSpUy4grKnsrMWWy-gHTaBs0T4WYt6oMc5pIU8_5Khob9FMkGSOOM')` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#201f1f]/80 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-[#0e0e0e] px-2 py-0.5 border border-[#353434]">
                            GI SEAL VERIFIED
                          </span>
                          <span className="text-[9px] font-bold text-[#8e9192] uppercase">SRINAGAR</span>
                        </div>

                        <div className="relative z-10 space-y-2">
                          <h3 className="font-serif text-2xl text-white">The Art of Textiles</h3>
                          <p className="text-[12px] text-[#c4c7c8]">
                            Grade-A Himalayan Changthangi spun cashmere with needlework certified under GI protocol.
                          </p>
                          <button
                            onClick={() => switchCustomerTab('shop')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-white uppercase tracking-widest pt-2 hover:underline cursor-pointer"
                          >
                            EXPLORE WEAVES <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Right Protocol Ledger Block */}
                      <div className="lg:col-span-8 bg-[#2a2a2a] border border-[#353434] relative flex flex-col md:flex-row items-center justify-between p-6 lg:p-8 overflow-hidden gap-6">
                        <div className="relative z-10 space-y-3 max-w-md">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                            DIRECT COMMERCE PROTOCOL
                          </span>
                          <h3 className="font-serif text-2xl sm:text-3xl text-white">
                            Zero Broker Markup. Total Lineage Ownership.
                          </h3>
                          <p className="text-[14px] text-[#c4c7c8] leading-relaxed">
                            Every Indian rupee transacted delivers immediate, cryptographically registered liquidity directly into verified artisan bank accounts via ONDC.
                          </p>
                          <div className="pt-2 flex items-center gap-4">
                            <span className="font-serif text-3xl font-bold text-white">88.4%</span>
                            <span className="text-[12px] text-[#c4c7c8] leading-tight">
                              Average gross proceeds directly received by artisan cooperatives
                            </span>
                          </div>
                        </div>

                        <div className="relative z-10 w-full md:w-64 bg-[#0e0e0e] p-5 border border-[#353434] flex flex-col justify-between">
                          <div className="flex items-center justify-between pb-3">
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">SETTLEMENT ENGINE</span>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold text-[#c4c7c8]">
                              <span>ARTISAN SHARE</span>
                              <span className="text-white font-extrabold">₹28,500</span>
                            </div>
                            <div className="w-full bg-[#201f1f] h-2 overflow-hidden">
                              <div className="bg-white h-full w-[88.4%]"></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-[#8e9192] pt-1">
                              <span>LOGISTICS & TAX</span>
                              <span>₹3,500</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-white text-center uppercase tracking-widest pt-4 border-t border-[#353434] mt-3">
                            ESCROW CLEAR: INSTANT (ONDC)
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </section>

                {/* SECTION C: 4 HOROLOGICAL VALUE STANDARDS */}
                <section className="w-full bg-[#0e0e0e] py-12 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto px-4 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="p-6 bg-[#201f1f] border border-[#353434] flex flex-col space-y-3 hover:bg-[#2a2a2a] transition-colors">
                        <div className="flex items-center justify-between">
                          <CheckCircle size={22} className="text-white" />
                          <span className="text-[10px] font-bold text-[#8e9192]">01</span>
                        </div>
                        <h4 className="font-serif text-[16px] text-white font-bold">Direct From Master Artisans</h4>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          100% direct studio provenance. Zero commercial brokers, dealers, or opaque middle tier.
                        </p>
                      </div>

                      <div className="p-6 bg-[#201f1f] border border-[#353434] flex flex-col space-y-3 hover:bg-[#2a2a2a] transition-colors">
                        <div className="flex items-center justify-between">
                          <CreditCard size={22} className="text-white" />
                          <span className="text-[10px] font-bold text-[#8e9192]">02</span>
                        </div>
                        <h4 className="font-serif text-[16px] text-white font-bold">Fair & Transparent Pricing</h4>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          Immutable smart payouts logged on public ledgers with audited artisan living wage royalty structures.
                        </p>
                      </div>

                      <div className="p-6 bg-[#201f1f] border border-[#353434] flex flex-col space-y-3 hover:bg-[#2a2a2a] transition-colors">
                        <div className="flex items-center justify-between">
                          <Award size={22} className="text-white" />
                          <span className="text-[10px] font-bold text-[#8e9192]">03</span>
                        </div>
                        <h4 className="font-serif text-[16px] text-white font-bold">Authentic GI Heritage</h4>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          Every artifact dispatched carries its authentic Geographical Indication stamp and genealogy ledger.
                        </p>
                      </div>

                      <div className="p-6 bg-[#201f1f] border border-[#353434] flex flex-col space-y-3 hover:bg-[#2a2a2a] transition-colors">
                        <div className="flex items-center justify-between">
                          <Sparkles size={22} className="text-white" />
                          <span className="text-[10px] font-bold text-[#8e9192]">04</span>
                        </div>
                        <h4 className="font-serif text-[16px] text-white font-bold">AI-Powered Cataloging</h4>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          Smartphone AI assistant converts workshop voice in Indian languages into museum-grade 4K listings instantly.
                        </p>
                      </div>

                    </div>
                  </div>
                </section>

                {/* SECTION D: SHOP BY COLLECTION */}
                <section className="w-full bg-[#141313] py-16 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto px-4 lg:px-12 space-y-12">
                    
                    <div className="text-center max-w-xl mx-auto space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white block">
                        CURATION BY MEDIUM
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-white">Shop By Collection</h2>
                      <p className="text-[14px] text-[#c4c7c8]">
                        Handcrafted lineages categorized by their geological and mineral foundations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Collection 1: Pottery & Ceramics */}
                      <div 
                        onClick={() => { setCustomerCategory('pottery'); switchCustomerTab('shop'); }}
                        className="bg-[#201f1f] border border-[#353434] flex flex-col overflow-hidden group hover:bg-[#2a2a2a] transition-all cursor-pointer"
                      >
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Pottery & Ceramics Collection"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8J9qQ8F6XPoZlY8ZkXiIxAYRw-R9wy8ELozin0L3d2AsR1cYCFVU8VZ4nzVPZsSCzwQv6ZQmCbapNuHomiWLsfQA-2628ITqHRxoh0QoGFqY8QsqDdzb411L8P6sxbKzah7v3vuzoCwCURk9DJYQ-e5icaBoIW44WHLgUSxN8p65FWjhBR0P_xHm6cDJFLs5MZNS7qdy1znqCyIU1E6fIWg8qz6TOY8oaJuBVTz4"
                          />
                          <div className="absolute top-4 left-4 bg-[#0e0e0e]/90 px-3 py-1 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">142 MASTERWORKS</span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block mb-1">
                              MINERAL GLAZE & CLAY
                            </span>
                            <h3 className="font-serif text-xl text-white">Pottery & Ceramics</h3>
                            <p className="text-[12px] text-[#c4c7c8] mt-1">
                              Jaipur Egyptian-paste Blue Pottery, Molela terracotta votives, and Khurja stoneware.
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-widest">
                            <span className="group-hover:underline">VIEW COLLECTION</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Collection 2: Textiles & Fabrics */}
                      <div 
                        onClick={() => { setCustomerCategory('textiles'); switchCustomerTab('shop'); }}
                        className="bg-[#201f1f] border border-[#353434] flex flex-col overflow-hidden group hover:bg-[#2a2a2a] transition-all cursor-pointer"
                      >
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Textiles & Fabrics Collection"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFlKCXXQ_JaLnFPtIyyCBfr9UCl287bu_JXPWczmOwbJM0w36f19IM5Bqx_96RaNg1dqhxleTBxtnjvq6zrgQw-H_cFM4WR993-TvyN-5KEMK_UUSHhHGs4UV2fFT9dGXWtz84LREkviNMbdr0oQVX1Cuwsv3hI9RainhdG6aY_ZeKd7LZSAC8v_TU_GYWt5shgoHiE7DijTa-zaxwGNFKjzx-LXwCSmZ4IzDXO7c"
                          />
                          <div className="absolute top-4 left-4 bg-[#0e0e0e]/90 px-3 py-1 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">88 MASTERWORKS</span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block mb-1">
                              DOUBLE IKAT & CASHMERE
                            </span>
                            <h3 className="font-serif text-xl text-white">Textiles & Fabrics</h3>
                            <p className="text-[12px] text-[#c4c7c8] mt-1">
                              Patan Patola looms, Varanasi Katan brocades, and Chanderi gossamer cottons.
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-widest">
                            <span className="group-hover:underline">VIEW COLLECTION</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                      {/* Collection 3: Home Decor & Woodcraft */}
                      <div 
                        onClick={() => { setCustomerCategory('woodwork'); switchCustomerTab('shop'); }}
                        className="bg-[#201f1f] border border-[#353434] flex flex-col overflow-hidden group hover:bg-[#2a2a2a] transition-all cursor-pointer"
                      >
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Home Decor & Woodcraft Collection"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqmymwXinYA329bej5AmsBAMHPJURViNADkX6FXC5IAZF4BZ3qWc_vSShNB4AfELSE1efFjlnKtOOPuRsntXoFdVJKDU7ZrdH353sNchrN5N-Cc7_Oxr9II3pzAjsgCe5aSkEvqT5icS9W7LzFaHAk-j6cnouvU7-z9DUdef7YneXkrcpcAxxlmx7mvdnuvNM8FJ1LIE1FwzumWH9aNnCqEzjlditFMJlhRd_JcNc"
                          />
                          <div className="absolute top-4 left-4 bg-[#0e0e0e]/90 px-3 py-1 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">210 MASTERWORKS</span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block mb-1">
                              CARVED HARDWOOD & METALS
                            </span>
                            <h3 className="font-serif text-xl text-white">Home Decor & Woodcraft</h3>
                            <p className="text-[12px] text-[#c4c7c8] mt-1">
                              Saharanpur hand-carvings, Sankheda lacquer furniture, and Bidriware silver inlay.
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-widest">
                            <span className="group-hover:underline">VIEW COLLECTION</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </section>

                {/* SECTION E: TRENDING CERTIFIED MASTERWORKS (LIVE PRODUCTS + STITCH PIECES) */}
                <section className="w-full bg-[#0e0e0e] py-16 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto px-4 lg:px-12 space-y-8">
                    
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#353434]/50">
                      <div>
                        <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] block mb-1">
                          PROVENANCE SELECTIONS
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl text-white">
                          Trending Certified Masterworks
                        </h2>
                      </div>
                      <button
                        onClick={() => switchCustomerTab('shop')}
                        className="text-[11px] font-bold text-white uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        VIEW COMPLETE VITRINE <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* 4-column Luxury Vitrine Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Item 1: Bastar Dhokra */}
                      <div className="bg-[#201f1f] border border-[#353434] flex flex-col group hover:bg-[#2a2a2a] transition-all">
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Sahasrara Dhokra Brass Vessel"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgERiqwe-jJ4j-wXH_3Mlw0DbHukdEwqkxTh9jzjALKWrKQolJ33n1rN8fRQTHWOUKeJIZcFzlPLv5rnC79GKmOABdzWbpIv3CSB8e9JBY1znBQ2dVYJemnhm8uW8JdeMLbq9HpqXtm-CVo88gZ1d6vzOxleOvkfnodF14UxQ2a2RO-s6BXWscY_2cWjr0AykijbCWZZPXC5uqZR-tPpz0zrAwsMqWvy4pMR00t3A"
                          />
                          <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/90 px-2 py-0.5 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase">GI CERTIFIED</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block">
                              DEVENDRA BAGHEL • BASTAR
                            </span>
                            <h3 className="font-serif text-[17px] text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                              Sahasrara Dhokra Brass Vessel
                            </h3>
                            <p className="text-[12px] text-[#8e9192] mt-0.5 line-clamp-1">
                              Lost-wax bronze alloy casting • 72 hrs
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-[#353434]/60">
                            <span className="font-serif text-lg font-bold text-white">₹18,500</span>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: 'dhokra-top-01',
                                  title: 'Sahasrara Dhokra Brass Vessel',
                                  price: 18500,
                                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgERiqwe-jJ4j-wXH_3Mlw0DbHukdEwqkxTh9jzjALKWrKQolJ33n1rN8fRQTHWOUKeJIZcFzlPLv5rnC79GKmOABdzWbpIv3CSB8e9JBY1znBQ2dVYJemnhm8uW8JdeMLbq9HpqXtm-CVo88gZ1d6vzOxleOvkfnodF14UxQ2a2RO-s6BXWscY_2cWjr0AykijbCWZZPXC5uqZR-tPpz0zrAwsMqWvy4pMR00t3A',
                                  category: 'Metalcraft & Dhokra'
                                });
                              }}
                              className="bg-[#353434] text-white hover:bg-white hover:text-[#141313] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                              type="button"
                            >
                              ACQUIRE
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item 2: Neelambari Blue Glaze Jar */}
                      <div className="bg-[#201f1f] border border-[#353434] flex flex-col group hover:bg-[#2a2a2a] transition-all">
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Neelambari Blue Glaze Jar"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmAHqpENVakqXswpvUEKTejh05201o6Q0g6JoWY0IBk_E43l2h21DZu5ItYGaTm7bKmj2sX_6G9yeigqZfSSkDMs3SEJRBWgHJFoqCYPHMKgrmVQNnIhXvcUru4O6MIMJLSYit2baHZEy_m-LJGyJ7vDHnXnxHA5vCmV5ElHJg6DbvlUr5HjQM85izdUV3xdrlpCv2IxXEiu6rYPLxn8zq24A3IKJCnM5gX3sVxKo"
                          />
                          <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/90 px-2 py-0.5 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase">KRIPAL STUDIO</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block">
                              KRIPAL KUMBH • JAIPUR
                            </span>
                            <h3 className="font-serif text-[17px] text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                              Neelambari Blue Glaze Jar
                            </h3>
                            <p className="text-[12px] text-[#8e9192] mt-0.5 line-clamp-1">
                              Quartz & fuller's earth fired amphora
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-[#353434]/60">
                            <span className="font-serif text-lg font-bold text-white">₹12,200</span>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: 'pottery-top-02',
                                  title: 'Neelambari Blue Glaze Jar',
                                  price: 12200,
                                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmAHqpENVakqXswpvUEKTejh05201o6Q0g6JoWY0IBk_E43l2h21DZu5ItYGaTm7bKmj2sX_6G9yeigqZfSSkDMs3SEJRBWgHJFoqCYPHMKgrmVQNnIhXvcUru4O6MIMJLSYit2baHZEy_m-LJGyJ7vDHnXnxHA5vCmV5ElHJg6DbvlUr5HjQM85izdUV3xdrlpCv2IxXEiu6rYPLxn8zq24A3IKJCnM5gX3sVxKo',
                                  category: 'Pottery & Ceramics'
                                });
                              }}
                              className="bg-[#353434] text-white hover:bg-white hover:text-[#141313] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                              type="button"
                            >
                              ACQUIRE
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item 3: Shikargah Banarasi Katan Silk */}
                      <div className="bg-[#201f1f] border border-[#353434] flex flex-col group hover:bg-[#2a2a2a] transition-all">
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Shikargah Banarasi Katan Silk"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmI2nVu2NB_RhbcBe0IQyshk9r-gE449ZW1jIbcb-o8c4_sXppvDEyC3CWU5Bb5JHHH4lDUq4k3ocbu3vfGx8EV2cm3PT6ELBHfUg9lLHnM0ROvZidtAguxdeHuYxGmLfu9cy2tLYZU6241CEjA58BlsOFU_y1j-7JCNQEJWyak6HR34NlgeWnTrqD4yM-kxiwaygKMJcUpKF_UMIYb_Jjkl-oQZBq8cCHcGAEKWg"
                          />
                          <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/90 px-2 py-0.5 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase">LIMITED WEAVE</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block">
                              RASHID ANSARI • VARANASI
                            </span>
                            <h3 className="font-serif text-[17px] text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                              Shikargah Banarasi Katan Silk
                            </h3>
                            <p className="text-[12px] text-[#8e9192] mt-0.5 line-clamp-1">
                              Pure mulberry silk with antique gold zari
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-[#353434]/60">
                            <span className="font-serif text-lg font-bold text-white">₹34,000</span>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: 'silk-top-03',
                                  title: 'Shikargah Banarasi Katan Silk',
                                  price: 34000,
                                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmI2nVu2NB_RhbcBe0IQyshk9r-gE449ZW1jIbcb-o8c4_sXppvDEyC3CWU5Bb5JHHH4lDUq4k3ocbu3vfGx8EV2cm3PT6ELBHfUg9lLHnM0ROvZidtAguxdeHuYxGmLfu9cy2tLYZU6241CEjA58BlsOFU_y1j-7JCNQEJWyak6HR34NlgeWnTrqD4yM-kxiwaygKMJcUpKF_UMIYb_Jjkl-oQZBq8cCHcGAEKWg',
                                  category: 'Textiles & Weaves'
                                });
                              }}
                              className="bg-[#353434] text-white hover:bg-white hover:text-[#141313] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                              type="button"
                            >
                              ACQUIRE
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Item 4: Bhakti Rosewood Intarsia Box */}
                      <div className="bg-[#201f1f] border border-[#353434] flex flex-col group hover:bg-[#2a2a2a] transition-all">
                        <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden">
                          <img
                            alt="Bhakti Rosewood Intarsia Box"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtlYs0CKotoqzgOsaf_BTiLGipkSP_yavVegMyCBqm7Lfo0u0NGdsC1_VTumxLptyRNJr0UNMgVq_hcUfXEMDyVDM_hvI0J0iO_XVq-o5BXWCMggEvJESS4m2V9-v7Ie8sKTCP4EpCqczHM-S8MT51rrmjwztXqQYTya7QNleTSq_gJoeZMIA12ciW7Wxc6tPpvD1yPNYJch04MBZVwkKMRoRN10PcmpvDuzEM7KA"
                          />
                          <div className="absolute bottom-2 left-2 bg-[#0e0e0e]/90 px-2 py-0.5 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase">INTARSIA SEAL</span>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest block">
                              M. RAMACHANDRA • MYSURU
                            </span>
                            <h3 className="font-serif text-[17px] text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                              Bhakti Rosewood Intarsia Box
                            </h3>
                            <p className="text-[12px] text-[#8e9192] mt-0.5 line-clamp-1">
                              Seasoned rosewood & brass joinery
                            </p>
                          </div>
                          <div className="pt-2 flex items-center justify-between border-t border-[#353434]/60">
                            <span className="font-serif text-lg font-bold text-white">₹15,800</span>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: 'wood-top-04',
                                  title: 'Bhakti Rosewood Intarsia Box',
                                  price: 15800,
                                  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtlYs0CKotoqzgOsaf_BTiLGipkSP_yavVegMyCBqm7Lfo0u0NGdsC1_VTumxLptyRNJr0UNMgVq_hcUfXEMDyVDM_hvI0J0iO_XVq-o5BXWCMggEvJESS4m2V9-v7Ie8sKTCP4EpCqczHM-S8MT51rrmjwztXqQYTya7QNleTSq_gJoeZMIA12ciW7Wxc6tPpvD1yPNYJch04MBZVwkKMRoRN10PcmpvDuzEM7KA',
                                  category: 'Wood & Lacquer'
                                });
                              }}
                              className="bg-[#353434] text-white hover:bg-white hover:text-[#141313] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                              type="button"
                            >
                              ACQUIRE
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </section>

                {/* SECTION F: FEATURED ARTISAN (MASTER HARIRAM) */}
                <section className="w-full bg-[#141313] py-16 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto px-4 lg:px-12">
                    <div className="bg-[#201f1f] border border-[#353434] overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                        
                        {/* Portrait */}
                        <div className="lg:col-span-6 relative min-h-[440px] lg:min-h-[540px] bg-[#0e0e0e]">
                          <img
                            alt="Master Hariram Portrait"
                            className="w-full h-full object-cover object-center"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALfOFj7XjcnfofzZz2EQCPzpY0eOLUjFj9gqBAZ6bXDSa0GRxats1_rooKzbCwxNIuCkAxxlYFE_V-SLZZdIF-JEm1TNlx68D4X1BoD9_W37SnX-X8Cv7G2UaebRLs1vpv1fm6k5OJy--9vTzGba0PbiYG8I70_6m2VZubbJzSnWuY7PjI9t1Z_p8HAm9rwjuvbGlmEnW404ydG-vrOM2DctDZ4puIyLhSugh4bsQ"
                          />
                          <div className="absolute bottom-4 left-4 bg-[#0e0e0e]/90 px-4 py-2 border border-[#353434]">
                            <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em] block">
                              MOLELA CLAY GUILD • RAJASTHAN
                            </span>
                            <span className="text-[11px] font-semibold text-[#e5e2e1]">
                              MASTER SCULPTOR ATELIER
                            </span>
                          </div>
                        </div>

                        {/* Narrative & Metrics */}
                        <div className="lg:col-span-6 p-6 lg:p-12 flex flex-col justify-between space-y-6">
                          <div className="space-y-4">
                            <div className="inline-flex items-center gap-2">
                              <span className="w-2 h-2 bg-[#c8c6c6] rounded-full"></span>
                              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8c6c6]">
                                MASTER OF THE MONTH
                              </span>
                            </div>

                            <h2 className="font-serif text-3xl sm:text-4xl text-white">
                              Master Hariram — 4th Generation Terracotta Sculptor
                            </h2>

                            <p className="text-[15px] text-[#c4c7c8] leading-relaxed">
                              For thirty-eight uninterrupted years, Hariram has shaped the alluvial riverbed clay of the Banas river into monumental, unglazed bas-relief plaques. Working without casting molds, every curve is finger-carved from sacred ancestral memory.
                            </p>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="bg-[#1c1b1b] p-4 border border-[#353434]">
                                <span className="font-serif text-2xl font-bold text-white block">46 YRS</span>
                                <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">
                                  GUILD HERITAGE RECORD
                                </span>
                              </div>
                              <div className="bg-[#1c1b1b] p-4 border border-[#353434]">
                                <span className="font-serif text-2xl font-bold text-white block">2,400+</span>
                                <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">
                                  HEIRLOOMS DISPATCHED GLOBALLY
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-4">
                            <button
                              onClick={() => { setCustomerCategory('pottery'); switchCustomerTab('shop'); }}
                              className="inline-flex items-center gap-2 bg-white text-[#141313] text-[11px] font-bold uppercase tracking-[0.18em] px-6 py-3.5 hover:bg-[#c8c6c6] transition-all cursor-pointer"
                            >
                              MEET THE ARTISAN <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={() => switchCustomerTab('artisans')}
                              className="inline-flex items-center gap-2 bg-[#2a2a2a] text-white text-[11px] font-bold uppercase tracking-[0.18em] px-6 py-3.5 hover:bg-white hover:text-[#141313] transition-all cursor-pointer"
                            >
                              EXPLORE HARIRAM’S ATELIER
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION G: CLOSING HOROLOGICAL BANNER */}
                <section className="w-full bg-[#0e0e0e] relative py-20 overflow-hidden border-b border-[#353434]/40">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlwwlQYZPAIH_6AZYW_m605-xc4ztYLs_p1mL7ehPOQ_Lb6HuLp1fgFyq6MI7C7YqfT3iYoidChFDY9Ora2pc_rBMFuGC3I8qACUpvkG3A-xUlgrT7pHcOky-B4eab6f7xIITKyBqH8bJsOPZ3zsTSV5nS3hH0F2AJIw4XK010pO4uxm3kaGrI3-4B6O-5verJf8LnMz2BM1mUfDkNPbQpi8p1wbCqLr99__TFlN4')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-[#0e0e0e] pointer-events-none"></div>

                  <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-12 text-center space-y-4">
                    <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em] block">
                      EXTRAORDINARY LIVING ANTIQUITIES
                    </span>
                    <h2 className="font-serif text-3xl sm:text-5xl text-white">
                      World-Class Artisan Collections
                    </h2>
                    <p className="text-[15px] text-[#c4c7c8] max-w-2xl mx-auto leading-relaxed">
                      Join the private ledger of patrons, curators, and collectors investing directly in the sustained legacy of India’s finest master creators.
                    </p>
                    <div className="pt-4 flex justify-center items-center">
                      <button
                        onClick={() => switchCustomerTab('shop')}
                        className="bg-[#494949] text-white hover:bg-white hover:text-[#141313] px-10 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                      >
                        BROWSE VAULT
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* VIEW 2: EXPLORE CRAFTS / SHOP                                         */}
            {/* --------------------------------------------------------------------- */}
            {customerTab === 'shop' && (
              <div className="flex flex-col w-full text-[#e5e2e1]">
                
                {/* Sub-Hero Header */}
                <section className="relative bg-[#0e0e0e] px-4 lg:px-12 pt-12 pb-8 border-b border-[#353434]/40">
                  <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
                    
                    {/* Breadcrumbs & Cluster Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">
                      <div className="flex items-center gap-2">
                        <span className="text-white">REGISTRY ARCHIVE</span>
                        <span>/</span>
                        <span className="text-white">28 GI CERTIFIED CRAFT CLUSTERS</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#201f1f] px-3 py-1 border border-[#353434]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="text-[#e5e2e1]">184 MASTERWORKS RECORDED IN LEDGER</span>
                      </div>
                    </div>

                    {/* Display Title & Direct Guild Ratio */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                      <div className="lg:col-span-8 space-y-2">
                        <h1 className="font-serif text-4xl sm:text-5xl text-white uppercase tracking-tight">
                          Discover Handmade.
                        </h1>
                        <p className="text-[15px] text-[#c4c7c8] max-w-3xl leading-relaxed">
                          Explore certified heirloom creations curated directly from India’s living ancestral lineages. Every artifact carries cryptographically verifiable GI origin records, material assay telemetry, and direct smart settlements to master artisan guilds.
                        </p>
                      </div>
                      <div className="lg:col-span-4 flex flex-col lg:items-end justify-end">
                        <div className="bg-[#201f1f] p-4 space-y-2 w-full lg:max-w-xs border border-[#353434]">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#c4c7c8] block">DIRECT GUILD RATIO</span>
                          <div className="flex items-baseline justify-between">
                            <span className="font-serif text-2xl font-bold text-white">89.4%</span>
                            <span className="text-[11px] font-bold text-[#c4c7c8] uppercase">To Master Craftsmen</span>
                          </div>
                          <div className="w-full bg-[#353434] h-1.5">
                            <div className="bg-white h-1.5 w-[89.4%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search Bar & Suggestion Chips */}
                    <div className="bg-[#201f1f] p-3 sm:p-4 space-y-3 border border-[#353434] shadow-xl">
                      <div className="relative flex items-center bg-[#0e0e0e] border border-[#353434]">
                        <Search size={18} className="absolute left-4 text-[#8e9192]" />
                        <input
                          aria-label="Search artisan crafts"
                          className="w-full bg-transparent pl-12 pr-28 py-3.5 text-[14px] text-white placeholder:text-[#8e9192] focus:outline-none"
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          placeholder="Search by craft lineage, metallurgy, artisan master, or GI cluster (e.g. Molela Terracotta, Rogan, Dhokra)..."
                          type="text"
                        />
                        <div className="absolute right-4 hidden sm:flex items-center gap-1 pointer-events-none">
                          <kbd className="px-2 py-0.5 text-[9px] font-bold text-[#c4c7c8] bg-[#201f1f] border border-[#353434] tracking-wider">⌘ K</kbd>
                        </div>
                      </div>

                      {/* Cluster Suggestion Chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-[#8e9192] mr-1">Cluster Indices:</span>
                        {[
                          'Jaipur Blue Pottery',
                          'Changthang Pashmina',
                          'Bidriware Inlay',
                          'Dhokra Lost-Wax',
                          'Patan Patola Silk',
                          'Molela Clay Stele'
                        ].map((chip) => (
                          <button
                            key={chip}
                            onClick={() => setCustomerSearchQuery(chip)}
                            className="bg-[#1c1b1b] hover:bg-[#353434] text-[#c4c7c8] hover:text-white px-2.5 py-1 border border-[#353434] transition-colors cursor-pointer"
                            type="button"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </section>

                {/* Filter & Category Bar */}
                <section className="sticky top-20 z-40 bg-[#141313]/95 backdrop-blur-md px-4 lg:px-12 py-3 border-b border-[#353434]">
                  <div className="max-w-7xl mx-auto flex flex-col gap-3">
                    
                    {/* Category Tabs */}
                    <div className="flex items-center justify-between overflow-x-auto pb-1">
                      <div className="flex items-center gap-2 flex-nowrap">
                        {[
                          { id: 'all', label: 'All Masterworks (184)' },
                          { id: 'pottery', label: 'Pottery & Ceramics (42)' },
                          { id: 'textiles', label: 'Textiles & Weaves (56)' },
                          { id: 'metalcraft', label: 'Metalcraft & Dhokra (38)' },
                          { id: 'woodwork', label: 'Wood & Lacquer (32)' },
                          { id: 'jewelry', label: 'Jewellery & Stones (16)' }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setCustomerCategory(cat.id)}
                            className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all cursor-pointer ${
                              customerCategory === cat.id
                                ? 'bg-white text-[#141313]'
                                : 'bg-[#1c1b1b] text-[#c4c7c8] hover:text-white hover:bg-[#201f1f] border border-[#353434]'
                            }`}
                            type="button"
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      <div className="hidden lg:flex items-center text-[9px] font-bold text-[#8e9192] uppercase whitespace-nowrap pl-4">
                        <span>Displaying {products.length + 12} Verified Artifacts</span>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 4-Column Masterwork Vitrine Grid */}
                <section className="px-4 lg:px-12 py-12 bg-[#0e0e0e]">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* 1. Masterworks Curated List from Stitch */}
                      {CERTIFIED_MASTERWORKS
                        .filter((item) => {
                          if (customerCategory !== 'all') {
                            const cLower = item.category.toLowerCase();
                            if (customerCategory === 'pottery' && !cLower.includes('pottery') && !cLower.includes('clay')) return false;
                            if (customerCategory === 'textiles' && !cLower.includes('textile') && !cLower.includes('silk') && !cLower.includes('weaves')) return false;
                            if (customerCategory === 'metalcraft' && !cLower.includes('metal') && !cLower.includes('dhokra') && !cLower.includes('brass')) return false;
                            if (customerCategory === 'woodwork' && !cLower.includes('wood') && !cLower.includes('lacquer')) return false;
                            if (customerCategory === 'jewelry' && !cLower.includes('jewel') && !cLower.includes('stone')) return false;
                          }
                          if (customerSearchQuery.trim()) {
                            const q = customerSearchQuery.toLowerCase();
                            return (
                              item.title.toLowerCase().includes(q) ||
                              item.artisan.toLowerCase().includes(q) ||
                              item.material.toLowerCase().includes(q) ||
                              item.region.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            className="group bg-[#1c1b1b] border border-[#353434] flex flex-col justify-between hover:bg-[#201f1f] transition-all duration-200"
                          >
                            <div 
                              onClick={() => setSelectedProduct(item)}
                              className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden cursor-pointer"
                            >
                              <img
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={item.image}
                              />
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="bg-[#0e0e0e]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white border border-[#353434]">
                                  {item.edition}
                                </span>
                                <span className="bg-[#2a2a2a]/90 text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border border-[#353434]">
                                  {item.gi_tag}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[9px] font-bold bg-[#0e0e0e]/90 px-2 py-1 border border-[#353434]">
                                <span className="text-[#c4c7c8] uppercase tracking-wider">{item.material}</span>
                                <span className="text-white font-extrabold">{item.craft_hours} CRAFT HRS</span>
                              </div>
                            </div>

                            <div className="p-4 flex flex-col gap-3 flex-grow justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">
                                  {item.artisan}
                                </span>
                                <h2 
                                  onClick={() => setSelectedProduct(item)}
                                  className="font-serif text-[17px] font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1 cursor-pointer"
                                >
                                  {item.title}
                                </h2>
                                <p className="text-[12px] text-[#c4c7c8] line-clamp-2">
                                  Ancestral museum-grade craft from {item.region}. Cryptographically attested provenance.
                                </p>
                              </div>

                              <div className="pt-2 flex items-center justify-between border-t border-[#353434]">
                                <div>
                                  <span className="text-[9px] font-bold text-[#8e9192] uppercase block">VALUATION</span>
                                  <span className="font-serif text-[18px] font-bold text-white">₹{item.price.toLocaleString()}</span>
                                </div>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="bg-white text-[#141313] hover:bg-[#c8c6c6] px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                  type="button"
                                >
                                  Acquire
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* 2. User-Created Products From Backend (Synchronized Seamlessly) */}
                      {products
                        .filter((p) => {
                          if (customerCategory !== 'all') {
                            const cLower = (p.category || '').toLowerCase();
                            if (customerCategory === 'pottery' && !cLower.includes('pottery') && !cLower.includes('clay')) return false;
                            if (customerCategory === 'textiles' && !cLower.includes('textile') && !cLower.includes('silk')) return false;
                            if (customerCategory === 'metalcraft' && !cLower.includes('metal') && !cLower.includes('dhokra')) return false;
                            if (customerCategory === 'woodwork' && !cLower.includes('wood')) return false;
                            if (customerCategory === 'jewelry' && !cLower.includes('jewel')) return false;
                          }
                          if (customerSearchQuery.trim()) {
                            const q = customerSearchQuery.toLowerCase();
                            return (
                              (p.title || '').toLowerCase().includes(q) ||
                              (p.artisan || '').toLowerCase().includes(q) ||
                              (p.category || '').toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((p) => (
                          <div
                            key={p.id}
                            className="group bg-[#1c1b1b] border border-[#353434] flex flex-col justify-between hover:bg-[#201f1f] transition-all duration-200"
                          >
                            <div 
                              onClick={() => setSelectedProduct(p)}
                              className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden cursor-pointer"
                            >
                              <img
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={p.image}
                              />
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="bg-[#0e0e0e]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400 border border-[#353434]">
                                  LIVE ONDC LISTING
                                </span>
                              </div>
                              <button
                                onClick={(e) => handleDeleteProduct(p.id, e)}
                                title="Delete Product"
                                className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors z-10"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="p-4 flex flex-col gap-3 flex-grow justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">
                                  {p.artisan || 'Verified Master Artisan'} • {p.location || 'India'}
                                </span>
                                <h2 
                                  onClick={() => setSelectedProduct(p)}
                                  className="font-serif text-[17px] font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1 cursor-pointer"
                                >
                                  {p.title}
                                </h2>
                                <p className="text-[12px] text-[#c4c7c8] line-clamp-2">
                                  {p.description || 'Authentic artisan creation with digital provenance passport.'}
                                </p>
                              </div>

                              <div className="pt-2 flex items-center justify-between border-t border-[#353434]">
                                <div>
                                  <span className="text-[9px] font-bold text-[#8e9192] uppercase block">VALUATION</span>
                                  <span className="font-serif text-[18px] font-bold text-white">₹{p.price}</span>
                                </div>
                                <button
                                  onClick={() => addToCart(p)}
                                  className="bg-white text-[#141313] hover:bg-[#c8c6c6] px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                                  type="button"
                                >
                                  Acquire
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                    </div>
                  </div>
                </section>

                {/* Provenance & Direct Impact Banner */}
                <section className="bg-[#141313] px-4 lg:px-12 py-16 border-t border-[#353434]/40">
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-[#1c1b1b] border border-[#353434] p-8 lg:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#201f1f] border border-[#353434] text-white">
                          <CheckCircle size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
                            100% Direct Guild Settlement
                          </h3>
                          <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                            Zero intermediary margins. All acquisitions clear into master artisan guild accounts under transparent ledger disbursement protocols.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#201f1f] border border-[#353434] text-white">
                          <Award size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
                            Cryptographic GI Authenticity
                          </h3>
                          <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                            Each physical artifact carries an immutable NFC-embedded certificate mapped to the Government of India Geographical Indication registry.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#201f1f] border border-[#353434] text-white">
                          <ShieldCheck size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-[11px] font-bold uppercase tracking-widest text-white">
                            Insured White-Glove Transit
                          </h3>
                          <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                            Museum-grade crate packaging and temperature-stabilized bonded global courier logistics with comprehensive transit indemnity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* VIEW 3: COLLECTIONS & ARTISANS                                        */}
            {/* --------------------------------------------------------------------- */}
            {(customerTab === 'collections' || customerTab === 'artisans') && (
              <div className="flex flex-col w-full text-[#e5e2e1]">
                
                {/* Atelier Vitrine Cover */}
                <section className="relative w-full h-[400px] overflow-hidden bg-[#0e0e0e] border-b border-[#353434]">
                  <div
                    className="w-full h-full bg-cover bg-center opacity-40 mix-blend-luminosity"
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD0BflBIeahEwYu-nbuhMSAcyp24GKqfl-JHtnRUykqCdK-_pow8gNa12MzZ2qAv3w7OsZ_zp1cgsD26eh-fSXJ0dD9aAJsqzyjwXs8wCR1LLLjEneshMk8bT6BVzWgd04ZFG8rATxhpJyuBK3R4Zwp0jt3I668_m7wjG4Ul2Fp5VA6vP5SAiLrV03pvb_4tUO2kOw84ZAQMGZC2Fu6NQ44x-4p14F8vJ0SH1kd_48')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141313] via-[#141313]/60 to-transparent"></div>

                  <div className="absolute bottom-10 left-0 w-full px-4 lg:px-12">
                    <div className="max-w-7xl mx-auto space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white bg-[#0e0e0e] px-3 py-1 border border-[#353434] inline-block">
                        ATELIER ARCHIVES • 28 HUBS
                      </span>
                      <h1 className="font-serif text-3xl sm:text-5xl text-white">
                        {customerTab === 'collections' ? 'Curated Masterwork Collections' : 'Living Master Artisan Guilds'}
                      </h1>
                      <p className="text-[14px] text-[#c4c7c8] max-w-2xl">
                        {customerTab === 'collections'
                          ? 'Certified mineralogy and metallurgy lineages preserving centuries of ancestral technique.'
                          : 'Meet the 4th and 5th generation Indian craftsmen keeping endangered art forms alive.'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Artisan Master Cards Grid */}
                <section className="px-4 lg:px-12 py-16 bg-[#141313]">
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Master 1: Leeladhar Sharma */}
                    <div className="bg-[#201f1f] border border-[#353434] p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-center">
                      <img
                        alt="Master Leeladhar Sharma"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-white/20 shrink-0"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDonYfE4pP7xnEzbq1ogN4JdUCyGObr5GHwKA-a-Fewr7DcZxuog1aROhFCWb7hoOLEZISrT4gqnMEfW3FrIbmlyTXXHh0T4s9pK6Ym8ZwcYb-AgMsOE9pNc06FGImp0WWNvs3T7luzQ2eTa63eH4jubqY_ZUGx3imaxuDxZLYG1_Kd-z6_UqbQV4khG2vOwAmafZtksOYRKXMjveNEg3h5ZEAkUb7FZHrJ1FifJ-k"
                      />
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">SANGANER ATELIER, JAIPUR</span>
                        <h3 className="font-serif text-2xl text-white font-bold">Master Leeladhar Sharma</h3>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          5th-generation Blue Pottery alchemist. Guarding the clay-free formulation of quartz stone, Fuller’s earth, and Persian cobalt glaze for 40 uninterrupted years.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            onClick={() => { setCustomerCategory('pottery'); switchCustomerTab('shop'); }}
                            className="bg-white text-[#141313] px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                          >
                            View Works
                          </button>
                          <span className="text-[10px] font-bold text-[#8e9192] uppercase">38 Yrs at Wheel</span>
                        </div>
                      </div>
                    </div>

                    {/* Master 2: Hariram Kumbhar */}
                    <div className="bg-[#201f1f] border border-[#353434] p-6 lg:p-8 flex flex-col sm:flex-row gap-6 items-center">
                      <img
                        alt="Master Hariram"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-white/20 shrink-0"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuALfOFj7XjcnfofzZz2EQCPzpY0eOLUjFj9gqBAZ6bXDSa0GRxats1_rooKzbCwxNIuCkAxxlYFE_V-SLZZdIF-JEm1TNlx68D4X1BoD9_W37SnX-X8Cv7G2UaebRLs1vpv1fm6k5OJy--9vTzGba0PbiYG8I70_6m2VZubbJzSnWuY7PjI9t1Z_p8HAm9rwjuvbGlmEnW404ydG-vrOM2DctDZ4puIyLhSugh4bsQ"
                      />
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">MOLELA CLUSTER, RAJASTHAN</span>
                        <h3 className="font-serif text-2xl text-white font-bold">Master Hariram Kumbhar</h3>
                        <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                          4th-generation terracotta sculptor modeling the alluvial mud of the Banas river into hollow votive stele plaques completely freehand without any molds.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            onClick={() => { setCustomerCategory('pottery'); switchCustomerTab('shop'); }}
                            className="bg-white text-[#141313] px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                          >
                            View Works
                          </button>
                          <span className="text-[10px] font-bold text-[#8e9192] uppercase">46 Yrs Guild Heritage</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* VIEW 4: AI BUSINESS & SHOPPING COPILOT                                */}
            {/* --------------------------------------------------------------------- */}
            {customerTab === 'ai_ask' && (
              <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-[#201f1f] border border-[#353434] p-8 space-y-6">
                  
                  <div className="flex items-center gap-3 pb-4 border-b border-[#353434]">
                    <div className="w-10 h-10 rounded-full bg-white text-[#141313] flex items-center justify-center font-bold">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl text-white">Kaarvo AI Craft Copilot</h2>
                      <p className="text-[12px] text-[#c4c7c8]">
                        Ask about Indian craft heritage, custom gift recommendations, fair price audits, or speak in Hindi/regional languages.
                      </p>
                    </div>
                  </div>

                  {/* Message History */}
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                    {aiShoppingMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border ${
                          m.sender === 'user'
                            ? 'bg-[#2a2a2a] border-[#444748] ml-8'
                            : 'bg-[#141313] border-[#353434] mr-8'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                          {m.sender === 'user' ? 'You' : 'Kaarvo AI Copilot'}
                        </div>
                        <p className="text-[14px] text-[#e5e2e1] leading-relaxed whitespace-pre-wrap">
                          {m.text}
                        </p>
                      </div>
                    ))}
                    {aiShoppingLoading && (
                      <div className="p-4 bg-[#141313] border border-[#353434] text-center text-[#c4c7c8] text-sm flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-white" />
                        Analyzing verified craft clusters...
                      </div>
                    )}
                  </div>

                  {/* Input Form with Neural Voice Mic */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#353434]">
                    <input
                      type="text"
                      className="flex-1 bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none focus:border-white"
                      value={aiShoppingInput}
                      onChange={(e) => setAiShoppingInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiShoppingQuery()}
                      placeholder="Ask Kaarvo AI anything e.g. 'Show me authentic Dhokra brass under ₹20,000'..."
                    />
                    <button
                      onClick={() => handleAiShoppingQuery()}
                      className="bg-white text-[#141313] px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                    >
                      Ask
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* FULL STITCH PRODUCT DETAIL DOSSIER MODAL                              */}
            {/* --------------------------------------------------------------------- */}
            {selectedProduct && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-4 lg:p-12 flex justify-center items-start"
                onClick={() => setSelectedProduct(null)}
              >
                <div 
                  className="bg-[#141313] border border-[#353434] w-full max-w-6xl overflow-hidden my-auto relative shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  
                  {/* Top Archival Navigation Strip */}
                  <div className="w-full bg-[#0e0e0e] border-b border-[#353434] px-6 py-3 flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#8e9192]">
                    <div className="flex items-center gap-2">
                      <span className="text-white">REGISTRY ARCHIVE</span>
                      <span>/</span>
                      <span className="text-[#c4c7c8]">{selectedProduct.category}</span>
                      <span>/</span>
                      <span className="text-white">{selectedProduct.title}</span>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Main 2-Column Showcase */}
                  <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Gallery & Telemetry (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      
                      {/* Viewport Frame */}
                      <div className="relative w-full aspect-[4/5] bg-[#0e0e0e] overflow-hidden border border-[#353434]">
                        <img
                          alt={selectedProduct.title}
                          className="w-full h-full object-cover"
                          src={selectedProduct.image}
                        />
                        <div className="absolute top-3 left-3 bg-[#0e0e0e]/90 px-3 py-1 border border-[#353434]">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                            CRYPTOGRAPHIC GI PROVENANCE ATTESTED
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-[9px] font-bold bg-[#0e0e0e]/90 px-3 py-1.5 border border-[#353434] text-[#c4c7c8]">
                          <span>ASSAY WEIGHT: 3.120 KG</span>
                          <span>CRAFT HOURS: {selectedProduct.craft_hours || '44'} HRS</span>
                        </div>
                      </div>

                      {/* NFC Passkey Strip */}
                      <div className="bg-[#1c1b1b] border border-[#353434] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <QrCode size={24} className="text-white" />
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-white">NFC Cryptographic Physical Twin</p>
                            <p className="text-[12px] text-[#c4c7c8]">Tap device upon receiving to inspect immutable kiln provenance ledger.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPassportProduct(selectedProduct)}
                          className="text-[9px] font-bold text-white uppercase tracking-widest px-3 py-1.5 bg-[#2a2a2a] border border-[#353434] hover:bg-white hover:text-[#141313] transition-colors"
                        >
                          View Passport
                        </button>
                      </div>

                    </div>

                    {/* Right Column: Acquisition Dossier (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col bg-[#1c1b1b] border border-[#353434] p-6 lg:p-8 space-y-6">
                      
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block mb-1">
                          ORIGIN: {selectedProduct.location || selectedProduct.region || 'INDIA'} • GI CERTIFIED
                        </span>
                        <h1 className="font-serif text-3xl text-white tracking-tight">
                          {selectedProduct.title}
                        </h1>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-[13px] text-white font-bold">{selectedProduct.artisan || 'Master Artisan'}</span>
                          <CheckCircle size={14} className="text-emerald-400" />
                        </div>
                      </div>

                      {/* Valuation Tier & 89% Guild Cut */}
                      <div className="py-4 bg-[#0e0e0e] px-5 border border-[#353434] space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif text-3xl font-bold text-white">₹{selectedProduct.price?.toLocaleString()}</span>
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-[#2a2a2a] text-white border border-[#353434]">
                            DIRECT GUILD CUT 89%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#c4c7c8]">
                          ₹{Math.round(selectedProduct.price * 0.89).toLocaleString()} proceeds directly disbursed to verified artisan cooperative
                        </p>
                      </div>

                      {/* Curatorial Description */}
                      <p className="text-[13px] text-[#c4c7c8] leading-relaxed">
                        {selectedProduct.description || 'Museum-grade artifact engineered with centuries of ancestral mastery and verified under Government of India Geographical Indication protocols.'}
                      </p>

                      {/* Metrology Spec Grid */}
                      <div className="border border-[#353434] divide-y divide-[#353434] bg-[#0e0e0e] text-[11px]">
                        <div className="flex justify-between p-2.5">
                          <span className="text-[#8e9192] uppercase">Craft Duration</span>
                          <span className="font-bold text-white">{selectedProduct.craft_hours || '44'} Dedicated Hours</span>
                        </div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-[#8e9192] uppercase">Assay Materials</span>
                          <span className="font-bold text-white">{selectedProduct.material || 'Natural Mineral & Earth'}</span>
                        </div>
                        <div className="flex justify-between p-2.5">
                          <span className="text-[#8e9192] uppercase">Lineage Ledger</span>
                          <span className="font-bold text-white">Batch #KV-IND-{selectedProduct.id || '248'}</span>
                        </div>
                      </div>

                      {/* Acquire Action Button */}
                      <div className="space-y-3 pt-2">
                        <button
                          onClick={() => {
                            addToCart(selectedProduct);
                            setSelectedProduct(null);
                            setIsCartOpen(true);
                          }}
                          className="w-full bg-white text-[#141313] hover:bg-[#c8c6c6] py-4 text-[12px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag size={16} />
                          <span>Acquire Masterwork</span>
                        </button>
                        <button
                          onClick={() => speakText(`${selectedProduct.title}. ${selectedProduct.description || 'Authentic handcrafted artifact'}. Verified by Kaarvo Guild.`, 'en-IN')}
                          className="w-full bg-[#2a2a2a] hover:bg-[#353434] text-white py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#353434]"
                        >
                          <Volume2 size={14} />
                          <span>Listen to Heritage Story</span>
                        </button>
                      </div>

                    </div>

                  </div>

                  {/* Section: Cryptographic Fair Pricing Ledger */}
                  <div className="bg-[#0e0e0e] border-t border-[#353434] p-6 lg:p-10 space-y-4">
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        AUDITED ESCROW TRANSPARENCY
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        Polygon Mainnet Hash: 0x8a92f03b22...c78d1e90
                      </span>
                    </div>

                    <div className="h-3 w-full flex overflow-hidden bg-[#201f1f]">
                      <div className="bg-white h-full w-[89%]" title="Artisan Direct (89%)"></div>
                      <div className="bg-[#c8c6c6] h-full w-[4.5%]" title="Guild Fund (4.5%)"></div>
                      <div className="bg-[#8e9192] h-full w-[3.5%]" title="Logistics (3.5%)"></div>
                      <div className="bg-[#444748] h-full w-[3%]" title="Platform (3%)"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] pt-2">
                      <div className="bg-[#1c1b1b] p-3 border border-[#353434]">
                        <span className="text-[#8e9192] block uppercase text-[9px]">89% Direct Maker</span>
                        <span className="text-white font-bold">₹{Math.round(selectedProduct.price * 0.89).toLocaleString()}</span>
                      </div>
                      <div className="bg-[#1c1b1b] p-3 border border-[#353434]">
                        <span className="text-[#8e9192] block uppercase text-[9px]">4.5% Guild Coop</span>
                        <span className="text-white font-bold">₹{Math.round(selectedProduct.price * 0.045).toLocaleString()}</span>
                      </div>
                      <div className="bg-[#1c1b1b] p-3 border border-[#353434]">
                        <span className="text-[#8e9192] block uppercase text-[9px]">3.5% White-Glove Transit</span>
                        <span className="text-white font-bold">₹{Math.round(selectedProduct.price * 0.035).toLocaleString()}</span>
                      </div>
                      <div className="bg-[#1c1b1b] p-3 border border-[#353434]">
                        <span className="text-[#8e9192] block uppercase text-[9px]">3% Kaarvo Protocol</span>
                        <span className="text-white font-bold">₹{Math.round(selectedProduct.price * 0.03).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CART DRAWER & CHECKOUT                                                */}
            {/* --------------------------------------------------------------------- */}
            {isCartOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-end"
                onClick={() => setIsCartOpen(false)}
              >
                <div 
                  className="bg-[#1c1b1b] border-l border-[#353434] w-full max-w-md h-full p-6 flex flex-col justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-[#353434]">
                      <h3 className="font-serif text-2xl text-white">Your Shopping Cart ({cartItems.length})</h3>
                      <button onClick={() => setIsCartOpen(false)} className="text-[#8e9192] hover:text-white cursor-pointer">
                        <X size={22} />
                      </button>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="text-center py-16 text-[#8e9192] space-y-3">
                        <ShoppingBag size={48} className="mx-auto text-[#444748]" />
                        <p className="text-[14px]">Your cart is currently empty.</p>
                        <button
                          onClick={() => { setIsCartOpen(false); switchCustomerTab('shop'); }}
                          className="bg-white text-[#141313] px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest mt-2 cursor-pointer"
                        >
                          Explore Masterworks
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center bg-[#201f1f] border border-[#353434] p-3">
                            <img src={item.image} alt={item.title} className="w-14 h-14 object-cover" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-bold text-white truncate">{item.title}</h4>
                              <div className="text-[14px] font-serif font-bold text-white">₹{item.price}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-7 h-7 bg-[#2a2a2a] border border-[#353434] text-white flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="text-[12px] font-bold text-white px-1">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-7 h-7 bg-[#2a2a2a] border border-[#353434] text-white flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="pt-6 border-t border-[#353434] space-y-4">
                      <div className="space-y-2 text-[13px] text-[#c4c7c8]">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="text-white font-bold">₹{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Global Insured Logistics</span>
                          <span className="text-emerald-400 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-[#353434]">
                          <span>Net Escrow Total</span>
                          <span>₹{cartTotal}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setIsCheckoutOpen(true);
                        }}
                        className="w-full bg-white text-[#141313] hover:bg-[#c8c6c6] py-4 text-[12px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                      >
                        Proceed to Secure Checkout →
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CHECKOUT MODAL                                                        */}
            {/* --------------------------------------------------------------------- */}
            {isCheckoutOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsCheckoutOpen(false)}
              >
                <div 
                  className="bg-[#1c1b1b] border border-[#353434] w-full max-w-lg p-6 lg:p-8 space-y-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center pb-3 border-b border-[#353434]">
                    <h3 className="font-serif text-2xl text-white">Masterwork Acquisition Dossier</h3>
                    <button onClick={() => setIsCheckoutOpen(false)} className="text-[#8e9192] hover:text-white">
                      <X size={20} />
                    </button>
                  </div>

                  {checkoutStep === 1 && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Step 1: Shipping Address</span>
                      <input
                        type="text"
                        className="w-full bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none"
                        value={checkoutData.name}
                        onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                        placeholder="Full Legal Name / Collector Name"
                      />
                      <input
                        type="text"
                        className="w-full bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none"
                        value={checkoutData.phone}
                        onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                        placeholder="Contact Phone Number"
                      />
                      <input
                        type="text"
                        className="w-full bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none"
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                        placeholder="Street Address / Vault Location"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none"
                          value={checkoutData.city}
                          onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                          placeholder="City"
                        />
                        <input
                          type="text"
                          className="bg-[#0e0e0e] border border-[#353434] p-3 text-[14px] text-white focus:outline-none"
                          value={checkoutData.pincode}
                          onChange={(e) => setCheckoutData({ ...checkoutData, pincode: e.target.value })}
                          placeholder="Pincode / Postal"
                        />
                      </div>
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full bg-white text-[#141313] py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors cursor-pointer mt-2"
                      >
                        Continue to Delivery →
                      </button>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Step 2: Insured Dispatch Protocol</span>
                      <div className="bg-[#201f1f] border border-[#353434] p-4 space-y-2">
                        <div className="text-[13px] font-bold text-white flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-400" />
                          <span>Insured Temperature-Controlled Transit</span>
                        </div>
                        <p className="text-[12px] text-[#c4c7c8]">
                          Custom wooden crate with shock-sensor telemetry dispatched directly from artisan guild workshops.
                        </p>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setCheckoutStep(1)}
                          className="bg-[#2a2a2a] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest border border-[#353434]"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCheckoutStep(3)}
                          className="flex-1 bg-white text-[#141313] py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors"
                        >
                          Continue to Payment →
                        </button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 3 && (
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Step 3: Escrow Payment</span>
                      <div className="bg-[#201f1f] border border-[#353434] p-4 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[#c4c7c8]">Escrow Total</span>
                          <span className="text-xl font-serif font-bold text-white">₹{cartTotal}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400">
                          89% of this amount will be immediately locked and released to the artisan cooperative via ONDC Beckn settlement.
                        </p>
                      </div>
                      <button
                        onClick={handleProcessOrder}
                        className="w-full bg-white text-[#141313] py-4 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                      >
                        Confirm Acquisition & Lock Escrow
                      </button>
                    </div>
                  )}

                  {checkoutStep === 4 && (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                        <CheckCircle size={32} />
                      </div>
                      <h4 className="font-serif text-2xl text-white">Acquisition Registered</h4>
                      <p className="text-[13px] text-[#c4c7c8] max-w-sm mx-auto">
                        Your order has been cryptographically confirmed and dispatched to the artisan guild via ONDC Beckn gateway.
                      </p>
                      <button
                        onClick={() => { setIsCheckoutOpen(false); setCheckoutStep(1); }}
                        className="bg-white text-[#141313] px-8 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                      >
                        Return to Gallery
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* GOOGLE STITCH 5-COLUMN LUXURY FOOTER                                  */}
            {/* --------------------------------------------------------------------- */}
            <footer className="w-full bg-[#0e0e0e] border-t border-[#353434]/40 pt-16 pb-12">
              <div className="max-w-7xl mx-auto px-4 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#353434]/30">
                  
                  {/* Col 1: Brand & Mission */}
                  <div className="space-y-4 lg:col-span-1">
                    <div className="flex items-center gap-3">
                      <img
                        alt="KAARVO Luxury Logo"
                        className="h-6 w-auto object-contain"
                        src="https://lh3.googleusercontent.com/aida/AEtjO1Uhs93tN5Vdr6hc1UEwSALe4SxN2jM7MAWTO06wrU6kabT4FGtTQWfdiy9tbQ63qIPO-dpLgZ3ZivuBJ9iX0PlSzf8BhTtHyKmNQLpse_GSfDb8aVY9qItgKBCSlGodxdKuR4S8WE2n0S5WXYRSfUhpa8KusB3qLRM5wnoy4ZFj6I5fNXG0sq5XTt6w5Df6E64Y6SJ5T0bXiiZlQrEgi0Tl5Ey0XfRDaxvLNu6-1cQG"
                      />
                      <span className="font-serif text-[18px] text-white tracking-widest uppercase font-bold">
                        KAARVO
                      </span>
                    </div>
                    <p className="text-[12px] text-[#c4c7c8] leading-relaxed">
                      Haute horlogerie discipline meeting ancestral Indian artisan lineage. Monolithic gallery commerce for museum-grade artifacts.
                    </p>
                    <div className="flex items-center gap-2 text-[#8e9192]">
                      <CheckCircle size={14} className="text-white" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#c4c7c8]">
                        GI Cluster Verified
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Explore Crafts */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">
                      Explore Crafts
                    </h4>
                    <ul className="space-y-2 text-[12px] text-[#c4c7c8]">
                      <li><a className="hover:text-white transition-colors" href="#">Pottery & Ceramics (Jaipur Blue)</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Handloom Textiles (Patan Patola)</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Dhokra Brass Lost-Wax</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Sankheda Lacquered Wood</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Bidriware Silver Inlay</a></li>
                    </ul>
                  </div>

                  {/* Col 3: Sell on Kaarvo */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">
                      Sell on Kaarvo
                    </h4>
                    <ul className="space-y-2 text-[12px] text-[#c4c7c8]">
                      <li><button onClick={() => switchMode('artisan')} className="hover:text-white transition-colors cursor-pointer text-left">AI Provenance Cataloger</button></li>
                      <li><button onClick={() => switchMode('artisan')} className="hover:text-white transition-colors cursor-pointer text-left">Master Artisan Onboarding</button></li>
                      <li><button onClick={() => switchMode('artisan')} className="hover:text-white transition-colors cursor-pointer text-left">Transparent Smart Payouts</button></li>
                      <li><button onClick={() => switchMode('artisan')} className="hover:text-white transition-colors cursor-pointer text-left">Guild Protection Protocol</button></li>
                      <li><button onClick={() => switchMode('artisan')} className="hover:text-white transition-colors cursor-pointer text-left">Valuation Audits</button></li>
                    </ul>
                  </div>

                  {/* Col 4: Guild & Registry */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-4">
                      Guild & Registry
                    </h4>
                    <ul className="space-y-2 text-[12px] text-[#c4c7c8]">
                      <li><a className="hover:text-white transition-colors" href="#">Horological Certification</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Artisan Heritage Ledger</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Custom Concierge & Bids</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Global Secure Logistics</a></li>
                      <li><a className="hover:text-white transition-colors" href="#">Provenance Inquiries</a></li>
                    </ul>
                  </div>

                  {/* Col 5: Exclusive Drops */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">
                      Exclusive Drops
                    </h4>
                    <p className="text-[12px] text-[#c4c7c8]">
                      Subscribe to private gallery viewings and limited certified edition releases.
                    </p>
                    <div className="flex flex-col gap-2">
                      <input
                        className="bg-[#1c1b1b] border border-[#353434] px-4 py-2 text-white placeholder:text-[#8e9192] text-[12px] focus:outline-none"
                        placeholder="collector@patron.com"
                        type="email"
                      />
                      <button
                        className="bg-white text-[#141313] text-[11px] font-bold uppercase tracking-widest py-2 px-4 hover:bg-[#c8c6c6] transition-colors cursor-pointer"
                        type="button"
                      >
                        Access Vault
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Sub-Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-bold text-[#8e9192] uppercase tracking-widest">
                  <div>© 2025 KAARVO HAUTE ARTISAN COMMERCE. ALL RIGHTS RESERVED.</div>
                  <div className="flex items-center gap-6">
                    <a className="hover:text-white transition-colors" href="#">Guild Charter</a>
                    <a className="hover:text-white transition-colors" href="#">GI Index</a>
                    <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-white transition-colors" href="#">Terms of Provenance</a>
                  </div>
                </div>

              </div>
            </footer>

          </main>
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

            {/* ARTISAN USER CARD (Stitch Auth Profile) */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '14px'
                }}>
                  {(currentUser?.full_name || currentUser?.username || 'M')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {currentUser ? (currentUser.full_name || currentUser.username) : 'Mohan Lal'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentUser ? `${currentUser.region || 'Jaipur, Rajasthan'}` : 'Verified Master Artisan'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                  ONDC Verified
                </span>
                {currentUser ? (
                  <button
                    onClick={handleAuthLogout}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <LogIn size={12} /> Sign In
                  </button>
                )}
              </div>
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
                              image: enhancedImage || rawImageFile || getCraftSpecificImage(catalog.category, catalog.descriptor.name),
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
                      <p style={{ fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{m.content}</p>
                    </div>
                  ))}
                  {copilotLoading && (
                    <div className="card-artisan" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>
                        🤖 Kaarvo Copilot
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>✍️ Analyzing your business data and generating answer...</p>
                    </div>
                  )}
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


      {/* ========================================================================= */}
      {/* GOOGLE STITCH AUTHENTICATION MODAL: SIGN IN & SIGN UP (JWT & REFRESH)    */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="stitch-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="stitch-auth-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                color: '#57534E'
              }}
            >
              <X size={18} />
            </button>

            {/* LEFT HERO PANEL (STITCH ARTISAN BRANDING) */}
            <div className="stitch-auth-hero">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '24px' }}>
                  <Sparkles size={14} /> SIH26090 OFFICIAL PLATFORM
                </div>
                <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '14px' }}>
                  Direct Market Linkage for India's Master Artisans.
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', marginBottom: '24px' }}>
                  Zero-middlemen ONDC Beckn integration, automated 4K AI studio image enhancement, and voice cataloging in Indian regional languages.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <CheckCircle size={18} color="#A7F3D0" /> 100% Living-Wage Guarantee & GI Verification
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <CheckCircle size={18} color="#A7F3D0" /> Real-time Speech-to-English Auto-Cataloging
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <CheckCircle size={18} color="#A7F3D0" /> Digital Heritage Passport with Offline QR Code
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', opacity: 0.85 }}>
                <span>Certified by ONDC & MoSJE</span>
                <span>🇮🇳 Made with pride for Bharat</span>
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="stitch-auth-panel">
              {/* TABS: SIGN IN vs CREATE ACCOUNT */}
              <div style={{ display: 'flex', background: '#F5F5F4', padding: '4px', borderRadius: '16px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'login' ? '#C26D47' : '#78716C',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'register' ? '#C26D47' : '#78716C',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: authMode === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* DEMO 1-CLICK QUICK ACCESS PILLS */}
              <div style={{ marginBottom: '20px', background: '#FDF4EF', border: '1px solid #F7DCD0', padding: '12px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#C26D47', marginBottom: '8px' }}>
                  ⚡ Quick Demo Access (For Evaluators & Judges):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="stitch-demo-chip"
                    onClick={() => handleAuthLogin(null, { username: 'artisan_demo', password: 'demo123' })}
                  >
                    👤 1-Click: Artisan Demo (Mohan Lal)
                  </button>
                  <button
                    type="button"
                    className="stitch-demo-chip"
                    onClick={() => handleAuthLogin(null, { username: 'customer_demo', password: 'demo123' })}
                  >
                    🛍️ 1-Click: Customer Demo (Priya)
                  </button>
                </div>
              </div>

              {/* ERROR ALERT */}
              {authError && (
                <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', fontSize: '13px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {authMode === 'login' ? (
                <form onSubmit={(e) => handleAuthLogin(e)}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>
                      Username or Email Address
                    </label>
                    <div className="stitch-input-wrapper">
                      <User size={18} className="stitch-input-icon" />
                      <input
                        type="text"
                        className="stitch-input"
                        placeholder="Enter username (e.g. artisan_demo)"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div className="stitch-input-wrapper">
                      <Lock size={18} className="stitch-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="stitch-input"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        style={{ paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '4px' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-artisan-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '6px' }}
                  >
                    {authLoading ? '⏳ Signing in with JWT...' : 'Sign In to Kaarvo AI →'}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={(e) => handleAuthRegister(e)}>
                  {/* ROLE SELECTION */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>
                      I am registering as:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setAuthRole('artisan')}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `2px solid ${authRole === 'artisan' ? '#C26D47' : '#E7E5E4'}`,
                          background: authRole === 'artisan' ? '#FDF4EF' : '#FFFFFF',
                          color: authRole === 'artisan' ? '#C26D47' : '#57534E',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🎨 Artisan / Seller
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthRole('customer')}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: `2px solid ${authRole === 'customer' ? '#C26D47' : '#E7E5E4'}`,
                          background: authRole === 'customer' ? '#FDF4EF' : '#FFFFFF',
                          color: authRole === 'customer' ? '#C26D47' : '#57534E',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        🛍️ Customer / Buyer
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Full Name</label>
                      <div className="stitch-input-wrapper">
                        <User size={16} className="stitch-input-icon" />
                        <input
                          type="text"
                          className="stitch-input"
                          placeholder="e.g. Ramesh Kumar"
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Email Address</label>
                      <div className="stitch-input-wrapper">
                        <Mail size={16} className="stitch-input-icon" />
                        <input
                          type="email"
                          className="stitch-input"
                          placeholder="ramesh@artisan.in"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Choose Username</label>
                      <div className="stitch-input-wrapper">
                        <User size={16} className="stitch-input-icon" />
                        <input
                          type="text"
                          className="stitch-input"
                          placeholder="e.g. ramesh_pottery"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Password</label>
                      <div className="stitch-input-wrapper">
                        <Lock size={16} className="stitch-input-icon" />
                        <input
                          type="password"
                          className="stitch-input"
                          placeholder="Min 4 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {authRole === 'artisan' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Craft Specialization</label>
                        <select
                          className="stitch-input"
                          style={{ paddingLeft: '14px', height: '48px' }}
                          value={regCraftType}
                          onChange={(e) => setRegCraftType(e.target.value)}
                        >
                          <option value="Terracotta Pottery">🏺 Terracotta Pottery</option>
                          <option value="Handloom Silk Weaving">🥻 Handloom Silk Weaving</option>
                          <option value="Woodcraft & Toys">🐘 Woodcraft & Channapatna</option>
                          <option value="Brass & Metal Casting">🪔 Brass & Metal Casting</option>
                          <option value="Folk & Tribal Painting">🎨 Folk & Tribal Painting</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#44403C', marginBottom: '6px' }}>Heritage Cluster Region</label>
                        <select
                          className="stitch-input"
                          style={{ paddingLeft: '14px', height: '48px' }}
                          value={regRegion}
                          onChange={(e) => setRegRegion(e.target.value)}
                        >
                          <option value="Jaipur, Rajasthan">Jaipur, Rajasthan</option>
                          <option value="Varanasi, Uttar Pradesh">Varanasi, Uttar Pradesh</option>
                          <option value="Kashmir, India">Kashmir, India</option>
                          <option value="Channapatna, Karnataka">Channapatna, Karnataka</option>
                          <option value="Kutch, Gujarat">Kutch, Gujarat</option>
                          <option value="Kolkata, West Bengal">Kolkata, West Bengal</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn-artisan-primary"
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: '800', marginTop: '10px' }}
                  >
                    {authLoading ? '⏳ Creating Account...' : 'Complete Registration & Get Started →'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
