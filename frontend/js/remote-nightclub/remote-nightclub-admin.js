

const adminBtnElement = document.getElementById('adminBtn');
const adminPanelElement = document.getElementById('adminPanel');
const newEventFormContainer = document.getElementById('newEventFormContainer');

adminBtnElement.addEventListener('click', toggleAdminPanel);

const adminMenuHTML = ` 
    <header class="admin-menu-header">
        <button id="menuNewEventBtn">Nytt Event</button>
        <button id="menuManageEventsBtn">Hantera Event</button>
        <button id="menuBookingsBtn">Hantera Bokningar</button>
    </header>
    <section id="adminContentArea"></section>
    `

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
                <label for="enterTicketCount">Antal tillgängliga biljetter:</label>
                <input type="number" id="enterTicketCount" min="1" required>
            </div>

            <div>
                <label for="enterMaxTickets">Max antal biljetter:</label>
                <input type="number" id="enterMaxTickets" min="1" required>
            </div>
            
            <button type="submit">Skapa Event</button>
        </form>
    `;

const manageEventsHTML = `
    <h3>Hantera Event</h3>
    <section id="adminShowEvents"></section>
`;

const bookingsHTML = `
    <h3>Återbetalning</h3>
    <section id="adminShowBookings"></section>
`;



attachFormListener();

function toggleAdminPanel() {
    // Kontrollera om panelen är tom (ska öppnas)
    if (adminPanelElement.innerHTML === '') {
        // 1. Ladda in menyn i adminPanelElement
        adminPanelElement.innerHTML = adminMenuHTML;

        loadView('newEvent'); 

        attachMenuListeners(); 

        // Visa panelen
        newEventFormContainer.classList.add('visible');
        adminPanelElement.classList.remove('hidden');

    } else {
        // Stäng panelen (din befintliga logik)
        newEventFormContainer.classList.remove('visible');
        adminPanelElement.classList.add('hidden');
        adminPanelElement.innerHTML = '';
    }
}

function attachMenuListeners() {

    const newEventBtn = document.getElementById('menuNewEventBtn');
    const manageEventsBtn = document.getElementById('menuManageEventsBtn');
    const refundsBtn = document.getElementById('menuBookingsBtn');

    newEventBtn.addEventListener('click', () => {
        loadView('newEvent')
    });

    manageEventsBtn.addEventListener('click', () => {
        loadView('manageEvents')
    });

    refundsBtn.addEventListener('click', () => {
        loadView('showBookings')
    });
}

function loadView(viewName) {

    switch (viewName) {
        case 'newEvent':
            adminContentArea.innerHTML = newEventFormHTML
            break
        case 'manageEvents':
            showEvents()
            break
        case 'showBookings':
            adminContentArea.innerHTML = bookingsHTML
            break
        default:
            console.log('Ingen giltig vy valdes.')
    }
}



function attachFormListener() {
    const form = document.getElementById('createEventForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            createEvent();
        });
    }
}

async function showEvents() {
    const adminShowEventsElement = document.getElementById('adminContentArea');

    const response = await fetch('http://localhost:5000/events');
    const events = await response.json()

    const ourEvents = events.filter(event => event.clubId === 3)
    let eventsHTML = ''
    for (var event of ourEvents){
        var eventHTML = `
        <div class="admin-show-event">
            <h1>${event.title}</h1>
            <p>${event.date}</p>
            <p>${event.price}</p>
            <p>${event.ticketCount} + / + ${event.maxTickets}</p>
            <button id="deleteEvent" class="delete-event">delete</button>
        </div>
        `
        eventsHTML += eventHTML
    }
    adminShowEventsElement.innerHTML = eventsHTML
}

function createEvent() {
    const eventTitleElement = document.getElementById('enterTitle');
    const eventDescriptionElement = document.getElementById('enterDescription');
    const eventPriceElement = document.getElementById('enterPrice');
    const eventTicketCountElement = document.getElementById('enterTicketCount');
    const eventMaxTicketsElement = document.getElementById('enterMaxTickets');

    const eventID = Math.random();

    const newEvent = {
        id: eventID,
        category: 'Remote Nightclub',
        title: eventTitleElement.value,
        datetime: new Date(eventObject['datetime']),
        location: 'TUC Växjö',
        description: eventDescriptionElement.value,
        price: eventPriceElement.value,
        ticketCount: eventTicketCountElement.value,
        maxTickets: eventMaxTicketsElement.value,
        clubId: 1,
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
            displayEvent(data);
            alert(`Eventet "${data.title}" skapades framgångsrikt!`);
            adminPanelElement.innerHTML = '';
        })
        .catch(error => {
            console.error('Kunde inte skapa event:', error);
            alert('Ett fel uppstod vid skapandet av eventet.');
        })
}

