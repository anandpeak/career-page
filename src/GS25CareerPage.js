import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, DollarSign, Users, ChevronRight, User, Briefcase, Star, Navigation, Search, Globe, MessageSquare, Zap, TrendingUp, Award, Heart, ArrowLeft, X, Map, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Company Configuration System
const COMPANY_CONFIGS = {
  'carrefour': {
    companyId: 'carrefour',
    brandName: 'Carrefour',
    subdomain: 'carrefour.oneplace.hr',
    brandColor: '#1e40af',
    brandGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e40af 50%, #3b82f6 75%, #60a5fa 100%)',
    logo: 'Carrefour',
    maxStoreSelection: 1,
    features: {
      hasShiftPreferences: true,
      requiresExperience: false,
      hasUrgentPositions: true
    },
    translations: {
      mn: {
        title: 'Carrefour-д ажиллах',
        subtitle: '50+ дэлгүүрт ажлын байр нээлттэй',
        findNearby: 'Гэрт ойр ажилд оръё',
        selectStores: 'Нэг ажлын байр сонгоорой',
        selectPosition: 'Ажлын байр сонгох',
        availablePositions: 'Нээлттэй ажлын байрууд',
        apply: 'Ажилд оръё',
        urgent: 'Яаралтай',
        back: 'Буцах'
      },
      en: {
        title: 'Work at Carrefour',
        subtitle: '50+ stores with open positions',
        findNearby: 'Find Stores Near Me',
        selectStores: 'Select 1 position',
        selectPosition: 'Select Position',
        availablePositions: 'Available Positions',
        apply: 'Apply',
        urgent: 'Urgent',
        back: 'Back'
      }
    }
  }
};

// Mock company data - replace with API calls
const MOCK_COMPANY_DATA = {
  'carrefour': {
    stores: [
      { 
        id: 101, 
        name: 'Carrefour State Department Store', 
        lat: 47.9172, 
        lng: 106.9040, 
        address: 'State Department Store',
        managerId: 'mgr_c001',
        positions: [
          { id: 'cpos1', title: 'Кассчин', urgent: true, salaryRange: '₮2.0M-2.5M' },
          { id: 'cpos2', title: 'Хүнсний хэсгийн ажилчин', urgent: false, salaryRange: '₮1.8M-2.3M' },
          { id: 'cpos3', title: 'Үйлчлэгч', urgent: true, salaryRange: '₮1.7M-2.2M' }
        ]
      },
      { 
        id: 102, 
        name: 'Carrefour Mall', 
        lat: 47.9250, 
        lng: 106.9150, 
        address: 'Central Mall',
        managerId: 'mgr_c002',
        positions: [
          { id: 'cpos4', title: 'Борлуулагч', urgent: false, salaryRange: '₮1.9M-2.4M' },
          { id: 'cpos5', title: 'Бүтээгдэхүүний зохион байгуулагч', urgent: true, salaryRange: '₮2.1M-2.6M' }
        ]
      }
    ]
  }
};

