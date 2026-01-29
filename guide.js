const guideMapEl = document.getElementById('guideMap');
const guideTitle = document.getElementById('guideTitle');
const guideDesc = document.getElementById('guideDesc');
const guideNotifs = document.getElementById('guideNotifs');
const backBtn = document.getElementById('backBtn');
const shareGuideBtn = document.getElementById('shareGuideBtn');

let map = null;
let routeLine = null;
let altRouteLine = null;
let userMarker = null;
let watchId = null;
let trafficSegments = [];
let arrowMarkers = [];
let routingControl = null;

function initMap() {
  if (!guideMapEl || typeof L === 'undefined') return;
  map = L.map(guideMapEl, { zoomControl: true }).setView([14.5995, 120.9842], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);
}

function addNotif(text) {
  if (!guideNotifs) return;
  const div = document.createElement('div');
  div.className = 'contact-item';
  div.textContent = text;
  guideNotifs.prepend(div);
}

function buildRouteWaypoints(start, end, offsetFactor) {
  return [
    [start.lat, start.lng],
    [end.lat, end.lng]
  ];
}

function drawRoute(start, end) {
  if (!map || !L.Routing) return;
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  trafficSegments.forEach((seg) => map.removeLayer(seg));
  trafficSegments = [];
  arrowMarkers.forEach((m) => map.removeLayer(m));
  arrowMarkers = [];

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(start.lat, start.lng),
      L.latLng(end.lat, end.lng)
    ],
    lineOptions: {
      styles: [
        { color: '#7bf1ff', weight: 4, opacity: 0.95 }
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
    const coords = route.coordinates.map((c) => [c.lat, c.lng]);
    const n = coords.length - 1;
    if (n <= 0) return;
    const colors = ['#3ddc84', '#f7b500', '#ff5d5d'];
    for (let i = 0; i < n; i += 1) {
      const seg = L.polyline([coords[i], coords[i + 1]], {
        color: colors[i] || '#3ddc84',
        weight: 5,
        opacity: 0.9
      }).addTo(map);
      trafficSegments.push(seg);
      const midLat = (coords[i][0] + coords[i + 1][0]) / 2;
      const midLng = (coords[i][1] + coords[i + 1][1]) / 2;
      const arrow = L.marker([midLat, midLng], {
        icon: L.divIcon({ className: 'route-arrow', html: '➤' })
      }).addTo(map);
      arrowMarkers.push(arrow);
    }
  });
}

function startLiveRoute(target) {
  if (!navigator.geolocation) {
    addNotif('Location not supported on this device. Showing static route.');
    drawRoute({ lat: 14.5995, lng: 120.9842 }, target);
    guideDesc.textContent = 'Static guidance • Move manually along the highlighted road.';
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      if (!userMarker) {
        userMarker = L.marker([latitude, longitude]).addTo(map);
      } else {
        userMarker.setLatLng([latitude, longitude]);
      }
      drawRoute({ lat: latitude, lng: longitude }, target);
      guideDesc.textContent = 'Live navigation in progress.';
      addNotif(`Update: moving • ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    },
    () => {
      addNotif('Location permission denied. Showing static route instead.');
      drawRoute({ lat: 14.5995, lng: 120.9842 }, target);
      guideDesc.textContent = 'Static guidance • Follow the highlighted road visually.';
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

function init() {
  initMap();
  const stored = localStorage.getItem('navify-guide-target');
  const target = stored ? JSON.parse(stored) : { lat: 14.5995, lng: 120.9842, label: 'Destination' };
  guideTitle.textContent = `Routing to ${target.label}`;
  addNotif('Route ready • Green/Yellow/Red segments show traffic (simulated)');
  startLiveRoute({ lat: target.lat, lng: target.lng });
}

backBtn?.addEventListener('click', () => {
  if (watchId) navigator.geolocation.clearWatch(watchId);
  window.location.href = 'home.html';
});

shareGuideBtn?.addEventListener('click', () => {
  addNotif('Share link copied • Send this page to your trusted circle.');
  if (navigator.clipboard && window.location) {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }
});

init();
