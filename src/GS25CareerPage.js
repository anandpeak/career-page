import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, ChevronRight, User, Briefcase, Star, Navigation, Search, Globe, MessageSquare, Zap, TrendingUp, Award, Heart } from 'lucide-react';
import './GS25CareerPage.css';

// Real GS25 store data - replace with API call to your backend
const MOCK_STORES = [
  // Downtown stores
  { id: 1, name: 'GS25 Zaisan', lat: 47.8864, lng: 106.9057, openings: 3, urgent: true, distance: 0.5, managerId: 'mgr_001', address: 'Zaisan Street 12' },
  { id: 2, name: 'GS25 Shangri-La', lat: 47.9167, lng: 106.9167, openings: 2, urgent: false, distance: 1.2, managerId: 'mgr_002', address: 'Shangri-La Mall, 1st Floor' },
  { id: 3, name: 'GS25 Central Tower', lat: 47.9187, lng: 106.9177, openings: 1, urgent: true, distance: 1.8, managerId: 'mgr_003', address: 'Central Tower, Ground Floor' },
  { id: 4, name: 'GS25 State Department Store', lat: 47.9172, lng: 106.9040, openings: 4, urgent: false, distance: 2.3, managerId: 'mgr_004', address: 'Peace Avenue 44' },
  { id: 5, name: 'GS25 National Park', lat: 47.9250, lng: 106.9150, openings: 2, urgent: true, distance: 3.1, managerId: 'mgr_005', address: 'Chinggis Avenue 15' },
  // Add more stores here
  { id: 6, name: 'GS25 Bayanzurkh', lat: 47.9356, lng: 106.9894, openings: 3, urgent: false, distance: 8.5, managerId: 'mgr_006', address: 'Bayanzurkh District' },
  { id: 7, name: 'GS25 Airport', lat: 47.8517, lng: 106.7661, openings: 5, urgent: true, distance: 12.3, managerId: 'mgr_007', address: 'Airport Road' },
  { id: 8, name: 'GS25 University', lat: 47.9234, lng: 106.9321, openings: 2, urgent: false, distance: 2.1, managerId: 'mgr_008', address: 'University Street 1' },
];

