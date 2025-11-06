/* MOVIE SOUNDTRACK ORCHESTRA - ADMIN JS
   Ansvar: Administratörsfunktionalitet
   - Skapa nya events (formulärhantering)
   - Ta bort events med bekräftelse
   - Visa alla bokningar för våra events
   - Återbetala bokningar och återställa biljetter */

// Vänta på att sidan laddas
document.addEventListener('DOMContentLoaded', function() {
    // Hitta formuläret
    const form = document.getElementById('new-event');
    
    // Lyssna på när formuläret skickas
    form.addEventListener('submit', function(event) {
        // Förhindra att sidan laddas om
        event.preventDefault();

        // Hämta alla värden i formuläret här nedan
        const eventName = document.getElementById('event-name').value;
        const eventDate = document.getElementById('event-when').value;
        const eventLocation = document.getElementById('event-where').value;
        const eventDescription = document.getElementById('event-info').value;
        const eventPrice = document.getElementById('event-cost').value;
        const eventMaxTickets = document.getElementById('event-max').value;
        const eventImage = document.getElementById('event-img').value;


        // Skapa ett objekt med all data som matats in i formuläret
        // Detta objekt kan sedan skickas till servern med fetch()
        const eventData = {
            title: eventName,
            datetime: eventDate,             
            location: eventLocation,         
            description: eventDescription,   
            price: parseFloat(eventPrice),    
            maxTickets: parseInt(eventMaxTickets), 
            ticketCount: 0,
            category: "movie-soundtrack",
            clubId: 2,
            eventImage: eventImage || "default.jpg"  
        };

        // Skicka till servern
        fetch('http://localhost:5000/events', {
            method: 'POST', //metod för att skapa nytt event
            headers: {      // specificera att vi skickar JSON
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)  // konvertera objektet till JSON-sträng
          })

          .then(response => {  // hantera svaret från servern
              if (response.ok) {
                  alert('Event skapat!');
                  form.reset(); // Rensa formuläret
                  
                  // Uppdatera både admin-listan och kundsidan automatiskt
                  loadAdminEvents(); // Uppdatera admin-panelen
                  loadCustomerEvents(); // Uppdatera kundsidan
              } else {
                  alert('Något gick fel!');
              }
          })

          .catch(error => {
              console.error('Fel:', error);
              alert('Något gick fel: ' + error);
        });
       
    }); 

    // Lyssna på tab-klick för att ladda events när "Hantera events" klickas
    const tabButtons = document.querySelectorAll('.tab-btn');
    // gå igenom varje tab-knapp och lägg till click-lyssnare
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Om användaren klickar på "Hantera events" tab
            if (tabName === 'manage-events') {
                loadAdminEvents(); // Ladda events automatiskt
            }
            
            // Om användaren klickar på "Se bokningar" tab
            if (tabName === 'view-bookings') {
                loadAdminBookings(); // Ladda bokningar automatiskt
            }
        });
    });
}); 



// Funktion för att ladda alla events i admin-panelen
async function loadAdminEvents() {
    try {
        // Hämta alla events från servern
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();
        
        // Filtrera bara movie-soundtrack events (våra events)
        const movieEvents = allEvents.filter(event => event.category === 'movie-soundtrack');
        
        // Sortera events efter datum (tidigaste först)
        movieEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Hitta containern där vi ska visa events
        const adminEventsList = document.getElementById('admin-events-list');
        
        // Rensa befintligt innehåll
        adminEventsList.innerHTML = '';
        
        // Om inga events finns
        if (movieEvents.length === 0) {
            adminEventsList.innerHTML = '<p>Inga movie-soundtrack events hittades.</p>';
            return;
        }
        
        // Skapa HTML för varje event
        movieEvents.forEach(event => {
            // Formatera datum och tid. För att visa på ett läsbart sätt.
            const eventDate = new Date(event.datetime);
            const formattedDate = eventDate.toLocaleDateString('sv-SE');
            const formattedTime = eventDate.toLocaleTimeString('sv-SE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Skapa event-kort med delete-knapp
            const eventDiv = document.createElement('div');
            eventDiv.className = 'admin-event-item';
            eventDiv.innerHTML = `
                <h4>${event.title}</h4>
                <p><strong>Datum:</strong> ${formattedDate} ${formattedTime}</p>
                <p><strong>Plats:</strong> ${event.location}</p>
                <p><strong>Pris:</strong> ${event.price} kr</p>
                <p><strong>Biljetter:</strong> ${event.ticketCount}/${event.maxTickets}</p>
                <button class="delete-btn" onclick="deleteEvent('${event.id}')">Ta bort event</button>
            `;
            
            adminEventsList.appendChild(eventDiv); //lägg till i admin-listan
        });
        
    } catch (error) {
        console.error('Fel vid laddning av events:', error);
        document.getElementById('admin-events-list').innerHTML = '<p>Fel vid laddning av events.</p>';
    }
}


// Funktion för att ta bort ett event
async function deleteEvent(eventId) {
    // Bekräfta att användaren verkligen vill ta bort
    if (!confirm('Är du säker på att du vill ta bort detta event?')) {
        return; // Avbryt om användaren säger nej
    }
    
    try {
        // Skicka DELETE-request till servern. eventId kommer från knappen som användaren klickade på.
        const response = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Event borttaget!');
            // Ladda om både admin-listan och kundsidan
            loadAdminEvents();
            loadCustomerEvents(); // Uppdatera kundsidan också
        } else {
            alert('Kunde inte ta bort eventet!');
        }
    } catch (error) {
        console.error('Fel vid borttagning:', error);
        alert('Något gick fel: ' + error);
    }
}







