// hiphop-booking.js - Bokningssystem för Hip-Hop Klubben
// ===========================================

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
                
                // FIX: Använd formatDateTime-funktionen för korrekt tidvisning
                const { formattedDate, formattedTime } = formatDateTime(event.datetime);

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

// FUNKTION: Formatera datum och tid korrekt (samma som i hiphop-main.js)
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
        const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
        const selectedEvent = await eventResponse.json();

        const maxTickets = selectedEvent.maxTickets || 200;
        const currentTickets = selectedEvent.ticketCount || 0;
        const availableTickets = maxTickets - currentTickets;
        const ticketPrice = selectedEvent.price || 150;

        if (requestedTickets > availableTickets) {
            showMessage(`Tyvärr finns det bara ${availableTickets} biljetter kvar!`, 'error');
            return;
        }

        const booking = {
            eventId: eventId,
            customerName: customerName,
            customerEmail: customerEmail,
            ticketCount: requestedTickets,
            bookingDate: new Date().toISOString(),
            totalPrice: ticketPrice * requestedTickets,
        };

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

        showMessage(`Tack ${customerName}! Du har bokat ${requestedTickets} biljetter till "${selectedEvent.title}". Totalt: ${booking.totalPrice} kr.`, 'success');
        
        document.getElementById('ticket-form').reset();
        
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