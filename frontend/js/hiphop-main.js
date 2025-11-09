
async function createEvents() {
  try {
    // hämta events från servern
    const response = await fetch('http://localhost:5000/events');
    const allEvents = await response.json();
    
    // Filtrera bara hiphop events
    const hiphopEvents = allEvents.filter(event => event.category === 'hiphop');
    
    // Sortera efter datum
    hiphopEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const eventList = document.getElementById('event-list');
    
    if (eventList) {
      
      eventList.innerHTML = '';
      
      // Om det inte finns events 
      if (hiphopEvents.length === 0) {
        eventList.innerHTML = '<p>Inga kommande evenemang just nu. Håll utkik!</p>';
        return;
      }
      
      //html för varje evnt
      hiphopEvents.forEach((event) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = ` 
          <img src="${event.image}" alt="${event.title}">
          <h3>${event.title}</h3>
          <p><strong>${event.date}</strong></p>
          <p><strong>Plats: </strong>${event.location}</p>
          <p>${event.description} </p>
        `;
        eventList.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Fel vid laddning av events:', error);
    const eventList = document.getElementById('event-list');
    if (eventList) {
      eventList.innerHTML = '<p>Kunde inte ladda evenemang. Försök igen senare.</p>';
    }
  }
}


async function createHipHopClubPage() {

  document.body.className = "hiphop-klubben";

  // för html-strukturen
  document.body.innerHTML = ` 
    <header> 
      <h1>🎧 Hip-Hop Klubben</h1> 
      <nav> 
        <a href="home.html">Hem</a> 
        <a href="#kalender">Evenemang</a> 
        <a href="#om">Om Oss</a> 
      </nav> 
    </header> 
     
    <main> 
      <section id="intro"> 
        <h2>Välkommen till Hip-Hop Klubben</h2> 
        <p>Välkommen till Sveriges hetaste scen för hiphop-kultur. Här möts de bästa artisterna, DJ:arna och dansarna för att skapa oförglömliga kvällar fyllda med energi och passion.</p> 
      </section> 
       
      <section id="kalender"> 
        <h2>🎤 Kommande Evenemang</h2> 
        <div id="event-list" class="event-grid"></div> 
      </section> 
       
      <section id="om"> 
        <h2>Om Oss</h2> 
        <p>Hip-Hop Klubben på Gala Emporium är mer än bara en klubb - det är en kulturell institution. Sedan vår öppning 2012 har vi varit den främsta mötesplatsen för hiphop-älskare i regionen.</p> 
        <p>Vi tror på äkta hiphop-kultur i alla dess former - från rap och beatbox till breakdance och graffiti. Vår scen har sett både lokala talanger och internationella stjärnor, allt i en atmosfär av respekt och gemenskap.</p> 
        <p>Varje kväll på Hip-Hop Klubben är en unik upplevelse där musik, dans och konst sammanstrålar för att skapa magi. Oavsett om du är här för att lyssna, dansa eller bara njuta av stämningen - välkommen in i vår familj!</p> 
      </section> 

    </main> 
     
    <footer>
        <p>&copy; 2025 Hip-Hop Klubben | Gala Emporium</p>
    </footer>
  `;

  
  await createEvents();

  console.log("Hip-Hop Klubben-sidan är laddad!");
}

document.addEventListener("DOMContentLoaded", createHipHopClubPage);