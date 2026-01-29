const avatarBtn = document.getElementById('avatarBtn');
const avatarModal = document.getElementById('avatarModal');
const avatarGrid = document.getElementById('avatarGrid');
const avatarImg = document.getElementById('avatarImg');
const avatarUpload = document.getElementById('avatarUpload');
const transportCard = document.getElementById('transportCard');
const categoryCard = document.getElementById('categoryCard');
const transportModal = document.getElementById('transportModal');
const categoryModal = document.getElementById('categoryModal');
const transportList = document.getElementById('transportList');
const categoryGrid = document.getElementById('categoryGrid');
const tripPlaces = document.getElementById('tripPlaces');
const walkRouteBtn = document.getElementById('walkRouteBtn');
const settingsPhoneInput = document.getElementById('settingsPhoneInput');
const settingsPhoneCodeInput = document.getElementById('settingsPhoneCodeInput');
const sendSmsBtn = document.getElementById('sendSmsBtn');
const confirmSmsBtn = document.getElementById('confirmSmsBtn');
const settingsPasswordInput = document.getElementById('settingsPasswordInput');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const verifyEmailBtn = document.getElementById('verifyEmailBtn');
const pushToggleBtn = document.getElementById('pushToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');
const locationModal = document.getElementById('locationModal');
const allowLocationBtn = document.getElementById('allowLocationBtn');
const locationInput = document.getElementById('locationInput');
const mapDescription = document.getElementById('mapDescription');
const userName = document.getElementById('userName');
const mapEl = document.getElementById('map');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const shareToggle = document.getElementById('shareToggle');
const contactInput = document.getElementById('contactInput');
const addContactBtn = document.getElementById('addContactBtn');
const contactList = document.getElementById('contactList');
const liveStatus = document.getElementById('liveStatus');
const destinationInput = document.getElementById('destinationInput');
const suggestList = document.getElementById('suggestList');
const suggestionsHint = document.getElementById('suggestionsHint');
const safetyNote = document.getElementById('safetyNote');
const notifBar = document.getElementById('notifBar');
const openShareModal = document.getElementById('openShareModal');
const shareModal = document.getElementById('shareModal');
const requestModal = document.getElementById('requestModal');
const requestText = document.getElementById('requestText');
const acceptRequestBtn = document.getElementById('acceptRequestBtn');
const denyRequestBtn = document.getElementById('denyRequestBtn');
const modeButtons = document.querySelectorAll('[data-route-mode]');
const prefsModal = document.getElementById('prefsModal');
const nameInput = document.getElementById('nameInput');
const savePrefsBtn = document.getElementById('savePrefsBtn');
const etaLabel = document.getElementById('etaLabel');

const LIVE_KEY = 'navify-live-contacts';
const CONTACT_KEY = 'navify-contacts';
const NAME_KEY = 'navify-name';
const FAVORITES_KEY = 'navify-favorites';

avatarBtn?.addEventListener('click', () => openModal(avatarModal));
transportCard?.addEventListener('click', () => openModal(transportModal));
categoryCard?.addEventListener('click', () => openModal(categoryModal));
openShareModal?.addEventListener('click', () => openModal(shareModal));
menuBtn?.addEventListener('click', () => {
  openModal(menuModal);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal(avatarModal);
    closeModal(transportModal);
    closeModal(categoryModal);
    closeModal(locationModal);
    closeModal(shareModal);
    closeModal(requestModal);
    closeModal(prefsModal);
    closeModal(menuModal);
  }
});

const avatarOptions = [
  'https://i.pravatar.cc/150?img=32',
  'https://i.pravatar.cc/150?img=15',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=22',
  'https://i.pravatar.cc/150?img=36'
];

function setAvatar(src) {
  if (avatarImg) avatarImg.src = src;
  closeModal(avatarModal);
}

if (avatarGrid) {
  avatarOptions.forEach((src) => {
    const button = document.createElement('button');
    button.className = 'avatar-option';
    button.innerHTML = `<img src="${src}" alt="Avatar" />`;
    button.addEventListener('click', () => setAvatar(src));
    avatarGrid.appendChild(button);
  });
}

