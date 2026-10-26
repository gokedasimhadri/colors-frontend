// API service for Colours 2027 events
// Dynamically fetches event types, categories, subcategories, and events

export const EVENT_TYPE =
  (typeof import.meta !== 'undefined' && (import.meta.env?.EVENT_TYPE || import.meta.env?.VITE_EVENT_TYPE)) ||
  (typeof process !== 'undefined' && (process.env?.EVENT_TYPE || process.env?.VITE_EVENT_TYPE)) ||
  'COLORS';

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:9022';

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
export const CATEGORY_ORDER = ['SPORTS', 'CULTURALS', 'CREO'];

export const SUBCATEGORY_ORDER = {
  'Sports & Games': [
    'Running',
    'Jumping & Throwing',
    'Volleyball',
    'Basketball',
    'Shuttle Badminton Singles',
    'Relay',
    'Football',
    'TenniKoit',
    'Kabaddi',
    'ThrowBall',
    'Chess',
    'Kho Kho',
    'Table Tennis Singles'
  ],
  'SPORTS': [
    'Running',
    'Jumping & Throwing',
    'Volleyball',
    'Basketball',
    'Shuttle Badminton Singles',
    'Relay',
    'Football',
    'TenniKoit',
    'Kabaddi',
    'ThrowBall',
    'Chess',
    'Kho Kho',
    'Table Tennis Singles'
  ],
  'Culturals Events': [
    'Singing',
    'Instrumental',
    'Mime',
    'Mono Action',
    'Stand-up Comedy',
    'Skit',
    'Dance',
    'Mimicry'
  ],
  'CULTURALS': [
    'Singing',
    'Instrumental',
    'Mime',
    'Mono Action',
    'Stand-up Comedy',
    'Skit',
    'Dance',
    'Mimicry'
  ],
  'Creo Events': [
    'Spot Painting',
    'Fashion Show',
    'Treasure Hunt',
    'Mehandi',
    'Movie Making',
    'Spot Photography',
    'Sahityam',
    'Dumb Charades',
    'Rangoli'
  ],
  'CREO': [
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

// Cached categories and events for subcategory/coordinator lookups
let cachedCategories = null;
let cachedEventsByType = {};

/**
 * Fetch all available fest themes / event types (e.g. COLORS, VEDA, ALA)
 */
export async function fetchThemes() {
  try {
    const endpoint = '/api/central-event-types';
    let res;
    try {
      res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    } catch {
      res = await fetch(`${API_BASE}${endpoint}`);
    }

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
export async function fetchAllEvents(typeCode = EVENT_TYPE) {
  const code = (typeCode || 'COLORS').toUpperCase();
  try {
    const endpoint = `/api/central-events?typeCode=${code}&limit=100`;
    let res;
    try {
      res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
    } catch {
      res = await fetch(`${API_BASE}${endpoint}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status}`);
    }

    const json = await res.json();
    const rawEvents = Array.isArray(json) ? json : json.data || [];
    const mapped = rawEvents.map((ev) => mapBackendEvent(ev));
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
export async function fetchCategoriesWithSubCategories(typeCode = EVENT_TYPE) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();
    const endpoint = `/api/central-event-types/${code}/categories`;

    // Concurrently fetch categories and live events for this theme
    let [catRes, allEvents] = await Promise.all([
      (async () => {
        try {
          const r = await fetch(endpoint);
          if (r.ok) return r;
        } catch {
          // fallback to API_BASE
        }
        return fetch(`${API_BASE}${endpoint}`);
      })(),
      fetchAllEvents(code).catch(() => [])
    ]);

    if (!catRes.ok) {
      throw new Error(`Failed to fetch categories: ${catRes.status}`);
    }

    const json = await catRes.json();
    const rawCategories = Array.isArray(json) ? json : json.data || [];

    const normalized = normalizeCategories(rawCategories, allEvents, code);
    cachedCategories = normalized;
    return sortCategoriesAndSubCategories(normalized);
  } catch (err) {
    console.error('Error fetching categories with subcategories:', err);
    throw err;
  }
}

/**
 * Normalize category objects from backend central_event_categories collection
 * Links subcategories with actual event counts and coordinator details
 */
function normalizeCategories(categories, allEvents = [], typeCode = 'COLORS') {
  if (!Array.isArray(categories)) return [];

  return categories.map((cat) => {
    const catCode = (cat.code || cat._id || '').toUpperCase();
    const catName = cat.name || catCode;

    // Filter events belonging to this category
    const catEvents = (allEvents || []).filter(
      (ev) =>
        (cat._id && String(ev.categoryId) === String(cat._id)) ||
        (ev.category && ev.category.toUpperCase() === catName.toUpperCase()) ||
        (ev.typeCode && ev.typeCode.toUpperCase() === typeCode.toUpperCase() && ev.categoryName === catName)
    );

    // Subcategories from backend
    let subList = Array.isArray(cat.subcategories) ? [...cat.subcategories] : [];

    // If subcategories are empty in DB but fest catalog defines them, provide fallback
    if (subList.length === 0 && cat.hasSubcategories !== false) {
      const fallbackList = SUBCATEGORY_ORDER[catName] || SUBCATEGORY_ORDER[catCode] || [];
      subList = fallbackList.map((subName, index) => ({
        _id: `fallback-${catCode.toLowerCase()}-${index}`,
        name: subName,
        code: subName.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
        isActive: true,
        sortOrder: index + 1,
        banner: null,
        coordinator: cat.coordinator || null,
        coordinators: cat.coordinators || []
      }));
    }

    // Format subcategories to standard shape compatible with existing UI
    const formattedData = subList.map((sub) => {
      const subName = sub.name || sub.SubCatogory || sub.code;
      const bannerUrl = sub.banner?.url || sub.Image || sub.image || null;

      // Find events belonging to this subcategory
      const subEvents = catEvents.filter((ev) => {
        if (sub._id && ev.subcategoryId && String(ev.subcategoryId) === String(sub._id)) {
          return true;
        }
        const evSub = (ev.subCategory || ev.subcategoryName || '').toLowerCase().trim();
        const curSub = (subName || '').toLowerCase().trim();
        return evSub === curSub || evSub.includes(curSub) || curSub.includes(evSub);
      });

      return {
        _id: sub._id,
        code: sub.code,
        name: subName,
        SubCatogory: subName, // compatibility alias
        banner: sub.banner,
        Image: bannerUrl,
        image: bannerUrl,
        coordinator: sub.coordinator,
        coordinators: sub.coordinators || (sub.coordinator ? [sub.coordinator] : []),
        sortOrder: sub.sortOrder ?? 0,
        eventCount: subEvents.length,
        events: subEvents
      };
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
      hasSubcategories: cat.hasSubcategories,
      data: formattedData,
      totalEventsCount: catEvents.length,
      events: catEvents
    };
  });
}

/**
 * Sort categories and their subcategories
 */
function sortCategoriesAndSubCategories(categories) {
  if (!Array.isArray(categories)) return [];

  // Sort categories according to sortOrder or CATEGORY_ORDER
  const sorted = [...categories].sort((a, b) => {
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

  // Sort subcategories inside each category
  return sorted.map((cat) => {
    const preferredOrder = SUBCATEGORY_ORDER[cat.name] || SUBCATEGORY_ORDER[cat.code] || [];
    const items = Array.isArray(cat.data) ? [...cat.data] : [];

    items.sort((a, b) => {
      if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number' && a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
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
 * Fetch events within a subcategory
 * Checks live backend central-events collection; falls back gracefully to fest events catalog
 */
export async function fetchEventsInSubCategory(category, subCategory, subcategoryId = null, typeCode = EVENT_TYPE) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();

    // 1. If we have cached events or can fetch all events for this theme
    let allEvents = cachedEventsByType[code];
    if (!allEvents || allEvents.length === 0) {
      allEvents = await fetchAllEvents(code);
    }

    if (Array.isArray(allEvents) && allEvents.length > 0) {
      const normSub = (subCategory || '').toLowerCase().trim();
      const normCat = (category || '').toLowerCase().trim();

      const filtered = allEvents.filter((ev) => {
        // Direct subcategoryId match
        if (subcategoryId && ev.subcategoryId && String(ev.subcategoryId) === String(subcategoryId)) {
          return true;
        }

        const evSub = (ev.subCategory || ev.subcategoryName || '').toLowerCase().trim();
        const evCat = (ev.category || ev.categoryName || '').toLowerCase().trim();

        const subMatches = evSub === normSub || (normSub && evSub.includes(normSub)) || (evSub && normSub.includes(evSub));
        if (subMatches) {
          // If category is provided, verify category matches too
          if (normCat) {
            const catMatches =
              evCat === normCat ||
              evCat.includes(normCat) ||
              normCat.includes(evCat) ||
              ev.category?.toLowerCase() === normCat;
            return catMatches;
          }
          return true;
        }

        return false;
      });

      if (filtered.length > 0) {
        return filtered;
      }
    }

    // 2. Direct backend query by subcategoryId if provided
    if (subcategoryId && !subcategoryId.startsWith('fallback-')) {
      try {
        let res;
        const endpoint = `/api/central-events?typeCode=${code}&subcategoryId=${subcategoryId}`;
        try {
          res = await fetch(endpoint);
        } catch {
          res = await fetch(`${API_BASE}${endpoint}`);
        }
        if (res && res.ok) {
          const json = await res.json();
          const live = Array.isArray(json) ? json : json.data || [];
          if (live.length > 0) {
            return live.map((ev) => mapBackendEvent(ev, category, subCategory));
          }
        }
      } catch (e) {
        console.warn('SubcategoryId query notice:', e.message);
      }
    }

    // 3. Fallback to catalog events if not registered yet
    return getCatalogEventsForSubCategory(category, subCategory);
  } catch (err) {
    console.error(`Error fetching events for ${category} / ${subCategory}:`, err);
    return getCatalogEventsForSubCategory(category, subCategory);
  }
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

  // In database, registration fee is stored in paise (amount * 100). Convert to Rupees for display.
  const rawPrice = ev.fee?.amount ?? 0;
  const rupeePrice = rawPrice >= 100 ? Math.round(rawPrice / 100) : rawPrice;

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
    typeCode: ev.typeCode || 'COLORS'
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
      eventName: `${normSub} Open Championship`,
      eventType: 'Solo / Team',
      price: 100,
      overview: `Official Aditya University competition for ${normSub}. Evaluated by certified national-level judges with cash rewards and university merit certificates.`,
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
 * Fetch detailed event information (rules, venue, price, overview)
 * Direct backend slug lookup or all-events match
 */
export async function fetchEventDetails(category, subCategory, eventNameOrSlug, typeCode = EVENT_TYPE) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();
    const queryTerm = (eventNameOrSlug || '').trim();

    // 1. Direct slug endpoint lookup (/api/central-events/:slug)
    try {
      const enc = encodeURIComponent(queryTerm);
      let res;
      try {
        res = await fetch(`/api/central-events/${enc}`);
      } catch {
        res = await fetch(`${API_BASE}/api/central-events/${enc}`);
      }

      if (res && res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return mapBackendEvent(json.data, category, subCategory);
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
    const events = getCatalogEventsForSubCategory(category, subCategory);
    const found = events.find(
      (e) => e.eventName.toLowerCase() === queryTerm.toLowerCase()
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
    console.error(`Error fetching event details for ${eventNameOrSlug}:`, err);
    throw err;
  }
}

/**
 * Fetch faculty coordinators for an event
 * Uses live coordinator data from central_event_categories or central-events
 */
export async function fetchFacultyCoordinators(category, subCategory, eventName, typeCode = EVENT_TYPE) {
  try {
    const code = (typeCode || 'COLORS').toUpperCase();

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
        // Check subcategory coordinator first
        const normSub = (subCategory || '').toLowerCase();
        const sub = (cat.data || []).find(
          (s) => (s.name || s.SubCatogory || '').toLowerCase() === normSub
        );

        if (sub && Array.isArray(sub.coordinators) && sub.coordinators.length > 0) {
          const valid = sub.coordinators.filter((c) => c && (c.name || c.empId || c.institutionId));
          if (valid.length > 0) {
            return valid.map((c, idx) => {
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

        if (sub?.coordinator && (sub.coordinator.name || sub.coordinator.empId || sub.coordinator.institutionId)) {
          const c = sub.coordinator;
          const instId = c.institutionId || c.empId || c.employeeId || '';
          return [
            {
              cordinatorName: c.name || 'Coordinator',
              cordinatorDesignation: c.designation || 'Faculty Coordinator',
              cordinatorPhone: c.phone || '',
              cordinatorEmail: c.email || '',
              empId: instId,
              institutionId: instId,
              cordinatorImage: instId ? `${instId}.jpg` : ''
            }
          ];
        }

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

    // Default faculty coordinators
    return [
      {
        cordinatorName: 'GOKEDA SIMHADRI',
        cordinatorDesignation: 'Web Developer / Coordinator',
        cordinatorPhone: '9553451345',
        cordinatorEmail: 'simhadri.g@adityauniversity.in',
        empId: '6981',
        institutionId: '6981',
        cordinatorImage: '6981.jpg'
      },
      {
        cordinatorName: 'MORTHA SRIKAR',
        cordinatorDesignation: 'Programmer / Fest Incharge',
        cordinatorPhone: '8978868851',
        cordinatorEmail: 'srikar@gmail.com',
        empId: '6607',
        institutionId: '6607',
        cordinatorImage: '6607.jpg'
      }
    ];
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
    console.error('Error fetching student coordinators:', err);
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
    const res = await fetch(`/api/central-events/check-student/${encodeURIComponent(clean)}${qs}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    try {
      const res = await fetch(`${API_BASE}/api/central-events/check-student/${encodeURIComponent(clean)}${qs}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
  }
  return { exists: false, student: null, alreadyRegisteredForEvent: false };
}

/**
 * Register a student account via /api/event-students/register
 */
export async function registerStudentAccount(studentData) {
  const endpoint = '/api/event-students/register';
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
  } catch {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
  }

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
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  } catch {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Login failed. Please check your credentials.');
  }

  const student = json.student || json.data;
  setLoggedStudent(student);
  return student;
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

export async function submitEventRegistration(payload) {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const localRegId = `CLR27-COLORS-${randomDigits}`;

  const feeAmount = Number(payload.amount !== undefined ? payload.amount : payload.price || 0);

  const requestBody = {
    eventId: payload.eventId || payload.rawId,
    eventSlug: payload.eventSlug || payload.slug,
    eventTitle: payload.eventName || payload.title,
    typeCode: 'COLORS',
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
    teamMembers: payload.isTeam && Array.isArray(payload.teamMembers) ? payload.teamMembers : [],
    fee: {
      amount: feeAmount,
      currency: 'INR'
    },
    academicYear: '2026-27'
  };

  let backendData = null;
  try {
    const url = `${API_BASE}/api/central-event-registrations`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        backendData = json.data;
      }
    } else {
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message && errJson.message.toLowerCase().includes('already registered')) {
        // Return existing registration if duplicate
        if (errJson.data?.registration) {
          backendData = errJson.data;
        }
      }
    }
  } catch (err) {
    console.warn('Backend central event registration sync note:', err.message);
  }

  const registrationNumber = backendData?.registrationNumber || backendData?.registration?.registrationNumber || localRegId;
  const paymentReference = backendData?.paymentReference || backendData?.payment?.paymentReference || `PAY-${registrationNumber}`;
  const razorpayOrderId = backendData?.orderId || backendData?.payment?.razorpay?.orderId || null;

  const record = {
    registrationId: registrationNumber,
    registrationNumber,
    paymentReference,
    orderId: razorpayOrderId,
    registeredAt: new Date().toISOString(),
    status: 'CONFIRMED',
    ...payload,
    backendRegistration: backendData?.registration,
    backendPayment: backendData?.payment
  };

  // Persist to local student registrations cache
  try {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    // Only add if not already present
    const exists = all.some(r => r.registrationNumber === registrationNumber || (r.eventId === payload.eventId && r.studentRoll === payload.studentRoll));
    if (!exists) {
      all.push(record);
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(all));
    }
  } catch (err) {
    console.error('Failed to save registration locally:', err);
  }

  return record;
}

/**
 * Fetch registrations from backend central_event_student_registrations for a student
 */
export async function syncStudentRegistrations(studentRoll) {
  if (!studentRoll) return [];
  try {
    const res = await fetch(`${API_BASE}/api/central-event-registrations/student/${studentRoll}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Graceful offline fallback
  }
  return [];
}

