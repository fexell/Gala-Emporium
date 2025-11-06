/* 
   MOVIE SOUNDTRACK ORCHESTRA - MAIN JS
   Ansvar: Kundfunktionalitet och event-visning
   - Admin-panel toggle och tab-switching
   - Ladda och visa events för kunder
   - Hantera "Boka Biljetter" knapp-klick */

// Admin-knapp funktionalitet - visa/dölj admin-formulär
const adminBtn = document.getElementById('admin-btn');
const adminStuff = document.getElementById('admin-stuff');

adminBtn.addEventListener('click', () => {
  //toggle för att visa/dölja admin-sektionen
  //hide-klassen läggs till eller tas bort.
  //class="admin-box hide" blir class="admin-box"
  //och vice versa
  adminStuff.classList.toggle('hide');
  
  // ändra knapptext beroende på om admin är synligt eller inte
  if (adminStuff.classList.contains('hide')) {
    adminBtn.textContent = 'Visa Admin';
  } else {
    adminBtn.textContent = 'Dölj Admin';
  }
});


// Tab-funktionalitet för admin-panelen
// hämta alla tab-knappar (Lägg till event, Hantera events, Se bokningar). Lista med 3 knappar.
const tabButtons = document.querySelectorAll('.tab-btn');
// hämta alla tab-innehåll (de olika sektionerna som visas/döljs). Lista med 3 divs.
const tabContents = document.querySelectorAll('.tab-content');

// gå igenom varje tab-knapp och lägg till click-lyssnare
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    
    // steg 1: ta bort 'active' klassen från alla tab-knappar (gör alla gråa och inaktiva)
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // steg 2: dölj alla tab-innehåll genom att lägga till 'hide' klassen
    //Alla 3 innehålls sektioner försvinner.
    tabContents.forEach(content => content.classList.add('hide'));
    
    // steg 3: lägg till 'active' klassen på den knapp som blev klickad (gör den gul/aktiv). bara den klickade knappen lyser upp. button är den knapp som användaren klickade på (deklareras i foreach ovan som lyssnar efter click).
    button.classList.add('active');
    
    // steg 4: ta reda på vilken tab som ska visas genom att läsa data-tab attributet från den klickade knappen. 
    const targetTab = button.getAttribute('data-tab'); // t.ex "add-event"
    
    // steg 5:  Hitta HTML-elementet med detta ID från data-tab ovan och ta bort hide-klassen för att visa det.
    document.getElementById(targetTab).classList.remove('hide');
  });
});






/* 
   HUVUDFUNKTION: Ladda events för kunder
   Detta är hjärtat i kundsidan - visar alla
   kommande filmmusikkonserter sorterat efter datum*/

async function loadCustomerEvents() {
    try {
        // Hämta alla events från servern
        const response = await fetch('http://localhost:5000/events');
        const allEvents = await response.json();
        
        // Filtrera bara movie-soundtrack events
        const movieEvents = allEvents.filter(event => event.category === 'movie-soundtrack');
        
        // Sortera events efter datum (tidigaste först)
        movieEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
        
        // Hitta containern där events ska visas
        const showContainer = document.getElementById('show-container');
        
        // Rensa befintligt innehåll
        showContainer.innerHTML = '';
        
        // Om inga events finns
        if (movieEvents.length === 0) {
            showContainer.innerHTML = '<p>Inga kommande evenemang just nu. Håll utkik!</p>';
            return;
        }
        
        // Skapa HTML för varje event
        movieEvents.forEach(event => {
            // Formatera datum och tid så att det visas på ett läsbart sätt
            const eventDate = new Date(event.datetime);
            const formattedDate = eventDate.toLocaleDateString('sv-SE');
            const formattedTime = eventDate.toLocaleTimeString('sv-SE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Beräkna tillgängliga biljetter
            const availableTickets = event.maxTickets - event.ticketCount;
            
            // Skapa event-kort
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';

            eventCard.innerHTML = `
                <h3>${event.title}</h3>
                <p>${formattedDate} kl ${formattedTime}</p>
                <p>Plats: ${event.location}</p>
                <p>${event.description}</p>
                <div class="event-bottom">
                    <p class="price-info">Pris: ${event.price} kr</p>
                    <p class="ticket-info">${availableTickets} biljetter kvar av ${event.maxTickets}</p>
                    <button class="book-btn" onclick="scrollToBooking('${event.id}')">Boka Biljetter</button>
                </div>
            `;
            //button ovan anropar scrollToBooking med event.id när den klickas

            showContainer.appendChild(eventCard); // lägg till event-kortet i containern show-container
        });
        
    } catch (error) {
        console.error('Fel vid laddning av events:', error);
        document.getElementById('show-container').innerHTML = '<p>Kunde inte ladda evenemang. Försök igen senare.</p>';
    }
}


// Funktion för att scrolla till bokning och formuläret
function scrollToBooking(eventId) {
    // Scrolla till bokningssektionen
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    
    // Vänta lite så att scrollningen hinner slutföras, sedan förifyll dropdown
    setTimeout(() => {
        const eventSelect = document.getElementById('pick-show'); // eventSelect blir dropdown-menyn
        eventSelect.value = eventId; // sätt dropdown till valt event
    }, 500);
}

// Ladda events när sidan laddas
document.addEventListener('DOMContentLoaded', loadCustomerEvents);