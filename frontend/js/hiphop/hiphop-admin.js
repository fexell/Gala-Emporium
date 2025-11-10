// hiphop-admin.js - Enkel admin för Hip-Hop Klubben
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    loadAdminEvents();
    
    const addForm = document.getElementById('add-event-form');
    if (addForm) {
        addForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addNewEvent();
        });
    }
});

// Lägg till nytt event
async function addNewEvent() {
    const title = document.getElementById('event-title').value;
    const datetime = document.getElementById('event-datetime').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;
    const price = document.getElementById('event-price').value;
    const maxTickets = document.getElementById('event-max-tickets').value;

    const eventData = {
        title: title,
        datetime: datetime,
        location: location,
        description: description,
        price: parseFloat(price),
        maxTickets: parseInt(maxTickets),
        ticketCount: 0,
        category: "hiphop",
        image: "../images/hiphop-default.jpg"
    };

    try {
        const response = await fetch('http://localhost:5000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            alert('Event skapat!');
            document.getElementById('add-event-form').reset();
            loadAdminEvents();
            loadShows();
            loadBookingEvents();
        } else {
            alert('Kunde inte skapa event!');
        }
    } catch (error) {
        console.error('Fel:', error);
        alert('Något gick fel: ' + error);
    }
}

// Ladda events i admin-listan
async function loadAdminEvents() {
    try {
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();
        
        const hiphopEvents = allEvents.filter(event => event.category === 'hiphop');
        hiphopEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        const eventsList = document.getElementById('events-list');
        
        if (eventsList) {
            eventsList.innerHTML = '';
            
            if (hiphopEvents.length === 0) {
                eventsList.innerHTML = '<p>Inga events hittades.</p>';
                return;
            }
            
            hiphopEvents.forEach(event => {
                // FIX: Använd formatDateTime-funktionen för korrekt tidvisning
                const { formattedDate, formattedTime } = formatDateTime(event.datetime);
                
                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-item';
                eventDiv.innerHTML = `
                    <h4>${event.title}</h4>
                    <p><strong>Datum:</strong> ${formattedDate} ${formattedTime}</p>
                    <p><strong>Plats:</strong> ${event.location}</p>
                    <p><strong>Pris:</strong> ${event.price} kr</p>
                    <p><strong>Biljetter sålda:</strong> ${event.ticketCount || 0}/${event.maxTickets}</p>
                    <button class="delete-event-btn" onclick="deleteEvent('${event.id}')">Ta bort event</button>
                `;
                
                eventsList.appendChild(eventDiv);
            });
        }
        
    } catch (error) {
        console.error('Fel vid laddning av events:', error);
        const eventsList = document.getElementById('events-list');
        if (eventsList) {
            eventsList.innerHTML = '<p>Fel vid laddning av events.</p>';
        }
    }
}

// FUNKTION: Formatera datum och tid korrekt (samma som i de andra filerna)
function formatDateTime(datetimeString) {
    const eventDate = new Date(datetimeString);
    
    const formattedDate = eventDate.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const formattedTime = eventDate.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    return { formattedDate, formattedTime };
}

// Ta bort event
async function deleteEvent(eventId) {
    if (!confirm('Är du säker på att du vill ta bort detta event?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Event borttaget!');
            loadAdminEvents();
            loadShows();
            loadBookingEvents();
        } else {
            alert('Kunde inte ta bort eventet!');
        }
    } catch (error) {
        console.error('Fel vid borttagning:', error);
        alert('Något gick fel: ' + error);
    }
}

// Gör funktionerna tillgängliga globalt
window.deleteEvent = deleteEvent;