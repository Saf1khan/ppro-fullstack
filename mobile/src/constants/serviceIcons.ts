export interface CategoryVisual {
  image: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  tagline: string;
}

export interface TaskVisual {
  image: string;
  badge: string;
  category: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  tagSecondary: string;
  priceNumeric: number;
  priceFormatted: string;
  originalPriceFormatted?: string;
  etaBadge: string;
  estimatedDuration: string;
  slotAvailabilityBadge: string;
  ratingScore: string;
}

export interface TimeSlotOption {
  id: string;
  period: string;
  timeRange: string;
  desc: string;
  icon: string;
}

export interface DateOption {
  id: string;
  dayName: string;
  dateLabel: string;
  badge?: string;
}

export interface ServiceSlot {
  dateId: string;
  dateLabel: string;
  slotId: string;
  timeRange: string;
  period: string;
  specialInstructions?: string;
}

export const DATE_OPTIONS: DateOption[] = [
  { id: 'today', dayName: 'Today', dateLabel: '03 Oct', badge: 'Fastest' },
  { id: 'tomorrow', dayName: 'Tomorrow', dateLabel: '04 Oct', badge: 'Popular' },
  { id: 'day3', dayName: 'Sun', dateLabel: '05 Oct', badge: 'Weekend' },
  { id: 'day4', dayName: 'Mon', dateLabel: '06 Oct' },
  { id: 'day5', dayName: 'Tue', dateLabel: '07 Oct' },
];

export const TIME_SLOT_OPTIONS: TimeSlotOption[] = [
  { id: 'morning', period: 'Morning', timeRange: '09:00 AM - 12:00 PM', desc: 'Optimal for thorough work & deep cleaning', icon: '🌅' },
  { id: 'afternoon', period: 'Afternoon', timeRange: '01:00 PM - 04:00 PM', desc: 'Convenient mid-day servicing', icon: '☀️' },
  { id: 'evening', period: 'Evening', timeRange: '04:00 PM - 07:00 PM', desc: 'After-work / post-office window', icon: '🌇' },
  { id: 'night', period: 'Late Evening', timeRange: '07:00 PM - 09:00 PM', desc: 'Flexible quiet evening coordination', icon: '🌙' },
];

export const DEFAULT_SERVICE_SLOT: ServiceSlot = {
  dateId: 'tomorrow',
  dateLabel: 'Tomorrow (04 Oct)',
  slotId: 'morning',
  timeRange: '09:00 AM - 12:00 PM',
  period: 'Morning',
};

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'deep-cleaning': {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#ECFDF5',
    textColor: '#047857',
    borderColor: '#A7F3D0',
    dotColor: '#10B981',
    tagline: 'Deep Cleaning',
  },
  plumbing: {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#EFF8FF',
    textColor: '#0369A1',
    borderColor: '#BAE6FD',
    dotColor: '#0EA5E9',
    tagline: 'Plumbing & Drainage',
  },
  electrical: {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#FFFBEB',
    textColor: '#B45309',
    borderColor: '#FDE68A',
    dotColor: '#F59E0B',
    tagline: 'Electrical & Wiring',
  },
  appliances: {
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#F5F3FF',
    textColor: '#6D28D9',
    borderColor: '#DDD6FE',
    dotColor: '#8B5CF6',
    tagline: 'Appliance Repair',
  },
};

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  badgeBg: '#ECFDF5',
  textColor: '#047857',
  borderColor: '#A7F3D0',
  dotColor: '#10B981',
  tagline: 'Home Services',
};

export function getCategoryVisual(slugOrName?: string): CategoryVisual {
  if (!slugOrName) return DEFAULT_CATEGORY_VISUAL;
  const key = slugOrName.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_VISUALS)) {
    if (key.includes(k) || v.tagline.toLowerCase().includes(key)) {
      return v;
    }
  }
  return DEFAULT_CATEGORY_VISUAL;
}

export type TaskVisualConfig = Omit<
  TaskVisual,
  'priceNumeric' | 'priceFormatted' | 'etaBadge' | 'estimatedDuration' | 'slotAvailabilityBadge' | 'ratingScore'
>;

