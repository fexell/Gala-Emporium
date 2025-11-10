// hiphop-main.js
// hiphop-main.js - Huvudfil för Hip-Hop Klubben

// Ladda events när sidan laddas
document.addEventListener('DOMContentLoaded', function() {
    loadShows();
});

// Ladda och visa events
async function loadShows() {
    try {
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();

        // Filtrera bara hiphop events
        const hiphopEvents = allEvents.filter(event => event.category === 'hiphop');
        hiphopEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        const showContainer = document.getElementById('show-container');

        if (showContainer) {
            showContainer.innerHTML = '';

            if (hiphopEvents.length === 0) {
                showContainer.innerHTML = '<p>Inga kommande evenemang just nu. Håll utkik!</p>';
                return;
            }

            // Skapa HTML för varje event
            hiphopEvents.forEach(event => {
                const eventDate = new Date(event.datetime);
                const formattedDate = eventDate.toLocaleDateString('sv-SE');
                const formattedTime = eventDate.toLocaleTimeString('sv-SE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                const card = document.createElement('div');
                card.className = 'show-card';
                card.innerHTML = ` 
                    <img src="${event.image || '../images/hiphop-default.jpg'}" alt="${event.title}">
                    <div class="show-card-content">
                        <h3>${event.title}</h3>
                        <p><strong>${formattedDate} ${formattedTime}</strong></p>
                        <p><strong>Plats: </strong>${event.location}</p>
                        <p>${event.description}</p>
                        <button class="book-show-btn" onclick="scrollToBooking(${event.id})">Boka Biljetter</button>
                    </div>
                `;
                showContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Fel vid laddning av events:', error);
        const showContainer = document.getElementById('show-container');
        if (showContainer) {
            showContainer.innerHTML = '<p>Kunde inte ladda evenemang. Försök igen senare.</p>';
        }
    }
}

// Scrolla till bokningssektionen
function scrollToBooking(eventId) {
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        const eventSelect = document.getElementById('pick-show');
        if (eventSelect) {
            eventSelect.value = eventId;
        }
    }, 500);
}

// Gör funktionen global
window.scrollToBooking = scrollToBooking;