avatarUpload?.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setAvatar(String(reader.result));
  reader.readAsDataURL(file);
});

if (avatarImg) {
  avatarImg.src = avatarOptions[0];
}

let transportOptions = [
  { name: '🏠 Home', detail: 'Go back to where you stay most of the time.' },
  { name: '💼 Work / Office', detail: 'Daily commute or side hustles.' },
  { name: '🎓 School / Campus', detail: 'Classes, review spots, and campus meet-ups.' },
  { name: '❤️ Partner / Best friend', detail: 'Someone important you often visit.' },
  { name: '🏬 Favorite mall / hangout', detail: 'Your usual place for food, movies, or chill time.' }
];

const categoryOptions = [
  'Beach trips',
  'City night walks',
  'Food trips',
  'Mall days',
  'Family day out',
  'Commute to work',
  'Study sessions',
  'Weekend getaways'
];

// Merge any saved favorites into the in-memory list on load
const storedFavorites = loadFavoritePlaces();
if (storedFavorites.length) {
  transportOptions = transportOptions.concat(storedFavorites);
}

function loadFavoritePlaces() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function saveFavoritePlaces(list) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

function renderTransport() {
  if (!transportList) return;
  transportList.innerHTML = '';
  transportOptions.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'transport-item';
    div.innerHTML = `<span>${item.name}</span><span>${item.detail}</span>`;
    div.addEventListener('click', () => {
      if (mapDescription) {
        mapDescription.textContent = `${item.name} saved as a favorite place · use the map to set the exact spot.`;
      }
      closeModal(transportModal);
    });
    transportList.appendChild(div);
  });
}

function renderCategories() {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = '';
  categoryOptions.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.textContent = item;
    div.addEventListener('click', () => {
      if (mapDescription) {
        mapDescription.textContent = `${item} · themes for places you want to visit with friends or family.`;
      }
      renderTripPlaces(item);
    });
    categoryGrid.appendChild(div);
  });
}

renderTransport();
renderCategories();

let map = null;
let userMarker = null;
let watchId = null;
let sharingOn = false;
let routeLine = null;
let altRouteLine = null;
let trafficSegments = [];
let arrowMarkers = [];
let guideOn = true;
let ideaMarkers = [];
let currentMode = 'walk';
let routingControl = null;
let lastDistanceKm = null;
let lastProximityAlertAt = 0;
let lastProximityContact = '';
let lastRouteTarget = null;
let pushEnabled = false;