export const TASK_VISUALS: Record<string, TaskVisualConfig> = {
  'kitchen deep degreasing & chimney scrub': {
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    badge: 'KITCHEN CARE',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.9 · 60m',
  },
  'bathroom tile, grout & acid wash': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    badge: 'BATHROOM PRO',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.8 · 45m',
  },
  'complete home move-in sanitization': {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    badge: 'FULL RESIDENCE',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 5.0 · Move-In',
  },
  'sofa & upholstery deep shampoo': {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    badge: 'UPHOLSTERY',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.9 · Wet Care',
  },
  'balcony & window mesh pressure wash': {
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    badge: 'BALCONY JET',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.7 · 40m',
  },
  'post-renovation paint & debris scrub': {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badge: 'POST-BUILD',
    category: 'Deep Cleaning',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.9 · Heavy Duty',
  },
  'drain blockage clearing & jetting': {
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    badge: 'DRAIN CLEAR',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 4.9 · Express',
  },
  'tap, mixer & diverter installation/repair': {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    badge: 'BATH FITTING',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 4.8 · 30m',
  },
  'overhead tank cleaning & disinfection': {
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    badge: 'TANK HYGIENE',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 4.9 · Deep Sanitized',
  },
  'concealed pipe leakage detection': {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    badge: 'LEAK SCAN',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 5.0 · Acoustic Scan',
  },
  'commode & flush cistern overhaul': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    badge: 'CISTERN CARE',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 4.8 · Leak-Free',
  },
  'water purifier inlet & filter line setup': {
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    badge: 'RO INLET',
    category: 'Plumbing',
    accentBg: '#EFF8FF',
    borderColor: '#BAE6FD',
    textColor: '#0369A1',
    dotColor: '#0EA5E9',
    tagSecondary: '★ 4.9 · Food Grade',
  },
  'ceiling fan & exhaust installation': {
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    badge: 'FAN & AIR',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 4.8 · Calibrated',
  },
  'distribution board (db) & mcb tripping fix': {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
    badge: 'POWER DB',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 5.0 · Emergency Fix',
  },
  'led chandelier & ambient light setup': {
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80',
    badge: 'AMBIENT LED',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 4.9 · Designer Mount',
  },
  'smart switch & home automation fitting': {
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
    badge: 'SMART HOME',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 4.9 · Wi-Fi Relay',
  },
  'inverter wiring & battery line setup': {
    image: 'https://images.unsplash.com/photo-1558441719-743452445173?auto=format&fit=crop&w=400&q=80',
    badge: 'POWER BACKUP',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 4.9 · Heavy Gauge',
  },
  'ac power socket & heavy load rewiring': {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    badge: '16A SOCKET',
    category: 'Electrical',
    accentBg: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#B45309',
    dotColor: '#F59E0B',
    tagSecondary: '★ 4.8 · Fire Proof',
  },
  'split ac deep foam jet cleaning': {
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=400&q=80',
    badge: 'AC FOAM JET',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 4.9 · 2X Cooling',
  },
  'microwave & oven magnetron inspection': {
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80',
    badge: 'OVEN CARE',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 4.8 · Safety Check',
  },
  'semi/front-load washing machine spin fix': {
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
    badge: 'WASHER DRUM',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 4.9 · Balance Tune',
  },
  'refrigerator gas top-up & coil de-icing': {
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    badge: 'FRIDGE COIL',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 4.8 · Pure Gas',
  },
  'ro water purifier membrane & sediment change': {
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
    badge: 'MEMBRANE SWAP',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 5.0 · TDS Tuning',
  },
  'geyser coil descaling & thermostat replacement': {
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80',
    badge: 'GEYSER COIL',
    category: 'Appliances',
    accentBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    textColor: '#6D28D9',
    dotColor: '#8B5CF6',
    tagSecondary: '★ 4.9 · Scale Flush',
  },
};

