// Add the ticket booking form HTML
// If a purchase is made, show a receipt with booking details instead

const ticketForm = document.querySelector('.ticket-form');

const ticketFormHTML = `
<h1 class="booking-title">BOOKING</h1>
    <div>
        <label for="event-select">Event:</label>
        <select name="eventId" id="event-select">
        </select>
    </div>
    <div>
        <label for="event-date">Tid:</label>
        <select name="event-date" id="booking-time-select">
        </select>
    </div>

    <div>
        <label for="customerEmail">Your Email:</label>
        <input type="email" name="email" placeholder="email@example.com">
    </div>

    <div>
        <label class="customerName" for="customerName">Your Name:</label>
        <input type="text" name="name" placeholder="Your name">
    </div>
    <div>
        <label for="ticket-quantity">Number of tickets:</label>
        <input type="number" id="ticket-quantity" name="tickets" min="1" max="10" value="1">
    </div>
    <button type="submit">Get Ticket</button>
`;

ticketForm.innerHTML = ticketFormHTML;


// SHOW BOOKING FORM AND ANIMATE FLOOR AND TELEVISION
const ticketWrapper = document.querySelector('.ticketwrapper');
const ticketButton = document.getElementById('ticket-button');
const floorImage = document.querySelector('.floor-img');
const television = document.querySelector('.television');
const headerTitle = document.querySelector('header h1');
const eventTitle = document.getElementById('event-title');

const toggleBookingDisplay = () => {
    ticketWrapper.classList.toggle('visible');
    floorImage.classList.toggle('floor-raised');
    television.classList.toggle('television-change-size');
    headerTitle.classList.toggle('header-shrunk');
    eventTitle.classList.toggle('event-title-shrunk');
};

ticketButton.addEventListener('click', toggleBookingDisplay);
television.addEventListener('click', toggleBookingDisplay);

// BOOKING FORM FUNCTIONALITY

ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(ticketForm);
    const customerData = Object.fromEntries(formData.entries());

    const selectedEvent = eventData.find(event => event.id == customerData.eventId);
    const totalPrice = selectedEvent.price * parseInt(customerData.tickets);
    const newId = Math.random().toString(16).slice(2, 6);

    const newBooking = {
        id: newId,
        eventId: customerData.eventId,
        customerName: customerData.name,
        customerEmail: customerData.email,
        ticketCount: parseInt(customerData.tickets),
        bookingDate: customerData['event-date'],
        totalPrice: totalPrice
    }

    try {
        const response = await fetch('http://localhost:5000/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBooking)
        });
        if (response.ok) {
            const responseData = await response.json();
            console.log('Booking created successfully:', responseData);
            showReceipt(newBooking);
            
        } else {
            console.error('Failed to create booking:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error creating booking:', error);
    }
    console.log(customerData);
    
});

function showReceipt(newBooking) {
    const receipt = `
    <section class="receipt">
    <h2>Booking Receipt</h2>
    <p><strong>Name:</strong> ${newBooking.customerName}</p>
    <p><strong>Email:</strong> ${newBooking.customerEmail}</p>
    <p><strong>Number of Tickets:</strong> ${newBooking.ticketCount}</p>
    <p><strong>Total Price:</strong> ${newBooking.totalPrice}kr</p>
    <p><strong>Show this booking ID when you arrive:</strong> ${newBooking.id}</p>
    <button id="closeReceipt">Close</button>
    </section>
    `
    ticketForm.innerHTML = receipt

    const closeButton = document.getElementById('closeReceipt');
    closeButton.addEventListener('click', () => {
        ticketForm.innerHTML = ticketFormHTML;
    })
;}





// LIGHT TOGGLE FUNCTIONALITY
const lightToggle = document.getElementById('light-toggle')
const darkMode = document.querySelector('.dark-mode')
const eventInfoVisible = document.querySelector('.event-info')

lightToggle.addEventListener('click', () => {
    darkMode.classList.toggle('hidden')
    eventInfoVisible?.classList.toggle('hidden')
    ticketWrapper.classList.toggle('hidden')
})

// PRESENT EVENTS ON TELEVISONEN

const eventDetails = document.getElementById('event-details');
const eventDate = document.getElementById('event-date');
const timeSelect = document.getElementById('booking-time-select');
const eventPrice = document.getElementById('event-price');
const eventCapacity = document.getElementById('event-capacity');
const eventVideo = document.getElementById('event-video');
const eventSelect = document.getElementById('event-select');

let currentEventIndex = 0;
let eventData = [];

async function initRemoteNightclub() {
    const CLUB_ID = 3;

    //FETCH EVENTS
    const response = await fetch('http://localhost:5000/events');
    eventData = await response.json();

    //FILTER 
    eventData = eventData.filter(event => event.clubId == CLUB_ID);

    //Add the events in booking form title select dropdown  
    for (const eventObject of eventData) {
        const optionElement = document.createElement('option');

        optionElement.value = eventObject.id;

        optionElement.textContent = eventObject.title;

        eventSelect.appendChild(optionElement);
    }

    //Update televisionen with first event
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

        eventSelect.value = eventObject.id;

        timeSelect.innerHTML = '';

        const timeOption = document.createElement('option');
        timeOption.value = eventObject.datetime;

        timeOption.textContent = `${formattedDate} ${formattedTime}`;

        timeSelect.appendChild(timeOption);
    }

    // GET NAVIGATION BUTTONS
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

    // Listener for event select change in booking form and update televisionen
    eventSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        const newIndex = eventData.findIndex(event => event.id == selectedId);
        currentEventIndex = newIndex;

        updateTelevisonen(currentEventIndex);
    });
};

initRemoteNightclub();