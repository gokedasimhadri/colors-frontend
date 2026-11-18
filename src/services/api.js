// API service for Colours 2027 events
// Dynamically fetches event types, categories, subcategories, and events

export const EVENT_TYPE =
  (typeof import.meta !== 'undefined' && (import.meta.env?.EVENT_TYPE || import.meta.env?.VITE_EVENT_TYPE)) ||
  (typeof process !== 'undefined' && (process.env?.EVENT_TYPE || process.env?.VITE_EVENT_TYPE)) ||
  'COLORS';

export const EVENT_YEAR = (
  (typeof import.meta !== 'undefined' && (import.meta.env?.EVENT_YEAR || import.meta.env?.VITE_EVENT_YEAR)) ||
  (typeof process !== 'undefined' && (process.env?.EVENT_YEAR || process.env?.VITE_EVENT_YEAR)) ||
  '2k27'
).toString().trim();

/**
 * Resolve Fest Code from EVENT_TYPE:
 * - COLORS / COLOURS -> CLR
 * - VEDA -> VEDA
 * - Default -> EVENT_TYPE
 */
export function getFestPrefix(eventType = EVENT_TYPE) {
  const t = (eventType || EVENT_TYPE || 'COLORS').toString().trim().toUpperCase();
  if (t === 'COLORS' || t === 'COLOURS' || t === 'CLR') {
    return 'CLR';
  }
  if (t === 'VEDA') {
    return 'VEDA';
  }
  return t;
}

/**
 * Resolve formatted year:
 * - If 2027 -> 2k27
 * - If 2026 -> 2k26
 * - If 2k27 -> 2k27
 */
export function getFormattedEventYear(year = EVENT_YEAR) {
  const y = (year || EVENT_YEAR || '2k27').toString().trim();
  if (/^20\d{2}$/.test(y)) {
    return '2k' + y.slice(2);
  }
  return y;
}

/**
 * Extract unique suffix number/identifier from raw ID
 * e.g. 'VEDA26-VEDA-731292' -> '731292'
 * e.g. 'PAY-VEDA26-VEDA-731292' -> '731292'
 * e.g. 'CLR27-COLORS-189720' -> '189720'
 */
export function extractUniqueSuffix(id = '') {
  if (!id) return '';
  const str = String(id).trim();
  const parts = str.split('-');
  return parts[parts.length - 1] || str;
}

/**
 * Format Registration ID using EVENT_TYPE and EVENT_YEAR:
 * Example:
 * EVENT_TYPE=COLORS, EVENT_YEAR=2k27 -> REG-CLR2k27-731292
 * EVENT_TYPE=VEDA, EVENT_YEAR=2k27   -> REG-VEDA2k27-731292
 */
export function formatRegistrationId(rawId, overrideType = null, overrideYear = null) {
  const suffix = extractUniqueSuffix(rawId) || Math.floor(100000 + Math.random() * 900000).toString();
  const code = getFestPrefix(overrideType || EVENT_TYPE);
  const year = getFormattedEventYear(overrideYear || EVENT_YEAR);
  return `REG-${code}${year}-${suffix}`;
}

/**
 * Format Payment Reference using EVENT_TYPE and EVENT_YEAR:
 * Example:
 * EVENT_TYPE=COLORS, EVENT_YEAR=2k27 -> PAY-CLR2k27-731292
 * EVENT_TYPE=VEDA, EVENT_YEAR=2k27   -> PAY-VEDA2k27-731292
 */
export function formatPaymentReference(rawRef, overrideType = null, overrideYear = null) {
  const suffix = extractUniqueSuffix(rawRef) || Math.floor(100000 + Math.random() * 900000).toString();
  const code = getFestPrefix(overrideType || EVENT_TYPE);
  const year = getFormattedEventYear(overrideYear || EVENT_YEAR);
  return `PAY-${code}${year}-${suffix}`;
}

export const EVENT_ACADEMIC_YEAR = (
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_EVENT_ACADEMIC_YEAR || import.meta.env?.EVENT_ACADEMIC_YEAR)) ||
  (typeof process !== 'undefined' && (process.env?.VITE_EVENT_ACADEMIC_YEAR || process.env?.EVENT_ACADEMIC_YEAR)) ||
  '2026-2027'
).toString().trim();

/**
 * Standardize academic year format:
 * e.g. "2026-27" -> "2026-2027", "2026 - 2027" -> "2026-2027"
 */
export function normalizeAcademicYear(yearStr = '') {
  if (!yearStr) return '';
  const clean = String(yearStr).replace(/\s+/g, '').trim();
  const matchShort = clean.match(/^(\d{4})-(\d{2})$/);
  if (matchShort) {
    const century = matchShort[1].slice(0, 2);
    return `${matchShort[1]}-${century}${matchShort[2]}`;
  }
  return clean;
}

/**
 * Check if a record's academic year matches target year from .env
 */
export function matchesAcademicYear(recordYear, targetYear = EVENT_ACADEMIC_YEAR) {
  if (!recordYear) return true; // If record omits academic year, keep it
  const normRecord = normalizeAcademicYear(recordYear);
  const normTarget = normalizeAcademicYear(targetYear);
  return (
    normRecord === normTarget ||
    normRecord.includes(normTarget) ||
    normTarget.includes(normRecord)
  );
}

/**
 * Check if a record matches the target EVENT_TYPE (e.g. 'COLORS') from .env
 */
export function matchesTypeCode(item, targetType = EVENT_TYPE) {
  if (!item) return false;
  const currentFest = (targetType || EVENT_TYPE || 'COLORS').toString().trim().toUpperCase();
  const itemType = (
    item.typeCode ||
    item.type_code ||
    item.eventType ||
    item.event_type ||
    item.festType ||
    item.categoryType ||
    item.backendRegistration?.typeCode ||
    item.backendRegistration?.eventType ||
    item.backendPayment?.typeCode ||
    item.registration?.typeCode ||
    ''
  ).toString().trim().toUpperCase();

  if (itemType) {
    if (currentFest === 'COLORS' || currentFest === 'COLOURS' || currentFest === 'CLR') {
      return itemType === 'COLORS' || itemType === 'COLOURS' || itemType === 'CLR';
    }
    return itemType === currentFest;
  }

  // Fallback check against ID / paymentReference prefix
  const ref = (
    item.registrationNumber ||
    item.registrationId ||
    item.paymentReference ||
    item.payment_reference ||
    ''
  ).toString().toUpperCase();

  if (ref.includes('VEDA')) {
    return currentFest === 'VEDA';
  }
  if (ref.includes('CLR') || ref.includes('COLOR')) {
    return currentFest === 'COLORS' || currentFest === 'COLOURS' || currentFest === 'CLR';
  }

  return true;
}

/**
 * Check if a record has completed PAID payment status,
 * or is a CONFIRMED registration in central_event_student_registrations
 */
export function isPaidPayment(item) {
  if (!item) return false;

  // 1. Direct payment status
  const payStatus = (
    item.payment?.status ||
    item.paymentStatus ||
    item.backendPayment?.status ||
    ''
  ).toString().trim().toUpperCase();

  if (payStatus === 'PAID' || payStatus === 'SUCCESS' || payStatus === 'COMPLETED') {
    return true;
  }

  // 2. Item top-level status
  const itemStatus = (item.status || '').toString().trim().toUpperCase();
  if (itemStatus === 'PAID' || itemStatus === 'SUCCESS' || itemStatus === 'COMPLETED') {
    return true;
  }

  // 3. User requirement: central_event_student_registrations with status=CONFIRMED
  if (itemStatus === 'CONFIRMED') {
    return true;
  }

  return false;
}

export const API_BASE = (
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_URL || import.meta.env?.API_URL)) ||
  (typeof process !== 'undefined' && (process.env?.VITE_API_URL || process.env?.API_URL)) ||
  'http://localhost:9022'
).replace(/\/+$/, '');

/**
 * Build URL resolving against API_BASE (http://localhost:9022)
 */
export function buildApiUrl(path = '') {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath;
}

/**
 * Standard fetch connecting directly to backend API (API_BASE = http://localhost:9022)
 * with automatic relative fallback if direct connection fails (e.g. CORS/proxy fallback)
 */
export async function apiFetch(endpoint, options = {}) {
  const directUrl = buildApiUrl(endpoint);
  try {
    const res = await fetch(directUrl, options);
    return res;
  } catch (err) {
    if (API_BASE && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      const fallbackUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      try {
        const fallbackRes = await fetch(fallbackUrl, options);
        return fallbackRes;
      } catch {
        // Fallback also failed
      }
    }
    throw err;
  }
}

export const EMP_PHOTO_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMP_URL) ||
  'https://info.aec.edu.in/aus/employeephotos';