export function getTaskVisual(taskName: string): TaskVisual {
  const normalized = taskName.trim().toLowerCase();
  let base: Partial<TaskVisual> = TASK_VISUALS[normalized];

  if (!base) {
    for (const [key, visual] of Object.entries(TASK_VISUALS)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        base = visual;
        break;
      }
    }
  }

  if (!base) {
    base = {
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      badge: 'VERIFIED PRO',
      category: 'General',
      accentBg: '#ECFDF5',
      borderColor: '#A7F3D0',
      textColor: '#047857',
      dotColor: '#10B981',
      tagSecondary: '★ 4.9 · 30m',
    };
  }

  // Derive deterministic realistic pricing and duration based on service requirements
  let price = 499;
  let original = 749;
  let duration = '⏱️ 45-60m';
  let estimated = '45-60 mins on-site execution';
  let rating = '4.9';

  const cat = (base.category || '').toLowerCase();
  const name = normalized;

  if (cat.includes('clean') || name.includes('clean') || name.includes('move-in') || name.includes('degreas')) {
    if (name.includes('move-in') || name.includes('renovation')) {
      price = 1499;
      original = 1999;
      duration = '⏱️ 3 - 4 hrs';
      estimated = '3 - 4 hours comprehensive deep scrubbing';
      rating = '5.0';
    } else if (name.includes('chimney') || name.includes('kitchen')) {
      price = 599;
      original = 899;
      duration = '⏱️ 60-90m';
      estimated = '60-90 mins intensive degreasing';
      rating = '4.9';
    } else {
      price = 449;
      original = 699;
      duration = '⏱️ 45-60m';
      estimated = '45-60 mins thorough scrub';
      rating = '4.8';
    }
  } else if (cat.includes('plumb') || name.includes('drain') || name.includes('pipe') || name.includes('tap')) {
    if (name.includes('acoustic') || name.includes('tank')) {
      price = 649;
      original = 949;
      duration = '⏱️ 60-90m';
      estimated = '60-90 mins precision acoustic diagnostic';
      rating = '4.9';
    } else {
      price = 299;
      original = 499;
      duration = '⏱️ 30-45m';
      estimated = '30-45 mins leak repair';
      rating = '4.8';
    }
  } else if (cat.includes('elect') || name.includes('fan') || name.includes('switch') || name.includes('light')) {
    if (name.includes('inverter') || name.includes('chandelier') || name.includes('breaker')) {
      price = 549;
      original = 799;
      duration = '⏱️ 60-90m';
      estimated = '60-90 mins calibrated heavy wiring';
      rating = '5.0';
    } else {
      price = 249;
      original = 399;
      duration = '⏱️ 30-45m';
      estimated = '30-45 mins diagnostic & fixture fit';
      rating = '4.9';
    }
  } else if (cat.includes('appliance') || name.includes('ac') || name.includes('geyser') || name.includes('ro')) {
    if (name.includes('ac') || name.includes('magnetron')) {
      price = 699;
      original = 999;
      duration = '⏱️ 60-90m';
      estimated = '60-90 mins pressure testing & gas tuning';
      rating = '4.9';
    } else {
      price = 499;
      original = 749;
      duration = '⏱️ 45-60m';
      estimated = '45-60 mins multi-point check';
      rating = '4.8';
    }
  }

  return {
    image: base.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badge: base.badge || 'VERIFIED PRO',
    category: base.category || 'Home Services',
    accentBg: base.accentBg || '#ECFDF5',
    borderColor: base.borderColor || '#A7F3D0',
    textColor: base.textColor || '#047857',
    dotColor: base.dotColor || '#10B981',
    tagSecondary: base.tagSecondary || '★ 4.9 · Verified',
    priceNumeric: price,
    priceFormatted: `₹${price}`,
    originalPriceFormatted: `₹${original}`,
    etaBadge: duration,
    estimatedDuration: estimated,
    slotAvailabilityBadge: '📅 Select Slot',
    ratingScore: rating,
  };
}

