export interface CategoryVisual {
  icon: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  tagline: string;
}

export interface TaskVisual {
  icon: string;
  badge: string;
  accentBg: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'deep-cleaning': {
    icon: '✨',
    badgeBg: '#E8F8F2',
    textColor: '#155C49',
    borderColor: '#C6EADE',
    tagline: 'Deep Cleaning & Sanitization',
  },
  plumbing: {
    icon: '🚰',
    badgeBg: '#EBF5FF',
    textColor: '#026AA2',
    borderColor: '#BAE6FD',
    tagline: 'Plumbing & Drainage',
  },
  electrical: {
    icon: '⚡',
    badgeBg: '#FEF6EE',
    textColor: '#B54708',
    borderColor: '#FECDCA',
    tagline: 'Electrical & Wiring',
  },
  appliances: {
    icon: '❄️',
    badgeBg: '#F4F3FF',
    textColor: '#5925DC',
    borderColor: '#D9D6FE',
    tagline: 'Appliance Care & Repair',
  },
};

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  icon: '🛠️',
  badgeBg: '#E8F2EE',
  textColor: '#155C49',
  borderColor: '#C6EADE',
  tagline: 'Professional Service',
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
  'kitchen deep degreasing & chimney scrub': { icon: '🍳', badge: 'Kitchen', accentBg: '#FEF3F2' },
  'bathroom tile, grout & acid wash': { icon: '🚿', badge: 'Bathroom', accentBg: '#E0F2FE' },
  'complete home move-in sanitization': { icon: '🏡', badge: 'Full Home', accentBg: '#E8F8F2' },
  'sofa & upholstery deep shampoo': { icon: '🛋️', badge: 'Upholstery', accentBg: '#FEF6EE' },
  'balcony & window mesh pressure wash': { icon: '🪟', badge: 'Balcony', accentBg: '#F0FDF4' },
  'post-renovation paint & debris scrub': { icon: '🎨', badge: 'Post-Build', accentBg: '#FFFBEB' },
  'drain blockage clearing & jetting': { icon: '🌊', badge: 'Unclog', accentBg: '#E0F2FE' },
  'tap, mixer & diverter installation/repair': { icon: '🚰', badge: 'Fitting', accentBg: '#EBF5FF' },
  'overhead tank cleaning & disinfection': { icon: '💧', badge: 'Tank Wash', accentBg: '#EFF8FF' },
  'concealed pipe leakage detection': { icon: '🔍', badge: 'Leak Scan', accentBg: '#F4F3FF' },
  'commode & flush cistern overhaul': { icon: '🚽', badge: 'Flush Care', accentBg: '#F0F9FF' },
  'water purifier inlet & filter line setup': { icon: '🥛', badge: 'RO Inlet', accentBg: '#E8F8F2' },
  'ceiling fan & exhaust installation': { icon: '💨', badge: 'Fan Fitting', accentBg: '#FEF6EE' },
  'distribution board (db) & mcb tripping fix': { icon: '⚡', badge: 'DB / MCB', accentBg: '#FEF3F2' },
  'led chandelier & ambient light setup': { icon: '💡', badge: 'LED Lights', accentBg: '#FEF8E7' },
  'smart switch & home automation fitting': { icon: '📱', badge: 'Smart Home', accentBg: '#F4F3FF' },
  'inverter wiring & battery line setup': { icon: '🔋', badge: 'Inverter', accentBg: '#ECFDF3' },
  'ac power socket & heavy load rewiring': { icon: '🔌', badge: 'Power Line', accentBg: '#FEF6EE' },
  'split ac deep foam jet cleaning': { icon: '❄️', badge: 'AC Foam', accentBg: '#E0F2FE' },
  'microwave & oven magnetron inspection': { icon: '♨️', badge: 'Microwave', accentBg: '#FEF3F2' },
  'semi/front-load washing machine spin fix': { icon: '🧺', badge: 'Washer', accentBg: '#EBF5FF' },
  'refrigerator gas top-up & coil de-icing': { icon: '🧊', badge: 'Fridge', accentBg: '#E0F2FE' },
  'ro water purifier membrane & sediment change': { icon: '🧪', badge: 'RO Service', accentBg: '#ECFDF3' },
  'geyser coil descaling & thermostat replacement': { icon: '🔥', badge: 'Geyser', accentBg: '#FEF6EE' },
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
  return { icon: '🛠️', badge: 'Service', accentBg: '#F8F9FA' };
}