export const CAMPUS_PHOTO_BASES = [
  'https://info.aec.edu.in/aus/employeephotos',
  'https://info.aec.edu.in/aec/employeephotos',
  'https://info.aec.edu.in/acet/employeephotos',
  'https://info.aec.edu.in/acoe/employeephotos'
];

// Standard preferred ordering matching fest structure
export const CATEGORY_ORDER = ['CULTURALS', 'SPORTS', 'CREO'];

// Official Festival Coordinators as announced on poster
export const OFFICIAL_POSTER_COORDINATORS = {
  'CULTURALS': {
    name: 'Mr. P. Raju',
    designation: 'Culturals Chair',
    phone: '8374245400',
    email: 'raju.p@adityauniversity.in'
  },
  'SPORTS': {
    name: 'Dr. N. Ravi',
    designation: 'Sports Chair',
    phone: '9912393905',
    email: 'ravi.n@adityauniversity.in'
  },
  'CREO': {
    name: 'Dr. B. Srinivas',
    designation: 'Creo Chair',
    phone: '9866732745',
    email: 'srinivas.b@adityauniversity.in'
  }
};

export const SUBCATEGORY_ORDER = {};

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

// Cached categories and events for subcategory/coordinator lookups
let cachedCategories = null;
let cachedEventsByType = {};

/**
 * Fetch all available fest themes / event types (e.g. COLORS, VEDA, ALA)
 */
export async function fetchThemes() {
  try {
    const res = await apiFetch('/api/central-event-types');

    if (!res.ok) {
      throw new Error(`Failed to fetch themes: ${res.status}`);
    }

    const json = await res.json();
    const types = Array.isArray(json) ? json : json.data || [];
    return types.filter((t) => t.isActive !== false);
  } catch (err) {
    console.error('Error fetching themes:', err);
    // Fallback default themes
    return [
      { code: 'COLORS', name: 'COLORS Youth Cultural Fest', isActive: true, sortOrder: 1 },
      { code: 'VEDA', name: 'VEDA National Tech Fest', isActive: true, sortOrder: 2 },
      { code: 'ALA', name: 'ALA Literary & Arts Festival', isActive: true, sortOrder: 3 }
    ];
  }
}

/**
 * Fetch all events for a given fest theme / event type
 */