export function getTaskHighlights(taskName: string): string[] {
  const name = taskName.toLowerCase();
  if (name.includes('chimney') || name.includes('kitchen') || name.includes('degreas')) {
    return [
      'Chemical degreasing of chimney baffle filters & stainless mesh',
      'Intense scrub of stovetop, burner plates & backsplash tiles',
      'Degreasing of cabinet exterior surfaces & exhaust duct',
      'Food-safe sanitization of countertops & stainless steel sink',
    ];
  }
  if (name.includes('bathroom') || name.includes('tile') || name.includes('acid wash')) {
    return [
      'Acid-safe descaling of wall tiles, grout lines & floor hard-water marks',
      'Scale removal from shower head, taps & chrome fixtures',
      'Deep chemical scrubbing of toilet bowl, commode & cistern',
      'Mirror cleaning & anti-bacterial fogging sanitization',
    ];
  }
  if (name.includes('move-in') || name.includes('residence') || name.includes('sanitization')) {
    return [
      'End-to-end vacuuming, wet-scrubbing & cobweb extraction across all rooms',
      'Interior & exterior wiping of all cupboards, shelves & wardrobes',
      'Window tracks, balcony glass & sliding door deep wash',
      'Hospital-grade multi-surface sanitization & floor buffing',
    ];
  }
  if (name.includes('sofa') || name.includes('upholstery') || name.includes('shampoo')) {
    return [
      'Dry vacuuming to extract deep dust mites, pet hair & allergens',
      'Fabric-safe shampoo foam injection to dissolve deep sweat/oil stains',
      'High-pressure moisture extraction for fast drying under 3 hours',
      'Aromatherapy anti-microbial fabric deodorization spray',
    ];
  }
  if (name.includes('drain') || name.includes('jetting') || name.includes('block')) {
    return [
      'High-pressure motorized drain snake & jetting for deep clogs',
      'Dissolution of trapped grease, hair & solid sediment without pipe damage',
      'P-trap cleaning & chemical pipe disinfection',
      'Drain flow test with 50-litre pressure flush verification',
    ];
  }
  if (name.includes('tank') || name.includes('disinfection') || name.includes('overhead')) {
    return [
      'Full drainage & high-pressure rotary mechanized scrubbing',
      'Sludge suction extraction from floor & corners of tank',
      'Anti-bacterial potassium permanganate/UV disinfection treatment',
      'Float valve inspection & pipe inlet filter cleaning',
    ];
  }
  if (name.includes('leak') || name.includes('acoustic') || name.includes('pipe')) {
    return [
      'Acoustic sensor ultrasound leak detection behind walls & tiles',
      'Thermal imaging inspection for hidden moisture & seepage points',
      'Zero-demolition pinhole leak pinpointing',
      'Comprehensive leak diagnostic report with exact repair roadmap',
    ];
  }
  if (name.includes('tap') || name.includes('mixer') || name.includes('faucet')) {
    return [
      'Cartridge & spindle disassembly, descaling & Teflon repacking',
      'O-ring & rubber gasket replacement to eliminate persistent dripping',
      'Pressure testing for hot & cold mixer balance',
      'Chrome polish & aerator descaling for smooth water flow',
    ];
  }
  if (name.includes('fan') || name.includes('ceiling') || name.includes('calibration')) {
    return [
      'Blade pitch & dynamic wobble angle calibration with gauge',
      'Motor bearing lubrication & capacitor capacitance testing',
      'Downrod safety bolt & cotter pin security inspection',
      'Silent speed control & noise reduction tuning',
    ];
  }
  if (name.includes('mcb') || name.includes('breaker') || name.includes('tripping') || name.includes('wiring')) {
    return [
      'Digital insulation resistance & earth-leakage current testing',
      'Phase load balancing across MCBs to prevent breaker overheating',
      'Terminal screw tightening to eliminate arching and spark hazard',
      'Earthing loop impedance measurement & safety sign-off',
    ];
  }
  if (name.includes('chandelier') || name.includes('led') || name.includes('fixture')) {
    return [
      'Heavy ceiling anchor load calculation & safety hook installation',
      'Driver voltage stabilization & individual crystal prism assembly',
      'Multi-switch dimming or remote receiver configuration',
      'Safety drop-test verification before electrical power-up',
    ];
  }
  if (name.includes('switch') || name.includes('smart') || name.includes('automation')) {
    return [
      'Retrofit Wi-Fi smart switch module installation behind switchboard',
      'Neutral wire routing & surge protection connection',
      'Mobile app pairing, scene configuration & voice assistant linking',
      'Physical switch dual-mode override testing',
    ];
  }
  if (name.includes('ac') || name.includes('foam') || name.includes('air conditioner')) {
    return [
      'High-pressure indoor cooling coil foam jetting with drain tray wash',
      'Blower fan wheel scrub to eliminate mold spores & foul smell',
      'Outdoor condenser fin pressure wash & gas pressure check',
      'Temperature differential test at vent for optimal 18°C cooling',
    ];
  }
  if (name.includes('ro') || name.includes('purifier') || name.includes('filter')) {
    return [
      'Multi-stage pre-sediment, activated carbon & post-carbon filter replacement',
      'RO membrane flow rate & salt rejection efficiency test',
      'Booster pump pressure & auto-cut-off solenoid valve test',
      'Digital TDS meter calibration before and after filtration',
    ];
  }
  if (name.includes('geyser') || name.includes('heater') || name.includes('coil')) {
    return [
      'Tank drainage and magnesium sacrificial anode replacement',
      'Heavy mineral limescale removal from copper/incoloy heating coil',
      'Thermostat safety cutout calibration to prevent overheating',
      'Pressure relief valve & tank sealing gasket inspection',
    ];
  }
  if (name.includes('microwave') || name.includes('magnetron')) {
    return [
      'High-voltage capacitor discharge & magnetron emission test',
      'Door interlock switch safety test & radiation leakage measurement',
      'Turntable motor & waveguide mica sheet replacement if burned',
      'Thermal cutout & cooling fan performance verification',
    ];
  }
  if (name.includes('washing machine') || name.includes('spin')) {
    return [
      'Drain pump disassembly & foreign object (coin/pin) extraction',
      'Motor drive belt tensioning & suspension spring balance check',
      'Spin tub bearing noise diagnostic & clutch test',
      'Drum descaling cycle & water inlet solenoid check',
    ];
  }
  if (name.includes('refrigerator') || name.includes('fridge') || name.includes('ice')) {
    return [
      'Evaporator defrost heater & bi-metal thermostat continuity test',
      'Drain line defrost unclogging to prevent water pooling in crisper',
      'Condenser coil cleaning & compressor starting relay check',
      'Door magnetic gasket seal test with vacuum paper check',
    ];
  }
  return [
    'Certified technician dispatch with specialized professional tools',
    'Thorough multi-point inspection before starting work',
    'Execution adhering to PadosiPro quality and safety standards',
    'Post-service testing, cleanup and 30-day warranty sign-off',
  ];
}
