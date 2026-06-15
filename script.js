// Fade-In Effekt beim Scrollen

const fadeElements = document.querySelectorAll('.fade-in');

function showOnScroll() {
    const triggerBottom = window.innerHeight * 0.85;

    fadeElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < triggerBottom) {
            el.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', showOnScroll);
window.addEventListener('load', showOnScroll);

// Mobile Navigation

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });
}

// Interaktive Weltkarte (Leaflet)

const mapElement = document.getElementById('world-map');

if (mapElement && typeof L !== 'undefined') {
    const map = L.map('world-map').setView([20, -30], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const routePoints = [
        [53.55, 9.99],    // Hamburg
        [28.10, -15.41],  // Kanaren
        [14.60, -61.03],  // Karibik (aktuell)
        [9.08, -79.68],   // Panama
        [-17.65, -149.42],// Tahiti
        [-16.92, 145.77], // Australien (Cairns)
        [-33.92, 18.42],  // Kapstadt
        [53.55, 9.99]     // Hamburg (Rückkehr)
    ];

    const routeLine = L.polyline(routePoints, {
        color: '#ffd700',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 8'
    }).addTo(map);

    const waypointLabels = [
        'Hamburg – Start',
        'Kanarische Inseln',
        'Karibik – Aktuelle Position',
        'Panamakanal',
        'Tahiti',
        'Australien',
        'Kapstadt',
        'Hamburg – Ziel'
    ];

    const defaultIcon = L.divIcon({
        className: 'map-marker',
        html: '<div class="marker-dot"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const currentIcon = L.divIcon({
        className: 'map-marker-current',
        html: '<div class="marker-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    routePoints.forEach((point, index) => {
        const isCurrent = index === 2;
        L.marker(point, { icon: isCurrent ? currentIcon : defaultIcon })
            .addTo(map)
            .bindPopup(`<strong>${waypointLabels[index]}</strong>`);
    });

    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
}
