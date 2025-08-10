import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, ChevronRight, User, Briefcase, Star, Navigation, Search, Globe, MessageSquare, Zap, TrendingUp, Award, Heart, ArrowLeft, X, Map, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CareerPageAPI } from './services/api';
import { transformCompanyData, transformStoreData, transformPositionData } from './utils/dataTransformers';

// Custom hook for API data - UPDATED FOR YOUR API
const useCompanyData = () => {
  const [api] = useState(() => new CareerPageAPI());
  const [companyData, setCompanyData] = useState(null);
  const [apiStores, setApiStores] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  const getSubdomainFromUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '1place'; // Default for testing
    }
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
    return '1place';
  };

  const loadCompanyData = async () => {
    const suburl = getSubdomainFromUrl();
    setDataLoading(true);
    setDataError(null);
    
    try {
      // Get everything in one API call
      const allData = await api.getCompanyBySuburl(suburl);
      console.log('✅ Raw API data received:', allData);
      
      // Transform company config
      const transformedCompany = transformCompanyData(allData);
      console.log('🏢 Transformed company:', transformedCompany);
      setCompanyData(transformedCompany);
      
      // Transform branches (stores) - now includes jobs (positions) already
      const transformedStores = transformStoreData(allData.branches || []);
      console.log('🏬 Transformed stores:', transformedStores);
      setApiStores(transformedStores);
      
      console.log('✅ API data transformation complete:', { 
        companyName: transformedCompany.brandName,
        storeCount: transformedStores.length,
        storeNames: transformedStores.map(s => s.name)
      });
      
    } catch (error) {
      setDataError(error.message);
      console.log('❌ API failed, will use fallback data:', error.message);
      // Don't set fallback data here, let the component use existing mock data
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, []);

  return {
    companyData,
    apiStores,
    dataLoading,
    dataError,
    reloadCompanyData: loadCompanyData,
    api
  };
};

