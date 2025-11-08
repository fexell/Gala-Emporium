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

        //Fånga fel.
    } catch (error) {
        console.error('Fel vid laddning av data:', error);
        return { events: [], clubs: [] };
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
            <button class="club-btn" data-club-id="${club.id}">Besök klubb</button>
        `;

        // appendChild lägger till det nya klubbkortet i clubs-grid
        // Nu syns kortet på sidan!
        clubsGrid.appendChild(clubCard);
    });


}




// ================================
// KÖRS NÄR SIDAN LADDAS
// ================================

// Vänta tills DOM är laddad, sedan kör funktionerna
document.addEventListener('DOMContentLoaded', async function () {

    await loadAllData();  // Hämta allt först
    // Uppdatera statistik

    updateStatistics(); // Anropa funktionen för att uppdatera statistik.

    renderClubs();      // Anropa funktionen för att visa klubbar.

});