const adminBtnElement = document.getElementById('adminBtn');
const adminPanelElement = document.getElementById('adminPanel');

adminBtnElement.addEventListener('click', toggleAdminPanel);

function toggleAdminPanel() {
    if (adminPanelElement.innerHTML === '') {
        adminPanelElement.innerHTML = adminMenuHTML;
        loadView('newEvent');
        attachMenuListeners();
    } else {
        adminPanelElement.innerHTML = '';
    }
}

const adminMenuHTML = ` 
    <section class="admin-panel">
        <section class="admin-menu-header">
            <button id="menuNewEventBtn">Nytt Event</button>
            <button id="menuManageEventsBtn">Hantera Event</button>
        </section>
        <section id="adminContentArea"></section>
    </section>
`



function attachMenuListeners() {
    const newEventBtn = document.getElementById('menuNewEventBtn');
    const manageEventsBtn = document.getElementById('menuManageEventsBtn');

    newEventBtn.addEventListener('click', () => {
        loadView('newEvent')
    });

    manageEventsBtn.addEventListener('click', () => {
        loadView('manageEvents')
    });


};

function loadView(viewName) {
    switch (viewName) {
        case 'newEvent':
            showNewEvent()
            break
        case 'manageEvents':
            showEvents()
            break
        default:
            console.log('Ingen giltig vy valdes.')
    }
}

function showNewEvent() {
    const newEventFormHTML = `
    <form id="createEventForm">
            <h3>Skapa ett nytt Event</h3>
            <div>
                <label for="enterTitle">Titel:</label>
                <input type="text" id="enterTitle" required>
            </div>

            <div>
                <label for="enterDatetime">Datum & Tid:</label>
                <input type="datetime-local" id="enterDatetime" required>
            </div>

            <div>
                <label for="enterLocation">Plats:</label>
                <input type="text" id="enterLocation" required>
            </div>

            <div>
                <label for="enterDescription">Beskrivning:</label>
                <textarea id="enterDescription" rows="2" required></textarea>
            </div>

            <div>
                <label for="enterPrice">Pris (SEK):</label>
                <input type="number" id="enterPrice" min="0" required>
            </div>

            <div>
                <label for="enterTicketCount">Antal reserverade biljetter:</label>
                <input type="number" id="enterTicketCount" min="1" required>
            </div>

            <div>
                <label for="enterMaxTickets">Max antal biljetter:</label>
                <input type="number" id="enterMaxTickets" min="1" required>
            </div>
            
            <button type="submit">Skapa Event</button>
        </form>
    `;

    adminContentArea.innerHTML = newEventFormHTML

    const form = document.getElementById('createEventForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(form)
            createEvent();
        });
    }
}

function createEvent() {
    const eventTitleElement = document.getElementById('enterTitle');
    const eventDescriptionElement = document.getElementById('enterDescription');
    const enterDatetimeElement = document.getElementById('enterDatetime')
    const eventPriceElement = document.getElementById('enterPrice');
    const enterLocationElement = document.getElementById('enterLocation');
    const eventTicketCountElement = document.getElementById('enterTicketCount');
    const eventMaxTicketsElement = document.getElementById('enterMaxTickets');

    const eventID = Math.random().toString(36).substring(2, 7);

    const newEvent = {
        id: eventID,
        title: eventTitleElement.value,
        datetime: enterDatetimeElement.value,
        location: enterLocationElement.value,
        description: eventDescriptionElement.value,
        price: parseInt(eventPriceElement.value),
        maxTickets: parseInt(eventMaxTicketsElement.value),
        ticketCount: parseInt(eventTicketCountElement.value),
        category: 'Remote Nightclub',
        clubId: 3,
        eventImage: 'default.img'
    };

    fetch('http://localhost:5000/events',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            alert(`Eventet "${data.title}" skapades framgångsrikt!`);
            adminPanelElement.innerHTML = '';
        })
        .catch(error => {
            console.error('Kunde inte skapa event:', error);
            alert('Ett fel uppstod vid skapandet av eventet.');
        })
    showEvents();
}

async function showEvents() {

    const response = await fetch('http://localhost:5000/events');
    const events = await response.json()

    

    const ourEvents = events.filter(event => event.clubId === 3)
    let eventsHTML = `
            <h3>Hantera Event</h3>

    `
    for (var event of ourEvents) {
        var eventHTML = `
        <div class="admin-show-event">
            <h1>${event.title}</h1>
            <p>Date: ${event.datetime}</p>
            <p>Price: ${event.price}</p>
            <p>Tickets: ${event.ticketCount}/${event.maxTickets}</p>
            <button  data-id="${event.id}" class="delete-event">delete</button>
        </div>
        `
        eventsHTML += eventHTML
    }
    adminContentArea.innerHTML = eventsHTML;

    const deleteButtons = document.querySelectorAll('.delete-event');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.target.dataset.id;
            deleteEvent(eventId)
        })
    })
}

async function deleteEvent(eventId) {
    const response = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: 'DELETE'
    })
    if (!response.ok) {
        throw new Error(`Kunde inte ta bort event. Status: ${response.status}`);
    }
    alert('Eventet togs bort framgångsrikt!');
    showEvents();
}