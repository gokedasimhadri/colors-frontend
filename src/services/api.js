// API service for Colours 2027 events

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3012';

// Standard preferred ordering matching the fest structure
export const CATEGORY_ORDER = ['Sports & Games', 'Culturals', 'Creo'];

export const SUBCATEGORY_ORDER = {
  'Sports & Games': [
    'Basketball',
    'Shuttle Badminton Singles',
    'Relay',
    'Football',
    'TenniKoit',
    'Volleyball',
    'Kabaddi',
    'ThrowBall',
    'Chess',
    'Running',
    'Jumping & Throwing',
    'Kho Kho',
    'Table Tennis Singles'
  ],
  'Culturals': [
    'Mime',
    'Stand-up Comedy',
    'Skit',
    'Dance',
    'Singing',
    'Mono Action',
    'Instrumental',
    'Mimicry'
  ],
  'Creo': [
    'Spot Painting',
    'Fashion Show',
    'Treasure Hunt',
    'Mehandi',
    'Movie Making',
    'Spot Photography',
    'Sahityam',
    'Dumb Charades',
    'Rangoli'
  ]
};

// Curated high-resolution, professional university festival photography
export const PROFESSIONAL_EVENT_IMAGES = {
  // Sports & Games
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
  'Shuttle Badminton Singles': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
  'Relay': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop',
  'Football': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
  'TenniKoit': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop',
  'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=800&auto=format&fit=crop',
  'Kabaddi': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop',
  'ThrowBall': 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop',
  'Chess': 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800&auto=format&fit=crop',
  'Running': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
  'Jumping & Throwing': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=800&auto=format&fit=crop',
  'Kho Kho': 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop',
  'Table Tennis Singles': 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop',

  // Culturals
  'Mime': 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop',
  'Stand-up Comedy': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
  'Skit': 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800&auto=format&fit=crop',
  'Dance': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
  'Singing': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop',
  'Mono Action': 'https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=800&auto=format&fit=crop',
  'Instrumental': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
  'Mimicry': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',

  // Creo
  'Spot Painting': 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop',
  'Fashion Show': 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
  'Treasure Hunt': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop',
  'Mehandi': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
  'Movie Making': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
  'Spot Photography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  'Sahityam': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop',
  'Dumb Charades': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop',
  'Rangoli': 'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?q=80&w=800&auto=format&fit=crop',
};

/**
 * Fetch all categories with their subcategories
 */
