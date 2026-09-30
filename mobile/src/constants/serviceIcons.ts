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
}

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

export const TASK_VISUALS: Record<string, TaskVisual> = {
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
  if (TASK_VISUALS[normalized]) {
    return TASK_VISUALS[normalized];
  }
  for (const [key, visual] of Object.entries(TASK_VISUALS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return visual;
    }
  }
  return {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badge: 'VERIFIED PRO',
    category: 'General',
    accentBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#047857',
    dotColor: '#10B981',
    tagSecondary: '★ 4.9 · Verified',
  };
}
