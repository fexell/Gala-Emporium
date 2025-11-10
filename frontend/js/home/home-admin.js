/* 
   GALA EMPORIUM - HOME ADMIN JS
   Ansvar: Klubbhantering på startsidan
   - Skapa nya klubbar
   - Ta bort befintliga klubbar
   - Visa alla klubbar för admin
*/

// ==========================================
// STEG 1: Vänta tills hela sidan har laddats
// ==========================================
document.addEventListener('DOMContentLoaded', function () {

  // ==========================================
  // STEG 2: Hämta viktiga element från HTML
  // ==========================================
  const adminBtn = document.getElementById('admin-btn');       // Knappen "Visa Admin"
  const adminPanel = document.getElementById('admin-panel');   // Admin-panelen som visas/döljs
  const addClubForm = document.getElementById('add-club-form'); // Formuläret för att skapa klubb

  // ==========================================
  // STEG 3: Admin-knapp funktionalitet
  // När användaren klickar på "Visa Admin" knappen
  // ==========================================
  if (adminBtn && adminPanel) { // Kolla så elementen finns
    adminBtn.addEventListener('click', function () { //lyssnare för klick på adminBtn

      // Toggle hide-klassen (lägger till om den inte finns, tar bort om den finns)
      //hide är css class som döljer elementet
      adminPanel.classList.toggle('hide');

      // Om panelen är dold (har hide-klassen)
      if (adminPanel.classList.contains('hide')) {
        adminBtn.textContent = 'Visa Admin'; // Ändra knapptext
      }
      // Om panelen är synlig (inte har hide-klassen)
      else {
        adminBtn.textContent = 'Dölj Admin';  // Ändra knapptext
        loadAdminClubs();                     // Ladda alla klubbar. Funktionen finns längre ner

        // Scrolla mjukt ner till admin-panelen efter 100ms (så hinner panelen visas först)
        setTimeout(() => {
          adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  }

  // ==========================================
  // STEG 4: Formulär-lyssnare
  // När användaren skickar formuläret (klickar "Lägg till klubb")
  // ==========================================
  if (addClubForm) {
    addClubForm.addEventListener('submit', handleAddClub);
  }
});


// ==========================================
// FUNKTION: Lägg till ny klubb
// Körs när formuläret skickas
// ==========================================
async function handleAddClub(event) {
  // Förhindra att sidan laddas om (default formulär-beteende)
  event.preventDefault();

  // Hämta alla värden från formuläret
  const clubName = document.getElementById('club-name').value;
  const clubLocation = document.getElementById('club-location').value;
  const clubDescription = document.getElementById('club-description').value;
  const clubEmail = document.getElementById('club-email').value;
  const clubPhone = document.getElementById('club-phone').value;

  // Skapa ett objekt med all klubb-data
  const clubData = {
    name: clubName,
    location: clubLocation,
    description: clubDescription,
    email: clubEmail,
    phone: clubPhone,
    clubImage: 'default-club.jpg' //Ifall vi vill ha en standardbild fält
  };

  try {
    // Skicka klubb-data till servern med POST-request
    const response = await fetch('http://localhost:5000/clubs', {
      method: 'POST',                          // POST = skapa ny data
      headers: {
        'Content-Type': 'application/json'     // Vi skickar JSON-data
      },
      body: JSON.stringify(clubData)           // Konvertera objektet till JSON-sträng
    });

    // Om det lyckades 
    if (response.ok) {
      alert('Klubb skapad!');                  // Visa bekräftelse
      document.getElementById('add-club-form').reset(); // Rensa formuläret
      loadAdminClubs();                        // Uppdatera admin-listan

      // UPPDATERA KUNDSIDAN
      // Funktionerna definieras i home.js som är en modul (type="module")
      // Vi anropar dem via window.funktionsnamn eftersom de exporterats dit
      // loadAllData är en async funktion som hämtar ny data från servern
      // .then() betyder "när loadAllData är klar, kör då koden inuti"
      window.loadAllData().then(() => {
        window.updateStatistics();  // Uppdatera antal events och klubbar
        window.renderClubs();       // Rita om alla klubb-kort på sidan
        window.loadEvents();        // Rita om alla events på sidan
      });
    }
    // Om något gick fel
    else {
      alert('Något gick fel vid skapande av klubb!');
    }

  } catch (error) {
    // Om nätverksfel eller annat tekniskt fel
    console.error('Fel vid skapande av klubb:', error);
    alert('Något gick fel: ' + error);
  }
}


// ==========================================
// FUNKTION: Ladda alla klubbar
// Hämtar klubbar från servern och visar dem i admin-listan
// ==========================================
async function loadAdminClubs() {
  try {
    // Hämta alla klubbar från servern
    const response = await fetch('http://localhost:5000/clubs');
    const clubs = await response.json();      // Konvertera svaret till JavaScript-array

    // Hitta containern där vi ska visa klubbarna
    const adminClubsList = document.getElementById('admin-clubs-list');

    // Rensa allt gammalt innehåll
    adminClubsList.innerHTML = '';

    // Om det inte finns några klubbar
    if (clubs.length === 0) {
      adminClubsList.innerHTML = '<p>Inga klubbar hittades.</p>';
      return; // Avsluta funktionen
    }

    // Loopa igenom varje klubb och skapa ett kort
    clubs.forEach(club => {
      // Skapa ett nytt div-element
      const clubCard = document.createElement('div');
      clubCard.className = 'admin-club-card';  // Lägg till CSS-klass

      // Fyll kortet med HTML-innehåll
      clubCard.innerHTML = `
        <div class="admin-club-info">
          <h4>${club.name}</h4>
          <p><strong>Plats:</strong> ${club.location}</p>
          <p><strong>Beskrivning:</strong> ${club.description}</p>
          <p><strong>E-post:</strong> ${club.email || 'Ingen e-post'}</p>
          <p><strong>Telefon:</strong> ${club.phone || 'Inget telefonnummer'}</p>
          <p><strong>ID:</strong> ${club.id}</p>
        </div>
        <div class="admin-club-actions">
          <button class="delete-btn" onclick="deleteClub('${club.id}', '${club.name}')">
            Ta bort klubb
          </button>
        </div>
      `;

      // Lägg till kortet i listan
      adminClubsList.appendChild(clubCard);
    });

  } catch (error) {
    // Om något gick fel vid hämtning
    console.error('Fel vid laddning av klubbar:', error);
    document.getElementById('admin-clubs-list').innerHTML =
      '<p>Kunde inte ladda klubbar. Försök igen senare.</p>';
  }
}


// ==========================================
// FUNKTION: Ta bort klubb
// Körs när användaren klickar på "Ta bort klubb" knappen
// Events kopplade till klubben tas också bort
// ==========================================
async function deleteClub(clubId, clubName) {

  try {
    // Konvertera clubId till nummer för korrekt jämförelse
    // Detta är viktigt eftersom HTML skickar det som sträng men databasen har nummer
    const clubIdNumber = Number(clubId);

    // STEG 1: Hämta alla events för att se om det finns kopplade events
    const eventsResponse = await fetch('http://localhost:5000/events');
    const allEvents = await eventsResponse.json();

    // Filtrera ut events som tillhör denna klubb (jämför clubId)
    // Vi använder === för strikt jämförelse
    const clubEvents = allEvents.filter(event => event.clubId === clubIdNumber);

    // STEG 2: Visa bekräftelse med info om vad som kommer tas bort
    let confirmMessage = `Är du säker på att du vill ta bort "${clubName}"?`;

    if (clubEvents.length > 0) {
      confirmMessage += `\n\nDetta kommer också ta bort ${clubEvents.length} event(s):\n`;
    }

    const confirmDelete = confirm(confirmMessage); // Visa bekräftelse-dialog


    // Om användaren klickade "Avbryt"
    if (!confirmDelete) {
      return; // Avsluta funktionen
    }

    // STEG 3: Ta bort alla events som tillhör klubben
    if (clubEvents.length > 0) {
      // Loopa igenom och ta bort varje event
      for (const event of clubEvents) {
        await fetch(`http://localhost:5000/events/${event.id}`, {
          method: 'DELETE'
        });
      }
    }

    // STEG 4: Ta bort klubben från servern
    const response = await fetch(`http://localhost:5000/clubs/${clubId}`, {
      method: 'DELETE'
    });

    // Om borttagningen lyckades
    if (response.ok) {
      //eventText används för att visa antal events som också togs bort
      const eventText = clubEvents.length > 0 ? ` och ${clubEvents.length} event(s)` : '';
      alert(`"${clubName}"${eventText} har tagits bort!`);
      loadAdminClubs(); // Uppdatera admin-listan

      // UPPDATERA KUNDSIDAN
      // Funktionerna definieras i home.js som är en modul (type="module")
      // Vi anropar dem via window.funktionsnamn eftersom de exporterats dit
      // loadAllData är en async funktion som hämtar ny data från servern
      // .then() betyder "när loadAllData är klar, kör då koden inuti"
      window.loadAllData().then(() => {
        window.updateStatistics();  // Uppdatera antal events och klubbar
        window.renderClubs();       // Rita om alla klubb-kort på sidan
        window.loadEvents();        // Rita om alla events på sidan
      });
    }
    // Om något gick fel
    else {
      alert('Kunde inte ta bort klubben. Försök igen!');
    }

  } catch (error) {
    // Om nätverksfel eller annat tekniskt fel
    console.error('Fel vid borttagning av klubb:', error);
    alert('Något gick fel: ' + error);
  }
}

