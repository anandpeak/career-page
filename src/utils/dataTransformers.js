// src/utils/dataTransformers.js - FINAL FIX

export const transformCompanyData = (apiData) => {
  // Handle both direct company config and nested companyConfig
  const companyConfig = {
    ...(apiData.companyConfig || {}),
    ...(apiData.companyId ? {
      companyId: apiData.companyId,
      name: apiData.name,
      // Note: prefer nested companyConfig description fields over root
      description: (apiData.companyConfig && (apiData.companyConfig.companyDescription || apiData.companyConfig.description)) || apiData.description,
      photoUrl: apiData.photoUrl,
      color: apiData.color,
      country: (apiData.companyConfig && apiData.companyConfig.country) || apiData.country || 'MN',
      // Prefer nested arrays from companyConfig; fall back to root-level arrays
      companyAdvantages: (apiData.companyConfig && apiData.companyConfig.companyAdvantages) || apiData.companyAdvantages || [],
      companyBenefits: (apiData.companyConfig && apiData.companyConfig.companyBenefits) || apiData.companyBenefits || []
    } : {})
  };

  console.log('🏢 Transforming company config:', companyConfig);

  // Get country code
  const country = companyConfig.country || 'MN';

  // Determine translations based on country
  let mnTranslations;
  if (country === 'KZ') {
    // Russian translations for Kazakhstan
    mnTranslations = {
      title: `Работать в ${companyConfig.name || 'Company'}`,
      subtitle: 'Открытые вакансии',
      findNearby: 'Найти ближайшие к дому',
      selectStores: 'Выберите филиал',
      selectPosition: 'Выберите вакансию',
      availablePositions: 'Доступные вакансии',
      apply: 'Подать заявку',
      urgent: 'Срочно',
      back: 'Назад',
      viewJobs: 'Посмотреть вакансии',
      selected: 'Выбрано',
      myLocation: 'Моё местоположение',
      nearbyStores: 'Филиалы рядом с вами',
      yourLocation: 'Ваше местоположение',
      jobsAvailable: 'вакансий',
      selectedJob: 'Выбранная вакансия',
      startInterview: 'Перейти к собеседованию',
      loadingLocation: 'Поиск местоположения...',
      // Error messages
      errorPermissionDenied: '🔒 Требуется разрешение на определение местоположения. Включите геолокацию в настройках браузера.',
      errorPermissionDeniedAndroid: '🤖 Android: требуется разрешение на определение местоположения. Настройки → Приложения → Chrome/Browser → Разрешения → Местоположение → "Разрешить".',
      errorPermissionDeniedSafari: '📱 Safari: требуется разрешение на определение местоположения. Настройки → Safari → Местоположение → "Разрешить".',
      errorPositionUnavailable: '📍 Местоположение не найдено. Проверьте GPS или интернет-соединение и попробуйте снова.',
      errorPositionUnavailableAndroid: '📍 Android: местоположение не найдено. Включите GPS, проверьте интернет и попробуйте снова.',
      errorTimeout: '⏱️ Время ожидания истекло.',
      errorTimeoutAndroid: '⏱️ Android: время ожидания истекло. GPS-сигнал может быть слабым.',
      errorTimeoutSafari: '⏱️ Safari: время ожидания истекло.',
      errorDefault: '❌ Ошибка определения местоположения.'
    };
  } else if (country === 'UZ') {
    // Uzbek translations for Uzbekistan
    mnTranslations = {
      title: `${companyConfig.name || 'Company'}da ishlash`,
      subtitle: 'Ochiq ish o\'rinlari',
      findNearby: 'Uyga yaqin ishga kirish',
      selectStores: 'Filial tanlang',
      selectPosition: 'Ish o\'rnini tanlang',
      availablePositions: 'Ochiq ish o\'rinlari',
      apply: 'Ishga kirish',
      urgent: 'Shoshilinch',
      back: 'Orqaga',
      viewJobs: 'Ish o\'rinlarini ko\'rish',
      selected: 'Tanlangan',
      myLocation: 'Mening joylashuvim',
      nearbyStores: 'Sizga yaqin filiallar',
      yourLocation: 'Sizning joylashuvingiz',
      jobsAvailable: 'ish o\'rni',
      selectedJob: 'Tanlangan ish o\'rni',
      startInterview: 'Suhbatga o\'tish',
      loadingLocation: 'Joylashuv qidirilmoqda...',
      // Error messages
      errorPermissionDenied: '🔒 Joylashuvni aniqlash uchun ruxsat kerak. Brauzer sozlamalaridan joylashuvni yoqing.',
      errorPermissionDeniedAndroid: '🤖 Android: joylashuvni aniqlash uchun ruxsat kerak. Sozlamalar → Ilovalar → Chrome/Browser → Ruxsatlar → Joylashuv → "Ruxsat berish".',
      errorPermissionDeniedSafari: '📱 Safari: joylashuvni aniqlash uchun ruxsat kerak. Sozlamalar → Safari → Joylashuv → "Ruxsat berish".',
      errorPositionUnavailable: '📍 Joylashuv topilmadi. GPS yoki internet aloqasini tekshiring va qaytadan urinib ko\'ring.',
      errorPositionUnavailableAndroid: '📍 Android: joylashuv topilmadi. GPS-ni yoqing, internetni tekshiring va qaytadan urinib ko\'ring.',
      errorTimeout: '⏱️ Kutish vaqti tugadi.',
      errorTimeoutAndroid: '⏱️ Android: kutish vaqti tugadi. GPS signali zaif bo\'lishi mumkin.',
      errorTimeoutSafari: '⏱️ Safari: kutish vaqti tugadi.',
      errorDefault: '❌ Joylashuvni aniqlashda xatolik.'
    };
  } else {
    // Default Mongolian translations
    mnTranslations = {
      title: `${companyConfig.name || 'Company'}-д ажиллах`,
      subtitle: 'Ажлын байр нээлттэй',
      findNearby: 'Гэрт ойр ажилд оръё',
      selectStores: 'Салбар сонгоорой',
      selectPosition: 'Ажлын байр сонгох',
      availablePositions: 'Нээлттэй ажлын байрууд',
      apply: 'Ажилд оръё',
      urgent: 'Яаралтай',
      back: 'Буцах',
      viewJobs: 'Ажлын байр харах',
      selected: 'Сонгогдсон',
      myLocation: 'Миний байршил',
      nearbyStores: 'Таны ойролцоох салбарууд',
      yourLocation: 'Таны байршил',
      jobsAvailable: 'ажлын байр',
      selectedJob: 'Сонгосон ажлын байр',
      startInterview: 'Шууд ярилцлагад орох',
      loadingLocation: 'Байршил хайж байна...',
      // Error messages
      errorPermissionDenied: '🔒 Байршил зөвшөөрөх шаардлагатай. Хөтчийн тохиргооноос байршлыг идэвхжүүлнэ үү.',
      errorPermissionDeniedAndroid: '🤖 Android дээр байршил зөвшөөрөх шаардлагатай. Тохиргоо → Аппликейшн → Chrome/Browser → Зөвшөөрөл → Байршил → "Зөвшөөрөх" гэж сонгоно уу.',
      errorPermissionDeniedSafari: '📱 Safari дээр байршил зөвшөөрөх шаардлагатай. Тохиргоо → Safari → Байршил → "Зөвшөөрөх" гэж сонгоно уу.',
      errorPositionUnavailable: '📍 Байршил олдохгүй байна. GPS эсвэл интернет холболтоо шалгаад дахин оролдоно уу.',
      errorPositionUnavailableAndroid: '📍 Android дээр байршил олдохгүй байна. GPS-ийг идэвхжүүлж, интернет холболтоо шалгаад дахин оролдоно уу.',
      errorTimeout: '⏱️ Байршил хүлээх хугацаа дууссан.',
      errorTimeoutAndroid: '⏱️ Android дээр байршил хүлээх хугацаа дууссан. GPS сигнал сул байж болзошгүй.',
      errorTimeoutSafari: '⏱️ Safari дээр байршил хүлээх хугацаа дууссан.',
      errorDefault: '❌ Байршил тодорхойлоход алдаа гарлаа.'
    };
  }

  return {
    companyId: companyConfig.companyId || 'company',
    brandName: companyConfig.name || 'Company',
    subdomain: `${companyConfig.name || 'company'}.oneplace.hr`,
    brandColor: companyConfig.color || '#3b82f6',
    brandGradient: companyConfig.color
      ? `linear-gradient(135deg, ${companyConfig.color}99 0%, ${companyConfig.color} 100%)`
      : 'linear-gradient(135deg, #0a1929 0%, #1e3a8a 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)',
    logo: companyConfig.name || 'Company',
    photoUrl: companyConfig.photoUrl,
    description: companyConfig.companyDescription || companyConfig.description || '',
    companyAdvantages: companyConfig.companyAdvantages || [],
    companyBenefits: companyConfig.companyBenefits || [],
    country: country,
    maxStoreSelection: 1,
    features: {
      hasShiftPreferences: true,
      requiresExperience: false,
      hasUrgentPositions: true,
      allowsMultipleApplications: false
    },
    translations: {
      mn: mnTranslations,
      en: {
        title: `Work at ${companyConfig.name || 'Company'}`,
        subtitle: 'Open positions available',
        findNearby: 'Find Stores Near Me',
        selectStores: 'Select branch',
        selectPosition: 'Select Position',
        availablePositions: 'Available Positions',
        apply: 'Apply',
        urgent: 'Urgent',
        back: 'Back',
        viewJobs: 'View Jobs',
        selected: 'Selected',
        myLocation: 'My Location',
        nearbyStores: 'Stores Near You',
        yourLocation: 'Your Location',
        jobsAvailable: 'jobs available',
        selectedJob: 'Selected Job',
        startInterview: 'Start Interview',
        loadingLocation: 'Finding your location...'
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
          salaryRange: job.salary ? `₮${parseInt(job.salary).toLocaleString()}` : 'Цалин тохиролцоно',
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
      address: branch.address || branch.branchAddress || branch.location || 'Address not provided',
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