const tripIdeaSets = {
  'Beach trips': [
    {
      name: 'Laiya Beach',
      location: 'San Juan, Batangas',
      hours: 'Resorts usually 24 hours, day tours 7:00-17:00',
      rating: '4.5',
      lat: 13.679,
      lng: 121.406,
      image: 'https://source.unsplash.com/featured/?beach,philippines'
    },
    {
      name: 'White Beach Station 2',
      location: 'Boracay, Aklan',
      hours: 'Open areas all day, shops vary',
      rating: '4.8',
      lat: 11.959,
      lng: 121.93,
      image: 'https://source.unsplash.com/featured/?boracay,beach'
    }
  ],
  'City night walks': [
    {
      name: 'Bonifacio High Street',
      location: 'Taguig, Metro Manila',
      hours: 'Most shops 10:00-22:00',
      rating: '4.6',
      lat: 14.5506,
      lng: 121.0537,
      image: 'https://source.unsplash.com/featured/?city,night,philippines'
    },
    {
      name: 'Roxas Boulevard Baywalk',
      location: 'Manila',
      hours: 'Public area, most active late afternoon to night',
      rating: '4.4',
      lat: 14.574,
      lng: 120.979,
      image: 'https://source.unsplash.com/featured/?manila,baywalk'
    }
  ],
  'Food trips': [
    {
      name: 'Maginhawa Food Street',
      location: 'Quezon City',
      hours: 'Many spots 11:00-23:00',
      rating: '4.5',
      lat: 14.645,
      lng: 121.058,
      image: 'https://source.unsplash.com/featured/?food,street,philippines'
    },
    {
      name: 'Larsian BBQ',
      location: 'Cebu City',
      hours: 'Late afternoon to late night',
      rating: '4.3',
      lat: 10.309,
      lng: 123.893,
      image: 'https://source.unsplash.com/featured/?bbq,cebu'
    }
  ],
  'Mall days': [
    {
      name: 'SM Mall of Asia',
      location: 'Pasay, Metro Manila',
      hours: 'Usually 10:00-22:00',
      rating: '4.6',
      lat: 14.535,
      lng: 120.982,
      image: 'https://source.unsplash.com/featured/?mall,asia,philippines'
    },
    {
      name: 'Ayala Center Cebu',
      location: 'Cebu City',
      hours: 'Usually 10:00-21:00',
      rating: '4.5',
      lat: 10.317,
      lng: 123.906,
      image: 'https://source.unsplash.com/featured/?mall,cebu'
    }
  ],
  'Family day out': [
    {
      name: 'Rizal Park (Luneta)',
      location: 'Ermita, Manila',
      hours: 'Typically 6:00-21:00',
      rating: '4.5',
      lat: 14.582,
      lng: 120.979,
      image: 'https://source.unsplash.com/featured/?park,manila'
    },
    {
      name: "People's Park",
      location: 'Davao City',
      hours: 'Afternoon to evening (check local schedule)',
      rating: '4.4',
      lat: 7.071,
      lng: 125.6,
      image: 'https://source.unsplash.com/featured/?park,davao'
    }
  ],
  'Commute to work': [
    {
      name: 'Ortigas Center',
      location: 'Pasig/Mandaluyong',
      hours: 'Office hours, weekdays most busy',
      rating: '4.3',
      lat: 14.586,
      lng: 121.061,
      image: 'https://source.unsplash.com/featured/?ortigas,skyline'
    },
    {
      name: 'Makati CBD',
      location: 'Makati City',
      hours: 'Office hours, malls up to late evening',
      rating: '4.6',
      lat: 14.554,
      lng: 121.024,
      image: 'https://source.unsplash.com/featured/?makati,city'
    }
  ],
  'Study sessions': [
    {
      name: 'UP Diliman Oval',
      location: 'Quezon City',
      hours: 'Campus hours, check local guidelines',
      rating: '4.7',
      lat: 14.655,
      lng: 121.064,
      image: 'https://source.unsplash.com/featured/?university,philippines'
    },
    {
      name: 'Cafe study spots (BGC)',
      location: 'Taguig, Metro Manila',
      hours: 'Most cafes 9:00-21:00',
      rating: '4.5',
      lat: 14.553,
      lng: 121.048,
      image: 'https://source.unsplash.com/featured/?coffee,shop,philippines'
    }
  ],
  'Weekend getaways': [
    {
      name: 'Tagaytay Ridge',
      location: 'Tagaytay City',
      hours: 'Viewpoints open most of the day',
      rating: '4.6',
      lat: 14.11,
      lng: 120.94,
      image: 'https://source.unsplash.com/featured/?tagaytay,view'
    },
    {
      name: 'Baguio Session Road',
      location: 'Baguio City',
      hours: 'Shops and cafes from morning to late evening',
      rating: '4.6',
      lat: 16.412,
      lng: 120.596,
      image: 'https://source.unsplash.com/featured/?baguio,city'
    }
  ]
};

function getContacts() {
  return JSON.parse(localStorage.getItem(CONTACT_KEY) || '[]');
}

function setContacts(list) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(list));
}

function getLiveData() {
  return JSON.parse(localStorage.getItem(LIVE_KEY) || '{}');
}

function setLiveData(data) {
  localStorage.setItem(LIVE_KEY, JSON.stringify(data));
}

function initMap() {
  if (!mapEl || map || typeof L === 'undefined') return;
  map = L.map(mapEl, { zoomControl: true }).setView([14.5995, 120.9842], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);
  map.on('click', (e) => {
    if (destinationInput) {
      destinationInput.value = `Lat ${e.latlng.lat.toFixed(4)}, Lng ${e.latlng.lng.toFixed(4)}`;
    }
    const target = { lat: e.latlng.lat, lng: e.latlng.lng, label: 'Selected location' };
    localStorage.setItem('navify-guide-target', JSON.stringify(target));
    drawRoute(target.lat, target.lng, true);
    if (mapDescription) {
      mapDescription.textContent = 'Destination set from map. Tap "Guide me there" to open guide mode.';
    }
  });
}

