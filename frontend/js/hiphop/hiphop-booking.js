// hiphop-booking.js
// hiphop-booking.js - Bokningssystem för Hip-Hop Klubben

// Ladda events till bokningsdropdown
async function loadBookingEvents() {
    try {
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();

        const hiphopEvents = allEvents.filter(event => event.category === 'hiphop');
        hiphopEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

        const eventSelect = document.getElementById('pick-show');

        if (eventSelect) {
            eventSelect.innerHTML = '<option value="">Vilket event vill du gå på?</option>';

            hiphopEvents.forEach(event => {
                const availableTickets = event.maxTickets ? event.maxTickets - (event.ticketCount || 0) : 50;
                const eventDate = new Date(event.datetime);
                const formattedDate = eventDate.toLocaleDateString('sv-SE');
                const formattedTime = eventDate.toLocaleTimeString('sv-SE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = `${event.title} - ${formattedDate} ${formattedTime} (${availableTickets} biljetter kvar)`;

                if (availableTickets === 0) {
                    option.disabled = true;
                    option.textContent += ' - SLUTSÅLT';
                }

                eventSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Fel vid laddning av booking events:', error);
    }
}

// Hantera bokningsformulär
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('ticket-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    // Ladda events för bokning
    loadBookingEvents();
});

async function handleBooking(event) {
    event.preventDefault();

    const eventId = document.getElementById('pick-show').value;
    const customerName = document.getElementById('your-name').value;
    const customerEmail = document.getElementById('your-email').value;
    const requestedTickets = parseInt(document.getElementById('how-many').value);

    if (!eventId) {
        showMessage('Välj vilket event du vill gå på!', 'error');
        return;
    }

    try {
        // Hämta event-information
        const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
        const selectedEvent = await eventResponse.json();

        // Beräkna tillgängliga biljetter
        const maxTickets = selectedEvent.maxTickets || 200;
        const currentTickets = selectedEvent.ticketCount || 0;
        const availableTickets = maxTickets - currentTickets;
        const ticketPrice = selectedEvent.price || 150;

        if (requestedTickets > availableTickets) {
            showMessage(`Tyvärr finns det bara ${availableTickets} biljetter kvar!`, 'error');
            return;
        }

        const booking = {
            eventId: parseInt(eventId),
            customerName: customerName,
            customerEmail: customerEmail,
            ticketCount: requestedTickets,
            bookingDate: new Date().toISOString(),
            totalPrice: ticketPrice * requestedTickets,
        };

        // Spara bokning till databasen
        const bookingResponse = await fetch('http://localhost:5000/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(booking),
        });

        if (!bookingResponse.ok) {
            throw new Error('Kunde inte spara bokning');
        }

        // Uppdatera biljetträknare
        const updatedEvent = {
            ...selectedEvent,
            ticketCount: currentTickets + requestedTickets,
        };

        const updateResponse = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent),
        });

        if (!updateResponse.ok) {
            throw new Error('Kunde inte uppdatera biljetträknare');
        }

        // Visa bekräftelse
        showMessage(`Tack ${customerName}! Du har bokat ${requestedTickets} biljetter till "${selectedEvent.title}". Totalt: ${booking.totalPrice} kr.`, 'success');
        
        // Rensa formuläret
        document.getElementById('ticket-form').reset();
        
        // Uppdatera events
        loadShows();
        loadBookingEvents();
        
    } catch (error) {
        console.error('Fel vid bokning:', error);
        showMessage('Något gick fel vid bokningen. Försök igen!', 'error');
    }
}

// Visa meddelande
function showMessage(message, type) {
    const messageDiv = document.getElementById('booking-message');
    messageDiv.textContent = message;
    messageDiv.className = `confirmation ${type}`;
    messageDiv.classList.remove('hide');
    
    setTimeout(() => {
        messageDiv.classList.add('hide');
    }, 5000);
}