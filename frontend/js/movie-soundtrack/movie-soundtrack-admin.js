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