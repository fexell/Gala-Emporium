// Bokningssystem för Movie Soundtrack Orchestra

// Vi börjar med att ladda events när sidan laddas
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bokningssystem laddat!');
    
    // Ladda events till dropdown
    loadBookingEvents();


    // Lyssna på bokningsformuläret. anrop funktionen handleBooking när formuläret skickas
    const bookingForm = document.getElementById('ticket-form');
    bookingForm.addEventListener('submit', handleBooking);

});





async function loadBookingEvents() {
    try {
        // Hämta alla events från servern
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();
        
        // Filtrera bara movie-soundtrack events
        const movieEvents = allEvents.filter(event => event.category === 'movie-soundtrack');
        
        // Sortera efter datum (samma som på huvudsidan)
        movieEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Hitta dropdown-menyn
        const eventSelect = document.getElementById('pick-show');
        
        // Rensa befintliga alternativ (förutom den första "Vilket event...")
        eventSelect.innerHTML = '<option value="">Vilket event vill du gå på?</option>';
        
        // Lägg till varje event som ett alternativ
        movieEvents.forEach(event => {
            const eventDate = new Date(event.datetime);
            const formattedDate = eventDate.toLocaleDateString('sv-SE');
            const formattedTime = eventDate.toLocaleTimeString('sv-SE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const availableTickets = event.maxTickets - event.ticketCount;
            
            // Skapa option element
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = `${event.title} - ${formattedDate} kl ${formattedTime} (${availableTickets} biljetter kvar)`;
            
            // Inaktivera om inga biljetter kvar
            if (availableTickets === 0) {
                option.disabled = true;
                option.textContent += ' - SLUTSÅLT';
            }
            
            eventSelect.appendChild(option); // Lägg till i dropdown "pick-show"
        });
        
    } catch (error) {
        console.error('Fel vid laddning av booking events:', error);
    }
}