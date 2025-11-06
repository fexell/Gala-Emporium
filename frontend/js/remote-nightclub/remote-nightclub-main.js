// Booking form submission handling
const ticketForm = document.querySelector('.ticket-form')

ticketForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(ticketForm)
    const customerData = Object.fromEntries(formData.entries())
    console.log(customerData)
})

// Event data fetching and display

const rawEvent = await fetch('http://localhost:5000/events')
const eventData = await rawEvent.json()

const eventTitle = document.getElementById('event-title')
const eventDetails = document.getElementById('event-details')
const eventDate = document.getElementById('event-date')
const eventPrice = document.getElementById('event-price')
const eventCapacity = document.getElementById('event-capacity')
const eventVideo = document.getElementById('event-video')

function updateTelevisonen(eventIndex) {
    const eventObject = eventData[eventIndex];

    eventTitle.textContent = eventObject.title; // Använd 'title' istället för 'Title'
    eventDetails.textContent = eventObject.description; // Använd 'description' istället för 'Description'

    const [fullDate, fullTimeWithSeconds] = eventObject['datetime'].split('T');
    const [year, month, day] = fullDate.split('-');
    const cleanTime = fullTimeWithSeconds.slice(0, 5); 
    
    eventDate.textContent = `Time: ${day.replace(/^0+/, '')}/${month.replace(/^0+/, '')} ${cleanTime}`;

    eventPrice.textContent = `Price: ${eventObject.price}kr`; // Använd 'price' istället för 'Price'

    eventCapacity.textContent = `Capacity: ${eventObject.maxTickets} people`; // Använd 'maxTickets' för kapacitet

    eventVideo.src = eventObject.eventImage + '.mp4'; // Du behöver troligen lägga till filändelsen
    eventVideo.load();
    eventVideo.play();
}

// Event navigation buttons
const nextEventButton = document.getElementById('next-event')
const previousEventButton = document.getElementById('previous-event')

let currentEventIndex = 0

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

updateTelevisonen(currentEventIndex)

// Light/Dark mode toggle
const lightToggle = document.getElementById('light-toggle')
const darkMode = document.querySelector('.dark-mode')
const crowdVisible = document.querySelector('.crowd')
const eventInfoVisible = document.querySelector('.event-info')

lightToggle.addEventListener('click', () => {
    darkMode.classList.toggle('hidden')
    crowdVisible.classList.toggle('hidden')
    eventInfoVisible.classList.toggle('hidden')
})