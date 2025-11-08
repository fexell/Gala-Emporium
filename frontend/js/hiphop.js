
async function createHipHopClubPage() {

  document.body.className = "hiphop-klubben";

  // för html-strukturen
  document.body.innerHTML = ` 
    <header> 
      <h1>🎧 Hip-Hop Klubben</h1> 
      <nav> 
        <a href="index.html">Hem</a> 
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
       
    </main> 
     
    
  `;

  
  await createEvents();

  console.log("Hip-Hop Klubben-sidan är laddad!");
}

document.addEventListener("DOMContentLoaded", createHipHopClubPage);