// Company Configuration System
const COMPANY_CONFIGS = {
  'gs25': {
    companyId: 'gs25',
    brandName: 'GS25',
    subdomain: 'gs25.oneplace.hr',
    brandColor: '#3b82f6',
    brandGradient: 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)',
    logo: 'GS25',
    maxStoreSelection: 1,
    features: {
      hasShiftPreferences: true,
      requiresExperience: true,
      hasUrgentPositions: true
    },
    translations: {
      mn: {
        title: 'GS25-д ажиллах',
        subtitle: '300+ дэлгүүрт ажлын байр нээлттэй',
        findNearby: 'Гэрт ойр ажилд оръё',
        selectStores: 'Нэг ажлын байр сонгоорой',
        selectPosition: 'Ажлын байр сонгох',
        availablePositions: 'Нээлттэй ажлын байрууд',
        apply: 'Ажилд оръё',
        urgent: 'Яаралтай',
        back: 'Буцах'
      },
      en: {
        title: 'Work at GS25',
        subtitle: '300+ stores with open positions',
        findNearby: 'Find Stores Near Me',
        selectStores: 'Select 1 position',
        selectPosition: 'Select Position',
        availablePositions: 'Available Positions',
        apply: 'Apply',
        urgent: 'Urgent',
        back: 'Back'
      }
    }
  },
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
  'gs25': {
    stores: [
      { 
        id: 1, 
        name: 'GS25 Zaisan', 
        lat: 47.8864, 
        lng: 106.9057, 
        address: 'Zaisan Street 12',
        managerId: 'mgr_001',
        positions: [
          { id: 'pos1', title: 'Кассчин', urgent: true, salaryRange: '₮1.8M-2.2M' },
          { id: 'pos2', title: 'Борлуулагч', urgent: false, salaryRange: '₮1.6M-2.0M' },
          { id: 'pos3', title: 'Ахлах кассчин', urgent: true, salaryRange: '₮2.2M-2.8M' }
        ]
      },
      { 
        id: 2, 
        name: 'GS25 Central Tower', 
        lat: 47.9187, 
        lng: 106.9177, 
        address: 'Central Tower, Ground Floor',
        managerId: 'mgr_003',
        positions: [
          { id: 'pos4', title: 'Кассчин', urgent: false, salaryRange: '₮1.8M-2.2M' },
          { id: 'pos5', title: 'Агуулахын ажилчин', urgent: true, salaryRange: '₮1.7M-2.1M' }
        ]
      },
      { 
        id: 3, 
        name: 'GS25 Shangri-La', 
        lat: 47.9167, 
        lng: 106.9167, 
        address: 'Shangri-La Mall, 1st Floor',
        managerId: 'mgr_002',
        positions: [
          { id: 'pos6', title: 'Борлуулагч', urgent: false, salaryRange: '₮1.6M-2.0M' },
          { id: 'pos7', title: 'Шөнийн ээлж', urgent: true, salaryRange: '₮2.0M-2.5M' }
        ]
      }
    ]
  },
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
  // Add API hook at the very top
  const { companyData, apiStores, dataLoading, dataError, api } = useCompanyData();

  // Get company config based on subdomain or default to gs25
  const getCompanyFromSubdomain = () => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    return COMPANY_CONFIGS[subdomain] || COMPANY_CONFIGS['gs25'];
  };

  const [companyConfig, setCompanyConfig] = useState(getCompanyFromSubdomain());
  const [step, setStep] = useState('landing'); // landing, stores
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

  // Fix default marker icon for Leaflet
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Use API company data if available, otherwise use existing logic
  useEffect(() => {
    if (companyData) {
      console.log('✅ Setting company config from API:', companyData);
      setCompanyConfig(companyData);
    } else if (!dataLoading && !dataError) {
      // Only use fallback if we're not loading and there's no error yet
      const detected = getCompanyFromSubdomain();
      setCompanyConfig(detected);
    }
  }, [companyData, dataLoading, dataError]);

  // Load company data - FIXED VERSION
  useEffect(() => {
    console.log('🔄 Store data effect triggered');
    console.log('- apiStores.length:', apiStores?.length || 0);
    console.log('- dataLoading:', dataLoading);
    console.log('- dataError:', dataError);
    console.log('- companyData available:', !!companyData);
    
    // PRIORITY: Use API data first if available
    if (apiStores && apiStores.length > 0) {
      console.log('✅ Using API data - Setting stores:', apiStores.length);
      console.log('📋 API Store names:', apiStores.map(s => s.name));
      setStores([...apiStores]); // Force new array reference
      console.log('✅ Stores set successfully');
    } else if (!dataLoading && !dataError) {
      console.log('⚠️ No API stores available, checking fallback...');
      // Only use fallback as last resort
      const fallbackData = MOCK_COMPANY_DATA['gs25'];
      setStores([...fallbackData.stores]);
      console.log('🔄 Using fallback mock data');
    } else {
      console.log('⏳ Still loading or has error, waiting...');
    }
    
    // Reset selections when data changes
    setSelectedStores([]);
    setSelectedPositions([]);
    setCurrentStore(null);
    setShowPositionModal(false);
  }, [apiStores, dataLoading, dataError, companyData]);

  // Debug useEffect to track store state changes
  useEffect(() => {
    console.log('🐛 CURRENT STORES STATE:', stores.length, 'stores');
    console.log('🐛 Current store names:', stores.map(s => s.name));
  }, [stores]);

  // Show loading state while API data is being fetched
  if (dataLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)',
        color: 'white',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          Loading company data...
          {dataError && <div style={{ color: '#fca5a5', marginTop: '1rem' }}>
            API Error: {dataError}<br/>
            <small>Will use fallback data</small>
          </div>}
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  // Distance calculation function using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get stores sorted by distance from user location
  const getSortedStores = () => {
    if (!userLocation || !stores.length) {
      return stores;
    }
    
    return [...stores].sort((a, b) => {
      // Only sort stores that have valid coordinates
      if (!a.hasValidCoordinates && !b.hasValidCoordinates) return 0;
      if (!a.hasValidCoordinates) return 1;
      if (!b.hasValidCoordinates) return -1;
      
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      
      return distanceA - distanceB;
    });
  };

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

  // Enhanced location handling for Safari/iOS
  const getUserLocation = async () => {
    setLoading(true);
    setLocationError('');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Таны төхөөрөмж байршил тодорхойлохыг дэмжихгүй байна. Дүүргээ гараар сонгоно уу.');
      setLoading(false);
      return;
    }

    // Check if we're on Safari/iOS for better error handling
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Safari-specific timeout (shorter for better UX)
    const timeoutDuration = (isSafari || isIOS) ? 6000 : 10000;
    
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
              errorMessage = '📱 Safari дээр байршил зөвшөөрөх шаардлагатай. Тохиргоо → Safari → Байршил → "Зөвшөөрөх" гэж сонгоно уу. Эсвэл доорх дүүргээ сонгоно уу.';
            } else {
              errorMessage = '🔒 Байршил зөвшөөрөх шаардлагатай. Хөтчийн тохиргооноос байршлыг идэвхжүүлнэ үү. Эсвэл доорх дүүргээ сонгоно уу.';
            }
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📍 Байршил олдохгүй байна. GPS эсвэл интернет холболтоо шалгаад дахин оролдоно уу. Эсвэл доорх дүүргээ сонгоно уу.';
            break;
          case error.TIMEOUT:
            if (isSafari || isIOS) {
              errorMessage = '⏱️ Safari дээр байршил хүлээх хугацаа дууссан. Доорх дүүргээ сонгоно уу.';
            } else {
              errorMessage = '⏱️ Байршил хүлээх хугацаа дууссан. Доорх дүүргээ сонгоно уу.';
            }
            break;
          default:
            errorMessage = '❌ Байршил тодорхойлоход алдаа гарлаа. Доорх дүүргээ сонгоно уу.';
        }
        
        setLocationError(errorMessage);
        setLoading(false);
        // Don't auto-navigate, let user select district first
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster positioning
        timeout: timeoutDuration,
        maximumAge: 600000 // 10 minutes cache for better performance
      }
    );
  };
  
  // Manual location selection for Safari/iOS users
  const selectManualLocation = () => {
    // Default to Ulaanbaatar center
    setUserLocation({ lat: 47.9187, lng: 106.9177 });
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

  // Add API application submission function
  const handleApiApplicationSubmit = async (formData) => {
    if (!api || !selectedPositions.length) return false;
    
    try {
      setLoading(true);
      
      const applicationData = {
        company_id: companyConfig.companyId,
        store_id: selectedPositions[0]?.storeId,
        position_id: selectedPositions[0]?.positionId,
        applicant_data: formData,
        source: 'career_page',
        language: language,
        applied_at: new Date().toISOString()
      };
      
      const result = await api.submitApplication(applicationData);
      console.log('✅ Application submitted via API:', result);
      return true;
    } catch (error) {
      console.error('❌ API application submission failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTranslation = (key) => {
    return companyConfig.translations[language][key] || key;
  };

  // Dynamic styles based on company config
  const dynamicStyles = {
    background: '#f5f5f5', // Grey background for main pages
    '--brand-color': companyConfig.brandColor,
    '--brand-color-light': companyConfig.brandColor + '20',
    '--brand-color-medium': companyConfig.brandColor + '40'
  };

  return (
    <div className="app-container" style={dynamicStyles}>
      {/* Debug Info - Remove this after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div>🏢 Company: {companyConfig?.brandName || 'Loading...'}</div>
          <div>🎨 Brand Color: {companyConfig?.brandColor || 'Not Set'}</div>
          <div>🏬 API Stores: {apiStores.length}</div>
          <div>📋 Current Stores: {stores.length}</div>
          <div>📍 Store Names: {stores.map(s => s.name).join(', ')}</div>
          <div>🔄 Data Loading: {dataLoading ? 'Yes' : 'No'}</div>
          <div>❌ API Error: {dataError || 'None'}</div>
        </div>
      )}

      {/* Header */}
<div className="header">
  <div className="header-content">
    <div className="header-left">
      {step !== 'landing' && (
        <button onClick={goBack} className="back-button">
          <ArrowLeft className="icon-sm" />
        </button>
      )}
      {companyConfig.photoUrl ? (
        <img 
          src={companyConfig.photoUrl} 
          alt={companyConfig.name}
          className="company-logo"
        />
      ) : (
        <div className="logo" style={{ background: companyConfig.brandColor }}>
          {companyConfig.logo}
        </div>
      )}
      {selectedPositions.length > 0 && (
        <span className="selection-count">✓</span>
      )}
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
          <div className="hero-section">
            <div className="trending-badge">
              <Zap className="icon-sm" />
              <span>Ажилд ороход амархан 🔥</span>
            </div>
            <h1 className="hero-title">{companyConfig.brandName} - н нээлттэй ажлын байрууд</h1>

            <div className="badges">
              <span className="badge green">Шууд ярилцлагад ороорой! 🚀</span>
              <span className="badge pink">Найрсаг баг хамт олон 💫</span>
            </div>
          </div>

          <div className="location-buttons">
            <button
              onClick={getUserLocation}
              className={`cta-button main-action-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Байршил хайж байна...</span>
                </>
              ) : (
                <>
                  <MapPin className="icon-left" />
                  <span>{getTranslation('findNearby')}</span>
                  <Zap className="icon-right" />
                </>
              )}
            </button>

          </div>

          {/* Benefits Grid */}
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon green">
                <DollarSign className="icon" />
              </div>
              <div className="benefit-content">
                <div className="benefit-title">Өрсөлдөхүйц сарын цалин</div>
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

          {/* Show loading if we don't have stores data yet */}
          {stores.length === 0 && (apiStores.length === 0 || dataLoading) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: 'rgba(226, 232, 240, 0.8)'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              <p>Дэлгүүрийн мэдээлэл ачааллаж байна...</p>
            </div>
          ) : (
            <>
              {/* Interactive Leaflet Map */}
              <div className="map-container">
                {userLocation ? (
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
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    />
                    
                    {/* User location marker */}
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                      <Popup>
                        <div style={{ textAlign: 'center', color: '#333' }}>
                          <strong>📍 Таны байршил</strong>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Store markers - only show stores with valid coordinates */}
                    {stores.filter(store => store.hasValidCoordinates).map(store => {
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
                {getSortedStores().map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleStoreClick(store)}
                    className={`store-card ${selectedStores.find(s => s.id === store.id) ? 'selected' : ''}`}
                  >
                    <div className="store-header">
                      <div className="store-info">
                        <h3 className="store-name">{store.name}</h3>
                        <p className="store-address">{store.address}</p>
                        {userLocation && store.hasValidCoordinates && (
                          <p className="store-distance">
                            📍 танаас {calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng).toFixed(1)} км зайд
                          </p>
                        )}
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
  onClick={() => {
    // Get company ID and job ID from API data
    const companyId = companyConfig.companyId; // 316
    const jobId = selectedPositions[0]?.positionId; // 2003
    
    console.log('🔗 Redirecting to AI interview:', { companyId, jobId });
    console.log('🏢 Company:', companyConfig.brandName);
    console.log('💼 Job:', selectedPositions[0]?.positionTitle);
    
    // Construct the chat URL
    const chatUrl = `https://chat.oneplace.hr/chat/${companyId}/${jobId}`;
    
    console.log('🌐 Opening URL:', chatUrl);
    
    // Open in new tab/window
    window.open(chatUrl, '_blank');
    
    // Optional: Also track the application submission in your analytics
    if (api && typeof handleApiApplicationSubmit === 'function') {
      handleApiApplicationSubmit({
        interview_type: 'ai',
        session_data: {
          companyId: companyId,
          jobId: jobId,
          storeId: selectedPositions[0]?.storeId,
          storeName: selectedPositions[0]?.storeName,
          positionTitle: selectedPositions[0]?.positionTitle,
          language: language,
          timestamp: Date.now(),
          source: 'career_page',
          chatUrl: chatUrl
        }
      }).catch(err => console.log('📊 Analytics submission failed:', err));
    }
  }}
  className="continue-button standout-button"
  disabled={loading || !selectedPositions.length}
>
  <MessageSquare className="icon" />
  AI ярилцлага эхлэх
  <Zap className="icon" />
</button>
                </div>
              )}
            </>
          )}
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
        :root {
          --brand-color: ${companyConfig?.brandColor || '#3b82f6'};
          --brand-color-rgb: ${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'};
        }
        .app-container {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          position: relative;
          color: #111827;
        }

        .header {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          background: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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

        .header-right {
          display: flex;
          align-items: center;
        }

        .back-button {
          background: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.1);
          border: 1px solid rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.2);
          border-radius: 8px;
          padding: 0.5rem;
          color: ${companyConfig?.brandColor || '#3b82f6'};
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
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .selection-count {
          margin-left: 0.5rem;
          background: rgba(34, 197, 94, 0.2);
          color: rgba(134, 239, 172, 0.9);
          padding: 0.125rem 0.5rem;
          border-radius: 12px;
          font-size: 0.875rem;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: none;
          padding: 0.5rem 0.875rem;
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.15);
          color: var(--brand-color);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .language-selector {
          position: relative;
          display: flex;
          gap: 0.5rem;
          align-items: center;
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
          background-color: #f5f5f5;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 1rem;
        }

        .trending-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.1);
          backdrop-filter: blur(10px);
          color: #111827;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.15);
        }

        .hero-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
          line-height: 1.1;
          word-wrap: break-word;
          hyphens: auto;
          text-align: center;
          max-width: 100%;
          letter-spacing: -0.02em;
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.5rem;
            line-height: 1.15;
            letter-spacing: -0.01em;
          }
        }

        @media (max-width: 360px) {
          .hero-title {
            font-size: 1.375rem;
            line-height: 1.2;
            letter-spacing: 0;
          }
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
          border: 1px solid rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.1);
        }

        .badge.green {
          background: rgba(34, 197, 94, 0.1);
          color: rgba(134, 239, 172, 0.9);
        }

        .badge.pink {
          background: rgba(236, 72, 153, 0.1);
          color: rgba(251, 182, 206, 0.9);
        }

        .cta-button {
          width: 100%;
          padding: 1.25rem 2rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.125rem;
          color: white;
          background: linear-gradient(135deg, ${companyConfig?.brandColor || '#3b82f6'} 0%, ${companyConfig?.brandColor || '#3b82f6'} 100%);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 16px rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.3), 0 4px 8px rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.2);
          margin-bottom: 1rem;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.5px;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .cta-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2), 0 8px 10px rgba(0, 0, 0, 0.15);
          filter: brightness(1.1);
        }

        .cta-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .cta-button .icon-left {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        .cta-button .icon-right {
          width: 1.25rem;
          height: 1.25rem;
          flex-shrink: 0;
        }

        .cta-button span {
          flex: 1;
          text-align: center;
          font-weight: 600;
          letter-spacing: 0.25px;
        }

        .cta-button.loading {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          box-shadow: 0 4px 20px rgba(107, 114, 128, 0.3);
        }

        .cta-button.loading span {
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
          color: #374151;
          background: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.15);
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
          background: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.12);
          border-color: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.25);
          transform: translateY(-1px);
        }

        .manual-location-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .safari-hint {
          font-size: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }

        .standout-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          animation: gentle-pulse 3s ease-in-out infinite;
        }

        .standout-button:hover:not(:disabled) {
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
          margin-bottom: 1rem;
        }

        .tip-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .tip-text {
          font-size: 0.75rem;
          color: #374151;
          line-height: 1.4;
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
          background: rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid rgba(${companyConfig?.brandColor ? companyConfig.brandColor.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ') : '59, 130, 246'}, 0.1);
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

        .benefit-icon.green { 
          background: rgba(34, 197, 94, 0.15); 
          color: #22c55e;
        }
        .benefit-icon.blue { 
          background: rgba(59, 130, 246, 0.15); 
          color: #3b82f6;
        }
        .benefit-icon.purple { 
          background: rgba(147, 51, 234, 0.15); 
          color: #9333ea;
        }

        .benefit-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .benefit-subtitle {
          color: #374151;
          font-size: 0.875rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #374151;
          margin-bottom: 1.5rem;
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

        .map-container .leaflet-container {
          height: 100% !important;
          width: 100% !important;
          border-radius: 16px;
        }

        .map-container .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          font-size: 10px !important;
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

        .stores-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .store-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          margin-bottom: 1rem;
        }

        .store-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .store-card.selected {
          border-color: ${companyConfig?.brandColor || '#3b82f6'};
          background: white;
          box-shadow: 0 0 0 2px ${companyConfig?.brandColor || '#3b82f6'}, 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .store-name {
          font-weight: 700;
          color: #111827;
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .store-address {
          font-size: 0.875rem;
          color: #4b5563;
          margin: 0 0 0.25rem 0;
        }

        .store-distance {
          font-size: 0.75rem;
          color: #059669;
          font-weight: 500;
          margin: 0 0 0.75rem 0;
        }

        .positions-preview {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .positions-count {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 500;
        }

        .urgent-badge {
          font-size: 0.7rem;
          background: rgba(239, 68, 68, 0.15);
          color: #dc2626;
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          font-weight: 600;
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
          color: #111827;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .position-store {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .position-salary {
          color: #059669;
          font-weight: 600;
          font-size: 0.875rem;
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

        .continue-button:hover {
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .modal-close {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.5rem;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-subtitle {
          color: #6b7280;
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
            padding: 1rem 1rem;
          }
          
          .hero-title {
            font-size: 1.75rem;
            line-height: 1.2;
          }

          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 1.25rem;
          }
          
          .modal-content {
            margin: 0.5rem;
            max-width: none;
          }

          .manual-location-button {
            padding: 1rem;
            gap: 0.5rem;
          }

          .location-tip {
            padding: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .tip-text {
            font-size: 0.8rem;
          }

          .cta-button {
            padding: 1.1rem 1.5rem;
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .cta-button .icon-left {
            width: 1.25rem;
            height: 1.25rem;
          }

          .cta-button .icon-right {
            width: 1.1rem;
            height: 1.1rem;
          }

          .benefits-grid {
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .benefit-card {
            padding: 1rem;
          }

          .benefit-icon {
            width: 2.5rem;
            height: 2.5rem;
          }

          .benefit-title {
            font-size: 0.9rem;
          }

          .benefit-subtitle {
            font-size: 0.8rem;
          }

          .map-container {
            height: 250px;
            margin-bottom: 1.5rem;
          }

          .store-card {
            padding: 1rem;
          }

          .store-name {
            font-size: 1rem;
          }

          .store-address {
            font-size: 0.8rem;
          }

          .positions-count {
            font-size: 0.8rem;
          }

          .urgent-badge {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
          }
        }
      `}</style>
    </div>
  );
  
};

export default MultiCompanyCareerPage;