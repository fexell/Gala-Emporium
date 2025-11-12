/* OPERA EMPORIUM - ADMIN MODULE
   Returnerar admin-gränssnitt som en route i SPA */

export default function admin() {
  return `
    <div class="admin-container">
      <a href="#start" class="admin-back-link">← Tillbaka till startsida</a>
      
      <div class="admin-header">
        <h1>🎭 Admin Panel</h1>
      </div>

      <div class="admin-tabs">
        <button class="admin-tab-btn active" data-tab="create-event">Skapa Event</button>
        <button class="admin-tab-btn" data-tab="manage-events">Hantera Events</button>
        <button class="admin-tab-btn" data-tab="view-bookings">Se Bokningar</button>
      </div>

      <div class="admin-tab-content active" id="admin-create-event">
        <h2>Skapa nytt event</h2>
        <form id="admin-new-event">
          <div class="admin-form-group">
            <label for="admin-event-name">Event-namn:</label>
            <input type="text" id="admin-event-name" required>
          </div>

          <div class="admin-form-group">
            <label for="admin-event-when">Datum och tid:</label>
            <input type="datetime-local" id="admin-event-when" required>
          </div>

          <div class="admin-form-group">
            <label for="admin-event-where">Plats:</label>
            <input type="text" id="admin-event-where" required>
          </div>

          <div class="admin-form-group">
            <label for="admin-event-info">Beskrivning:</label>
            <textarea id="admin-event-info" rows="4" required></textarea>
          </div>

          <div class="admin-form-group">
            <label for="admin-event-cost">Pris (kr):</label>
            <input type="number" id="admin-event-cost" min="0" required>
          </div>

          <div class="admin-form-group">
            <label for="admin-event-max">Max antal biljetter:</label>
            <input type="number" id="admin-event-max" min="1" required>
          </div>

          <button type="submit" class="admin-btn-primary">Skapa Event</button>
        </form>
      </div>

      <div class="admin-tab-content" id="admin-manage-events">
        <h2>Hantera events</h2>
        <div id="admin-events-list">
          <!-- Events laddas här -->
        </div>
      </div>

      <div class="admin-tab-content" id="admin-view-bookings">
        <h2>Alla bokningar</h2>
        <div id="admin-bookings-list">
          <!-- Bokningar laddas här -->
        </div>
      </div>
    </div>
  `;
}

// Admin-funktionalitet som körs efter render
export function initAdmin() {
  setupAdminTabs();
  setupAdminForm();
}

function setupAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const tabName = this.getAttribute('data-tab');

      // Ta bort active från alla
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Lägg till active på klickad
      this.classList.add('active');
      document.getElementById(`admin-${tabName}`).classList.add('active');

      // Ladda data när man klickar på tab
      if (tabName === 'manage-events') {
        loadAdminEvents();
      } else if (tabName === 'view-bookings') {
        loadAdminBookings();
      }
    });
  });
}

function setupAdminForm() {
  const form = document.getElementById('admin-new-event');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const eventData = {
      title: document.getElementById('admin-event-name').value,
      datetime: document.getElementById('admin-event-when').value,
      location: document.getElementById('admin-event-where').value,
      description: document.getElementById('admin-event-info').value,
      price: parseFloat(document.getElementById('admin-event-cost').value),
      maxTickets: parseInt(document.getElementById('admin-event-max').value),
      ticketCount: 0,
      category: "opera",
      eventImage: "Events.jpg"
    };

    try {
      const response = await fetch('http://localhost:5000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        alert('Event skapat!');
        form.reset();
        loadAdminEvents();
      } else {
        alert('Något gick fel!');
      }
    } catch (error) {
      console.error('Fel:', error);
      alert('Något gick fel: ' + error);
    }
  });
}

async function loadAdminEvents() {
  try {
    const response = await fetch('http://localhost:5000/events');
    const allEvents = await response.json();

    const operaEvents = allEvents.filter(event => event.category === 'opera');
    operaEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    const adminEventsList = document.getElementById('admin-events-list');
    adminEventsList.innerHTML = '';

    if (operaEvents.length === 0) {
      adminEventsList.innerHTML = '<p>Inga opera events hittades.</p>';
      return;
    }

    operaEvents.forEach(event => {
      const eventDate = new Date(event.datetime);
      const formattedDate = eventDate.toLocaleDateString('sv-SE');
      const formattedTime = eventDate.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const eventDiv = document.createElement('div');
      eventDiv.className = 'admin-event-item';
      eventDiv.innerHTML = `
        <h4>${event.title}</h4>
        <p><strong>Datum:</strong> ${formattedDate} ${formattedTime}</p>
        <p><strong>Plats:</strong> ${event.location}</p>
        <p><strong>Pris:</strong> ${event.price} kr</p>
        <p><strong>Biljetter:</strong> ${event.ticketCount}/${event.maxTickets}</p>
        <button class="admin-delete-btn" data-event-id="${event.id}">Ta bort event</button>
      `;

      const deleteBtn = eventDiv.querySelector('.admin-delete-btn');
      deleteBtn.addEventListener('click', () => deleteEvent(event.id));

      adminEventsList.appendChild(eventDiv);
    });

  } catch (error) {
    console.error('Fel vid laddning av events:', error);
    document.getElementById('admin-events-list').innerHTML = '<p>Fel vid laddning av events.</p>';
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Är du säker på att du vill ta bort detta event?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/events/${eventId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Event borttaget!');
      loadAdminEvents();
    } else {
      alert('Kunde inte ta bort eventet!');
    }
  } catch (error) {
    console.error('Fel vid borttagning:', error);
    alert('Något gick fel: ' + error);
  }
}

