export const restaurantRow = (restaurant) => {
    const { name, address, company, distance, isNearby } = restaurant;

    const target = document.createElement('div');
    target.classList.add('restaurant-card');
//

    if (isNearby) {
        target.classList.add('closest-highlight');
    }

    const distanceHTML = distance ? `<span class="distance">${distance.toFixed(1)} km</span>` : '';

    target.innerHTML = `
        <div class="card-info">
            <h3>${name}</h3>
            <p class="address">${address}</p>
            ${distanceHTML}
            <span class="company-tag">${company}</span>
        </div>`;

    return target;
};



export const restaurantModal = (restaurant, menu) => {
    const { name, address, company, city } = restaurant;
    const courses = menu.courses;


    const fullAddress = city ? `${address}, ${city}` : address;
    const encodedAddress = encodeURIComponent(fullAddress);

    const reittiopasUrl = `https://reittiopas.hsl.fi/reitti/%20/${encodedAddress}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    let menuHTML = `<ul class="menu-list">`;

    if (courses && courses.length > 0) {
        courses.forEach(course => {
            let dietText = '';
            if(Array.isArray(course.diets)) {
                dietText = course.diets.join(', ');
            } else if (typeof course.diets === 'string') {
                dietText = course.diets;
            }

            const diets = dietText ? `<span class="diets">${dietText}</span>` : '';
            const price = course.price ? `<span class="price">${course.price}</span>` : '';

            menuHTML += `
                <li class="menu-item">
                    <div class="menu-item-main">
                        <span class="course-name">${course.name}</span>
                        ${diets}
                    </div>
                    ${price}
                </li>`;
        });
    } else {
        menuHTML += '<li class="no-menu">Ei menua saatavilla tänään.</li>';
    }
    menuHTML += '</ul>';

    return `
        <div class="modal-header">
            <h2>${name}</h2>
            <p><strong>Toimittaja:</strong> ${company}</p>
            <p><strong>Osoite:</strong> ${address}</p>
        </div>
        <hr>
        <div class="modal-body">
            <h4>Päivän menu</h4>
            ${menuHTML}
        </div>
        <div class="modal-footer">
            <button id="close-modal">Sulje</button>
        </div>
    `;
};