// Funktion för att ladda alla bokningar i admin-panelen
async function loadAdminBookings() {
    try {
        // Hämta alla bokningar från servern
        const bookingsResponse = await fetch('http://localhost:5000/bookings');
        const allBookings = await bookingsResponse.json();
        
        // Hämta alla events för att få event-namn
        const eventsResponse = await fetch('http://localhost:5000/events');
        const allEvents = await eventsResponse.json();
        
        // Filtrera bara movie-soundtrack events (våra events)
        const movieEvents = allEvents.filter(event => event.category === 'movie-soundtrack');
        const movieEventIds = movieEvents.map(event => event.id);
        
        // Filtrera bokningar så vi bara får de som tillhör våra events i en lista.
        //Här används kopplingen mellan booking och event via eventId
        //Enbart bokningar för våra movie-soundtrack events visas nu då vi filtrerar efter eventId kopplat till våra movie-soundtrack events.
        const movieBookings = allBookings.filter(booking => movieEventIds.includes(booking.eventId));
        
        // Hitta containern där vi ska visa bokningar
        const bookingsList = document.getElementById('bookings-list');
        
        // Rensa befintligt innehåll
        bookingsList.innerHTML = '';
        
        // Om inga bokningar finns för våra events
        if (movieBookings.length === 0) {
            bookingsList.innerHTML = '<p>Inga bokningar hittades för movie-soundtrack events.</p>';
            return;
        }
        
        // Skapa HTML för varje bokning (bara våra)
        movieBookings.forEach(booking => {
           // Hitta vilket event bokningen tillhör
          const event = movieEvents.find(e => e.id === booking.eventId);
          const eventTitle = event.title; // eventTitle används nedan

            //Förmatera datum som visas nedan så det blir läsbart.
            const bookingDate = new Date(booking.bookingDate); // <- Datumet när bokningen gjordes
            const formattedDate = bookingDate.toLocaleDateString('sv-SE'); // Formatera datum
            const formattedTime = bookingDate.toLocaleTimeString('sv-SE', {  // Formatera tid
                hour: '2-digit',   // Timme med två siffror
                minute: '2-digit' // Minut med två siffror
            });
            
            // Skapa boknings-kort i admin-panelen
            const bookingDiv = document.createElement('div'); // Skapa ett div-element
            bookingDiv.className = 'admin-booking-item'; // Lägg till en CSS-klass för styling
            // Fyll kortet med bokningsinfo
            bookingDiv.innerHTML = `       
                <h4>${eventTitle}</h4>
                <p><strong>Kund:</strong> ${booking.customerName}</p>
                <p><strong>Email:</strong> ${booking.customerEmail}</p>
                <p><strong>Antal biljetter:</strong> ${booking.ticketCount}</p>
                <p><strong>Totalpris:</strong> ${booking.totalPrice} kr</p>
                <p><strong>Bokad:</strong> ${formattedDate} ${formattedTime}</p>
                <button class="delete-btn" onclick="refundBooking('${booking.id}', '${booking.eventId}', ${booking.ticketCount})">Återbetala</button>
            `;
            // Knappen ovan (delete-btn) anropar refundBooking med booking.id, eventId och antal biljetter
            
            bookingsList.appendChild(bookingDiv);
        });
        
    } catch (error) {
        console.error('Fel vid laddning av bokningar:', error);
        document.getElementById('bookings-list').innerHTML = '<p>Fel vid laddning av bokningar.</p>';
    }
}






// Funktion för att återbetala en bokning (ta bort bokning och återställa biljetter)
//Vi tar emot 3 parametrar: bookingId (vilken bokning), eventId (vilket event) och ticketCount (antal biljetter som ska återställas) när återbetala knappen klickas.
async function refundBooking(bookingId, eventId, ticketCount) {
    // Bekräfta att administratören verkligen vill återbetala
    if (!confirm('Är du säker på att du vill återbetala denna bokning?')) {
        return; // Avbryt om användaren säger nej
    }
    
    try {
        // Steg 1: Ta bort bokningen från databasen
        const deleteResponse = await fetch(`http://localhost:5000/bookings/${bookingId}`, {
            method: 'DELETE' // DELETE-metod för att ta bort bokningen
        });
        
        if (!deleteResponse.ok) {   // Kontrollera om borttagningen lyckades annars kasta felmeddelande
            throw new Error('Kunde inte ta bort bokning'); 
        }
        
        // Steg 2: Hämta det aktuella eventet för att uppdatera biljetträknaren
        const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
        const event = await eventResponse.json();
        
        // Steg 3: Minska ticketCount (ge tillbaka biljetterna)
        const updatedEvent = { // Skapa ett nytt event-objekt med uppdaterad ticketCount
            ...event,     // Behåll alla andra egenskaper som de är
            ticketCount: event.ticketCount - ticketCount // Minska ticketCount med antalet återbetalade biljetter
        };
        
        // Steg 4: Uppdatera eventet i databasen
        const updateResponse = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'PUT', // Använd PUT för att uppdatera hela event-objektet
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent) // Skicka det uppdaterade event-objektet skapad ovan
        });
        
        if (!updateResponse.ok) {   // Kontrollera om uppdateringen lyckades annars kasta felmeddelande
            throw new Error('Kunde inte uppdatera biljetträknare');
        }
        
        alert('Bokning återbetald! Biljetterna är nu tillgängliga igen.');
        
        // Uppdatera alla vyer
        loadAdminBookings(); // Uppdatera bokningslistan
        loadAdminEvents();   // Uppdatera admin events (nya biljettsiffror)
        loadCustomerEvents(); // Uppdatera kundsidan
        loadBookingEvents();  // Uppdatera dropdown
        
    } catch (error) {
        console.error('Fel vid återbetalning:', error);
        alert('Något gick fel vid återbetalningen. Försök igen!');
    }
}