export async function fetchAllEvents(typeCode = EVENT_TYPE, academicYear = EVENT_ACADEMIC_YEAR) {
  const code = (typeCode || 'COLORS').toUpperCase();
  const yearQuery = normalizeAcademicYear(academicYear || EVENT_ACADEMIC_YEAR);
  try {
    const endpoint = `/api/central-events?typeCode=${code}&academicYear=${encodeURIComponent(yearQuery)}&limit=100`;
    let res = await apiFetch(endpoint);

    if (!res.ok) {
      res = await apiFetch(`/api/central-events?typeCode=${code}&limit=100`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status}`);
    }

    const json = await res.json();
    const rawEvents = Array.isArray(json) ? json : json.data || [];
    const mapped = rawEvents
      .map((ev) => mapBackendEvent(ev))
      .filter((ev) => {
        const cat = (ev.category || ev.categoryName || ev.categoryCode || '').toUpperCase();
        if (cat.includes('FETE')) return false;
        if (ev.academicYear || ev.academic_year) {
          return matchesAcademicYear(ev.academicYear || ev.academic_year, yearQuery);
        }
        return true;
      });
    cachedEventsByType[code] = mapped;
    return mapped;
  } catch (err) {
    console.warn(`Notice loading live events for ${code}:`, err.message);
    return cachedEventsByType[code] || [];
  }
}

/**
 * Fetch all categories and their subcategories based on EVENT_TYPE (e.g. 'COLORS')
 * Dynamically aggregates event counts and subcategories from backend
 */
export async function fetchCategoriesWithSubCategories(typeCode = EVENT_TYPE, academicYear = EVENT_ACADEMIC_YEAR) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();
    const yearQuery = normalizeAcademicYear(academicYear || EVENT_ACADEMIC_YEAR);
    const endpoint = `/api/central-event-types/${code}/categories?academicYear=${encodeURIComponent(yearQuery)}`;

    // Concurrently fetch categories and live events for this theme
    let [catRes, allEvents] = await Promise.all([
      apiFetch(endpoint).catch(() => apiFetch(`/api/central-event-types/${code}/categories`)),
      fetchAllEvents(code, yearQuery).catch(() => [])
    ]);

    if (!catRes.ok) {
      catRes = await apiFetch(`/api/central-event-types/${code}/categories`);
    }

    if (!catRes.ok) {
      throw new Error(`Failed to fetch categories: ${catRes.status}`);
    }

    const json = await catRes.json();
    const rawCategories = Array.isArray(json) ? json : json.data || [];

    const normalized = normalizeCategories(rawCategories, allEvents, code, yearQuery);
    cachedCategories = normalized;
    return sortCategoriesAndSubCategories(normalized);
  } catch (err) {
    console.error('Error fetching categories with subcategories:', err);
    throw err;
  }
}

/**
 * Infer activity/subcategory grouping from event title
 * e.g. "Singing (Solo)" -> "Singing", "Instrumental (Group)" -> "Instrumental"
 */
export function inferEventGroup(title = '') {
  if (!title || typeof title !== 'string') return 'General';
  const cleaned = title.replace(/\s*\((Solo|Group|Single|Team|Men|Women)[^)]*\)/i, '').trim();
  return cleaned || title;
}

/**
 * Normalize category objects from backend central_event_categories collection
 * Links subcategories with actual event counts and coordinator details
 */
function normalizeCategories(categories, allEvents = [], typeCode = 'COLORS', academicYear = EVENT_ACADEMIC_YEAR) {
  if (!Array.isArray(categories)) return [];

  return categories
    .filter((cat) => {
      const cCode = (cat.code || cat._id || '').toUpperCase();
      const cName = (cat.name || '').toUpperCase();
      if (cCode.includes('FETE') && cName.includes('FETE')) return false;
      const catYear = cat.academicYear || cat.academic_year;
      if (catYear && !matchesAcademicYear(catYear, academicYear)) {
        return false;
      }
      return true;
    })
    .map((cat) => {
    const catCode = (cat.code || cat._id || '').toUpperCase();
    const catName = cat.name || catCode;

    // Filter events belonging to this category
    const catEvents = (allEvents || []).filter((ev) => {
      if (cat._id && ev.categoryId && String(ev.categoryId) === String(cat._id)) return true;
      if (cat.rawId && ev.categoryId && String(ev.categoryId) === String(cat.rawId)) return true;
      const evCat = (ev.category || ev.categoryName || ev.categoryCode || '').toUpperCase();
      const cName = catName.toUpperCase();
      const cCode = catCode.toUpperCase();
      return (
        evCat === cName ||
        evCat === cCode ||
        evCat.includes(cCode) ||
        cCode.includes(evCat) ||
        evCat.includes(cName) ||
        cName.includes(evCat)
      );
    });

    // Sort events inside category
    catEvents.sort((a, b) => {
      if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number' && a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      const titleA = (a.title || a.eventName || '').toLowerCase();
      const titleB = (b.title || b.eventName || '').toLowerCase();
      return titleA.localeCompare(titleB);
    });

    return {
      _id: catCode, // e.g., 'SPORTS', 'CULTURALS', 'CREO'
      rawId: cat._id,
      code: catCode,
      name: catName,
      typeCode: typeCode,
      sortOrder: cat.sortOrder ?? 99,
      coordinator: cat.coordinator,
      coordinators: cat.coordinators || (cat.coordinator ? [cat.coordinator] : []),
      totalEventsCount: catEvents.length,
      events: catEvents,
      data: [] // empty for backward compatibility
    };
  });
}

/**
 * Sort categories according to sortOrder or CATEGORY_ORDER
 */
function sortCategoriesAndSubCategories(categories) {
  if (!Array.isArray(categories)) return [];

  return [...categories].sort((a, b) => {
    if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number') {
      return a.sortOrder - b.sortOrder;
    }
    const idxA = CATEGORY_ORDER.indexOf(a.code || a._id);
    const idxB = CATEGORY_ORDER.indexOf(b.code || b._id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return (a.name || a._id).localeCompare(b.name || b._id);
  });
}

export const fetchCategories = fetchCategoriesWithSubCategories;

/**
 * Fetch events within a category
 */
export async function fetchEventsForCategory(category, typeCode = EVENT_TYPE) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();
    let allEvents = cachedEventsByType[code];
    if (!allEvents || allEvents.length === 0) {
      allEvents = await fetchAllEvents(code);
    }
    if (!Array.isArray(allEvents)) return [];

    const normCat = (category || '').toLowerCase().trim();
    return allEvents.filter((ev) => {
      const evCat = (ev.category || ev.categoryName || ev.categoryCode || '').toLowerCase().trim();
      return evCat === normCat || evCat.includes(normCat) || normCat.includes(evCat);
    });
  } catch (err) {
    console.error(`Error fetching events for category ${category}:`, err);
    return [];
  }
}

/**
 * Backward compatibility alias for fetchEventsInSubCategory
 */
export async function fetchEventsInSubCategory(category, subCategory, subcategoryId = null, typeCode = EVENT_TYPE) {
  return fetchEventsForCategory(category, typeCode);
}

/**
 * Convert backend event fee (which is stored in paise, e.g. 100 paise = ₹1, 100000 paise = ₹1000)
 * into rupees.
 */
export function parseEventFeeInRupees(feeObjOrNumber) {
  if (feeObjOrNumber === null || feeObjOrNumber === undefined) return 0;
  let raw = 0;
  if (typeof feeObjOrNumber === 'number') {
    raw = feeObjOrNumber;
  } else if (typeof feeObjOrNumber === 'object') {
    raw = feeObjOrNumber.amount !== undefined ? feeObjOrNumber.amount : (feeObjOrNumber.price ?? 0);
  }
  raw = Number(raw) || 0;
  if (raw <= 0) return 0;

  // In database, registration fee is stored in paise (1 rupee = 100 paise, e.g. 100 -> ₹1, 30000 -> ₹300, 100000 -> ₹1000)
  if (raw >= 100) {
    return Math.round(raw / 100);
  }
  return raw;
}

/**
 * Map backend CentralEvent schema to frontend event card structure
 */
export function mapBackendEvent(ev, category = '', subCategory = '') {
  const isTeam = ev.participation?.type === 'TEAM';
  const minSize = ev.participation?.minTeamSize ?? 1;
  const maxSize = ev.participation?.maxTeamSize ?? 1;
  const teamLabel = isTeam
    ? `Team (${minSize}${maxSize && maxSize !== minSize ? `-${maxSize}` : ''})`
    : 'Solo';

  // In database, registration fee is stored in paise (amount * 100).
  const rupeePrice = parseEventFeeInRupees(ev.fee ?? ev.price);
  const rawPrice = ev.fee?.amount ?? ev.price ?? 0;

  const venueName =
    typeof ev.venue === 'object' && ev.venue !== null
      ? ev.venue.name || ev.venue.address || 'Aditya University Campus'
      : ev.venue || 'Aditya University Campus';

  const resolvedCat = ev.categoryName || category || 'General';
  const resolvedSub = ev.subcategoryName || subCategory || '';

  return {
    _id: ev._id,
    rawId: ev._id,
    slug: ev.slug,
    eventName: ev.title,
    title: ev.title,
    eventType: teamLabel,
    participationType: ev.participation?.type || 'SINGLE',
    minTeamSize: minSize,
    maxTeamSize: maxSize,
    price: rupeePrice,
    rawPrice: rawPrice,
    currency: ev.fee?.currency || 'INR',
    eventImage: ev.banner?.url || null,
    banner: ev.banner,
    overview: ev.description || '',
    description: ev.description || '',
    regulations: Array.isArray(ev.rules) ? ev.rules : [],
    rules: Array.isArray(ev.rules) ? ev.rules : [],
    venue: venueName,
    venueObj: ev.venue || {},
    capacity: ev.capacity || 100,
    rounds: ev.rounds || 1,
    mode: ev.mode || 'OFFLINE',
    status: ev.status || 'ACTIVE',
    registrationCount: ev.registrationCount ?? 0,
    schedule: ev.schedule || {},
    coordinators: ev.coordinators || {},
    category: resolvedCat,
    subCategory: resolvedSub,
    categoryName: resolvedCat,
    subcategoryName: resolvedSub,
    categoryId: ev.categoryId,
    subcategoryId: ev.subcategoryId,
    typeCode: ev.typeCode || 'COLORS',
    academicYear: ev.academicYear || ev.academic_year || EVENT_ACADEMIC_YEAR,
    academic_year: ev.academic_year || ev.academicYear || EVENT_ACADEMIC_YEAR
  };
}

/**
 * Festival events catalog for rich display when database events are pending creation
 */
function getCatalogEventsForSubCategory(category, subCategory) {
  const normSub = (subCategory || '').trim();

  // Curated competition items for each subcategory
  const catalogMap = {
    'Singing': [
      {
        eventName: 'Solo Singing (Classical & Western)',
        eventType: 'Solo',
        price: 100,
        overview: 'Showcase your vocal prowess across classical, light, folk, or western melodies with national-level judging.',
        regulations: [
          'Time limit: 4 to 5 minutes maximum including sound check.',
          'Karaoke track or acoustic accompaniment must be submitted 30 minutes prior to event start.',
          'Judging is based on pitch (Sur), rhythm (Taal), expression (Bhav), and overall stage presence.'
        ],
        venue: 'Main University Auditorium'
      },
      {
        eventName: 'Group Singing Harmony',
        eventType: 'Team (3-8)',
        price: 250,
        overview: 'Choral, band, or ensemble vocal competition celebrating harmony, vocal balance, and synchronized performance.',
        regulations: [
          'Team size: 3 to 8 vocalists.',
          'Time limit: 6 to 8 minutes.',
          'Acoustic instruments allowed on stage; drum kit available on request.'
        ],
        venue: 'Open Air Amphitheatre'
      }
    ],
    'Instrumental': [
      {
        eventName: 'Instrumental Solo (Strings & Keys)',
        eventType: 'Solo',
        price: 100,
        overview: 'Solo instrumental artistry covering guitar, violin, keyboard, flute, and traditional instruments.',
        regulations: [
          'Time limit: 5 minutes.',
          'Participants must bring their own instruments (amplifiers and DI boxes provided).',
          'Selection of raag or western scale is open.'
        ],
        venue: 'Seminar Hall 1'
      },
      {
        eventName: 'Percussion & Rhythm Showdown',
        eventType: 'Solo',
        price: 100,
        overview: 'Fast-paced rhythmic solo contest featuring drums, tabla, mridangam, octapad, or cajon.',
        regulations: [
          'Time limit: 4 minutes.',
          'Rhythmic clarity, complexity, and speed will be judged.'
        ],
        venue: 'Auditorium Stage B'
      }
    ],
    'Mime': [
      {
        eventName: 'Mime Theatre Championship',
        eventType: 'Team (2-6)',
        price: 150,
        overview: 'The silent theatrical art of storytelling, conveying poignant social messages or comedy through stylized gestures.',
        regulations: [
          'Time limit: 5 to 7 minutes.',
          'Standard mime face paint (white & black) is required.',
          'No spoken words, lip-sync, or handheld props permitted; background music is allowed.'
        ],
        venue: 'Drama Hall - Central Block'
      }
    ],
    'Mono Action': [
      {
        eventName: 'Mono Action Dramatic Solo',
        eventType: 'Solo',
        price: 100,
        overview: 'Solo theatrical monologue embodying powerful emotions, legendary mythological characters, or modern social figures.',
        regulations: [
          'Time limit: 4 to 6 minutes.',
          'Languages permitted: English, Telugu, or Hindi.',
          'Costume and minimal prop setup must be completed within 1 minute.'
        ],
        venue: 'Black Box Theatre'
      }
    ],
    'Running': [
      {
        eventName: '100m Sprint Championship',
        eventType: 'Solo',
        price: 100,
        overview: 'The lightning-fast 100-meter sprint to crown the fastest athlete of Aditya University Fest.',
        regulations: [
          'Standard IAAF athletics rules apply.',
          'Spike shoes are permitted on the synthetic track.',
          'Strict single false start disqualification rule in effect.'
        ],
        venue: 'University Olympic Athletic Track'
      },
      {
        eventName: '200m Speed Showdown',
        eventType: 'Solo',
        price: 100,
        overview: 'Curved track sprint testing maximum acceleration, lane maintenance, and sustained top velocity.',
        regulations: [
          'Heats followed by top 8 finals.',
          'Proper athletic attire and track bib are mandatory.'
        ],
        venue: 'University Olympic Athletic Track'
      },
      {
        eventName: '4x100m Relay Sprint',
        eventType: 'Team (4)',
        price: 200,
        overview: 'High-octane sprint relay testing explosive baton exchange and teamwork under high speed.',
        regulations: [
          '4 runners per squad.',
          'Baton exchange must happen inside the designated 30m changeover zone.'
        ],
        venue: 'University Olympic Athletic Track'
      }
    ],
    'Jumping & Throwing': [
      {
        eventName: 'Long Jump Challenge',
        eventType: 'Solo',
        price: 100,
        overview: 'Athletic leap championship testing takeoff power, sprint runway speed, and flight technique.',
        regulations: [
          '3 preliminary jumps for all competitors; top 8 advance to finals for 3 additional jumps.',
          'Measurement taken from the board to the nearest mark in the sand pit.'
        ],
        venue: 'Athletic Field - Jump Pit A'
      },
      {
        eventName: 'Shot Put Championship',
        eventType: 'Solo',
        price: 100,
        overview: 'Upper body power and kinetic rotational throw contest using regulation weight shot put.',
        regulations: [
          'Men: 7.26 kg / Women: 4.0 kg regulation spheres.',
          'Competitors must exit from the rear half of the throwing circle.'
        ],
        venue: 'Throws Arena - East Ground'
      }
    ],
    'Volleyball': [
      {
        eventName: "Men's Volleyball Tournament",
        eventType: 'Team (6-12)',
        price: 300,
        overview: 'Knockout inter-college volleyball championship with high-flying spikes, blocks, and intense rallies.',
        regulations: [
          'Standard FIVB rules apply.',
          'Matches are best of 3 sets (25-25-15) for qualifiers; finals best of 5 sets.',
          'Team jerseys with numbers are mandatory.'
        ],
        venue: 'University Outdoor Volleyball Courts'
      },
      {
        eventName: "Women's Volleyball Tournament",
        eventType: 'Team (6-12)',
        price: 300,
        overview: 'Premier women’s collegiate volleyball tournament showcasing strategic sets and spikes.',
        regulations: [
          'Standard FIVB rules apply.',
          'All squad members must carry valid university identity cards.'
        ],
        venue: 'University Outdoor Volleyball Courts'
      }
    ],
    'Spot Painting': [
      {
        eventName: 'Spot Painting Contest',
        eventType: 'Solo',
        price: 100,
        overview: 'Create a vibrant masterpiece on canvas based on a surprise theme revealed at the venue.',
        regulations: [
          'Duration: 2 hours.',
          'Standard A3 drawing sheet provided; bring your own watercolors, acrylics, and brushes.',
          'Artwork judged on originality, color harmony, and thematic depth.'
        ],
        venue: 'Fine Arts Studio - Block C'
      }
    ],
    'Fashion Show': [
      {
        eventName: 'Ethnic & Modern Runway Showcase',
        eventType: 'Team (8-16)',
        price: 500,
        overview: 'Dazzling runway production celebrating traditional Indian heritage fused with contemporary avant-garde fashion.',
        regulations: [
          'Time limit: 10 to 12 minutes on the ramp.',
          'Vulgarity or offensive gestures will lead to immediate disqualification.',
          'Background music and lighting cues must be submitted during morning tech rehearsal.'
        ],
        venue: 'Grand Open-Air Auditorium Ramp'
      }
    ],
    'Treasure Hunt': [
      {
        eventName: 'The Great Campus Quest',
        eventType: 'Team (4)',
        price: 200,
        overview: 'Decipher cryptic riddles, solve QR puzzles across campus landmarks, and race against the clock to claim the treasure.',
        regulations: [
          'Strict team size: 4 members.',
          'No motor vehicles allowed during the hunt; fair foot-race only.',
          'First team to locate the final vault wins the grand prize.'
        ],
        venue: 'Campus Central Quadrangle'
      }
    ],
    'Spot Photography': [
      {
        eventName: 'Spot Mobile & DSLR Photography',
        eventType: 'Solo',
        price: 100,
        overview: 'Capture the emotion, action, and vibrant fest moments across campus within a 3-hour window.',
        regulations: [
          'Photos must be captured on the fest day within campus bounds.',
          'Submit 2 unedited RAW/JPEG photographs with EXIF data intact.'
        ],
        venue: 'Festival Campus Grounds'
      }
    ]
  };

  if (catalogMap[normSub]) {
    return catalogMap[normSub];
  }

  // Generic fallback if subcategory is not explicitly in catalogMap
  return [
    {
      eventName: `${normSub || 'General'} Open Championship`,
      eventType: 'Solo / Team',
      price: 100,
      overview: `Official Aditya University competition for ${normSub || 'the festival'}. Evaluated by certified national-level judges with cash rewards and university merit certificates.`,
      regulations: [
        'All participants must carry their valid university/college ID cards.',
        'Reporting time is 30 minutes prior to scheduled event time.',
        'Decisions made by the judging committee will be final and binding.'
      ],
      venue: 'Aditya University Central Campus'
    }
  ];
}

/**
 * Curated catalog events by Category
 */
export function getCatalogEventsForCategory(category = '') {
  const normCat = (category || '').toLowerCase();

  // Curated competition items for each category
  const catalogMap = {
    'Singing': [
      {
        eventName: 'Solo Singing (Classical & Western)',
        eventType: 'Solo',
        price: 100,
        overview: 'Showcase your vocal prowess across classical, light, folk, or western melodies with national-level judging.',
        regulations: [
          'Time limit: 4 to 5 minutes maximum including sound check.',
          'Karaoke track or acoustic accompaniment must be submitted 30 minutes prior to event start.',
          'Judging is based on pitch (Sur), rhythm (Taal), expression (Bhav), and overall stage presence.'
        ],
        venue: 'Main University Auditorium'
      },
      {
        eventName: 'Group Singing Harmony',
        eventType: 'Team (3-8)',
        price: 250,
        overview: 'Choral, band, or ensemble vocal competition celebrating harmony, vocal balance, and synchronized performance.',
        regulations: [
          'Team size: 3 to 8 vocalists.',
          'Time limit: 6 to 8 minutes.',
          'Acoustic instruments allowed on stage; drum kit available on request.'
        ],
        venue: 'Open Air Amphitheatre'
      }
    ],
    'Instrumental': [
      {
        eventName: 'Instrumental Solo (Strings & Keys)',
        eventType: 'Solo',
        price: 100,
        overview: 'Solo instrumental artistry covering guitar, violin, keyboard, flute, and traditional instruments.',
        regulations: [
          'Time limit: 5 minutes.',
          'Participants must bring their own instruments (amplifiers and DI boxes provided).',
          'Selection of raag or western scale is open.'
        ],
        venue: 'Seminar Hall 1'
      }
    ],
    'Sports': [
      {
        eventName: '100m Sprint Championship',
        eventType: 'Solo',
        price: 100,
        overview: 'Track championship to find the fastest university runner with professional electronic timing.',
        regulations: [
          'Standard international athletics federation track rules apply.',
          'Spikes or running shoes required.'
        ],
        venue: 'Main Sports Complex Stadium Track'
      },
      {
        eventName: 'Volleyball Championship',
        eventType: 'Team (6-12)',
        price: 500,
        overview: 'High-octane collegiate volleyball league matches in knockout and round-robin formats.',
        regulations: [
          'Official VFI standard volleyball tournament rules.',
          'Proper team uniform mandatory.'
        ],
        venue: 'Outdoor Volleyball Arena'
      }
    ],
    'Creo': [
      {
        eventName: 'National Treasure Hunt',
        eventType: 'Team (3-5)',
        price: 300,
        overview: 'Decipher cryptic clues, solve campus puzzles, and race against time across the vast university estate.',
        regulations: [
          'Team size: 3 to 5 members.',
          'Use of motor vehicles is strictly forbidden.',
          'Time-based score tracking.'
        ],
        venue: 'Central Campus Plaza'
      },
      {
        eventName: 'Spot Painting & Fine Arts',
        eventType: 'Solo',
        price: 100,
        overview: 'On-the-spot fine arts competition. Express imagination on canvas based on a mystery theme announced at kickoff.',
        regulations: [
          'Drawing sheets provided by the university.',
          'Duration: 2 hours.'
        ],
        venue: 'Design & Architecture Studios'
      }
    ]
  };

  if (normCat.includes('cultur') || normCat === 'culturals') {
    return [...catalogMap['Singing'], ...catalogMap['Instrumental']];
  }
  if (normCat.includes('sport') || normCat === 'sports') {
    return catalogMap['Sports'];
  }
  if (normCat.includes('creo')) {
    return catalogMap['Creo'];
  }
  return [...catalogMap['Singing'], ...catalogMap['Sports'], ...catalogMap['Creo']];
}

/**
 * Fetch detailed event information (rules, venue, price, overview)
 * Direct backend slug lookup or all-events match
 */
export async function fetchEventDetails(category, arg2, arg3, arg4) {
  try {
    let eventNameOrSlug = arg2;
    let typeCode = EVENT_TYPE;

    if (typeof arg3 === 'string' && arg3.trim()) {
      if (arg4) {
        eventNameOrSlug = arg3;
        typeCode = arg4;
      } else if (arg3.toUpperCase() === 'COLORS' || arg3.toUpperCase() === 'VEDA') {
        typeCode = arg3;
      } else {
        eventNameOrSlug = arg3;
      }
    }

    const code = (typeCode || 'COLORS').toUpperCase();
    const queryTerm = (eventNameOrSlug || '').trim();

    // 1. Direct slug endpoint lookup (/api/central-events/:slug)
    try {
      const enc = encodeURIComponent(queryTerm);
      const res = await apiFetch(`/api/central-events/${enc}`);

      if (res && res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return mapBackendEvent(json.data, category);
        }
      }
    } catch (e) {
      console.warn('Direct slug query notice:', e.message);
    }

    // 2. Check in all events for this theme
    let allEvents = cachedEventsByType[code];
    if (!allEvents || allEvents.length === 0) {
      allEvents = await fetchAllEvents(code);
    }

    if (Array.isArray(allEvents) && allEvents.length > 0) {
      const qLower = queryTerm.toLowerCase();
      const match = allEvents.find((e) => {
        const evSlug = (e.slug || '').toLowerCase();
        const evTitle = (e.title || e.eventName || '').toLowerCase();
        return evSlug === qLower || evTitle === qLower || evTitle.includes(qLower) || qLower.includes(evTitle);
      });

      if (match) {
        return match;
      }
    }

    // 3. Fallback to catalog details
    const events = getCatalogEventsForCategory(category);
    const found = events.find(
      (e) => (e.eventName || e.title || '').toLowerCase() === queryTerm.toLowerCase()
    ) || events[0];

    return found || {
      eventName: queryTerm,
      eventType: 'Solo',
      price: 100,
      overview: `Official event competition for ${queryTerm} at Aditya University Colours 2027.`,
      regulations: [
        'Participants must report to the venue 30 minutes before the start time.',
        'Valid university ID card is mandatory.',
        'Judges decision will be final and binding.'
      ],
      venue: 'Aditya University Central Campus'
    };
  } catch (err) {
    console.error(`Error fetching event details for ${arg2}:`, err);
    throw err;
  }
}

/**
 * Fetch faculty coordinators for an event
 * Uses live coordinator data from central_event_categories or central-events
 */
export async function fetchFacultyCoordinators(category, arg2, arg3, arg4) {
  try {
    let eventName = arg2;
    let typeCode = EVENT_TYPE;

    if (typeof arg3 === 'string' && arg3.trim()) {
      if (arg4) {
        eventName = arg3;
        typeCode = arg4;
      } else if (arg3.toUpperCase() === 'COLORS' || arg3.toUpperCase() === 'VEDA') {
        typeCode = arg3;
      } else {
        eventName = arg3;
      }
    }

    const code = (typeCode || 'COLORS').toUpperCase();

    // 1. Check matching event directly from allEvents if eventName provided
    let allEvents = cachedEventsByType[code];
    if (!allEvents || allEvents.length === 0) {
      allEvents = await fetchAllEvents(code);
    }

    if (eventName && Array.isArray(allEvents)) {
      const qLower = eventName.toLowerCase();
      const ev = allEvents.find((e) => {
        const evSlug = (e.slug || '').toLowerCase();
        const evTitle = (e.title || e.eventName || '').toLowerCase();
        return evSlug === qLower || evTitle === qLower || evTitle.includes(qLower) || qLower.includes(evTitle);
      });

      if (ev) {
        const facultyArr = Array.isArray(ev.coordinators?.faculty)
          ? ev.coordinators.faculty
          : Array.isArray(ev.coordinators)
          ? ev.coordinators
          : ev.coordinator ? [ev.coordinator] : [];

        if (facultyArr.length > 0) {
          return facultyArr.map((c) => {
            const instId = c.institutionId || c.empId || c.employeeId || '';
            return {
              cordinatorName: c.name || 'Coordinator',
              cordinatorDesignation: c.designation || 'Faculty Coordinator',
              cordinatorPhone: c.phone || '',
              cordinatorEmail: c.email || '',
              empId: instId,
              institutionId: instId,
              cordinatorImage: instId ? `${instId}.jpg` : ''
            };
          });
        }
      }
    }

    // Check cached categories from backend
    let cats = cachedCategories;
    if (!cats || cats.length === 0) {
      cats = await fetchCategoriesWithSubCategories(code);
    }

    if (cats && Array.isArray(cats)) {
      const normCat = (category || '').toLowerCase();
      const cat = cats.find(
        (c) =>
          c.code?.toLowerCase() === normCat ||
          c.name?.toLowerCase() === normCat ||
          c._id?.toLowerCase() === normCat
      );

      if (cat) {
        // Fall back to category coordinators
        if (Array.isArray(cat.coordinators) && cat.coordinators.length > 0) {
          const valid = cat.coordinators.filter((c) => c && (c.name || c.empId || c.institutionId));
          if (valid.length > 0) {
            return valid.map((c) => {
              const instId = c.institutionId || c.empId || c.employeeId || '';
              return {
                cordinatorName: c.name || 'Coordinator',
                cordinatorDesignation: c.designation || 'Festival Coordinator',
                cordinatorPhone: c.phone || '',
                cordinatorEmail: c.email || '',
                empId: instId,
                institutionId: instId,
                cordinatorImage: instId ? `${instId}.jpg` : ''
              };
            });
          }
        }

        if (cat.coordinator && (cat.coordinator.name || cat.coordinator.empId || cat.coordinator.institutionId)) {
          const c = cat.coordinator;
          const instId = c.institutionId || c.empId || c.employeeId || '';
          return [
            {
              cordinatorName: c.name || 'Coordinator',
              cordinatorDesignation: c.designation || 'Festival Coordinator',
              cordinatorPhone: c.phone || '',
              cordinatorEmail: c.email || '',
              empId: instId,
              institutionId: instId,
              cordinatorImage: instId ? `${instId}.jpg` : ''
            }
          ];
        }
      }
    }

    // Default faculty coordinators matching official poster
    const catUpper = (category || '').toUpperCase();
    if (catUpper.includes('CULTUR') || catUpper === 'CULTURALS') {
      return [{
        cordinatorName: 'Mr. P. Raju',
        cordinatorDesignation: 'Culturals Fest Incharge',
        cordinatorPhone: '8374245400',
        cordinatorEmail: 'raju.p@adityauniversity.in'
      }];
    }
    if (catUpper.includes('SPORT') || catUpper === 'SPORTS') {
      return [{
        cordinatorName: 'Dr. N. Ravi',
        cordinatorDesignation: 'Sports Fest Incharge',
        cordinatorPhone: '9912393905',
        cordinatorEmail: 'ravi.n@adityauniversity.in'
      }];
    }
    if (catUpper.includes('CREO')) {
      return [{
        cordinatorName: 'Dr. B. Srinivas',
        cordinatorDesignation: 'Creo Fest Incharge',
        cordinatorPhone: '9866732745',
        cordinatorEmail: 'srinivas.b@adityauniversity.in'
      }];
    }

    return [
      {
        cordinatorName: 'Mr. P. Raju',
        cordinatorDesignation: 'Culturals Chair',
        cordinatorPhone: '8374245400',
        cordinatorEmail: 'raju.p@adityauniversity.in'
      },
      {
        cordinatorName: 'Dr. N. Ravi',
        cordinatorDesignation: 'Sports Chair',
        cordinatorPhone: '9912393905',
        cordinatorEmail: 'ravi.n@adityauniversity.in'
      },
      {
        cordinatorName: 'Dr. B. Srinivas',
        cordinatorDesignation: 'Creo Chair',
        cordinatorPhone: '9866732745',
        cordinatorEmail: 'srinivas.b@adityauniversity.in'
      }
    ];
  } catch (err) {
    console.error(`Error fetching faculty coordinators for ${arg2}:`, err);
    return [];
  }
}

/**
 * Fetch student coordinators for an event
 */
export async function fetchStudentCoordinators(category, arg2, arg3) {
  try {
    let eventName = arg2;
    if (arg3 && typeof arg3 === 'string' && !arg3.includes('COLOR')) {
      eventName = arg3;
    }
    const code = 'COLORS';
    let allEvents = cachedEventsByType[code];
    if (!allEvents || allEvents.length === 0) {
      allEvents = await fetchAllEvents(code);
    }

    if (eventName && Array.isArray(allEvents)) {
      const qLower = eventName.toLowerCase();
      const ev = allEvents.find((e) => {
        const evSlug = (e.slug || '').toLowerCase();
        const evTitle = (e.title || e.eventName || '').toLowerCase();
        return evSlug === qLower || evTitle === qLower || evTitle.includes(qLower) || qLower.includes(evTitle);
      });

      if (ev && Array.isArray(ev.coordinators?.student) && ev.coordinators.student.length > 0) {
        return ev.coordinators.student.map((s) => ({
          studentCordinatorName: s.name || 'Student Coordinator',
          studentCordinatorId: s.rollNo || s.studentId || '',
          studentCordinatorCollege: s.branch ? `Aditya University - ${s.branch}` : 'Aditya University',
          studentCordinatorPhone: s.phone || ''
        }));
      }
    }

    return [
      {
        studentCordinatorName: 'P. SAI TEJA',
        studentCordinatorId: '22A91A0501',
        studentCordinatorCollege: 'Aditya University - CSE',
        studentCordinatorPhone: '9848012345'
      },
      {
        studentCordinatorName: 'K. SRAVANI',
        studentCordinatorId: '22A91A0412',
        studentCordinatorCollege: 'Aditya University - ECE',
        studentCordinatorPhone: '9848054321'
      }
    ];
  } catch (err) {
    console.error(`Error fetching student coordinators for ${arg2}:`, err);
    return [];
  }
}

/**
 * Resolve subcategory image path
 * Supports backend uploaded images at /uploads/..., external URLs, and professional fallback photography
 */
export function getSubCatImageUrl(bannerOrUrl, subCategoryTitle = '') {
  let url = bannerOrUrl;
  if (typeof bannerOrUrl === 'object' && bannerOrUrl !== null) {
    url = bannerOrUrl.url || bannerOrUrl.Image || bannerOrUrl.image;
  }

  if (url && typeof url === 'string') {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `${API_BASE}${url}`;
    }
    if (url.startsWith('/')) {
      return url;
    }
    return `/eventSubCat_Images/${url}`;
  }

  // Use curated high-resolution photography if available
  if (subCategoryTitle && PROFESSIONAL_EVENT_IMAGES[subCategoryTitle]) {
    return PROFESSIONAL_EVENT_IMAGES[subCategoryTitle];
  }

  return '/hero_bg.png';
}

export function getLocalFallbackSubCatImageUrl(bannerOrUrl, subCategoryTitle = '') {
  if (subCategoryTitle && PROFESSIONAL_EVENT_IMAGES[subCategoryTitle]) {
    return PROFESSIONAL_EVENT_IMAGES[subCategoryTitle];
  }
  return '/hero_bg.png';
}

export function getEventImageUrl(imageName, eventName = '') {
  if (imageName && typeof imageName === 'string') {
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    if (imageName.startsWith('/uploads/')) {
      return `${API_BASE}${imageName}`;
    }
    if (imageName.startsWith('/')) {
      return imageName;
    }
    return `/event_images/${imageName}`;
  }

  if (eventName && PROFESSIONAL_EVENT_IMAGES[eventName]) {
    return PROFESSIONAL_EVENT_IMAGES[eventName];
  }
  return '/hero_bg.png';
}

/**
 * Dynamic resolution of faculty photo across AU/AEC/ACET campus servers
 * Matches reference URLs:
 *   ausUrl: https://info.aec.edu.in/aus/employeephotos/${profile.institutionId}.jpg
 *   aecUrl: https://info.aec.edu.in/aec/employeephotos/${profile.institutionId}.jpg
 *   acetUrl: https://info.aec.edu.in/acet/employeephotos/${profile.institutionId}.jpg
 */
export function getFacultyCandidateUrls(profileOrImage) {
  if (!profileOrImage) return [];

  const profile = typeof profileOrImage === 'object' && profileOrImage !== null ? profileOrImage : null;
  const rawId = profile
    ? (profile.institutionId || profile.empId || profile.employeeId || profile.cordinatorImage || '')
    : String(profileOrImage).trim();

  if (!rawId) return [];

  if (rawId.startsWith('http://') || rawId.startsWith('https://')) {
    return [rawId];
  }

  const cleanId = rawId.replace(/\.[^/.]+$/, '').trim();
  if (/^\d+$/.test(cleanId)) {
    const ausUrl = `https://info.aec.edu.in/aus/employeephotos/${cleanId}.jpg`;
    const aecUrl = `https://info.aec.edu.in/aec/employeephotos/${cleanId}.jpg`;
    const acetUrl = `https://info.aec.edu.in/acet/employeephotos/${cleanId}.jpg`;
    const acoeUrl = `https://info.aec.edu.in/acoe/employeephotos/${cleanId}.jpg`;
    return [ausUrl, aecUrl, acetUrl, acoeUrl];
  }

  return [`/Faculty_Images/${rawId}`];
}

export function getFacultyImageUrl(profileOrImage, index = 0) {
  if (!profileOrImage) return `/img/person/${(index % 8) + 1}.jpg`;

  const candidates = getFacultyCandidateUrls(profileOrImage);
  if (candidates.length > 0) {
    return candidates[0];
  }
  return `/img/person/${(index % 8) + 1}.jpg`;
}

// ─────────────────────────────────────────────────────────────
// STUDENT AUTH & EVENT REGISTRATION SERVICES
// ─────────────────────────────────────────────────────────────

export const STUDENT_STORAGE_KEY = 'fest_student_user';
export const REGISTRATIONS_STORAGE_KEY = 'fest_student_registrations';

/**
 * Get current logged in student from localStorage
 */
export function getLoggedStudent() {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save logged in student session
 */
export function setLoggedStudent(student) {
  try {
    if (student) {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
      window.dispatchEvent(new Event('fest-student-auth-change'));
    } else {
      localStorage.removeItem(STUDENT_STORAGE_KEY);
      window.dispatchEvent(new Event('fest-student-auth-change'));
    }
  } catch (err) {
    console.error('Failed to save student session:', err);
  }
}

/**
 * Logout student
 */
export function logoutStudent() {
  try {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    window.dispatchEvent(new Event('fest-student-auth-change'));
  } catch (err) {
    console.error('Failed to logout student:', err);
  }
}

/**
 * Check whether a student exists in central database or event registration records
 */
export async function checkStudentExists(rollOrEmail, eventData = null) {
  if (!rollOrEmail || !rollOrEmail.trim()) {
    return { exists: false, student: null, alreadyRegisteredForEvent: false };
  }
  const clean = rollOrEmail.trim();
  const queryParams = new URLSearchParams();
  if (eventData) {
    if (eventData._id || eventData.rawId) queryParams.set('eventId', eventData._id || eventData.rawId);
    if (eventData.slug || eventData.eventSlug) queryParams.set('eventSlug', eventData.slug || eventData.eventSlug);
    if (eventData.eventName || eventData.title) queryParams.set('eventTitle', eventData.eventName || eventData.title);
  }
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

  try {
    const res = await apiFetch(`/api/central-events/check-student/${encodeURIComponent(clean)}${qs}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Check student exists notice:', err.message);
  }
  return { exists: false, student: null, alreadyRegisteredForEvent: false };
}

export const ECAP_API_KEY =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_ECAP_API_KEY || import.meta.env?.ECAP_API_KEY));

/**
 * Fetch student data from ECAP / Aditya University API by roll number
 * Auto-maps studentname, branch, college, mobile, email, semester, location
 */
export async function fetchStudentByRollNumber(rollNumber) {
  if (!rollNumber || !rollNumber.trim()) return null;
  const cleanRoll = rollNumber.trim().toUpperCase();

  // 1. Try backend ecap-student endpoint first (handles proxy, API key, and fallback to central_event_student_account)
  try {
    const backendRes = await apiFetch(`/api/event-students/ecap-student/${encodeURIComponent(cleanRoll)}`);
    if (backendRes && backendRes.ok) {
      const json = await backendRes.json();
      if (json && json.success && json.data) {
        return normalizeEcapStudent(json.data, cleanRoll);
      }
    }
  } catch (err) {
    console.warn('Backend ecap-student fetch notice:', err.message);
  }

  // 2. Direct /adityaapi proxy call with x-api-key header
  try {
    const res = await fetch(`/adityaapi/api/studentdata/${encodeURIComponent(cleanRoll)}`, {
      headers: {
        'Accept': 'application/json',
        'x-api-key': ECAP_API_KEY,
        'X-API-Key': ECAP_API_KEY
      }
    });
    if (res.ok) {
      const json = await res.json();
      const norm = Array.isArray(json) ? json[0] : json;
      if (norm && !norm.error && (norm.studentname || norm.studentName || norm.rollno)) {
        return normalizeEcapStudent(norm, cleanRoll);
      }
    }
  } catch (err) {
    console.warn('Direct adityaapi proxy notice:', err.message);
  }

  return null;
}

export const FALLBACK_EVENT_DEPARTMENTS = [
  { name: 'CE', alternativeNames: 'CIV' },
  { name: 'CSE', alternativeNames: 'CSE-SAP,CSE-GC,CSE-DS-GC' },
  { name: 'ECE', alternativeNames: '' },
  { name: 'EEE', alternativeNames: '' },
  { name: 'ME', alternativeNames: 'MEC' },
  { name: 'IT', alternativeNames: '' },
  { name: 'AIML', alternativeNames: 'CSE-AI&ML,AIML-GC,AIML-MS' },
  { name: 'DS', alternativeNames: 'CSE-DS' },
  { name: 'IOT', alternativeNames: 'CSE-IOT' },
  { name: 'Ag.E', alternativeNames: 'AG' },
  { name: 'Min.E', alternativeNames: '' },
  { name: 'PT', alternativeNames: '' },
  { name: 'FS', alternativeNames: 'CS & DF,FIS,CFS,FS' },
  { name: 'SOB', alternativeNames: 'BA,BBA,BBA(DM),IMB,MB,MBA,BBA-BA-KPM,BBA-GF-PWC,BBA-Deloit,BBA-HCM-RV,BBA-FT-EY' },
  { name: 'SOP', alternativeNames: 'BP,PH,PQ,PC' },
  { name: 'BCA', alternativeNames: '117' },
  { name: 'MCA', alternativeNames: '' },
  { name: 'MS', alternativeNames: 'BBA-FT-EY' }
];

let cachedEventDepartments = null;

/**
 * Fetch all active event departments from backend or fallback catalog
 */
export async function fetchEventDepartments() {
  if (cachedEventDepartments && cachedEventDepartments.length > 0) {
    return cachedEventDepartments;
  }
  try {
    const res = await apiFetch('/api/event-departments');

    if (res && res.ok) {
      const json = await res.json();
      const list = json.data || json.departments || [];
      if (Array.isArray(list) && list.length > 0) {
        const active = list.filter((d) => d.status !== 'Inactive');
        if (active.length > 0) {
          cachedEventDepartments = active;
          return active;
        }
      }
    }
  } catch (err) {
    console.warn('Notice loading event departments:', err.message);
  }

  cachedEventDepartments = FALLBACK_EVENT_DEPARTMENTS;
  return FALLBACK_EVENT_DEPARTMENTS;
}

/**
 * Match department dropdown value by checking branch against department name & alternative names
 * e.g., branch "CIV" matches alternative name "CIV" of department "CE" -> returns "CE"
 */
export function matchDepartmentByBranch(branch, deptList = []) {
  if (!branch || !branch.trim()) return '';
  const cleanBranch = branch.trim().toUpperCase();
  const list = Array.isArray(deptList) && deptList.length > 0 ? deptList : (cachedEventDepartments || FALLBACK_EVENT_DEPARTMENTS);

  // 1. Direct match with department name
  for (const d of list) {
    const dName = (d.name || '').trim().toUpperCase();
    if (dName === cleanBranch) return d.name;
  }

  // 2. Exact match inside alternativeNames (comma-separated aliases e.g. "CIV", "MEC", "CSE-AI&ML")
  for (const d of list) {
    if (!d.alternativeNames) continue;
    const aliases = d.alternativeNames
      .split(',')
      .map((a) => a.trim().toUpperCase())
      .filter(Boolean);

    if (aliases.includes(cleanBranch)) {
      return d.name;
    }
  }

  // 3. Normalized alphanumeric match (stripping punctuation, spaces, dashes)
  const normBranch = cleanBranch.replace(/[^A-Z0-9]/g, '');
  for (const d of list) {
    const dNorm = (d.name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (normBranch === dNorm) return d.name;

    if (d.alternativeNames) {
      const aliases = d.alternativeNames
        .split(',')
        .map((a) => a.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
        .filter(Boolean);

      if (aliases.includes(normBranch)) {
        return d.name;
      }
    }
  }

  // 4. Substring / Prefix match fallback
  for (const d of list) {
    const dName = (d.name || '').trim().toUpperCase();
    if (cleanBranch.startsWith(dName) || dName.startsWith(cleanBranch)) {
      return d.name;
    }
    if (d.alternativeNames) {
      const aliases = d.alternativeNames
        .split(',')
        .map((a) => a.trim().toUpperCase())
        .filter(Boolean);

      for (const a of aliases) {
        if (cleanBranch === a || cleanBranch.includes(a) || a.includes(cleanBranch)) {
          return d.name;
        }
      }
    }
  }

  return cleanBranch;
}

export const COLLEGE_OPTIONS = [
  'AUS',
  'ACET',
  'Other Institution'
];

export function normalizeCollegeName(name = '') {
  if (!name) return 'AUS';
  const clean = name.toString().trim();
  const upper = clean.toUpperCase();
  if (upper === 'OTHER INSTITUTION' || upper === 'OTHER' || clean.toLowerCase().includes('other institution')) {
    return 'Other Institution';
  }
  if (upper.includes('ACET') || upper.includes('ENGINEERING & TECHNOLOGY')) {
    return 'ACET';
  }
  return 'AUS';
}

/**
 * Validates whether a custom college name contains either "university" or "engineering" (case-insensitive).
 * Required when "Other Institution" is selected.
 */
export function isValidOtherCollege(name) {
  if (!name || typeof name !== 'string') return false;
  const lower = name.trim().toLowerCase();
  return lower.includes('university') || lower.includes('engineering');
}

export function normalizeEcapStudent(data, fallbackRoll = '', deptList = []) {
  if (!data) return null;
  const roll = (data.rollno || data.RollNo || data.roll || fallbackRoll).toUpperCase().trim();

  // College detection strictly among: AUS, ACET, Other Institution
  let college = 'AUS';
  const rawCol = (data.college || '').toString().trim().toUpperCase();
  if (rawCol === 'OTHER INSTITUTION' || rawCol === 'OTHER' || data.college === 'Other Institution') {
    college = 'Other Institution';
  } else if (roll.includes('P3') || rawCol.includes('ACET')) {
    college = 'ACET';
  } else {
    college = 'AUS';
  }

  // Year detection
  const sem = (data.semestername || data.semester || data.year || '').toLowerCase();
  let yearOfStudy = 'Select';
  if (sem.includes('1/4') || sem.includes('i semester') || sem.includes('ii semester') || sem.includes('1st')) {
    yearOfStudy = '1st Year';
  } else if (sem.includes('2/4') || sem.includes('iii semester') || sem.includes('iv semester') || sem.includes('2nd')) {
    yearOfStudy = '2nd Year';
  } else if (sem.includes('3/4') || sem.includes('v semester') || sem.includes('vi semester') || sem.includes('3rd')) {
    yearOfStudy = '3rd Year';
  } else if (sem.includes('4/4') || sem.includes('vii semester') || sem.includes('viii semester') || sem.includes('4th')) {
    yearOfStudy = '4th Year';
  } else if (data.joinedyear) {
    const diff = new Date().getFullYear() - Number(data.joinedyear) + 1;
    if (diff <= 1) yearOfStudy = '1st Year';
    else if (diff === 2) yearOfStudy = '2nd Year';
    else if (diff === 3) yearOfStudy = '3rd Year';
    else if (diff >= 4) yearOfStudy = '4th Year';
  }

  // Location detection
  const locParts = [data.village, data.mandal, data.district, data.statename].filter(Boolean);
  const location = data.location || (locParts.length > 0 ? locParts.join(', ') : 'Surampalem');

  // Match Department from Branch using alternativeNames
  const rawBranch = (data.branch || data.department || '').trim();
  const matchedDepartment = matchDepartmentByBranch(rawBranch, deptList) || 'Select';

  return {
    rollNumber: roll,
    roll: roll,
    name: data.studentname || data.studentName || data.name || '',
    college: college,
    gender: data.gender || 'Male',
    mobile: data.mobilenumber || data.mobileNumber || data.mobile || data.fathermobilenumber || '',
    email: (data.emailid || data.email || '').toLowerCase(),
    yearOfStudy: yearOfStudy,
    year: yearOfStudy,
    department: matchedDepartment,
    departments: matchedDepartment,
    branch: rawBranch,
    location: location
  };
}

/**
 * Register a student account via /api/event-students/register
 */
export async function registerStudentAccount(studentData) {
  const endpoint = '/api/event-students/register';
  const res = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Registration failed. Please verify your details.');
  }

  const student = json.student || json.data || studentData;
  setLoggedStudent(student);
  return student;
}

/**
 * Login a student account via /api/event-students/login
 */
export async function loginStudentAccount(credentials) {
  const endpoint = '/api/event-students/login';
  const res = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Login failed. Please check your credentials.');
  }

  const student = json.student || json.data;
  setLoggedStudent(student);
  return student;
}

/**
 * Update student profile via /api/event-students/update
 */
export async function updateStudentProfile(profileData) {
  const endpoint = '/api/event-students/update';
  const res = await apiFetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Failed to update profile.');
  }

  const updated = json.student || json.data;
  if (updated) {
    // Preserve any existing fields if not returned
    const current = getLoggedStudent() || {};
    const merged = { ...current, ...updated };
    setLoggedStudent(merged);
  }
  return updated;
}

/**
 * Change student password via /api/event-students/change-password
 */
export async function changeStudentPassword(payload) {
  const endpoint = '/api/event-students/change-password';
  const res = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Failed to change password.');
  }
  return json;
}

/**
 * Fetch complete student dashboard (profile, registrations, payments)
 * Filtered by EVENT_TYPE ('COLORS') and PAID payment status
 */
export async function fetchStudentDashboard(roll, typeCode = EVENT_TYPE, academicYear = EVENT_ACADEMIC_YEAR) {
  if (!roll) throw new Error('Student roll number is required');
  const cleanRoll = encodeURIComponent(roll.trim().toUpperCase());
  const queryParams = new URLSearchParams();
  if (typeCode) queryParams.set('typeCode', typeCode);
  if (academicYear) queryParams.set('academicYear', academicYear);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const endpoint = `/api/event-students/dashboard/${cleanRoll}${queryString}`;
  const res = await apiFetch(endpoint);

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || json.message || 'Failed to fetch dashboard data');
  }

  const json = await res.json();
  const rawData = json.data || json;

  // Filter registrations & payments strictly by EVENT_TYPE and PAID status
  const filteredRegistrations = (rawData.registrations || []).filter(
    (reg) => matchesTypeCode(reg, typeCode) && isPaidPayment(reg) && matchesAcademicYear(reg.academicYear || reg.academic_year, academicYear)
  );

  const filteredPayments = (rawData.payments || []).filter(
    (pay) => matchesTypeCode(pay, typeCode) && isPaidPayment(pay) && matchesAcademicYear(pay.academicYear || pay.academic_year, academicYear)
  );

  return {
    ...rawData,
    registrations: filteredRegistrations,
    payments: filteredPayments
  };
}

/**
 * Get all registrations made by a student
 */
export function getRegisteredEventsForStudent(studentRollOrId) {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (!studentRollOrId) return all;
    return all.filter(
      (r) =>
        r.studentId === studentRollOrId ||
        r.studentRoll?.toLowerCase() === studentRollOrId.toString().toLowerCase() ||
        r.roll?.toLowerCase() === studentRollOrId.toString().toLowerCase()
    );
  } catch {
    return [];
  }
}

/**
 * Check if student is already registered for a specific event
 */
export function isStudentRegisteredForEvent(studentRollOrId, eventIdOrTitle) {
  if (!studentRollOrId || !eventIdOrTitle) return null;
  const list = getRegisteredEventsForStudent(studentRollOrId);
  const target = eventIdOrTitle.toString().toLowerCase();
  return (
    list.find(
      (r) =>
        (r.eventId && r.eventId.toString().toLowerCase() === target) ||
        (r.eventName && r.eventName.toString().toLowerCase() === target) ||
        (r.title && r.title.toString().toLowerCase() === target)
    ) || null
  );
}

/**
 * Dynamically load Razorpay Checkout script if not already present
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Save confirmed registration into localStorage
 */
export function saveLocalRegistration(record) {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    const exists = all.some(
      (r) =>
        r.registrationNumber === record.registrationNumber ||
        (r.eventId === record.eventId && r.studentRoll === record.studentRoll)
    );
    if (!exists) {
      all.unshift(record);
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error('Failed to save registration locally:', err);
  }
}

/**
 * Step 1: Initiate student event registration and get Razorpay Order.
 * Note: Payment record is NOT stored into central_event_student_payments collection here.
 */
export async function initiateEventRegistration(payload) {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const localRegId = formatRegistrationId(randomDigits);

  const feeAmount = Number(payload.amount !== undefined ? payload.amount : payload.price || 0);
  const teamSize = payload.teamSize || (payload.isTeam && Array.isArray(payload.teamMembers) ? payload.teamMembers.length + 1 : 1);

  const requestBody = {
    eventId: payload.eventId || payload.rawId,
    eventSlug: payload.eventSlug || payload.slug,
    eventTitle: payload.eventName || payload.title,
    typeCode: EVENT_TYPE,
    participant: {
      name: payload.studentName,
      rollNumber: payload.studentRoll,
      email: payload.studentEmail,
      phone: payload.studentMobile,
      college: payload.studentCollege || 'Aditya University',
      department: payload.studentDepartment || 'General',
      year: payload.studentYear || '3rd Year'
    },
    teamName: payload.isTeam ? payload.teamName : null,
    teamSize,
    participants: Array.isArray(payload.participants) && payload.participants.length > 0 ? payload.participants : [],
    teamMembers: payload.isTeam && Array.isArray(payload.teamMembers) ? payload.teamMembers : [],
    fee: {
      amount: feeAmount,
      currency: 'INR'
    },
    academicYear: normalizeAcademicYear(EVENT_ACADEMIC_YEAR) || '2026-2027'
  };

  const res = await apiFetch('/api/central-event-registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || json.error || 'Failed to initiate event registration. Please try again.');
  }

  const backendData = json.data || {};
  const registrationNumber = backendData.registrationNumber || localRegId;
  const paymentReference = backendData.paymentReference || formatPaymentReference(registrationNumber);
  const rzpObj = backendData.razorpay || {};
  const orderId = rzpObj.orderId || backendData.orderId || null;
  const keyId =
    rzpObj.keyId ||
    backendData.keyId ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) ||
    'rzp_live_Kmh34Xa4jArEXT';
  const isFree = backendData.isFree || feeAmount === 0;
  const amountInPaise = rzpObj.amount || backendData.amountInPaise || feeAmount * 100;
  const currency = rzpObj.currency || backendData.currency || 'INR';

  return {
    success: true,
    registrationNumber,
    paymentReference,
    orderId,
    amount: feeAmount,
    amountInPaise,
    currency,
    keyId,
    isFree,
    registration: backendData.registration || null,
    razorpay: {
      orderId,
      keyId,
      amount: amountInPaise,
      currency
    }
  };
}

/**
 * Step 2: Verify Razorpay payment signature after successful checkout.
 * ONLY AT THIS STAGE: The payment record is inserted into central_event_student_payments collection!
 */
export async function verifyEventPaymentGateway(verifyPayload) {
  const res = await apiFetch('/api/central-event-payments/verify-gateway', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verifyPayload)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || 'Payment verification failed on server');
  }

  return json;
}

export async function submitEventRegistration(payload) {
  const initData = await initiateEventRegistration(payload);
  const feeAmount = Number(initData.amount);

  const record = {
    registrationId: initData.registrationNumber,
    registrationNumber: initData.registrationNumber,
    paymentReference: initData.paymentReference,
    orderId: initData.orderId,
    registeredAt: new Date().toISOString(),
    status: feeAmount === 0 ? 'CONFIRMED' : 'PENDING',
    paymentStatus: feeAmount === 0 ? 'FREE' : 'PENDING',
    ...payload,
    participants: initData.registration?.participants || payload.participants,
    teamSize: initData.registration?.teamSize || payload.teamSize,
    backendRegistration: initData.registration,
    backendPayment: null
  };

  if (feeAmount === 0) {
    saveLocalRegistration(record);
  }

  return record;
}

/**
 * Fetch registrations from backend central_event_student_registrations for a student
 * Filtered by EVENT_TYPE ('COLORS') and PAID payment status
 */
export async function syncStudentRegistrations(studentRoll, typeCode = EVENT_TYPE, academicYear = EVENT_ACADEMIC_YEAR) {
  if (!studentRoll) return [];
  try {
    const queryParams = new URLSearchParams();
    if (typeCode) queryParams.set('typeCode', typeCode);
    if (academicYear) queryParams.set('academicYear', academicYear);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiFetch(`/api/central-event-registrations/student/${studentRoll}${queryString}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data.filter(
          (reg) => matchesTypeCode(reg, typeCode) && isPaidPayment(reg) && matchesAcademicYear(reg.academicYear || reg.academic_year, academicYear)
        );
      }
    }
  } catch {
    // Graceful offline fallback
  }
  return [];
}

/**
 * Update squad participants for a registration (used by student leader in Dashboard)
 */
export async function updateEventParticipants(registrationNumber, participants, teamMembers = []) {
  if (!registrationNumber) throw new Error('Registration Number is required');
  const cleanRegNo = encodeURIComponent(registrationNumber.trim());
  const endpoint = `/api/event-students/registrations/${cleanRegNo}/participants`;
  const payload = { participants, teamMembers };

  const res = await apiFetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Failed to update participants');
  }

  // Also update local storage if present
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      const updated = all.map((r) => {
        if (
          r.registrationNumber === registrationNumber ||
          r.registrationId === registrationNumber ||
          r.paymentReference === registrationNumber
        ) {
          return {
            ...r,
            participants,
            teamMembers,
            teamSize: participants.length
          };
        }
        return r;
      });
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (localErr) {
    console.warn('Local registration update notice:', localErr.message);
  }

  return json;
}


