

export default function start() {
  return `
  <h1>Gala Emporium: Opera Hall</h1>
    <h2> Föreställningar </h2>
  
    <div class="container" id="events-container">
      <!-- Events laddas dynamiskt från backend -->
    </div>

    <div class="booking-section">
      <h2>Boka Biljetter</h2>
      <form id="booking-form" class="booking-form">
        <div class="form-group">
          <label for="event">Välj föreställning:</label>
          <select id="event" name="event" required>
            <option value="">Välj en föreställning</option>
            <!-- Options laddas dynamiskt -->
          </select>
        </div>

        <div class="form-group">
          <label for="tickets">Antal biljetter:</label>
          <input type="number" id="tickets" name="tickets" min="1" max="10" value="1" required>
        </div>

        <div class="form-group">
          <label for="name">Ditt namn:</label>
          <input type="text" id="name" name="name" required placeholder="För- och efternamn">
        </div>

        <div class="form-group">
          <label for="email">E-post:</label>
          <input type="email" id="email" name="email" required placeholder="din.epost@exempel.se">
        </div>

        <div class="form-group">
          <label for="phone">Telefonnummer:</label>
          <input type="tel" id="phone" name="phone" placeholder="07X-XXX XX XX">
        </div>

        <div class="form-group">
          <label for="message">Meddelande (valfritt):</label>
          <textarea id="message" name="message" rows="3" placeholder="Specialönskemål eller annat meddelande"></textarea>
        </div>

        <button type="submit" class="submit-booking">Boka biljetter</button>
      </form>
    </div>

    <footer>
      <a href="#admin">admin</a>
    </footer>
  `;
}

// Ladda events från backend och lägg till dem EFTER de hårdkodade
export async function loadStartEvents() {
  try {
    const response = await fetch('http://localhost:5000/events');
    const allEvents = await response.json();

    // Filtrera bara opera events
    const operaEvents = allEvents.filter(event => event.category === 'opera');
    operaEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    const eventsContainer = document.getElementById('events-container');
    const eventSelect = document.querySelector('#event');

    if (!eventsContainer || !eventSelect) return;

    // BEHÅLL de hårdkodade events, lägg bara till nya dynamiska events
    // Skapa event-boxar för dynamiska events
    operaEvents.forEach(event => {
      const eventDate = new Date(event.datetime);

      // Formatera datum för visning
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];
      const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

      const month = months[eventDate.getMonth()];
      const day = eventDate.getDate();
      const weekday = weekdays[eventDate.getDay()];
      const time = eventDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

      // Skapa event box
      const eventBox = document.createElement('div');
      eventBox.className = 'event-box';
      eventBox.innerHTML = `
        <div class="event-content">
          <div class="date">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
            <span class="weekday">${weekday}</span>
          </div>
          <div class="time">${time}</div>
          <img src="images/${event.eventImage}" alt="${event.title}">
          <div class="event-text">
            <span class="event-type">Opera</span>
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <p class="event-price"><strong>Pris:</strong> ${event.price} kr</p>
          </div>
        </div>
      `;

      eventsContainer.appendChild(eventBox);

      // Lägg till i dropdown
      const formattedDate = eventDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
      const option = document.createElement('option');
      option.value = event.id;
      option.textContent = `${event.title} (${formattedDate}, ${time})`;
      option.dataset.datetime = event.datetime;
      eventSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Fel vid laddning av events:', error);
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
      eventsContainer.innerHTML = '<p class="error-message">Kunde inte ladda föreställningar.</p>';
    }
  }
}