async function loadAdminBookings() {
  try {
    const bookingsResponse = await fetch('http://localhost:5000/bookings');
    const allBookings = await bookingsResponse.json();

    const eventsResponse = await fetch('http://localhost:5000/events');
    const allEvents = await eventsResponse.json();

    const operaEvents = allEvents.filter(event => event.category === 'opera');
    const operaEventIds = operaEvents.map(event => String(event.id));

    console.log('Opera event IDs:', operaEventIds);
    console.log('All bookings:', allBookings);

    const operaBookings = allBookings.filter(booking => {
      const bookingEventId = String(booking.eventId);
      const match = operaEventIds.includes(bookingEventId);
      console.log(`Booking ${booking.id} - eventId: ${bookingEventId}, match: ${match}`);
      return match;
    });

    console.log('Opera bookings found:', operaBookings);

    const bookingsList = document.getElementById('admin-bookings-list');
    bookingsList.innerHTML = '';

    if (operaBookings.length === 0) {
      bookingsList.innerHTML = '<p>Inga bokningar hittades för opera events.</p>';
      return;
    }

    operaBookings.forEach(booking => {
      const event = operaEvents.find(e => String(e.id) === String(booking.eventId));
      const eventTitle = event ? event.title : 'Okänt event';

      const bookingDate = new Date(booking.bookingDate);
      const formattedDate = bookingDate.toLocaleDateString('sv-SE');
      const formattedTime = bookingDate.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const bookingDiv = document.createElement('div');
      bookingDiv.className = 'admin-booking-item';
      // Beräkna totalpris om det saknas
      let tickets = booking.ticketCount || booking.tickets || 0;
      let totalPrice = booking.totalPrice !== undefined ? booking.totalPrice : (event && event.price ? tickets * event.price : 'N/A');
      bookingDiv.innerHTML = `
        <h4>${eventTitle}</h4>
        <p><strong>Bokningsnummer:</strong> ${booking.referenceNumber || booking.id || 'N/A'}</p>
        <p><strong>Kund:</strong> ${booking.customerName || booking.name || (booking.customer && booking.customer.name) || 'N/A'}</p>
        <p><strong>Email:</strong> ${booking.customerEmail || booking.email || (booking.customer && booking.customer.email) || 'N/A'}</p>
        <p><strong>Antal biljetter:</strong> ${tickets}</p>
        <p><strong>Totalpris:</strong> ${totalPrice} kr</p>
        <p><strong>Bokad:</strong> ${formattedDate !== 'Invalid Date' ? formattedDate : ''} ${formattedTime !== 'Invalid Date' ? formattedTime : ''}</p>
        <button class="admin-delete-btn" data-booking-id="${booking.id}">Återbetala</button>
      `;

      const refundBtn = bookingDiv.querySelector('.admin-delete-btn');
      refundBtn.addEventListener('click', () => refundBooking(booking.id, booking.eventId, booking.ticketCount));

      bookingsList.appendChild(bookingDiv);
    });

  } catch (error) {
    console.error('Fel vid laddning av bokningar:', error);
    document.getElementById('admin-bookings-list').innerHTML = '<p>Fel vid laddning av bokningar.</p>';
  }
}

async function refundBooking(bookingId, eventId, ticketCount) {
  if (!confirm('Är du säker på att du vill återbetala denna bokning?')) {
    return;
  }

  try {
    // Ta bort bokningen
    const deleteResponse = await fetch(`http://localhost:5000/bookings/${bookingId}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error('Kunde inte ta bort bokning');
    }

    // Hämta eventet
    const eventResponse = await fetch(`http://localhost:5000/events/${eventId}`);
    const event = await eventResponse.json();

    // Återställ biljetter
    const updatedEvent = {
      ...event,
      ticketCount: event.ticketCount - ticketCount
    };

    // Uppdatera eventet
    const updateResponse = await fetch(`http://localhost:5000/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });

    if (!updateResponse.ok) {
      throw new Error('Kunde inte uppdatera biljetträknare');
    }

    alert('Bokning återbetald! Biljetterna är nu tillgängliga igen.');
    loadAdminBookings();
    loadAdminEvents();

  } catch (error) {
    console.error('Fel vid återbetalning:', error);
    alert('Något gick fel vid återbetalningen. Försök igen!');
  }
}
