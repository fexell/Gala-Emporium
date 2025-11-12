/**
 * ================================
 * GALA EMPORIUM 2025 - STARTSIDA
 * ================================
 * 
 * Huvudfunktionalitet för startsidan:
 * - Ladda och visa klubbar och evenemang från databasen
 * - Hantera filter och sortering
 * - Uppdatera statistik i hero-sektionen
 * - Rendera dynamiskt innehåll
 * 

 */

import { apiClient } from '../../helpers/Api.helper.js';

// ================================
// DOM ELEMENT REFERENSER
// ================================
// Här samlar vi alla HTML-element vi behöver manipulera

// DOM elements. söker de via id för snabb åtkomst.
const totalEvents = document.getElementById('total-events');
const totalClubs = document.getElementById('total-clubs');
const clubsGrid = document.getElementById('clubs-grid');
const clubFilter = document.getElementById('club-filter');
const sortFilter = document.getElementById('sort-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const eventsTimeline = document.getElementById('events-timeline');
const noEventsMessage = document.getElementById('no-events-message');

// Globala variabler som fylls med data från servern
let allEvents = [];
let allClubs = [];

// Hämta all data från servern en gång
async function loadAllData() {
  try {
    // Hämta events och clubs från servern 
    const [eventsResponse, clubsResponse] = await Promise.all([
      fetch('http://localhost:5000/events'),
      fetch('http://localhost:5000/clubs')
    ]);

    // Spara datan i de globala variablerna skapade ovan
    allEvents = await eventsResponse.json();
    allClubs = await clubsResponse.json();

  } catch (error) {
    // Fånga fel och logga dem
    console.error('Fel vid laddning av data:', error);
  }
}


// Uppdatera statistik (nu använder globala variablerna)
function updateStatistics() {
  // Uppdatera statistik DOM innehåll med antal events och clubs
  totalEvents.textContent = allEvents.length;
  totalClubs.textContent = allClubs.length;
}



// ================================
// RENDERA KLUBBAR
// ================================
/**
 * Funktion som visar alla klubbar på sidan
 * Den skapar ett HTML-kort för varje klubb i databasen
 */
function renderClubs() {
  // Rensa tidigare innehåll i clubs-grid
  // Detta gör att vi inte får dubbletter om funktionen körs flera gånger
  clubsGrid.innerHTML = '';

  // forEach loopar igenom arrayen allClubs
  // För varje klubb (club) i arrayen, kör koden inuti { }
  allClubs.forEach(club => {

    // Räkna antal events för denna klubb
    // OBS: club.id kan vara sträng eller nummer, event.clubId också
    // Vi konverterar båda till nummer för säker jämförelse
    const clubEventCount = allEvents.filter(event => Number(event.clubId) === Number(club.id)).length;

    // Skapa ett nytt div-element för klubbkortet
    const clubCard = document.createElement('div');

    // Ge div-elementet CSS-klassen 'club-card' för styling
    clubCard.className = 'club-card';

    // innerHTML sätter HTML-innehållet inuti div:en
    // Vi använder template literals (backticks `) för att kunna 
    // bädda in JavaScript-variabler med ${variabel}
    // VIKTIGT: Elementen måste vara direkta barn till club-card för att grid ska fungera!
    clubCard.innerHTML = `
            <h3>${club.name}</h3>
            <p class="club-location">📍 ${club.location}</p>
            <p class="club-description">${club.description}</p>
            <p class="club-event-count">🎫 ${clubEventCount} evenemang</p>
            <button class="club-btn" data-club-id="${club.id}">Besök klubb</button>
        `;

    // appendChild lägger till det nya klubbkortet i clubs-grid
    // Nu syns kortet på sidan!
    clubsGrid.appendChild(clubCard);

    clubFilter.appendChild(new Option(club.name, club.id));
  });

  // Lägg till event listeners för "Besök klubb"-knapparna
  // Detta körs efter att alla klubbkort har skapats
  addClubEventListeners();
}

// ================================
// HANTERA KLUBBNAVIGATION
// ================================

/**
 * Lägger till event listeners för alla "Besök klubb"-knappar
 * Denna funktion kallas efter att klubbkorten har renderats
 * 
 * Pedagogiskt: Klubb-baserad navigation - vi använder data-club-id 
 * för att identifiera vilken klubb användaren vill besöka
 */
function addClubEventListeners() {
  // Hitta alla "Besök klubb"-knappar
  const clubButtons = document.querySelectorAll('.club-btn');

  // Lägg till click-event för varje knapp
  clubButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Hämta club-id från data-attributet
      const clubId = this.getAttribute('data-club-id');

      // Hitta vilken klubb detta är
      const club = allClubs.find(c => c.id == clubId); // Använd == för datatyp-flexibilitet

      if (club) {
        // Navigera till rätt klubbs sida baserat på klubb-id
        let targetPage;

        if (clubId == 1) { // Opera Hall
          targetPage = '../index.html';
        } else if (clubId == 2) { // Movie Soundtrack Orchestra
          targetPage = 'movie-soundtrack.html';
        } else if (clubId == 3) { // Remote Nightclub
          targetPage = 'remote-nightclub.html';
        } else if (clubId == 4) { // EDM Club
          targetPage = 'edm.html';
        } else {
          // Fallback - om okänd klubb, stanna på startsidan
          console.warn('Okänd klubb-id:', clubId);
          return; // Gör ingenting, stanna på samma sida
        }

        window.location.href = targetPage.startsWith('../') ? targetPage : `../pages/${targetPage}`;
      } else {
        console.error('Klubb inte hittad för ID:', clubId);
      }
    });
  });


}

