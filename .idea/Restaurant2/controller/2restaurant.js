import {url} from '../model/2url.js';
import {fetchData} from '../model/2fetchData.js';
import {restaurantRow, restaurantModal} from '../controller/2comp.js';

const taulu = document.querySelector('#restaurant-list');
const modal = document.querySelector('#modal');
const searchInput = document.querySelector('#search');
const locationButton = document.querySelector('#location-button');
const locationInput = document.querySelector('#location-input');

let allRestaurants = [];
let map;
let markerLayer;
let routingControl;

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLa = (lat2 - lat1) * Math.PI / 180;
    const dLo = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLo / 2) * Math.sin(dLo / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const initMap = () => {
    const mapEl = document.querySelector('#map');
    if (!mapEl) return;

    map = L.map('map').setView([60.17, 24.94], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    setTimeout(() => { map.invalidateSize(); }, 200);
};

const updateMapMarkers = (restaurants) => {
    if (!markerLayer) return;
    markerLayer.clearLayers();
    restaurants.forEach(restaurant => {
        if (restaurant.location && restaurant.location.coordinates) {
            const [lo, la] = restaurant.location.coordinates;
            L.marker([la, lo]).addTo(markerLayer)
                .bindPopup(`<strong>${restaurant.name}</strong><br>${restaurant.address || ''}`);
        }
    });
};

const getCoord = async (address) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
};

const showRoutes = (userLa, userLo, destLat, destLon) => {
    if (routingControl) map.removeControl(routingControl);

    routingControl = L.Routing.control({
        waypoints: [L.latLng(userLa, userLo), L.latLng(destLat, destLon)],
        routeWhileDragging: true,
        show: false,
        createMarker: () => null,
        lineOptions: {
            styles: [{ color: 'blue', weight: 5, opacity: 0.6 }]
        }
    }).addTo(map);
};

const updateDistanceAndRoute = (userLa, userLo) => {
    let closestDistance = Infinity;
    let closestRestaurant = null;

    allRestaurants.forEach(restaurant => {
        if (restaurant.location && restaurant.location.coordinates) {
            const [rLo, rLa] = restaurant.location.coordinates;
            const dist = getDistance(userLa, userLo, rLa, rLo);
            restaurant.distance = dist;
            restaurant.isNearby = false;

            if (dist < closestDistance) {
                closestDistance = dist;
                closestRestaurant = restaurant;
            }
        }
    });//

    if (closestRestaurant) {
        closestRestaurant.isNearby = true;
        allRestaurants.sort((a, b) => (a.distance || 999) - (b.distance || 999));

        Table(allRestaurants);
        updateMapMarkers(allRestaurants);

        const [destLo, destLa] = closestRestaurant.location.coordinates;
        showRoutes(userLa, userLo, destLa, destLo);

        map.setView([userLa, userLo], 13);
        setTimeout(() => {
            const closestCard = document.querySelector('.closest-highlight');
            if (closestCard) closestCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
};

const Table = (restaurants) => {
    taulu.innerHTML = '';
    restaurants.forEach(restaurant => {
        const tr = restaurantRow(restaurant);

        tr.addEventListener('click', async () => {
            // 1. Visuaalinen korostus valitulle riville
            document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
            tr.classList.add('highlight');


            if (restaurant.location && restaurant.location.coordinates) {
                const [destLo, destLa] = restaurant.location.coordinates;

                navigator.geolocation.getCurrentPosition(pos => {
                    const userLa = pos.coords.latitude;
                    const userLo = pos.coords.longitude;


                    showRoutes(userLa, userLo, destLa, destLo);


                    map.setView([destLa, destLo], 13);
                    setTimeout(() => map.invalidateSize(), 200);
                }, (err) => {
                    console.warn("Sijaintia ei voitu hakea reittiä varten:", err.message);
                });
            }


            modal.innerHTML = '<p>Ladataan menua...</p>';
            modal.showModal();

            try {
                const menuData = await fetchData(`${url}/restaurants/daily/${restaurant._id}/fi`);
                modal.innerHTML = restaurantModal(restaurant, menuData);

                const closeBtn = modal.querySelector('#close-modal');
                if (closeBtn) {
                    closeBtn.onclick = () => modal.close();
                }
            } catch (err) {
                modal.innerHTML = `<p>Virhe ladattaessa menua: ${err.message}</p>
                                   <button onclick="document.querySelector('#modal').close()">Sulje</button>`;
            }
        });

        taulu.append(tr);
    });
};


searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    const filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(val) || (r.address && r.address.toLowerCase().includes(val))
    );
    Table(filtered);
    updateMapMarkers(filtered);
});

if (locationButton) {
    locationButton.addEventListener('click', async () => {
        const coords = await getCoord(locationInput.value);
        if (coords) updateDistanceAndRoute(coords.lat, coords.lon);
        else alert("Osoitetta ei löytynyt.");
    });
}

async function getRestaurants() {
    try {
        initMap();
        allRestaurants = await fetchData(`${url}/restaurants`);
        navigator.geolocation.getCurrentPosition(
            pos => updateDistanceAndRoute(pos.coords.latitude, pos.coords.longitude),
            err => { Table(allRestaurants); }
        );
    } catch (error) { taulu.innerHTML = error.message; }
}

getRestaurants();