export async function fetchCategoriesWithSubCategories() {
  try {
    let res;
    try {
      res = await fetch('/api/get-eventCatagory-with-subCatagory');
      if (!res.ok) throw new Error('Proxy failed');
    } catch {
      res = await fetch(`${API_BASE}/api/get-eventCatagory-with-subCatagory`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`);
    }

    const data = await res.json();
    return sortCategoriesAndSubCategories(data);
  } catch (err) {
    console.error('Error fetching categories with subcategories:', err);
    throw err;
  }
}

/**
 * Sort categories and their subcategories to ensure consistent, elegant display
 */
function sortCategoriesAndSubCategories(categories) {
  if (!Array.isArray(categories)) return [];

  // Sort categories according to CATEGORY_ORDER
  const sorted = [...categories].sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a._id);
    const idxB = CATEGORY_ORDER.indexOf(b._id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a._id.localeCompare(b._id);
  });

  // Sort subcategories inside each category
  return sorted.map((cat) => {
    const preferredOrder = SUBCATEGORY_ORDER[cat._id] || [];
    const items = Array.isArray(cat.data) ? [...cat.data] : [];

    items.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a.SubCatogory);
      const idxB = preferredOrder.indexOf(b.SubCatogory);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.SubCatogory.localeCompare(b.SubCatogory);
    });

    return {
      ...cat,
      data: items
    };
  });
}

/**
 * Fetch events within a subcategory (e.g. Instrumental -> Instrumental Solo, Instrumental Group)
 */
export async function fetchEventsInSubCategory(category, subCategory) {
  try {
    const encCat = encodeURIComponent(category);
    const encSub = encodeURIComponent(subCategory);

    let res;
    try {
      res = await fetch(`/api/get-events-in-subcatogary/${encCat}/${encSub}`);
      if (!res.ok) throw new Error('Proxy failed');
    } catch {
      res = await fetch(`${API_BASE}/api/get-events-in-subcatogary/${encCat}/${encSub}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch events in ${subCategory}: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching events for ${category} / ${subCategory}:`, err);
    throw err;
  }
}

/**
 * Fetch detailed event information (rules, venue, price, overview)
 */
export async function fetchEventDetails(category, subCategory, eventName) {
  try {
    const encCat = encodeURIComponent(category);
    const encSub = encodeURIComponent(subCategory);
    const encName = encodeURIComponent(eventName);

    let res;
    try {
      res = await fetch(`/api/get-events-info/${encCat}/${encSub}/${encName}`);
      if (!res.ok) throw new Error('Proxy failed');
    } catch {
      res = await fetch(`${API_BASE}/api/get-events-info/${encCat}/${encSub}/${encName}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch event details for ${eventName}: ${res.status}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    console.error(`Error fetching event details for ${eventName}:`, err);
    throw err;
  }
}

/**
 * Fetch faculty coordinators for an event
 */
export async function fetchFacultyCoordinators(category, subCategory, eventName) {
  try {
    const encCat = encodeURIComponent(category);
    const encSub = encodeURIComponent(subCategory);
    const encName = encodeURIComponent(eventName);

    let res;
    try {
      res = await fetch(`/api/get-faculty-cordinate-by-event/${encCat}/${encSub}/${encName}`);
      if (!res.ok) throw new Error('Proxy failed');
    } catch {
      res = await fetch(`${API_BASE}/api/get-faculty-cordinate-by-event/${encCat}/${encSub}/${encName}`);
    }

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching faculty coordinators:', err);
    return [];
  }
}

/**
 * Fetch student coordinators for an event
 */
export async function fetchStudentCoordinators(category, subCategory, eventName) {
  try {
    const encCat = encodeURIComponent(category);
    const encSub = encodeURIComponent(subCategory);
    const encName = encodeURIComponent(eventName);

    let res;
    try {
      res = await fetch(`/api/get-student-cordinate-by-event/${encCat}/${encSub}/${encName}`);
      if (!res.ok) throw new Error('Proxy failed');
    } catch {
      res = await fetch(`${API_BASE}/api/get-student-cordinate-by-event/${encCat}/${encSub}/${encName}`);
    }

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching student coordinators:', err);
    return [];
  }
}

/**
 * Resolve image path with curated high-resolution photography and local fallbacks
 */
export function getSubCatImageUrl(imageName, subCategoryTitle = '') {
  if (subCategoryTitle && PROFESSIONAL_EVENT_IMAGES[subCategoryTitle]) {
    return PROFESSIONAL_EVENT_IMAGES[subCategoryTitle];
  }
  if (!imageName) return '/img/party_mode.jpg';
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
  return `/eventSubCat_Images/${imageName}`;
}

export function getLocalFallbackSubCatImageUrl(imageName) {
  if (!imageName) return '/hero_bg.png';
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
  return `/eventSubCat_Images/${imageName}`;
}

export function getEventImageUrl(imageName, eventName = '') {
  if (eventName && PROFESSIONAL_EVENT_IMAGES[eventName]) {
    return PROFESSIONAL_EVENT_IMAGES[eventName];
  }
  if (!imageName) return '/img/party_mode.jpg';
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
  return `/event_images/${imageName}`;
}

export function getFacultyImageUrl(imageName, index = 0) {
  if (!imageName) return `/img/person/${(index % 8) + 1}.jpg`;
  if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
  return `/Faculty_Images/${imageName}`;
}