function clearIdeaMarkers() {
  if (!map) return;
  ideaMarkers.forEach((m) => map.removeLayer(m));
  ideaMarkers = [];
}

function showPlaceOnMap(place) {
  if (!place) return;
  if (!map) initMap();
  if (!map) return;
  clearIdeaMarkers();
  const marker = L.marker([place.lat, place.lng]).addTo(map);
  ideaMarkers.push(marker);
  map.setView([place.lat, place.lng], 15, { animate: true });
  if (destinationInput) {
    destinationInput.value = `${place.name} - ${place.location}`;
  }
  if (mapDescription) {
    mapDescription.textContent = `Previewing ${place.name}. Turn on location to see how long it takes to get there.`;
  }
  if (userMarker) {
    drawRoute(place.lat, place.lng, true);
  }
}

function haversineDistanceKm(a, b) {
  const R = 6371; // km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
}

function estimateEtaMinutes(distanceKm) {
  const speeds = { walk: 5 };
  const speed = speeds.walk;
  return (distanceKm / speed) * 60;
}

function updateEtaLabel() {
  if (!etaLabel || lastDistanceKm == null) {
    if (etaLabel) etaLabel.textContent = 'ETA: --';
    return;
  }
  const eta = estimateEtaMinutes(lastDistanceKm);
  const modeLabel = 'Walk';
  etaLabel.textContent = `ETA: ~${Math.round(eta)} min ${modeLabel}`;
}

function checkNearbyFriends() {
  if (!userMarker || !notifBar) return;
  const me = userMarker.getLatLng();
  const live = getLiveData();
  const contacts = getContacts();
  let bestEmail = null;
  let bestDist = Infinity;

  contacts.forEach((email) => {
    const info = live[email];
    if (!info) return;
    const d = haversineDistanceKm(
      { lat: me.lat, lng: me.lng },
      { lat: info.lat, lng: info.lng }
    );
    if (d < bestDist) {
      bestDist = d;
      bestEmail = email;
    }
  });

  const thresholdKm = 3;
  const now = Date.now();
  if (bestEmail && bestDist <= thresholdKm &&
      (bestEmail !== lastProximityContact || now - lastProximityAlertAt > 60000)) {
    lastProximityAlertAt = now;
    lastProximityContact = bestEmail;
    const label = bestEmail.split('@')[0];
    const span = notifBar.querySelector('span:nth-child(2)');
    if (span) {
      span.textContent = `${label} is about ${bestDist.toFixed(1)} km from you. Open the map and start a route if you want to meet up.`;
    }
    if (pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Navify • Friend nearby', {
          body: `${label} is about ${bestDist.toFixed(1)} km from you. Tap to open Navify.`,
        });
      } catch (_) {
        // Ignore notification errors
      }
    }
  }
}

