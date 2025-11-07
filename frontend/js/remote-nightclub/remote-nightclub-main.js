// BOOKING FORM FUNCTIONALITY
const eventTitle = document.getElementById('event-title');
const eventDetails = document.getElementById('event-details');
const eventDate = document.getElementById('event-date');
const eventPrice = document.getElementById('event-price');
const eventCapacity = document.getElementById('event-capacity');
const eventVideo = document.getElementById('event-video');

const ticketForm = document.querySelector('.ticket-form');

ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(ticketForm);
    const customerData = Object.fromEntries(formData.entries());
    console.log(customerData);
});

// LIGHT TOGGLE FUNCTIONALITY

const lightToggle = document.getElementById('light-toggle')
const darkMode = document.querySelector('.dark-mode')
const crowdVisible = document.querySelector('.crowd')
const eventInfoVisible = document.querySelector('.event-info')

lightToggle.addEventListener('click', () => {
    darkMode.classList.toggle('hidden')
    crowdVisible.classList.toggle('hidden')
    eventInfoVisible?.classList.toggle('hidden')
})

// SHOW EVENTS ON TELEVISONEN
async function initRemoteNightclub() {
    let currentEventIndex = 0;
    const CLUB_ID = 3; 

    // Hämta data
    const rawResponse = await fetch('http://localhost:5000/events');
    let eventData = await rawResponse.json(); 

    //Filtrera 
    eventData = eventData.filter(event => event.clubId == CLUB_ID);
    updateTelevisonen(currentEventIndex);

    function updateTelevisonen(eventIndex) {

        const eventObject = eventData[eventIndex];

        eventTitle.textContent = eventObject.title;
        eventDetails.textContent = eventObject.description;

        const eventDateTime = new Date(eventObject['datetime']);

        const formattedDate = eventDateTime.toLocaleDateString('sv-SE', {
            day: 'numeric', 
            month: 'numeric',
        });
        
        const formattedTime = eventDateTime.toLocaleTimeString('sv-SE', {
            hour: '2-digit',  
            minute: '2-digit', 
            hour12: false
        });
        
        eventDate.textContent = `Time: ${formattedDate} ${formattedTime}`;

        eventPrice.textContent = `Price: ${eventObject.price}kr`;
        eventCapacity.textContent = `Capacity: ${eventObject.maxTickets} people`;

        eventVideo.src = `/images/${eventObject.eventImage}.mp4`;
        eventVideo.load();
        eventVideo.play();
    }

    const nextEventButton = document.getElementById('next-event');
    const previousEventButton = document.getElementById('previous-event');

    // NAVIGATION BUTTONS FOR NEXT AND PREVIOUS EVENT
    nextEventButton.addEventListener('click', () => {
        console.log('click')
        currentEventIndex++
        if (currentEventIndex >= eventData.length) {
            currentEventIndex = 0
        }
        updateTelevisonen(currentEventIndex)
    })
    previousEventButton.addEventListener('click', () => {
        currentEventIndex--
        if (currentEventIndex < 0) {
            currentEventIndex = eventData.length - 1
        }
        updateTelevisonen(currentEventIndex)
    })
};

initRemoteNightclub();