const LANGUAGES = [
  { code: 'mn', name: 'Монгол', flag: '🇲🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const MultiCompanyCareerPage = () => {
  // Get company config based on subdomain
  const getCompanyFromSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return COMPANY_CONFIGS[subdomain] || null;
  };

  const [companyConfig, setCompanyConfig] = useState(getCompanyFromSubdomain());
  const [step, setStep] = useState('landing'); // landing, stores, position-select, apply
  const [navigationHistory, setNavigationHistory] = useState(['landing']);
  const [userLocation, setUserLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [language, setLanguage] = useState('mn');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Map reference for location button functionality
  const mapRef = useRef(null);

  // Fix default marker icon for Leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Navigation functions
  const navigateTo = (newStep) => {
    setNavigationHistory(prev => [...prev, newStep]);
    setStep(newStep);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousStep = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setStep(previousStep);
    }
  };

  // Load company data
  useEffect(() => {
    if (companyConfig && MOCK_COMPANY_DATA[companyConfig.companyId]) {
      const companyData = MOCK_COMPANY_DATA[companyConfig.companyId];
      setStores(companyData.stores);
      // Reset selections when switching companies
      setSelectedStores([]);
      setSelectedPositions([]);
      setCurrentStore(null);
      setShowPositionModal(false);
    } else {
      // No data available, clear stores
      setStores([]);
      setSelectedStores([]);
      setSelectedPositions([]);
      setCurrentStore(null);
      setShowPositionModal(false);
    }
  }, [companyConfig]);

  // Enhanced location handling for Safari/iOS
  const getUserLocation = async () => {
    setLoading(true);
    setLocationError('');
    
    if (!companyConfig || !MOCK_COMPANY_DATA[companyConfig.companyId]) {
      setLocationError('Компанийн мэдээлэл олдохгүй байна');
      setLoading(false);
      return;
    }

    const companyData = MOCK_COMPANY_DATA[companyConfig.companyId];
    setStores(companyData.stores);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Таны төхөөрөмж байршил тодорхойлохыг дэмжихгүй байна');
      handleLocationFallback(companyData.stores);
      return;
    }

    // Check if we're on Safari/iOS for better error handling
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Safari-specific timeout (shorter for better UX)
    const timeoutDuration = (isSafari || isIOS) ? 8000 : 15000;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setLoading(false);
        navigateTo('stores');
      },
      (error) => {
        let errorMessage = '';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            if (isSafari || isIOS) {
              errorMessage = 'Safari дээр байршил зөвшөөрөх шаардлагатай. Тохиргоо > Safari > Байршил > Зөвшөөрөх гэж сонгоно уу.';
            } else {
              errorMessage = 'Байршил зөвшөөрөх шаардлагатай. Хөтчийн тохиргооноос байршлыг идэвхжүүлнэ үү.';
            }
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Байршил олдохгүй байна. Интернет холболт эсвэл GPS-г шалгана уу.';
            break;
          case error.TIMEOUT:
            if (isSafari || isIOS) {
              errorMessage = 'Safari дээр байршил хүлээх хугацаа дууссан.';
            } else {
              errorMessage = 'Байршил хүлээх хугацаа дууссан.';
            }
            break;
          default:
            errorMessage = 'Байршил тодорхойлоход алдаа гарлаа.';
        }
        
        setLocationError(errorMessage);
        handleLocationFallback(companyData.stores);
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutDuration,
        maximumAge: 300000 // 5 minutes cache for better performance
      }
    );
  };
  
  // Manual location selection for Safari/iOS users
  const selectManualLocation = () => {
    if (!companyConfig || !MOCK_COMPANY_DATA[companyConfig.companyId]) {
      setLocationError('Компанийн мэдээлэл олдохгүй байна');
      return;
    }
    
    const companyData = MOCK_COMPANY_DATA[companyConfig.companyId];
    setStores(companyData.stores);
    // Default to Ulaanbaatar center
    setUserLocation({ lat: 47.9187, lng: 106.9177 });
    navigateTo('stores');
  };

  // Fallback when location fails
  const handleLocationFallback = (storeData) => {
    setLoading(false);
    // Default to Ulaanbaatar center
    const defaultLat = 47.9187;
    const defaultLng = 106.9177;
    setUserLocation({ lat: defaultLat, lng: defaultLng });
    navigateTo('stores');
  };

  const handleStoreClick = (store) => {
    setCurrentStore(store);
    setShowPositionModal(true);
  };

  const handlePositionSelect = (position) => {
    const storeWithPosition = {
      storeId: currentStore.id,
      storeName: currentStore.name,
      positionId: position.id,
      positionTitle: position.title,
      salaryRange: position.salaryRange,
      urgent: position.urgent
    };

    // Only allow one position selection - replace existing selection
    setSelectedPositions([storeWithPosition]);
    setSelectedStores([currentStore]);

    setShowPositionModal(false);
    setCurrentStore(null);

    // Auto-scroll to action button after selection
    setTimeout(() => {
      const actionButton = document.querySelector('.continue-button');
      if (actionButton) {
        actionButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300); // Small delay to ensure DOM is updated
  };

  const removeSelectedPosition = (storeId, positionId) => {
    // For single selection, just clear everything
    setSelectedPositions([]);
    setSelectedStores([]);
  };

  const getTranslation = (key) => {
    if (!companyConfig || !companyConfig.translations) return key;
    return companyConfig.translations[language][key] || key;
  };

  // Dynamic styles based on company config
  const dynamicStyles = companyConfig ? {
    background: companyConfig.brandGradient,
    '--brand-color': companyConfig.brandColor,
    '--brand-color-light': companyConfig.brandColor + '20',
    '--brand-color-medium': companyConfig.brandColor + '40'
  } : {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    '--brand-color': '#64748b',
    '--brand-color-light': '#64748b20',
    '--brand-color-medium': '#64748b40'
  };

  // If no company config is found, show error message
  if (!companyConfig) {
    return (
      <div className="app-container" style={dynamicStyles}>
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo" style={{ background: '#64748b' }}>
                ?
              </div>
              <span className="header-title">Компани олдохгүй</span>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="hero-section">
            <h1 className="hero-title">Компанийн мэдээлэл олдохгүй байна</h1>
            <p className="hero-subtitle">Таны хандсан хаяг буруу эсвэл компани бүртгэгдээгүй байна.</p>
          </div>
        </div>
        <style>{`
          .app-container {
            min-height: 100vh;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          .header {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
          }
          .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .logo {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: white;
          }
          .header-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
          }
          .page-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          .hero-section {
            text-align: center;
            margin-bottom: 3rem;
          }
          .hero-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .hero-subtitle {
            font-size: 1.25rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container" style={dynamicStyles}>
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            {step !== 'landing' && (
              <button onClick={goBack} className="back-button">
                <ArrowLeft className="icon-sm" />
              </button>
            )}
            <div className="logo" style={{ background: companyConfig.brandColor }}>
              {companyConfig.logo}
            </div>
            <span className="header-title">
              {getTranslation('title')}
              {selectedPositions.length > 0 && (
                <span className="selection-count">✓</span>
              )}
            </span>
          </div>
          <div className="language-selector">
            {/* Demo: Company Switcher */}
            {/* <button
              onClick={() => {
                const companies = Object.keys(COMPANY_CONFIGS);
                const currentIndex = companies.indexOf(companyConfig.companyId);
                const nextIndex = (currentIndex + 1) % companies.length;
                const nextCompany = companies[nextIndex];
                setCompanyConfig(COMPANY_CONFIGS[nextCompany]);
              }}
              className="company-switcher"
              title="Demo: Switch Company"
            >
              🏢 {companyConfig.brandName}
            </button> */}
            
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

          {/* Manual Location Selection (if location fails) */}
          {(locationError || !userLocation) && (
            <div className="district-selection">
              <div className="district-header">
                <MapPin className="icon-sm" style={{ color: companyConfig.brandColor }} />
                <h3>Дүүргээ сонгоно уу</h3>
              </div>
              {locationError && (
                <p className="location-error-text">{locationError}</p>
              )}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    const [lat, lng] = e.target.value.split(',').map(Number);
                    setUserLocation({ lat, lng });
                    setLocationError('');
                  }
                }}
                className="district-select"
                defaultValue=""
              >
                <option value="">Дүүргээ сонгоно уу...</option>
                <option value="47.9250,106.9150">Баянгол дүүрэг</option>
                <option value="47.9356,106.9894">Баянзүрх дүүрэг</option>
                <option value="47.9267,106.9083">Чингэлтэй дүүрэг</option>
                <option value="47.8864,106.9057">Хан-Уул дүүрэг</option>
                <option value="47.9187,106.9177">Сүхбаатар дүүрэг</option>
                <option value="47.8994,106.7892">Сонгинохайрхан дүүрэг</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Landing Page */}
      {step === 'landing' && (
        <div className="page-content">
          <div className="hero-section">
            <div className="trending-badge">
              <Zap className="icon-sm" />
              <span>Хамгийн trendy ажлын байр 🔥</span>
            </div>
            <h1 className="hero-title">{getTranslation('title')}</h1>
            <p className="hero-subtitle">{getTranslation('subtitle')}</p>
            <div className="badges">
              <span className="badge green">Яахав эхэлцгээе! 🚀</span>
              <span className="badge pink">Сайн санаатай баг 💫</span>
            </div>
          </div>

          <div className="location-buttons">
            <button
              onClick={getUserLocation}
              className={`cta-button main-action-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
              style={{ background: companyConfig.brandColor, marginBottom: '0.75rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Байршил хайж байна...</span>
                </>
              ) : (
                <>
                  <Navigation className="icon" />
                  <span>{getTranslation('findNearby')}</span>
                </>
              )}
            </button>

            {/* Manual location option - especially helpful for Safari */}
            <button
              onClick={selectManualLocation}
              className="manual-location-button"
              disabled={loading}
            >
              <MapPin className="icon-sm" />
              <span>Гараар байршил сонгох</span>
              <span className="safari-hint">(Safari/iPhone-д зориулсан)</span>
            </button>

            {/* Safari/iOS tip */}
            <div className="location-tip">
              <span className="tip-icon">💡</span>
              <span className="tip-text">
                iPhone Safari дээр байршил ажиллахгүй бол "Гараар байршил сонгох" товчийг дарна уу
              </span>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon green">
                <DollarSign className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">₮2.2M - ₮2.8M сарын цалин</div>
                <div className="benefit-subtitle">Цалингаа өдөртөө аваарай</div>
              </div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon blue">
                <Clock className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">Уян хатан ажлын цаг</div>
                <div className="benefit-subtitle">Цагаа сонгох боломжтой</div>
              </div>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon purple">
                <Briefcase className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">Туршлага шаардахгүй</div>
                <div className="benefit-subtitle">Бүрэн сургалттай</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Selection with Enhanced Map */}
      {step === 'stores' && (
        <div className="page-content">
          <div className="section-header">
            <h2 className="section-title">Таны ойролцоох дэлгүүрүүд</h2>
            <p className="section-subtitle">{getTranslation('selectStores')}</p>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="map-container">
            {userLocation ? (
              <>
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ 
                    height: '100%', 
                    width: '100%', 
                    borderRadius: '16px',
                    zIndex: 1
                  }}
                  attributionControl={true}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                  />
                  
                  {/* User location marker with custom icon containing text */}
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={L.divIcon({
                      className: 'custom-user-location-marker',
                      html: `
                        <div class="user-location-pin">
                          <div class="pin-body">
                            <div class="location-text">
                              <div class="text-line">Таны</div>
                              <div class="text-line">байршил</div>
                            </div>
                          </div>
                          <div class="pin-tip"></div>
                        </div>
                      `,
                      iconSize: [60, 60],
                      iconAnchor: [30, 60]
                    })}
                  />
                
                {/* Store markers */}
                {stores.map(store => {
                  const hasUrgentPositions = store.positions.some(p => p.urgent);
                  const markerIcon = L.icon({
                    iconUrl: hasUrgentPositions
                      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
                      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  });

                  return (
                    <Marker
                      key={store.id}
                      position={[store.lat, store.lng]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => handleStoreClick(store)
                      }}
                    >
                      <Popup>
                        <div style={{ color: '#333', minWidth: '200px' }}>
                          <strong style={{ fontSize: '16px', color: companyConfig.brandColor }}>
                            {store.name}
                          </strong>
                          <br />
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            {store.address}
                          </span>
                          <br />
                          <div style={{ marginTop: '8px', padding: '4px 8px', background: '#f0f9ff', borderRadius: '4px' }}>
                            <strong style={{ color: companyConfig.brandColor }}>
                              {store.positions.length} ажлын байр
                            </strong>
                            {hasUrgentPositions && (
                              <span style={{ 
                                marginLeft: '8px', 
                                color: '#dc2626',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                🔥 Яаралтай
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleStoreClick(store);
                            }}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '6px 12px',
                              background: companyConfig.brandColor,
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}
                          >
                            Ажлын байр харах
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                </MapContainer>
                
                {/* Location button to center map on user location */}
                <button
                  onClick={() => {
                    if (userLocation && mapRef.current) {
                      // Use the map reference to center on user location
                      mapRef.current.setView([userLocation.lat, userLocation.lng], 15, {
                        animate: true,
                        duration: 0.5
                      });
                    }
                  }}
                  className="location-button"
                  title="Миний байршил"
                >
                  <Navigation className="icon-sm" />
                </button>
              </>
            ) : (
              <div className="map-placeholder">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <p>Таны байршлыг хайж байна...</p>
                  </>
                ) : (
                  <>
                    <Map className="map-icon" />
                    <p>Байршил ачаалж байна...</p>
                    {locationError && (
                      <p className="map-error">{locationError}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Store Cards with Position Preview */}
          <div className="stores-list">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className={`store-card ${selectedStores.find(s => s.id === store.id) ? 'selected' : ''}`}
              >
                <div className="store-header">
                  <div className="store-info">
                    <h3 className="store-name">{store.name}</h3>
                    <p className="store-address">{store.address}</p>
                    <div className="positions-preview">
                      <span className="positions-count">
                        {store.positions.length} ажлын байр
                      </span>
                      {store.positions.some(p => p.urgent) && (
                        <span className="urgent-badge">🔥 Яаралтай</span>
                      )}
                    </div>
                  </div>
                  <div className="store-action">
                    <Building2 className="icon" style={{ color: companyConfig.brandColor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Position Summary */}
          {selectedPositions.length > 0 && (
            <div className="selection-summary">
              <h3 className="summary-title">Сонгосон ажлын байр</h3>
              <div className="selected-positions">
                {selectedPositions.map((sp) => (
                  <div key={`${sp.storeId}-${sp.positionId}`} className="selected-position">
                    <div className="position-info">
                      <div className="position-title">
                        {sp.positionTitle}
                        {sp.urgent && <span className="urgent-indicator"> 🔥</span>}
                      </div>
                      <div className="position-store">{sp.storeName}</div>
                      <div className="position-salary">{sp.salaryRange}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPositions([]);
                        setSelectedStores([]);
                      }}
                      className="remove-position"
                    >
                      <X className="icon-sm" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => navigateTo('apply')}
                className="continue-button"
                style={{ background: companyConfig.brandColor }}
              >
                AI ярилцлага эхлэх
                <MessageSquare className="icon" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Application Confirmation */}
      {step === 'apply' && (
        <div className="page-content">
          <div className="section-header">
            <h2 className="section-title">AI ярилцлагад бэлэн үү?</h2>
            <p className="section-subtitle">Таны сонгосон ажлын байрын талаар ярилцъя ✨</p>
          </div>

          <div className="confirmation-container">
            {/* Selected Position Display */}
            <div className="application-summary">
              <h4 className="summary-title">
                <Heart className="icon-sm" />
                Таны сонгосон ажлын байр
              </h4>
              <div className="summary-positions">
                {selectedPositions.map((sp) => (
                  <div key={`${sp.storeId}-${sp.positionId}`} className="summary-position">
                    <div className="position-details">
                      <div className="position-name">
                        {sp.positionTitle}
                        {sp.urgent && <span className="urgent-indicator"> 🔥</span>}
                      </div>
                      <div className="position-location">{sp.storeName}</div>
                      <div className="position-salary">{sp.salaryRange}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Info */}
            <div className="interview-info">
              <div className="info-icon">
                <MessageSquare className="icon" style={{ color: companyConfig.brandColor }} />
              </div>
              <div className="info-content">
                <h3 className="info-title">AI ярилцлагын тухай</h3>
                <ul className="info-list">
                  <li>⏱️ 3-5 минут үргэлжлэх</li>
                  <li>🤖 Найрсаг AI ажилд авагчтай ярилцана</li>
                  <li>💬 Танайт ойролцоо асуултууд асуух болно</li>
                  <li>📱 Утсаар эсвэл компьютераар хийж болно</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Interview Button */}
          <button
            onClick={() => {
              // Simulate starting AI interview
              const sessionData = {
                companyId: companyConfig.companyId,
                storeId: selectedPositions[0]?.storeId,
                storeName: selectedPositions[0]?.storeName,
                positionId: selectedPositions[0]?.positionId,
                positionTitle: selectedPositions[0]?.positionTitle,
                language: language,
                timestamp: Date.now(),
                source: 'career_page'
              };
              
              // In real implementation, redirect to AI interview
              console.log('Starting AI interview with:', sessionData);
              alert(`AI ярилцлага эхэлж байна!\n\nАжлын байр: ${selectedPositions[0]?.positionTitle}\nДэлгүүр: ${selectedPositions[0]?.storeName}`);
            }}
            className="ai-interview-button standout-button"
          >
            <MessageSquare className="icon" />
            AI ярилцлага эхлэх
            <Zap className="icon" />
          </button>

          <div className="privacy-note">
            <p>
              🔒 Таны мэдээлэл бүрэн нууцлагдан хадгалагдана. 
              AI ярилцлагын үр дүнг 24 цагийн дотор мэдэгдэх болно.
            </p>
          </div>
        </div>
      )}

      {/* Position Selection Modal */}
      {showPositionModal && currentStore && (
        <div className="modal-overlay" onClick={() => setShowPositionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{currentStore.name}</h3>
              <button
                onClick={() => setShowPositionModal(false)}
                className="modal-close"
              >
                <X className="icon" />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-subtitle">{getTranslation('availablePositions')}</p>
              <div className="positions-list">
                {currentStore.positions.map((position) => {
                  const isSelected = selectedPositions.find(sp => 
                    sp.storeId === currentStore.id && sp.positionId === position.id
                  );
                  
                  return (
                    <div
                      key={position.id}
                      onClick={() => handlePositionSelect(position)}
                      className={`position-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="position-header">
                        <div className="position-title">{position.title}</div>
                        {position.urgent && (
                          <span className="urgent-badge">🔥 {getTranslation('urgent')}</span>
                        )}
                      </div>
                      <div className="position-salary">{position.salaryRange}</div>
                      {isSelected && (
                        <div className="selected-indicator">✓ Сонгогдсон</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          position: relative;
          color: white;
        }

        .header {
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          background: rgba(15, 23, 42, 0.7);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
          padding: 1rem;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 480px;
          margin: 0 auto;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .back-button {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .logo {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.6rem 1rem;
          border-radius: 12px;
          letter-spacing: -0.3px;
        }

        .header-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }

        .selection-count {
          background: var(--brand-color);
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: 6px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }

        .language-selector {
          position: relative;
          display: flex;
          gap: 0.5rem;
        }

        .company-switcher {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(34, 197, 94, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 0.875rem;
          border-radius: 12px;
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: rgba(134, 239, 172, 0.9);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .company-switcher:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 0.875rem;
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.15);
          color: rgba(226, 232, 240, 0.9);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .language-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(59, 130, 246, 0.1);
          min-width: 150px;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgba(226, 232, 240, 0.9);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.875rem;
        }

        .page-content {
          padding: 1.5rem 1rem;
          max-width: 480px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 1rem;
        }

        .trending-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(10px);
          color: rgba(226, 232, 240, 0.9);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .hero-title {
          font-size: 2.25rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          line-height: 1.1;
        }

        .hero-subtitle {
          color: rgba(226, 232, 240, 0.8);
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .badges {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .badge.green {
          background: rgba(34, 197, 94, 0.1);
          color: #000000;
        }

        .badge.pink {
          background: rgba(236, 72, 153, 0.1);
          color: #000000;
        }

        .cta-button {
          width: 100%;
          padding: 1.25rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .location-buttons {
          margin-bottom: 2rem;
        }

        .manual-location-button {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 500;
          font-size: 1rem;
          color: rgba(226, 232, 240, 0.9);
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.25rem;
        }

        .manual-location-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .manual-location-button:hover:not(:disabled) {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
          transform: translateY(-1px);
        }

        .manual-location-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .safari-hint {
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.6);
          font-weight: 400;
        }

        .standout-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          animation: gentle-pulse 3s ease-in-out infinite;
        }

        .standout-button:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
          box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4) !important;
          transform: translateY(-2px) !important;
        }

        @keyframes gentle-pulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          }
          50% {
            box-shadow: 0 4px 25px rgba(16, 185, 129, 0.4);
          }
        }

        .location-tip {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.15);
          border-radius: 12px;
          padding: 0.75rem;
          margin-top: 1rem;
          margin-bottom: 2rem;
        }

        .tip-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .tip-text {
          font-size: 0.75rem;
          color: rgba(134, 239, 172, 0.9);
          line-height: 1.4;
        }

        .cta-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .cta-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .benefits-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .benefit-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .benefit-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .benefit-icon.green { background: rgba(34, 197, 94, 0.15); }
        .benefit-icon.blue { background: rgba(59, 130, 246, 0.15); }
        .benefit-icon.purple { background: rgba(147, 51, 234, 0.15); }

        .benefit-title {
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .benefit-subtitle {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: rgba(226, 232, 240, 0.8);
          font-size: 1rem;
        }

        .map-container {
          height: 300px;
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(59, 130, 246, 0.1);
          overflow: hidden;
          position: relative;
        }

        /* Leaflet map styling */
        .map-container .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          border-radius: 16px;
        }

        .map-container .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          font-size: 10px !important;
        }

        .location-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 1000;
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #3b82f6;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          -webkit-user-select: none;
          user-select: none;
        }

        .location-button:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .location-button:active {
          transform: scale(0.95);
        }

        .custom-user-location-marker {
          background: transparent !important;
          border: none !important;
        }

        .user-location-pin {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pin-body {
          width: 42px;
          height: 42px;
          background: #3b82f6;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          border: 2px solid white;
          position: relative;
          z-index: 2;
        }

        .location-text {
          transform: rotate(45deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
        }

        .text-line {
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          line-height: 0.9;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .pin-tip {
          position: absolute;
          bottom: 12px;
          width: 0;
          height: 0;
          z-index: 1;
        }

        .map-placeholder {
          text-align: center;
          color: rgba(226, 232, 240, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .map-icon {
          width: 2.5rem;
          height: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.7;
        }

        .map-error {
          font-size: 0.75rem;
          color: rgba(239, 68, 68, 0.8);
          text-align: center;
          max-width: 250px;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.5rem;
          border-radius: 8px;
          margin-top: 0.5rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .district-selection {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
        }

        .district-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .district-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .location-error-text {
          color: rgba(239, 68, 68, 0.9);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .district-select {
          width: 100%;
          padding: 0.875rem;
          background: rgba(59, 130, 246, 0.08) !important;
          color: white !important;
          border: 1px solid rgba(59, 130, 246, 0.15) !important;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .district-select:focus {
          background: rgba(59, 130, 246, 0.12) !important;
          border-color: rgba(59, 130, 246, 0.25) !important;
        }

        .district-select option {
          background: #1e293b !important;
          color: white !important;
        }

        .stores-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .store-card {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .store-card:hover {
          background: rgba(59, 130, 246, 0.12);
          transform: translateY(-1px);
        }

        .store-card.selected {
          border-color: var(--brand-color);
          background: var(--brand-color-light);
        }

        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .store-name {
          font-weight: 600;
          color: white;
          font-size: 1.125rem;
          margin: 0 0 0.5rem 0;
        }

        .store-address {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin: 0 0 0.75rem 0;
        }

        .positions-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .positions-count {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.8);
        }

        .urgent-badge {
          font-size: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          color: rgba(252, 165, 165, 0.9);
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .selection-summary {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
          margin-bottom: 2rem;
        }

        .summary-title {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 1rem;
        }

        .selected-positions {
          display: grid;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .selected-position {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 0.75rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .position-title {
          font-weight: 500;
          color: white;
          font-size: 0.9rem;
        }

        .position-store {
          font-size: 0.8rem;
          color: rgba(226, 232, 240, 0.7);
        }

        .remove-position {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 6px;
          padding: 0.25rem;
          color: rgba(252, 165, 165, 0.9);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .continue-button {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .confirmation-container {
          margin-bottom: 2rem;
        }

        .interview-info {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
          margin-bottom: 2rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .info-icon {
          background: rgba(59, 130, 246, 0.15);
          border-radius: 12px;
          padding: 0.75rem;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
        }

        .info-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.5rem;
        }

        .info-list li {
          color: rgba(226, 232, 240, 0.8);
          font-size: 0.875rem;
          padding: 0.25rem 0;
        }

        .ai-interview-button {
          width: 100%;
          padding: 1.25rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .ai-interview-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .privacy-note {
          text-align: center;
          background: rgba(34, 197, 94, 0.08);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(34, 197, 94, 0.15);
        }

        .privacy-note p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(134, 239, 172, 0.9);
          line-height: 1.5;
        }

        .form-container {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: rgba(226, 232, 240, 0.9);
        }

        .form-input {
          width: 100%;
          padding: 0.875rem;
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 12px;
          font-size: 1rem;
          color: white;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .form-input::placeholder {
          color: rgba(226, 232, 240, 0.5);
        }

        .application-summary {
          background: rgba(59, 130, 246, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.15);
          margin-bottom: 2rem;
        }

        .summary-positions {
          display: grid;
          gap: 0.75rem;
        }

        .summary-position {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .position-name {
          font-weight: 600;
          color: white;
          margin-bottom: 0.25rem;
        }

        .position-location {
          font-size: 0.875rem;
          color: rgba(226, 232, 240, 0.7);
          margin-bottom: 0.25rem;
        }

        .position-salary {
          font-size: 0.875rem;
          color: rgba(134, 239, 172, 0.9);
        }

        .selected-indicator {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: var(--brand-color);
          font-weight: 600;
          text-align: center;
          background: var(--brand-color-light);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .urgent-indicator {
          font-size: 1.25rem;
        }

        .submit-button {
          width: 100%;
          padding: 1.25rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 1.125rem;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .submit-button.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .modal-close {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-subtitle {
          color: rgba(226, 232, 240, 0.8);
          margin-bottom: 1rem;
        }

        .positions-list {
          display: grid;
          gap: 0.75rem;
        }

        .position-card {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .position-card:hover {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.25);
        }

        .position-card.selected {
          border-color: var(--brand-color);
          background: var(--brand-color-light);
        }

        .position-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .position-salary {
          font-size: 0.875rem;
          color: rgba(134, 239, 172, 0.9);
        }

        .icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .icon-sm {
          width: 1rem;
          height: 1rem;
        }

        .spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(226, 232, 240, 0.2);
          border-top: 2px solid rgba(226, 232, 240, 0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .page-content {
            padding: 1rem 0.75rem;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .modal-content {
            margin: 0.5rem;
            max-width: none;
          }

          .manual-location-button {
            padding: 0.875rem;
            gap: 0.375rem;
          }

          .location-tip {
            padding: 0.625rem;
          }

          .tip-text {
            font-size: 0.7rem;
          }

          .location-error-text {
            font-size: 0.8rem;
            padding: 0.625rem;
          }

          .user-location-pin {
            width: 55px;
            height: 55px;
          }

          .pin-body {
            width: 38px;
            height: 38px;
          }

          .text-line {
            font-size: 0.6rem;
            font-weight: 600;
          }
        }
      `}</style>
    </div>
  );
};

export default MultiCompanyCareerPage;