function drawRoute(toLat, toLng, safe = true) {
  if (!map || !userMarker || !L.Routing) return;
  const from = userMarker.getLatLng();

  // Clear any previous route and overlays
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
  if (altRouteLine) {
    map.removeLayer(altRouteLine);
    altRouteLine = null;
  }
  trafficSegments.forEach((seg) => map.removeLayer(seg));
  trafficSegments = [];
  arrowMarkers.forEach((m) => map.removeLayer(m));
  arrowMarkers = [];

  const target = { lat: toLat, lng: toLng };
  lastRouteTarget = target;

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(from.lat, from.lng),
      L.latLng(target.lat, target.lng)
    ],
    lineOptions: {
      styles: [
        {
          color: '#4285f4',
          weight: 6,
          opacity: 0.96,
          dashArray: guideOn ? '6 6' : '0'
        }
      ]
    },
    addWaypoints: false,
    draggableWaypoints: false,
    routeWhileDragging: false,
    fitSelectedRoutes: true,
    show: false,
    createMarker() {
      return null;
    }
  }).addTo(map);

  routingControl.on('routesfound', (e) => {
    const route = e.routes && e.routes[0];
    if (!route) return;

    // Coordinates that follow the real road
    const coords = route.coordinates.map((c) => [c.lat, c.lng]);
    const n = coords.length - 1;
    if (n <= 0) return;

    // Simulated traffic overlay along the road path
    const greenEnd = Math.max(1, Math.floor(n * 0.4));
    const yellowEnd = Math.max(greenEnd + 1, Math.floor(n * 0.7));

    function addTrafficSegment(fromIdx, toIdx, color) {
      if (toIdx <= fromIdx) return;
      const seg = L.polyline(coords.slice(fromIdx, toIdx + 1), {
        color,
        weight: 4,
        opacity: 0.9
      }).addTo(map);
      trafficSegments.push(seg);
    }

    addTrafficSegment(0, greenEnd, '#3ddc84');
    addTrafficSegment(greenEnd, yellowEnd, '#f7b500');
    addTrafficSegment(yellowEnd, n, '#ff5d5d');

    const arrowPositions = [0.2, 0.5, 0.8];
    arrowPositions.forEach((t) => {
      const idx = Math.min(n, Math.max(0, Math.floor(n * t)));
      const [lat, lng] = coords[idx];
      const arrow = L.marker([lat, lng], {
        icon: L.divIcon({ className: 'route-arrow', html: '➤' })
      }).addTo(map);
      arrowMarkers.push(arrow);
    });

    const distanceKm = route.summary && route.summary.totalDistance
      ? route.summary.totalDistance / 1000
      : haversineDistanceKm({ lat: from.lat, lng: from.lng }, target);
    lastDistanceKm = distanceKm;
    const eta = estimateEtaMinutes(distanceKm);
    const modeLabel = 'walking';

    if (safetyNote) {
      safetyNote.textContent = `${safe
        ? 'Traffic: Green = clear, Yellow = moderate, Red = heavy (simulated).'
        : 'Traffic: Yellow/Red segments detected (simulated).'} Approx. ${Math.round(eta)} min ${modeLabel} (${distanceKm.toFixed(1)} km).`;
    }
    if (notifBar) {
      notifBar.querySelector('span:nth-child(2)').textContent = safe
        ? 'Route set • Best road path selected.'
        : 'Route set • Alternate road path (caution).';
    }
    updateEtaLabel();
  });

  routingControl.on('routingerror', () => {
    if (safetyNote) {
      safetyNote.textContent = 'Unable to find a road route. Try a nearby point.';
    }
    lastDistanceKm = null;
    updateEtaLabel();
  });
}

function pickRouteTarget(label) {
  if (!userMarker) return null;
  const base = userMarker.getLatLng();
  const hash = label.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const off = ((hash % 10) - 5) * 0.001;
  return { lat: base.lat + off, lng: base.lng - off };
 }

function updateUserLocation(lat, lng) {
  if (!map) return;
  if (!userMarker) {
    userMarker = L.marker([lat, lng]).addTo(map);
  } else {
    userMarker.setLatLng([lat, lng]);
  }
  map.setView([lat, lng], 15, { animate: true });

  if (sharingOn) {
    const live = getLiveData();
    live.me = { lat, lng, updatedAt: Date.now(), label: 'You' };
    setLiveData(live);
    renderContacts();
  }
}

function requestLocation() {
  if (!navigator.geolocation) {
    if (locationInput) locationInput.value = 'Location not supported';
    return;
  }
  initMap();
  if (watchId) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (locationInput) locationInput.value = `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`;
      if (mapDescription) mapDescription.textContent = 'Live location active. Showing nearby transport hubs in the Philippines.';
      updateUserLocation(latitude, longitude);
    },
    () => {
      if (locationInput) locationInput.value = 'Permission denied';
      if (mapDescription) mapDescription.textContent = 'Enable location to see nearby transport options.';
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

allowLocationBtn?.addEventListener('click', () => {
  closeModal(locationModal);
  requestLocation();
});

if (locationModal) {
  openModal(locationModal);
}

savePrefsBtn?.addEventListener('click', () => {
  const name = nameInput?.value.trim() || 'Traveler';
  if (userName) userName.textContent = name;
  localStorage.setItem(NAME_KEY, name);
  closeModal(prefsModal);
});

// Ensure the map is visible even before location is allowed
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});

