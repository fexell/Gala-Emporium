// SHOW BOOKING FORM
const ticketWrapper = document.querySelector('.ticketwrapper');
const ticketButton = document.getElementById('ticket-button');
const floorImage = document.querySelector('.floor-img');
const television = document.querySelector('.television');

ticketButton.addEventListener('click', () => {
    ticketWrapper.classList.toggle('visible');
    floorImage.classList.toggle('floor-raised');
    television.classList.toggle('television-change-size');
});

// BOOKING FORM FUNCTIONALITY
const eventTitle = document.getElementById('event-title');
const eventDetails = document.getElementById('event-details');
const eventDate = document.getElementById('event-date');
const timeSelect = document.getElementById('booking-time-select');

const eventPrice = document.getElementById('event-price');
const eventCapacity = document.getElementById('event-capacity');
const eventVideo = document.getElementById('event-video');
const eventSelect = document.getElementById('event-select');


const ticketForm = document.querySelector('.ticket-form');

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
        } else {
            console.error('Failed to create booking:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error creating booking:', error);
    }
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


let currentEventIndex = 0;
let eventData = [];

// SHOW EVENTS ON TELEVISONEN
async function initRemoteNightclub() {
    const CLUB_ID = 3; 

    // Hämta data
    const response = await fetch('http://localhost:5000/events');
    eventData = await response.json(); 

    //Filtrera 
    eventData = eventData.filter(event => event.clubId == CLUB_ID);

    // Lägga till options i bookningsmeny
    for (const eventObject of eventData) {
        const optionElement = document.createElement('option');
        
        optionElement.value = eventObject.id;
        
        optionElement.textContent = eventObject.title; 
        
        // 3. Lägg till det skapade elementet i select-menyn
        eventSelect.appendChild(optionElement); 
    }

    //Updatera televisonen
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

    // Lyssna på ändringar i Event-selecten (dropdown)
    eventSelect.addEventListener('change', (e) => {
        const selectedId = e.target.value; 
        const newIndex = eventData.findIndex(event => event.id == selectedId); 
        currentEventIndex = newIndex; 
        
        updateTelevisonen(currentEventIndex); 
    });
};

initRemoteNightclub();