// Sortering
function sortEvents() {

  // Hitta den valda sorteringen
  const selectElement = document.getElementById('sort-filter');
  const selectedValue = selectElement.value;

  // Sortera evenemang efter vald sortering
  if (selectedValue === 'date-asc') {
    allEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  } else if (selectedValue === 'date-desc') {
    allEvents.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  } else if (selectedValue === 'price-asc') {
    allEvents.sort((a, b) => a.price - b.price)
  } else if (selectedValue === 'price-desc') {
    allEvents.sort((a, b) => b.price - a.price)
  }
}

async function sortByClub() {

  // Hitta den valda klubben
  const selectElement = document.getElementById('club-filter');
  const selectedValue = selectElement.value;

  allEvents = selectedValue !== 'all'
    ? await apiClient.get(`/events?clubId=${selectedValue}`)
    : await apiClient.get('/events');
}

// ================================
// RENDERA EVENEMANG
// ================================
/**
 * Funktion som visar alla evenemang på sidan
 * Den hämtar evenemang från databasen och skapar HTML-kort för varje event
 * Evenemangen sorteras efter datum (tidigast först)
 */
function loadEvents() {

  try {
    // STEG 1: Filtrera bara kommande evenemang (inte gamla)
    const today = new Date(); // Dagens datum
    today.setHours(0, 0, 0, 0); // Nollställ tid

    // Filtrera evenemang som är idag eller senare
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.datetime); // event.datetime är eventets datum och tid
      return eventDate >= today; // Visa bara events som är idag eller senare
    });


    // STEG 2: Sortera evenemang efter datum (tidigast först)
    /* upcomingEvents.sort((a, b) => {
        return new Date(a.datetime) - new Date(b.datetime); // sortering där a är tidigare än b
    }); */

    // STEG 3: Rensa tidigare innehåll
    eventsTimeline.innerHTML = '';

    // STEG 4: Om inga evenemang finns, visa meddelande
    if (upcomingEvents.length === 0) {
      noEventsMessage.classList.remove('hide'); // Visa "inga evenemang" meddelandet som är gömd annars
      return;
    }

    // STEG 5: Gömma "inga evenemang" meddelandet om det finns events
    noEventsMessage.classList.add('hide');

    // STEG 6: Skapa HTML för varje evenemang
    upcomingEvents.forEach(event => {
      // Hitta klubben som arrangerar detta evenemang
      const club = allClubs.find(c => c.id == event.clubId);  // VIKTIGT: Klubb-id är strängar i databasen men event.clubId är nummer. Därför använder vi == istället för ===
      // Hantera fall där klubb inte hittas
      const clubName = club.name;


      // Formatera datum för visning för användaren
      const eventDate = new Date(event.datetime);

      // Skapa event-kort HTML
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';

      eventCard.innerHTML = `
                <div class="event-date">
                    <span class="event-day">${eventDate.getDate()}</span>
                    <span class="event-month">${eventDate.toLocaleDateString('sv-SE', { month: 'short' })}</span>
                </div>
                <div class="event-info">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-club"> ${clubName}</p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-details">
                        <span class="event-time">🕐 ${eventDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span class="event-price">💰 ${event.price} kr</span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="book-ticket-btn" data-event-id="${event.id}">
                        Till Klubben
                    </button>
                </div>
            `;

      // Lägg till event-kortet i timeline
      eventsTimeline.appendChild(eventCard);
    });

    // Lägg till event listeners för "Boka biljett"-knapparna
    // Detta körs efter att alla event-kort har skapats. funktionen anropas här.
    EventListeners();

  } catch (error) {
    console.error('Fel vid laddning av evenemang:', error);
    noEventsMessage.classList.remove('hide');
  }
}