function addContact() {
  const email = contactInput?.value.trim();
  if (!email) return;
  const contacts = getContacts();
  if (!contacts.includes(email)) {
    contacts.push(email);
    setContacts(contacts);
  }
  if (contactInput) contactInput.value = '';
  renderContacts();
  closeModal(shareModal);
}

addContactBtn?.addEventListener('click', addContact);

shareToggle?.addEventListener('click', () => {
  sharingOn = !sharingOn;
  shareToggle.textContent = sharingOn ? 'Share: On' : 'Share: Off';
  if (liveStatus) {
    liveStatus.textContent = sharingOn
      ? 'Live updates on — your circle can see your status'
      : 'Live updates are off';
  }
  if (sharingOn) {
    requestLocation();
  }
});

setInterval(() => {
  if (!sharingOn) return;
  const live = getLiveData();
  const contacts = getContacts();
  contacts.forEach((email, idx) => {
    const jitter = (idx + 1) * 0.0004;
    live[email] = live[email] || { lat: 14.5995, lng: 120.9842 };
    live[email].lat = live[email].lat + (Math.random() - 0.5) * jitter;
    live[email].lng = live[email].lng + (Math.random() - 0.5) * jitter;
    live[email].updatedAt = Date.now();
  });
  setLiveData(live);
  renderContacts();
  checkNearbyFriends();
}, 15000);

renderContacts();

const suggestionSets = {
  manila: ['Rizal Park', 'Intramuros', 'National Museum', 'SM Mall of Asia', 'Luneta safe stop'],
  cebu: ['Magellan’s Cross', 'IT Park', 'Ayala Center Cebu', 'Carbon Market', 'Fuente Osmeña Circle'],
  davao: ['People’s Park', 'Roxas Night Market', 'SM Lanang', 'Eden Nature Park', 'Matina Town Square'],
  default: ['Nearest barangay hall', 'Police assistance desk', '24/7 convenience stop', 'Transport terminal', 'Safe waiting area']
};

function renderSuggestions(key) {
  if (!suggestList) return;
  suggestList.innerHTML = '';
  const list = suggestionSets[key] || suggestionSets.default;
  list.forEach((item, idx) => {
    const chip = document.createElement('div');
    chip.className = 'suggest-chip';
    chip.textContent = item;
    chip.addEventListener('click', () => {
      const target = pickRouteTarget(item);
      if (!target) return;
      const safe = idx % 2 === 0;
      drawRoute(target.lat, target.lng, safe);
      if (mapDescription) {
        mapDescription.textContent = `Routing to ${item} — ${safe ? 'safe' : 'caution'} path.`;
      }
    });
    suggestList.appendChild(chip);
  });
}

function updateSuggestions() {
  const value = (destinationInput?.value || '').toLowerCase();
  let key = 'default';
  if (value.includes('manila') || value.includes('metro')) key = 'manila';
  if (value.includes('cebu')) key = 'cebu';
  if (value.includes('davao')) key = 'davao';
  renderSuggestions(key);
  if (suggestionsHint) {
    suggestionsHint.textContent = key === 'default'
      ? 'Suggestions based on your live location and destination.'
      : `Popular and safe stops near ${key.toUpperCase()}.`;
  }
}

destinationInput?.addEventListener('input', updateSuggestions);
updateSuggestions();

