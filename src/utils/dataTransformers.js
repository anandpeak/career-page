// src/utils/dataTransformers.js - FINAL FIX

export const transformCompanyData = (apiData) => {
  const companyConfig = apiData.companyConfig || {};
  
  return {
    companyId: companyConfig.companyId || apiData.companyId || 'company', // ✅ Use actual numeric ID
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
    console.log('❌ No branches data to transform');
    return [];
  }

  console.log('🔄 Transforming branches:', apiBranches.length, 'branches');
  
  const transformedStores = apiBranches.map(branch => {
    console.log(`🏢 Processing branch: ${branch.branchName} (ID: ${branch.branchId})`);
    console.log('📍 Branch data:', branch);
    
    // Parse coordinates if they exist
    let lat = 47.9187; // Default Ulaanbaatar center
    let lng = 106.9177;
    let hasValidCoordinates = false;
    
    if (branch.coordinates && branch.coordinates !== null && branch.coordinates.trim() !== '') {
      try {
        // Handle both string and array formats for coordinates
        let coordParts = [];
        if (Array.isArray(branch.coordinates)) {
          coordParts = branch.coordinates;
        } else {
          coordParts = branch.coordinates.split(',').map(coord => coord.trim());
        }
        
        if (coordParts.length === 2) {
          const parsedLat = parseFloat(coordParts[0]);
          const parsedLng = parseFloat(coordParts[1]);
          
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            lat = parsedLat;
            lng = parsedLng;
            hasValidCoordinates = true;
            console.log(`✅ Valid coordinates found: ${lat}, ${lng}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse coordinates for branch ${branch.branchId}:`, branch.coordinates, error);
      }
    } else {
      console.log(`📍 No coordinates for branch: ${branch.branchName}`);
    }

    // Transform jobs to positions
    const positions = branch.jobs && Array.isArray(branch.jobs) 
      ? branch.jobs.map((job, index) => ({
          id: job.jobId || `pos_${branch.branchId}_${index}`,
          title: job.jobName || 'Position',
          urgent: index === 0, // First job is urgent for demo
          salaryRange: 'Цалин тохиролцоно',
          description: `${job.jobName || 'Ажлын байр'} - дэлгэрэнгүй мэдээлэл`,
          requirements: ['Туршлага шаардагдахгүй', 'Эерэг хандлага', 'Багаар ажиллах чадвар'],
          storeId: branch.branchId,
          positionId: job.jobId,
          branchName: branch.branchName
        }))
      : [];

    const transformedStore = {
      id: branch.branchId,
      name: branch.branchName || `Салбар ${branch.branchId}`,
      lat: lat,
      lng: lng,
      address: branch.branchName || 'Address not provided',
      positions: positions,
      hasValidCoordinates: hasValidCoordinates,
      // Add these for compatibility
      managerId: `mgr_${branch.branchId}`,
      district: hasValidCoordinates ? '' : 'Remote',
      phone: '',
      openingHours: '09:00-18:00'
    };

    console.log(`✅ Transformed store:`, transformedStore.name, `- ${transformedStore.positions.length} positions, coordinates: ${hasValidCoordinates}`);
    return transformedStore;
  });

  console.log(`✅ Transformation complete: ${transformedStores.length} stores total`);
  console.log(`📍 Stores with coordinates: ${transformedStores.filter(s => s.hasValidCoordinates).length}`);
  console.log(`🏢 Store names:`, transformedStores.map(s => s.name));

  return transformedStores;
};

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