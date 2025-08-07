// src/services/api.js - UPDATED FOR YOUR API STRUCTURE

export class CareerPageAPI {
  constructor() {
    this.baseURL = 'https://oneplace-hr-326159028339.asia-southeast1.run.app/v1';
    this.cache = new Map();
  }

  // Get ALL company data (company info + branches + jobs) in one call
  async getCompanyBySuburl(suburl) {
    const cacheKey = `company_${suburl}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseURL}/company/by-suburl/${suburl}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch company data: ${response.statusText}`);
      }
      
      const companyData = await response.json();
      
      // Cache the result for 5 minutes
      this.cache.set(cacheKey, companyData);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return companyData;
    } catch (error) {
      console.error('Error fetching company data:', error);
      throw error;
    }
  }

  // These methods are no longer needed since we get everything in one call
  // But keeping them for compatibility
  async getCompanyStores(companyId) {
    // This is handled by getCompanyBySuburl now
    console.warn('getCompanyStores called but data comes from getCompanyBySuburl');
    return [];
  }

  async getStorePositions(storeId) {
    // This is handled by getCompanyBySuburl now
    console.warn('getStorePositions called but data comes from getCompanyBySuburl');
    return [];
  }

  // Submit job application
  async submitApplication(applicationData) {
    try {
      const response = await fetch(`${this.baseURL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}