function renderTripPlaces(category) {
  if (!tripPlaces) return;
  tripPlaces.innerHTML = '';
  const places = tripIdeaSets[category];
  if (!places || !places.length) {
    const empty = document.createElement('div');
    empty.className = 'map-description';
    empty.textContent = 'Pick a trip idea to see sample places with photos, hours, and ratings.';
    tripPlaces.appendChild(empty);
    return;
  }
  places.forEach((place) => {
    const card = document.createElement('div');
    card.className = 'trip-place-card';

    const img = document.createElement('img');
    img.className = 'trip-place-image';
    img.src = place.image;
    img.alt = place.name;

    const main = document.createElement('div');
    main.className = 'trip-place-main';

    const nameEl = document.createElement('div');
    nameEl.className = 'trip-place-name';
    nameEl.textContent = place.name;

    const meta = document.createElement('div');
    meta.className = 'trip-place-meta';
    meta.textContent = `${place.location} • Hours: ${place.hours} • Rating: ${place.rating}/5 (community)`;

    const actions = document.createElement('div');
    actions.className = 'trip-place-actions';

    const travelBtn = document.createElement('button');
    travelBtn.className = 'button ghost trip-view-btn';
    travelBtn.type = 'button';
    travelBtn.textContent = 'Travel here';
    travelBtn.addEventListener('click', () => {
      showPlaceOnMap(place);
      closeModal(categoryModal);
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'button trip-view-btn';
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save to favorites';
    saveBtn.addEventListener('click', () => {
      const current = loadFavoritePlaces();
      if (!current.some((f) => f.name === place.name)) {
        const entry = {
          name: place.name,
          detail: `${place.location} • from Trip Ideas`
        };
        current.push(entry);
        saveFavoritePlaces(current);
        transportOptions.push(entry);
        renderTransport();
        if (mapDescription) {
          mapDescription.textContent = `${place.name} added to Favorite places.`;
        }
      }
    });

    actions.appendChild(travelBtn);
    actions.appendChild(saveBtn);
    main.appendChild(nameEl);
    main.appendChild(meta);
    main.appendChild(actions);

    card.appendChild(img);
    card.appendChild(main);
    tripPlaces.appendChild(card);
  });
}

// Guide is always on now; clicking the map after choosing a point
// can take the user into the guide experience without extra buttons.

function simulateIncomingRequest() {
  if (!requestModal) return;
  const sampleEmails = ['ate.maria@gmail.com', 'kuya.jay@family.ph', 'friend.lia@gmail.com'];
  const pick = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
  if (requestText) requestText.textContent = `${pick} wants to join your Trusted Circle.`;
  openModal(requestModal);
}

acceptRequestBtn?.addEventListener('click', () => {
  const text = requestText?.textContent || '';
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  if (emailMatch) {
    const contacts = getContacts();
    if (!contacts.includes(emailMatch[0])) {
      contacts.push(emailMatch[0]);
      setContacts(contacts);
    }
  }
  closeModal(requestModal);
  renderContacts();
});

denyRequestBtn?.addEventListener('click', () => {
  closeModal(requestModal);
});

setTimeout(simulateIncomingRequest, 6000);

if (userName) {
  const storedName = localStorage.getItem(NAME_KEY);
  userName.textContent = storedName || 'Traveler';
}

if (typeof navifyOnAuth === 'function') {
  navifyOnAuth((user) => {
    if (!user) {
      window.location.href = 'index.html';
    }
  });
}

updateEtaLabel();

if (modeButtons && modeButtons.length) {
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = 'walk';
      if (mapDescription) {
        mapDescription.textContent = 'Walking mode • See safe walking paths and nearby stops to your destination.';
      }
      updateEtaLabel();
    });
  });
}

walkRouteBtn?.addEventListener('click', () => {
  currentMode = 'walk';
  if (modeButtons && modeButtons.length) {
    modeButtons.forEach((b) => {
      if (b.dataset.routeMode === 'walk') b.classList.add('active');
      else b.classList.remove('active');
    });
  }
  const storedTarget = localStorage.getItem('navify-guide-target');
  let parsedTarget = null;
  if (storedTarget) {
    try {
      parsedTarget = JSON.parse(storedTarget);
    } catch (error) {
      parsedTarget = null;
    }
  }
  const target = lastRouteTarget || parsedTarget;
  if (!target) {
    if (mapDescription) {
      mapDescription.textContent = 'Tap on the map or choose a Trip idea first, then press "Guide me there".';
    }
    updateEtaLabel();
    return;
  }
  const trimmedLabel = destinationInput?.value.trim();
  const label = trimmedLabel || target.label || 'Destination';
  localStorage.setItem('navify-guide-target', JSON.stringify({ lat: target.lat, lng: target.lng, label }));
  window.location.href = 'guide.html';
});

