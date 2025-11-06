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





// Hantera bokningsformulär submission. event är formulärets submit-event d.v.s. när användaren klickar på "Boka Biljetter". Det är kopplat till just det elementet via addEventListener ovan.
async function handleBooking(event) {
    event.preventDefault(); // Stoppa formuläret från att ladda om sidan

    // Hämta formulärdata på bokningen och tilldela till variabler
    const eventId = document.getElementById('pick-show').value;
    const customerName = document.getElementById('your-name').value;
    const customerEmail = document.getElementById('your-email').value;
    const requestedTickets = parseInt(document.getElementById('how-many').value);
    
    // Validera att ett event är valt annars visa alert
    if (!eventId) {
        alert('Välj vilket event du vill gå på!');
        return;
    }
    
    try {

        // Hämta event-information från servern för att kolla biljetter och pris
        const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
        const selectedEvent = await eventResponse.json();

        // Beräkna tillgängliga biljetter. maxTickets är totala biljetter, ticketCount är redan sålda biljetter. 
        const availableTickets = selectedEvent.maxTickets - selectedEvent.ticketCount;

        // Kolla om det finns tillräckligt med biljetter. requestedTickets är antal biljetter användaren vill boka som jämförs med availableTickets.
        if (requestedTickets > availableTickets) {
          alert(`Tyvärr finns det bara ${availableTickets} biljetter kvar!`);
        return;
        }
      
      
      // Skapa bokningsobjekt som ska sparas i databasen
      const booking = {
          eventId: eventId,
          customerName: customerName,
          customerEmail: customerEmail,
          ticketCount: requestedTickets,
          bookingDate: new Date().toISOString(),
          totalPrice: selectedEvent.price * requestedTickets
      };

        // Spara bokning till databasen
          const bookingResponse = await fetch('http://localhost:5000/bookings', {
          method: 'POST', // Skicka som POST request
          headers: {      // Sätt rätt headers för JSON
            'Content-Type': 'application/json',  // specificera att vi skickar JSON
          },
          body: JSON.stringify(booking)  // konvertera objektet till JSON-sträng
        });

        // Kolla om bokningen lyckades annars kasta fel
        if (!bookingResponse.ok) {
          throw new Error('Kunde inte spara bokning');
        }
          
  
        // Uppdatera event med nya ticket count
        const updatedEvent = { // skapa ett nytt objekt med uppdaterad ticketCount
          ...selectedEvent,   // behåll all befintlig data och ändra bara ticketCount. selectedEvent är det ursprungliga event-objektet vi hämtade från servern.
          ticketCount: selectedEvent.ticketCount + requestedTickets  // lägg till de bokade biljetterna
       };

       // Skicka uppdateringen till servern
       const updateResponse = await fetch(`http://localhost:5000/events/${eventId}`, {
        method: 'PUT',  // Använd PUT för att uppdatera hela event-objektet
        headers: {  
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent) // skicka det uppdaterade event-objektet skapad ovan
      });

      if (!updateResponse.ok) {  // kolla om uppdateringen lyckades
        throw new Error('Kunde inte uppdatera biljetträknare');
      }

      // Visa bekräftelse och rensa formulär
      alert(`Grattis ${customerName}! Din bokning är bekräftad. Du har bokat ${requestedTickets} biljetter till "${selectedEvent.title}". Totalkostnad: ${booking.totalPrice} kr.`);

      document.getElementById('ticket-form').reset();
      loadCustomerEvents(); // Uppdatera kundsidan
      loadBookingEvents(); // Uppdatera dropdown

    } catch (error) {
        console.error('Fel vid bokning:', error);
        alert('Något gick fel vid bokningen. Försök igen!');
    }
}