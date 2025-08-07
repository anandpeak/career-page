// src/hooks/useCompanyData.js
import { useState, useEffect } from 'react';
import { CareerPageAPI } from '../services/api';
import { transformCompanyData, transformStoreData, transformPositionData } from '../utils/dataTransformers';

export const useCompanyData = () => {
  const [api] = useState(() => new CareerPageAPI());
  const [companyConfig, setCompanyConfig] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get company subdomain from URL
  const getSubdomainFromUrl = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '1place'; // Default for testing
    }
    
    // Extract subdomain (assuming format: subdomain.oneplace.hr)
    if (parts.length >= 3) {
      return parts[0];
    }
    
    return '1place'; // Default fallback
  };

  // Load company data
  const loadCompanyData = async (suburl = null) => {
    const targetSuburl = suburl || getSubdomainFromUrl();
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch company data
      const companyData = await api.getCompanyBySuburl(targetSuburl);
      const transformedCompanyConfig = transformCompanyData(companyData);
      setCompanyConfig(transformedCompanyConfig);

      // Fetch stores for this company
      const storesData = await api.getCompanyStores(transformedCompanyConfig.companyId);
      const transformedStores = transformStoreData(storesData);
      
      // Fetch positions for each store
      const storesWithPositions = await Promise.all(
        transformedStores.map(async (store) => {
          try {
            const positionsData = await api.getStorePositions(store.id);
            const transformedPositions = transformPositionData(positionsData);
            return { ...store, positions: transformedPositions };
          } catch (error) {
            console.warn(`Failed to load positions for store ${store.id}:`, error);
            return { ...store, positions: [] };
          }
        })
      );
      
      setStores(storesWithPositions);
      
    } catch (error) {
      setError(error.message);
      console.error('Failed to load company data:', error);
      
      // Fallback to mock data if API fails
      setCompanyConfig(getFallbackCompanyConfig(targetSuburl));
      setStores(getFallbackStores());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data in case API fails
  const getFallbackCompanyConfig = (suburl) => {
    return {
      companyId: suburl,
      brandName: suburl.toUpperCase(),
      subdomain: `${suburl}.oneplace.hr`,
      brandColor: '#3b82f6',
      brandGradient: 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)',
      logo: suburl.toUpperCase(),
      maxStoreSelection: 1,
      features: {
        hasShiftPreferences: true,
        requiresExperience: false,
        hasUrgentPositions: true
      },
      translations: {
        mn: {
          title: `${suburl.toUpperCase()}-д ажиллах`,
          subtitle: 'Ажлын байр нээлттэй',
          findNearby: 'Гэрт ойр ажилд оръё',
          selectStores: 'Ажлын байр сонгоорой',
          selectPosition: 'Ажлын байр сонгох',
          availablePositions: 'Нээлттэй ажлын байрууд',
          apply: 'Ажилд оръё',
          urgent: 'Яаралтай',
          back: 'Буцах'
        },
        en: {
          title: `Work at ${suburl.toUpperCase()}`,
          subtitle: 'Open positions available',
          findNearby: 'Find Stores Near Me',
          selectStores: 'Select positions',
          selectPosition: 'Select Position',
          availablePositions: 'Available Positions',
          apply: 'Apply',
          urgent: 'Urgent',
          back: 'Back'
        }
      }
    };
  };

  const getFallbackStores = () => {
    return [
      {
        id: 1,
        name: 'Store Central',
        lat: 47.9187,
        lng: 106.9177,
        address: 'Central Location',
        positions: [
          { id: 'pos1', title: 'Sales Associate', urgent: false, salaryRange: '₮1.8M-2.2M' }
        ]
      }
    ];
  };

  // Initialize on mount
  useEffect(() => {
    loadCompanyData();
  }, []);

  return {
    companyConfig,
    stores,
    loading,
    error,
    reloadCompanyData: loadCompanyData,
    api
  };
};