function initPushToggle() {
  if (!pushToggleBtn) return;
  const stored = localStorage.getItem('navify-push');
  pushEnabled = stored === 'on';
  pushToggleBtn.textContent = pushEnabled ? 'Push notifications: On' : 'Push notifications: Off';
  pushToggleBtn.addEventListener('click', async () => {
    if (!window.isSecureContext) {
      alert('Push notifications require HTTPS or localhost.');
      return;
    }
    if (!('Notification' in window)) {
      alert('Push notifications are not supported on this device or browser.');
      return;
    }
    if (Notification.permission === 'granted') {
      pushEnabled = !pushEnabled;
      localStorage.setItem('navify-push', pushEnabled ? 'on' : 'off');
      pushToggleBtn.textContent = pushEnabled ? 'Push notifications: On' : 'Push notifications: Off';
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      pushEnabled = true;
      localStorage.setItem('navify-push', 'on');
      pushToggleBtn.textContent = 'Push notifications: On';
    } else {
      pushEnabled = false;
      localStorage.setItem('navify-push', 'off');
      pushToggleBtn.textContent = 'Push notifications: Off';
    }
  });
}

initPushToggle();

function initMenuPanels() {
  const toggles = document.querySelectorAll('[data-panel-toggle]');
  toggles.forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    const selector = btn.getAttribute('data-panel-toggle');
    const panel = selector ? document.querySelector(selector) : null;
    if (!panel) return;
    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
    });
  });
}

initMenuPanels();

document.addEventListener('click', (e) => {
  const target = e.target.closest && e.target.closest('[data-panel-toggle]');
  if (!target) return;
  const selector = target.getAttribute('data-panel-toggle');
  const panel = selector ? document.querySelector(selector) : null;
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  target.classList.toggle('open', isOpen);
});

sendSmsBtn?.addEventListener('click', async () => {
  if (!settingsPhoneInput) return;
  const phone = settingsPhoneInput.value.trim();
  if (!phone) {
    alert('Enter a phone number first.');
    return;
  }
  if (!window.navifyStartPhoneVerification) {
    alert('Phone verification is not available.');
    return;
  }
  try {
    await navifyStartPhoneVerification(phone, 'recaptcha-container');
    alert('Verification code sent. Check your SMS messages.');
  } catch (err) {
    alert('Could not start phone verification: ' + (err && err.message ? err.message : err));
  }
});

confirmSmsBtn?.addEventListener('click', async () => {
  if (!settingsPhoneCodeInput) return;
  const code = settingsPhoneCodeInput.value.trim();
  if (!code) {
    alert('Enter the SMS code you received.');
    return;
  }
  if (!window.navifyConfirmPhoneCode) {
    alert('Phone verification is not available.');
    return;
  }
  try {
    const user = await navifyConfirmPhoneCode(code);
    const phone = settingsPhoneInput?.value.trim() || '';
    if (phone) {
      localStorage.setItem('navify-phone', phone);
    }
    alert('Phone number verified for this account.');
    if (mapDescription) {
      mapDescription.textContent = 'Phone number verified. Your account is more secure.';
    }
  } catch (err) {
    alert('Could not verify code: ' + (err && err.message ? err.message : err));
  }
});

changePasswordBtn?.addEventListener('click', async () => {
  if (!settingsPasswordInput) return;
  const newPw = settingsPasswordInput.value.trim();
  if (!newPw || newPw.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }
  if (!window.navifyChangePassword) {
    alert('Password change is not available.');
    return;
  }
  try {
    await navifyChangePassword(newPw);
    alert('Password updated. Use the new password next time you sign in.');
    settingsPasswordInput.value = '';
  } catch (err) {
    alert('Could not update password: ' + (err && err.message ? err.message : err));
  }
});

verifyEmailBtn?.addEventListener('click', async () => {
  if (!window.navifySendEmailVerification) {
    alert('Email verification is not available.');
    return;
  }
  try {
    await navifySendEmailVerification();
    alert('Verification email sent. Check your inbox.');
  } catch (err) {
    alert('Could not send verification email: ' + (err && err.message ? err.message : err));
  }
});

logoutBtn?.addEventListener('click', async () => {
  if (!window.navifySignOut) {
    window.location.href = 'index.html';
    return;
  }
  try {
    await navifySignOut();
  } finally {
    window.location.href = 'index.html';
  }
});