const LANGUAGES = [
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const GS25CareerPage = () => {
  const [step, setStep] = useState('landing'); // landing, location, stores, apply
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStores, setSelectedStores] = useState([]);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [language, setLanguage] = useState('mn');
  const [applicantData, setApplicantData] = useState({
    age: '',
    name: '',
    preferredShifts: [],
    experience: '',
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Load all stores from backend
  const loadStoresFromBackend = async () => {
    try {
      return MOCK_STORES;
    } catch (error) {
      console.error('Failed to load stores:', error);
      return MOCK_STORES;
    }
  };

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Get user location and load stores
  const getUserLocation = async () => {
    setLoading(true);
    setLocationError('');
    
    const stores = await loadStoresFromBackend();
    setAllStores(stores);
    
    if (!navigator.geolocation) {
      setLocationError('Location services not supported on your device');
      handleLocationFallback(stores);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        
        const storesWithDistance = stores.map(store => ({
          ...store,
          distance: parseFloat(calculateDistance(userLat, userLng, store.lat, store.lng))
        }));
        
        const sorted = storesWithDistance.sort((a, b) => a.distance - b.distance);
        setNearbyStores(sorted.slice(0, 10));
        setLoading(false);
        setStep('stores');
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location in your browser settings. ';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. ';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. ';
            break;
        }
        
        setLocationError(errorMessage + 'Select your district manually below.');
        handleLocationFallback(stores);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Fallback when location fails
  const handleLocationFallback = (stores) => {
    setLoading(false);
    const defaultLat = 47.9187;
    const defaultLng = 106.9177;
    setUserLocation({ lat: defaultLat, lng: defaultLng });
    
    const storesWithDistance = stores.map(store => ({
      ...store,
      distance: parseFloat(calculateDistance(defaultLat, defaultLng, store.lat, store.lng))
    }));
    
    const sorted = storesWithDistance.sort((a, b) => a.distance - b.distance);
    setNearbyStores(sorted.slice(0, 10));
    setStep('stores');
  };

  const handleStoreSelect = (store) => {
    if (selectedStores.find(s => s.id === store.id)) {
      setSelectedStores(selectedStores.filter(s => s.id !== store.id));
    } else if (selectedStores.length < 3) {
      setSelectedStores([...selectedStores, store]);
    }
  };

  const startAIInterview = async () => {
    setLoading(true);
    
    try {
      const sessionData = {
        applicantAge: applicantData.age,
        applicantName: applicantData.name,
        stores: selectedStores.map(s => ({
          id: s.id,
          name: s.name,
          managerId: s.managerId
        })),
        language: language,
        timestamp: Date.now(),
        source: 'career_page',
        experience: applicantData.experience,
        preferredShifts: applicantData.preferredShifts
      };
      
      const sessionParams = btoa(JSON.stringify(sessionData));
      window.location.href = `https://chat.oneplace.hr/chat/4/1851?session=${sessionParams}&lang=${language}`;
    } catch (error) {
      console.error('Failed to start interview:', error);
      setLoading(false);
    }
  };

  const getTranslation = (key) => {
    const translations = {
      mn: {
        title: 'GS25-д ажиллах',
        subtitle: '300+ дэлгүүрт ажлын байр нээлттэй',
        findNearby: 'Ойролцоох дэлгүүр олох',
        locationPermission: 'Таны байршлыг асууж ойролцоох дэлгүүрүүдийг харуулна',
        urgent: 'Яаралтай',
        openings: 'ажлын байр',
        apply: 'Өргөдөл гаргах',
        selectStores: 'Та 3 хүртэл дэлгүүр сонгож болно',
        yourInfo: 'Таны мэдээлэл',
        age: 'Нас',
        name: 'Нэр',
        experience: 'Туршлага',
        preferredShifts: 'Ажиллах цаг',
        morning: 'Өглөө',
        evening: 'Орой',
        night: 'Шөнө',
        weekend: 'Амралтын өдөр',
        startInterview: 'AI ярилцлага эхлэх',
        connecting: 'AI ажилд авагчтай холбогдож байна...',
        interviewReady: 'Ярилцлага эхлэхэд бэлэн',
        instructions: 'Таныг AI чат ярилцлагын хуудас руу чиглүүлнэ.',
        salaryRange: '₮2.2M - ₮2.8M сарын цалин',
        flexibleHours: 'Уян хатан ажлын цаг',
        noExperience: 'Туршлага шаардахгүй',
        fastHiring: '48 цагт хариу',
        benefits: 'Эрүүл мэндийн даатгал',
        career: 'Карьерын боломж',
        letsgoooo: "Яахав эхэлцгээе! 🚀",
        workVibes: "Сайн санаатай баг 💫",
        trendy: "Хамгийн trendy ажлын байр 🔥"
      },
      en: {
        title: 'Work at GS25',
        subtitle: '300+ stores with open positions',
        findNearby: 'Find Stores Near Me',
        locationPermission: "We'll ask for your location to show nearby stores",
        urgent: 'Urgent',
        openings: 'openings',
        apply: 'Apply',
        selectStores: 'Select up to 3 stores',
        yourInfo: 'Your Information',
        age: 'Age',
        name: 'Name',
        experience: 'Experience',
        preferredShifts: 'Preferred Shifts',
        morning: 'Morning',
        evening: 'Evening',
        night: 'Night',
        weekend: 'Weekend',
        startInterview: 'Start AI Interview',
        connecting: 'Connecting to AI Recruiter...',
        interviewReady: 'Interview Ready',
        instructions: 'You will be redirected to the AI chat interview.',
        salaryRange: '₮2.2M - ₮2.8M monthly',
        flexibleHours: 'Flexible Schedule',
        noExperience: 'No Experience Required',
        fastHiring: '48hr Response',
        benefits: 'Health Insurance',
        career: 'Career Growth',
        letsgoooo: "Let's gooo! 🚀",
        workVibes: "Good vibes team 💫",
        trendy: "Most trendy workplace 🔥"
      },
      ko: {
        title: 'GS25 채용',
        subtitle: '300개 이상 매장에서 직원 모집',
        findNearby: '내 주변 매장 찾기',
        locationPermission: '주변 매장을 표시하기 위해 위치 정보를 요청합니다',
        urgent: '긴급',
        openings: '명 모집',
        apply: '지원하기',
        selectStores: '최대 3개 매장 선택 가능',
        yourInfo: '지원자 정보',
        age: '나이',
        name: '이름',
        experience: '경력',
        preferredShifts: '근무 가능 시간',
        morning: '오전',
        evening: '오후',
        night: '야간',
        weekend: '주말',
        startInterview: 'AI 면접 시작',
        connecting: 'AI 면접관과 연결 중...',
        interviewReady: '면접 준비 완료',
        instructions: 'AI 채팅 면접 페이지로 이동합니다.',
        salaryRange: '₮2.2M - ₮2.8M 월급',
        flexibleHours: '유연한 스케줄',
        noExperience: '경험 불필요',
        fastHiring: '48시간 답변',
        benefits: '건강보험',
        career: '성장 기회',
        letsgoooo: "렛츠고! 🚀",
        workVibes: "좋은 분위기 팀 💫",
        trendy: "가장 트렌디한 직장 🔥"
      },
    };
    return translations[language][key] || key;
  };

  return (
    <div className="app-container">
      {/* Modern Header with Glassmorphism */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">GS25</div>
            <span className="header-title">{getTranslation('title')}</span>
          </div>
          <div className="language-selector">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="language-button"
            >
              <Globe className="icon-sm" />
              <span>{LANGUAGES.find(l => l.code === language).flag}</span>
            </button>
            {showLanguageMenu && (
              <div className="language-menu">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className="language-option"
                  >
                    <span className="flag">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Landing Page */}
      {step === 'landing' && (
        <div className="page-content">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="trending-badge">
              <Zap className="icon-sm" />
              <span>{getTranslation('trendy')}</span>
            </div>
            <h1 className="hero-title">{getTranslation('title')}</h1>
            <p className="hero-subtitle">{getTranslation('subtitle')}</p>
            <div className="badges">
              <span className="badge green">{getTranslation('letsgoooo')}</span>
              <span className="badge pink">{getTranslation('workVibes')}</span>
            </div>
          </div>

          {/* STANDOUT CTA Button - Moved right after hero */}
          <button
            onClick={getUserLocation}
            className="cta-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Finding stores...</span>
              </>
            ) : (
              <>
                <MapPin className="icon" />
                <span>{getTranslation('findNearby')}</span>
                <Zap className="icon-sm" />
              </>
            )}
          </button>
          
          {/* Permission Note */}
          <div className="permission-note">
            <p>{getTranslation('locationPermission')}</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card purple">
              <div className="stat-decoration"></div>
              <div className="stat-content">
                <div className="stat-number">300+</div>
                <div className="stat-label">Stores nationwide</div>
              </div>
            </div>
            <div className="stat-card blue">
              <div className="stat-decoration"></div>
              <div className="stat-content">
                <div className="stat-number">50+</div>
                <div className="stat-label">Daily hires</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon green">
                <DollarSign className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">{getTranslation('salaryRange')}</div>
                <div className="benefit-subtitle">Competitive pay + bonuses</div>
              </div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon blue">
                <Clock className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">{getTranslation('flexibleHours')}</div>
                <div className="benefit-subtitle">Choose your shifts</div>
              </div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon purple">
                <Briefcase className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">{getTranslation('noExperience')}</div>
                <div className="benefit-subtitle">Full training provided</div>
              </div>
            </div>
          </div>

          {/* CTA Button - Already moved above, so remove this one */}
          
          {/* District Selection */}
          <div className="district-selection">
            <p>Location not working?</p>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const [lat, lng] = e.target.value.split(',').map(Number);
                  setUserLocation({ lat, lng });
                  loadStoresFromBackend().then(stores => {
                    const storesWithDistance = stores.map(store => ({
                      ...store,
                      distance: parseFloat(calculateDistance(lat, lng, store.lat, store.lng))
                    }));
                    const sorted = storesWithDistance.sort((a, b) => a.distance - b.distance);
                    setNearbyStores(sorted.slice(0, 10));
                    setAllStores(stores);
                    setStep('stores');
                  });
                }
              }}
              className="district-select"
            >
              <option value="">Select your district...</option>
              <option value="47.9250,106.9150">Bayangol</option>
              <option value="47.9356,106.9894">Bayanzurkh</option>
              <option value="47.9267,106.9083">Chingeltei</option>
              <option value="47.8864,106.9057">Khan-Uul</option>
              <option value="47.9187,106.9177">Sukhbaatar</option>
              <option value="47.8994,106.7892">Songino Khairkhan</option>
            </select>
          </div>

          {/* Social Proof */}
          <div className="social-proof">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="star" />
              ))}
            </div>
            <p>Rated 4.8/5 by 2,000+ employees</p>
          </div>
        </div>
      )}

      {/* Store Selection */}
      {step === 'stores' && (
        <div className="page-content">
          <div className="section-header">
            <h2 className="section-title">Stores Near You</h2>
            <p className="section-subtitle">{getTranslation('selectStores')}</p>
          </div>

          {/* Map with Apple-style Design */}
          <div className="map-container">
            {userLocation ? (
              process.env.REACT_APP_GOOGLE_MAPS_KEY ? (
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.lat},${userLocation.lng}&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:You%7C${userLocation.lat},${userLocation.lng}${nearbyStores.map(store => `&markers=color:${store.urgent ? 'red' : 'green'}%7Clabel:${store.openings}%7C${store.lat},${store.lng}`).join('')}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&style=feature:all%7Celement:geometry%7Ccolor:0x1e88e5&style=feature:all%7Celement:labels.text.stroke%7Ccolor:0x1e88e5&style=feature:all%7Celement:labels.text.fill%7Ccolor:0xffffff&style=feature:administrative.locality%7Celement:labels.text.fill%7Ccolor:0x26c6da&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x26c6da&style=feature:road%7Celement:geometry%7Ccolor:0x42a5f5&style=feature:water%7Celement:geometry%7Ccolor:0x0d47a1`}
                  alt="Store locations map"
                  className="map-image"
                  onError={(e) => {
                    console.error('Map failed to load');
                    e.target.style.display = 'none';
                    const placeholder = e.target.parentNode.querySelector('.map-placeholder');
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                      placeholder.innerHTML = `
                        <div style="text-align: center; color: rgba(255, 255, 255, 0.9);">
                          <div style="font-size: 3rem; margin-bottom: 0.75rem;">📍</div>
                          <p style="margin: 0.25rem 0; font-weight: 500;">Map Unavailable</p>
                          <p style="margin: 0.25rem 0; font-size: 0.75rem; color: rgba(255, 255, 255, 0.7);">Check API key configuration</p>
                        </div>
                      `;
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Map loaded successfully');
                  }}
                />
              ) : (
                <div className="map-placeholder">
                  <div style={{textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)'}}>
                    <div style={{fontSize: '3rem', marginBottom: '0.75rem'}}>🗺️</div>
                    <p style={{margin: '0.25rem 0', fontWeight: '500'}}>Interactive Map</p>
                    <div className="map-error">
                      <p style={{margin: '0.5rem 0', fontSize: '0.75rem'}}>Google Maps API key not configured</p>
                      <p style={{margin: '0', fontSize: '0.6rem', opacity: '0.8'}}>Add REACT_APP_GOOGLE_MAPS_KEY to your .env file</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="map-placeholder">
                <div style={{textAlign: 'center', color: 'rgba(255, 255, 255, 0.9)'}}>
                  <MapPin className="map-icon" />
                  <p style={{margin: '0.25rem 0', fontWeight: '500'}}>Finding your location...</p>
                </div>
              </div>
            )}
          </div>

          {/* Store Cards */}
          <div className="stores-list">
            {nearbyStores.map((store, index) => (
              <div
                key={store.id}
                onClick={() => handleStoreSelect(store)}
                className={`store-card ${selectedStores.find(s => s.id === store.id) ? 'selected' : ''}`}
              >
                <div className="store-header">
                  <div className="store-info">
                    <div className="store-number-container">
                      <span className={`store-number ${selectedStores.find(s => s.id === store.id) ? 'selected' : ''}`}>
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="store-name">{store.name}</h3>
                        {store.address && (
                          <p className="store-address">{store.address}</p>
                        )}
                        <div className="store-distance">
                          <Navigation className="icon-sm" />
                          <span>{store.distance} km away</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {store.urgent && (
                    <span className="urgent-badge">
                      🔥 {getTranslation('urgent')}
                    </span>
                  )}
                </div>
                <div className="store-footer">
                  <span className="openings-badge">
                    {store.openings} {getTranslation('openings')}
                  </span>
                  <div className={`checkbox ${selectedStores.find(s => s.id === store.id) ? 'checked' : ''}`}>
                    {selectedStores.find(s => s.id === store.id) && (
                      <svg className="checkmark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={() => setStep('apply')}
            disabled={selectedStores.length === 0}
            className={`continue-button ${selectedStores.length > 0 ? 'enabled' : 'disabled'}`}
          >
            <span>{getTranslation('apply')} ({selectedStores.length}/3)</span>
            <ChevronRight className="icon" />
          </button>
        </div>
      )}

      {/* Application Form */}
      {step === 'apply' && (
        <div className="page-content">
          <div className="section-header">
            <h2 className="section-title">{getTranslation('yourInfo')}</h2>
            <p className="section-subtitle">Quick 2-minute application ✨</p>
          </div>

          <div className="form-container">
            {/* Age Input */}
            <div className="form-group">
              <label className="form-label">{getTranslation('age')} 🎂</label>
              <div className="input-container">
                <User className="input-icon" />
                <input
                  type="number"
                  min="16"
                  max="65"
                  value={applicantData.age}
                  onChange={(e) => setApplicantData({...applicantData, age: e.target.value})}
                  className="form-input"
                  placeholder="18"
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="form-group">
              <label className="form-label">{getTranslation('name')} ✨</label>
              <input
                type="text"
                value={applicantData.name}
                onChange={(e) => setApplicantData({...applicantData, name: e.target.value})}
                className="form-input"
                placeholder="Your awesome name"
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label className="form-label">{getTranslation('experience')} 💼</label>
              <select
                value={applicantData.experience}
                onChange={(e) => setApplicantData({...applicantData, experience: e.target.value})}
                className="form-input"
              >
                <option value="">Choose your level...</option>
                <option value="none">No retail experience (We'll teach you!)</option>
                <option value="less1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="more3">More than 3 years (Pro level!)</option>
              </select>
            </div>

            {/* Preferred Shifts */}
            <div className="form-group">
              <label className="form-label">{getTranslation('preferredShifts')} ⏰</label>
              <div className="shifts-grid">
                {[
                  { key: 'morning', emoji: '🌅' },
                  { key: 'evening', emoji: '🌆' },
                  { key: 'night', emoji: '🌙' },
                  { key: 'weekend', emoji: '🎉' }
                ].map((shift) => (
                  <label
                    key={shift.key}
                    className={`shift-option ${applicantData.preferredShifts.includes(shift.key) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="shift-checkbox"
                      checked={applicantData.preferredShifts.includes(shift.key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setApplicantData({
                            ...applicantData,
                            preferredShifts: [...applicantData.preferredShifts, shift.key]
                          });
                        } else {
                          setApplicantData({
                            ...applicantData,
                            preferredShifts: applicantData.preferredShifts.filter(s => s !== shift.key)
                          });
                        }
                      }}
                    />
                    <div className="shift-content">
                      <div className="shift-emoji">{shift.emoji}</div>
                      <span className="shift-label">{getTranslation(shift.key)}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Stores Summary */}
            <div className="stores-summary">
              <p className="summary-title">
                <Heart className="icon-sm" />
                Applying to these awesome stores:
              </p>
              <div className="summary-list">
                {selectedStores.map((store) => (
                  <div key={store.id} className="summary-item">
                    <div className="summary-dot"></div>
                    <span>{store.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Start Interview Button */}
          <button
            onClick={startAIInterview}
            disabled={!applicantData.age || !applicantData.name || loading}
            className={`interview-button ${applicantData.age && applicantData.name && !loading ? 'enabled' : 'disabled'}`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Connecting to AI recruiter...</span>
              </>
            ) : (
              <>
                <MessageSquare className="icon" />
                <span>{getTranslation('startInterview')}</span>
                <Zap className="icon-sm" />
              </>
            )}
          </button>

          {/* Footer Message */}
          <div className="footer-message">
            <p>🤖 Our AI recruiter is super friendly and quick!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GS25CareerPage;