// ================================
// HANTERA BILJETTBOKNING
// ================================

/**
 * Lägger till event listeners för alla "event-booking" knappar
 * Denna funktion kallas efter att event-korten har renderats
 * 
 * Pedagogiskt: Event delegation - vi lyssnar på alla knappar med klassen 'book-ticket-btn'
 * och använder data-event-id attributet för att identifiera vilket event som ska bokas och skickar användaren till bokningssidan.
 */
function EventListeners() {
  // Hitta alla "Boka biljett"-knappar
  const bookingButtons = document.querySelectorAll('.book-ticket-btn');

  // Lägg till click-event för varje knapp
  bookingButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();

      // Hämta event-id från data-attributet
      const eventId = this.getAttribute('data-event-id');

      // Hitta vilket event detta är med sökning i allEvents efter rätt id
      const event = allEvents.find(e => e.id === eventId);

      if (event) {
        // Navigera till rätt klubbs sida baserat på eventets kategori
        let targetPage;

        // Bestäm målsida baserat på eventets clubId
        if (event.clubId == 1) {
          targetPage = '../index.html';
        } else if (event.clubId == 2) {
          targetPage = 'movie-soundtrack.html';
        } else if (event.clubId == 3) {
          targetPage = 'remote-nightclub.html';
        } else if (event.clubId == 4) {
          targetPage = 'edm.html';
        } else {
          // Fallback - om okänd clubId, gå tillbaka till startsidan
          targetPage = 'home.html';
        }

        // Redirecta användaren till målsidan
        window.location.href = targetPage.startsWith('../') ? targetPage : `../pages/${targetPage}`;

      } else {
        console.error('Event inte hittat för ID:', eventId);
      }
    });
  });

}

// ================================
// KÖRS NÄR SIDAN LADDAS
// ================================

// Vänta tills DOM är laddad, sedan kör funktionerna
document.addEventListener('DOMContentLoaded', async function () {

  await loadAllData();  // Hämta allt först

  updateStatistics(); // Anropa funktionen för att uppdatera statistik.

  renderClubs();      // Anropa funktionen för att visa klubbar.

  loadEvents();         //  Visa evenemang

  // Sortering, när användaren ändrar vad att sortera på
  document.getElementById('sort-filter').addEventListener('change', () => {
    sortEvents()
    loadEvents()
  })

  document.getElementById('club-filter').addEventListener('change', async () => {
    await sortByClub()
    sortEvents()
    loadEvents()
  })

  clearFiltersBtn.addEventListener('click', async () => {
    allEvents = await apiClient.get('/events');

    clubFilter.value = 'all';
    sortFilter.value = 'date-asc';

    sortEvents();
    loadEvents();
  })

  // Sortering, efter att sidan laddats
});

// ================================
// EXPONERA FUNKTIONER TILL GLOBALT SCOPE
// ================================
// Eftersom detta är en modul (type="module"), är alla funktioner privata
// Vi exponerar dessa funktioner till window så att home-admin.js kan använda dem
window.loadAllData = loadAllData;
window.updateStatistics = updateStatistics;
window.renderClubs = renderClubs;
window.loadEvents = loadEvents;