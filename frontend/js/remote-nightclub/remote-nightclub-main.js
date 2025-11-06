// Booking form submission handling
const ticketForm = document.querySelector('.ticket-form')

ticketForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(ticketForm)
    const customerData = Object.fromEntries(formData.entries())
    console.log(customerData)
})

// Event data fetching and display

const rawEvent = await fetch('event.json')
const eventData = await rawEvent.json()

const eventTitle = document.getElementById('event-title')
const eventDetails = document.getElementById('event-details')
const eventDate = document.getElementById('event-date')
const eventPrice = document.getElementById('event-price')
const eventCapacity = document.getElementById('event-capacity')
const eventVideo = document.getElementById('event-video')

function updateTelevisonen(eventIndex) {
    const eventObject = eventData[eventIndex];

    eventTitle.textContent = eventObject.Title;
    eventDetails.textContent = eventObject.Description;

    const [fullDate, fullTime] = eventObject['Date Time'].split(' ');
    const [year, month, day] = fullDate.split('-');
    const cleanTime = fullTime.slice(0, 5);
    eventDate.textContent = `Time: ${day.replace(/^0+/, '')}/${month.replace(/^0+/, '')} ${cleanTime}`;

    eventPrice.textContent = `Price: ${eventObject.Price}kr`;

    eventCapacity.textContent = `Capacity: ${eventObject.Capacity} people`;

    eventVideo.src = eventObject.Image;
    eventVideo.load();
    eventVideo.play();
}