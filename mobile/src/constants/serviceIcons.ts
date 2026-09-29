export interface CategoryVisual {
  image: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  tagline: string;
}

export interface TaskVisual {
  image: string;
  badge: string;
  category: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'deep-cleaning': {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#E8F8F2',
    textColor: '#155C49',
    borderColor: '#C6EADE',
    tagline: 'Deep Cleaning',
  },
  plumbing: {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#EBF5FF',
    textColor: '#026AA2',
    borderColor: '#BAE6FD',
    tagline: 'Plumbing & Drainage',
  },
  electrical: {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#FEF6EE',
    textColor: '#B54708',
    borderColor: '#FECDCA',
    tagline: 'Electrical & Wiring',
  },
  appliances: {
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=400&q=80',
    badgeBg: '#F4F3FF',
    textColor: '#5925DC',
    borderColor: '#D9D6FE',
    tagline: 'Appliance Repair',
  },
};

const DEFAULT_CATEGORY_VISUAL: CategoryVisual = {
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  badgeBg: '#E8F2EE',
  textColor: '#155C49',
  borderColor: '#C6EADE',
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
    badge: 'KITCHEN',
    category: 'Deep Cleaning',
  },
  'bathroom tile, grout & acid wash': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    badge: 'BATHROOM',
    category: 'Deep Cleaning',
  },
  'complete home move-in sanitization': {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    badge: 'FULL HOME',
    category: 'Deep Cleaning',
  },
  'sofa & upholstery deep shampoo': {
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    badge: 'UPHOLSTERY',
    category: 'Deep Cleaning',
  },
  'balcony & window mesh pressure wash': {
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    badge: 'BALCONY',
    category: 'Deep Cleaning',
  },
  'post-renovation paint & debris scrub': {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    badge: 'POST-BUILD',
    category: 'Deep Cleaning',
  },
  'drain blockage clearing & jetting': {
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    badge: 'DRAINAGE',
    category: 'Plumbing',
  },
  'tap, mixer & diverter installation/repair': {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    badge: 'FITTING',
    category: 'Plumbing',
  },
  'overhead tank cleaning & disinfection': {
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=400&q=80',
    badge: 'TANK CARE',
    category: 'Plumbing',
  },
  'concealed pipe leakage detection': {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    badge: 'LEAK SCAN',
    category: 'Plumbing',
  },
  'commode & flush cistern overhaul': {
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    badge: 'CISTERN',
    category: 'Plumbing',
  },
  'water purifier inlet & filter line setup': {
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    badge: 'PURIFIER',
    category: 'Plumbing',
  },
  'ceiling fan & exhaust installation': {
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    badge: 'FAN & AIR',
    category: 'Electrical',
  },
  'distribution board (db) & mcb tripping fix': {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
    badge: 'CIRCUIT DB',
    category: 'Electrical',
  },
  'led chandelier & ambient light setup': {
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80',
    badge: 'LIGHTING',
    category: 'Electrical',
  },
  'smart switch & home automation fitting': {
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
    badge: 'AUTOMATION',
    category: 'Electrical',
  },
  'inverter wiring & battery line setup': {
    image: 'https://images.unsplash.com/photo-1558441719-743452445173?auto=format&fit=crop&w=400&q=80',
    badge: 'POWER BACKUP',
    category: 'Electrical',
  },
  'ac power socket & heavy load rewiring': {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    badge: 'HEAVY LOAD',
    category: 'Electrical',
  },
  'split ac deep foam jet cleaning': {
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=400&q=80',
    badge: 'AC FOAM',
    category: 'Appliances',
  },
  'microwave & oven magnetron inspection': {
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=400&q=80',
    badge: 'MICROWAVE',
    category: 'Appliances',
  },
  'semi/front-load washing machine spin fix': {
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80',
    badge: 'WASHER',
    category: 'Appliances',
  },
  'refrigerator gas top-up & coil de-icing': {
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    badge: 'FRIDGE',
    category: 'Appliances',
  },
  'ro water purifier membrane & sediment change': {
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80',
    badge: 'RO FILTER',
    category: 'Appliances',
  },
  'geyser coil descaling & thermostat replacement': {
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80',
    badge: 'GEYSER',
    category: 'Appliances',
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
    badge: 'SERVICE',
    category: 'General',
  };
}
