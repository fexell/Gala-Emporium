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