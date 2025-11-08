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

// DOM elements
const totalEvents = document.getElementById('total-events');
const totalClubs = document.getElementById('total-clubs');
const clubsGrid = document.getElementById('clubs-grid');
const viewAllClubsBtn = document.getElementById('view-all-clubs');
const clubFilter = document.getElementById('club-filter');
const sortFilter = document.getElementById('sort-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const eventsTimeline = document.getElementById('events-timeline');
const noEventsMessage = document.getElementById('no-events-message');



// Uppdatera statistik i hero-sektionen
async function updateStatistics() {
    try {
        // Hämta events från servern (samma som movie-soundtrack)
        const eventsResponse = await fetch('http://localhost:5000/events');
        const allEvents = await eventsResponse.json();
        
        // Hämta klubbar från servern
        const clubsResponse = await fetch('http://localhost:5000/clubs');
        const allClubs = await clubsResponse.json();
        
        // Uppdatera siffrorna i DOM
        totalEvents.textContent = allEvents.length;
        totalClubs.textContent = allClubs.length;
        
    } catch (error) {
        console.error('Fel vid laddning av statistik:', error);
        totalEvents.textContent = '-';
        totalClubs.textContent = '-';
    }
}




// ================================
// KÖRS NÄR SIDAN LADDAS
// ================================

// Vänta tills DOM är laddad, sedan kör funktionerna
document.addEventListener('DOMContentLoaded', function() {
  
    console.log('🎭 Startsidan laddas...');
    
    // Uppdatera statistik
    updateStatistics();
});