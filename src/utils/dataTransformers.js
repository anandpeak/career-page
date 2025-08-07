// src/utils/dataTransformers.js - FIXED FOR YOUR API STRUCTURE

export const transformCompanyData = (apiData) => {
  const companyConfig = apiData.companyConfig || {};
  
  return {
    companyId: companyConfig.name || 'company',
    brandName: companyConfig.name || 'Company',
    subdomain: `${companyConfig.name || 'company'}.oneplace.hr`,
    brandColor: '#3b82f6',
    brandGradient: `linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)`,
    logo: companyConfig.name || 'Company',
    photoUrl: companyConfig.photoUrl,
    description: companyConfig.description,
    maxStoreSelection: 1,
    features: {
      hasShiftPreferences: true,
      requiresExperience: false,
      hasUrgentPositions: true,
      allowsMultipleApplications: false
    },
    translations: {
      mn: {
        title: `${companyConfig.name || 'Company'}-д ажиллах`,
        subtitle: 'Ажлын байр нээлттэй',
        findNearby: 'Гэрт ойр ажилд оръё',
        selectStores: 'Салбар сонгоорой',
        selectPosition: 'Ажлын байр сонгох',
        availablePositions: 'Нээлттэй ажлын байрууд',
        apply: 'Ажилд оръё',
        urgent: 'Яаралтай',
        back: 'Буцах'
      },
      en: {
        title: `Work at ${companyConfig.name || 'Company'}`,
        subtitle: 'Open positions available',
        findNearby: 'Find Stores Near Me',
        selectStores: 'Select branch',
        selectPosition: 'Select Position',
        availablePositions: 'Available Positions',
        apply: 'Apply',
        urgent: 'Urgent',
        back: 'Back'
      }
    }
  };
};

export const transformStoreData = (apiBranches) => {
  if (!apiBranches || apiBranches.length === 0) {
    console.log('No branches data to transform');
    return [];
  }

  return apiBranches.map(branch => {
    // Parse coordinates if they exist, otherwise use default Ulaanbaatar center
    let lat = 47.9187;
    let lng = 106.9177;
    
    if (branch.coordinates && branch.coordinates !== null) {
      try {
        const [latStr, lngStr] = branch.coordinates.split(', ');
        lat = parseFloat(latStr);
        lng = parseFloat(lngStr);
      } catch (error) {
        console.warn(`Failed to parse coordinates for branch ${branch.branchId}:`, branch.coordinates);
      }
    }

    // Transform jobs to positions
    const positions = branch.jobs ? branch.jobs.map((job, index) => ({
      id: `pos_${branch.branchId}_${index}`,
      title: job.jobName || 'Position',
      urgent: Math.random() > 0.7, // Random urgent flag since not in API
      salaryRange: job.salary || 'Цалин: Харилцан тохиролцоно',
      description: job.description || '',
      requirements: job.requirements || [],
      benefits: job.benefits || [],
      shiftType: job.shiftType || 'full-time',
      employmentType: job.employmentType || 'permanent',
      experienceRequired: job.experienceRequired || false,
      openingsCount: job.openingsCount || 1
    })) : [];

    return {
      id: branch.branchId,
      name: branch.branchName || `Салбар ${branch.branchId}`,
      lat: lat,
      lng: lng,
      address: branch.branchName || 'Address not provided',
      managerId: `mgr_${branch.branchId}`,
      district: '',
      phone: branch.phone || '',
      openingHours: branch.hours || '09:00-18:00',
      positions: positions
    };
  });
};

// This function is not needed anymore since we get everything in one call
export const transformPositionData = (apiPositions) => {
  return apiPositions.map(position => ({
    id: position.id || position.position_id,
    title: position.title || position.position_title,
    urgent: position.urgent || position.is_urgent || false,
    salaryRange: position.salary_range || position.salary || 'Цалин: Харилцан тохиролцоно',
    description: position.description || '',
    requirements: position.requirements || [],
    benefits: position.benefits || [],
    shiftType: position.shift_type || '',
    employmentType: position.employment_type || 'full-time',
    experienceRequired: position.experience_required || false,
    openingsCount: position.openings_count || 1
  }));
};