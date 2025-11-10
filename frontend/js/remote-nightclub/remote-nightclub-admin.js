

const adminBtnElement  = document.getElementById('adminBtn');
const adminPanelElement     = document.getElementById('adminPanel');
const newEventFormContainer = document.getElementById('newEventFormContainer');

adminBtnElement.addEventListener('click', toggleAdminPanel);

const adminPanelContent =
    `
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
        attachFormListener();

        function toggleAdminPanel(){
            if (adminPanelElement.innerHTML === '') {
                adminPanelElement.innerHTML = adminPanelContent;
                
                newEventFormContainer.classList.add('visible');
                adminPanelElement.classList.remove('hidden'); 

        
                attachFormListener();
            } else {
                newEventFormContainer.classList.remove('visible');
                adminPanelElement.classList.add('hidden'); 
        
                adminPanelElement.innerHTML = '';
                
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



function createEvent() {
// Get all the elements
const eventTitleElement     = document.getElementById('enterTitle');
/* const eventDatetimeElement  = document.getElementById('enterDatetime');*/
const eventLocationElement  = document.getElementById('enterLocation');
const eventDescriptionElement = document.getElementById('enterDescription');
const eventPriceElement     = document.getElementById('enterPrice');
const eventTicketCountElement = document.getElementById('enterTicketCount');
const eventMaxTicketsElement = document.getElementById('enterMaxTickets');

const eventID = Math.random();

const newEvent = {
    id: eventID,
    category: 'Remote Nightclub',
    title: eventTitleElement.value,
    datetime: new Date(eventObject['datetime']),
    location: 'Remote Nightclub',
    description: eventDescriptionElement.value,
    price: eventPriceElement.value, 
    ticketCount: eventTicketCountElement.value,
    maxTickets: eventMaxTicketsElement.value,
    clubId: 1,
    eventImage: 'defalt.img' 
};



fetch('http://localhost:5000/events',
{
    method: 'POST',
    headers:  {
        'Content-Type' : 'application/json'
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

