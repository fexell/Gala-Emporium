import { apiClient } from '../../helpers/Api.helper.js'

import start from './start_opera.js';
import traviata from './traviata.js';
import requiem from './requiem.js';
import operagala from './operagala.js';

const main = document.querySelector('main');

function resetBodyClass() {
  document.body.classList.remove('traviata-bg', 'requiem-bg', 'operagala-bg');
}

// (Tidigare tillagd helper borttagen enligt önskemål)

// Helper to attach booking button listeners for whichever page is rendered
function attachBookingListeners() {
  const bookingButtons = document.querySelectorAll('.btn-prebook');
  bookingButtons.forEach(button => {
    // avoid attaching duplicate listeners
    if (button._hasPrebookListener) return;
    button._hasPrebookListener = true;

    button.addEventListener('click', (e) => {
      const target = e.currentTarget;
      const eventId = target.dataset.eventId;
      const eventTitle = target.dataset.eventTitle;
      const eventDateTime = target.dataset.eventDatetime;

      // Skapa och visa modal med formulärfält för datum/tid, kontakt och antal biljetter
      const defaultDate = new Date(eventDateTime).toISOString().slice(0, 10); // YYYY-MM-DD
      const defaultTime = new Date(eventDateTime).toISOString().slice(11, 16); // HH:MM

      const modalContent = `
        <div class="modal-overlay">
          <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-header">
              <h3 class="modal-title">Boka biljett</h3>
            </div>
            <div class="modal-body">
              <div class="modal-info">
                <p><strong>Föreställning:</strong> ${eventTitle}</p>
              </div>

              <form class="modal-form">
                <label>Datum<br>
                  <input id="booking-date" type="date" value="${defaultDate}" />
                </label>
                <label>Tid<br>
                  <input id="booking-time" type="time" value="${defaultTime}" />
                </label>
                <label>Antal biljetter<br>
                  <input id="booking-tickets" type="number" min="1" max="10" value="1" />
                </label>
                <label>Ditt namn<br>
                  <input id="booking-name" type="text" placeholder="Namn" />
                </label>
                <label>E-post<br>
                  <input id="booking-email" type="email" placeholder="you@example.com" />
                </label>
              </form>

              <p>Bekräfta dina uppgifter och klicka på "Bekräfta bokning".</p>
            </div>
            <div class="modal-actions">
              <button class="modal-cancel">Avbryt</button>
              <button class="modal-confirm">Bekräfta bokning</button>
            </div>
          </div>
        </div>
      `;

      // Lägg till modal i DOM
      const modalRoot = document.getElementById('prebook-modal-root');
      modalRoot.innerHTML = modalContent;

      // Hantera klick på stäng-knappen
      const closeButton = modalRoot.querySelector('.modal-close');
      closeButton.addEventListener('click', () => {
        modalRoot.innerHTML = '';
      });

      // Hantera klick på avbryt-knappen
      const cancelButton = modalRoot.querySelector('.modal-cancel');
      cancelButton.addEventListener('click', () => {
        modalRoot.innerHTML = '';
      });

      // Hantera klick på bekräfta-knappen
      const confirmButton = modalRoot.querySelector('.modal-confirm');
      confirmButton.addEventListener('click', async () => {
        // Läs in fälten från modalen
        const dateVal = modalRoot.querySelector('#booking-date').value;
        const timeVal = modalRoot.querySelector('#booking-time').value;
        const tickets = modalRoot.querySelector('#booking-tickets').value || 1;
        const name = modalRoot.querySelector('#booking-name').value || '';
        const email = modalRoot.querySelector('#booking-email').value || '';

        // Kombinera datum + tid till ISO datetime (fall tillbaka på ursprunglig eventDateTime om tomt)
        const combinedDateTime = (dateVal && timeVal)
          ? new Date(dateVal + 'T' + timeVal).toISOString()
          : eventDateTime;

        try {
          const payload = {
            eventId,
            eventTitle,
            eventDateTime: combinedDateTime,
            name,
            email,
            tickets: Number(tickets || 1),
            status: 'pending',
            customer: { name, email, phone: '' }
          };

          // Post directly with apiClient to keep it simple
          await apiClient.post('/bookings', payload);

          modalRoot.innerHTML = `
            <div class="modal-overlay">
              <div class="modal-content">
                <div class="modal-header">
                  <h3 class="modal-title">Bokning bekräftad!</h3>
                </div>
                <div class="modal-body">
                  <p>Din bokning är nu genomförd. Vi ser fram emot att se dig på föreställningen!</p>
                </div>
                <div class="modal-actions">
                  <button class="modal-confirm" onclick="document.getElementById('prebook-modal-root').innerHTML = ''">Stäng</button>
                </div>
              </div>
            </div>
          `;
        } catch (error) {
          console.error('Bokningsfel:', error);
          modalRoot.innerHTML = `
            <div class="modal-overlay">
              <div class="modal-content">
                <div class="modal-header">
                  <h3 class="modal-title">Något gick fel</h3>
                </div>
                <div class="modal-body">
                  <p>Kunde inte genomföra bokningen. Vänligen försök igen senare.</p>
                </div>
                <div class="modal-actions">
                  <button class="modal-confirm" onclick="document.getElementById('prebook-modal-root').innerHTML = ''">Stäng</button>
                </div>
              </div>
            </div>
          `;
        }
      });
    });
  });
}

// Funktion som bestämmer vilken sida som ska visas
function render() {
  const page = location.hash.slice(1);
  if (!page) {
    resetBodyClass();
    main.innerHTML = start();
    document.title = "Opera Emporium";
    attachBookingListeners();
    setupBookingForm();
    return;
  }

  if (page === "traviata") {
    resetBodyClass();
    document.body.classList.add('traviata-bg')

    main.innerHTML = traviata();
    attachBookingListeners();
  }
  else if (page === "requiem") {
    resetBodyClass();
    document.body.classList.add('requiem-bg')
    main.innerHTML = requiem();
    attachBookingListeners();
  }
  else if (page === "operagala") {
    resetBodyClass();
    document.body.classList.add('operagala-bg');

    main.innerHTML = operagala();
    attachBookingListeners();
  }
  else {
    resetBodyClass();
    main.innerHTML = start();
    document.title = "Opera Emporium";
    attachBookingListeners();
    setupBookingForm();
    return;
  }


  // Uppdatera flikens titel automatiskt från <h2> om det finns
  const title = document.querySelector('main h2');

  // booking listeners are attached per-page by attachBookingListeners()
  if (title) {
    document.title = title.textContent;
  } else {
    document.title = "Opera Emporium";
  }
}

// När sidan laddas eller hash ändras:
window.addEventListener('DOMContentLoaded', render);
window.addEventListener('hashchange', render);

// Funktion för att skicka bokningsdata till backend
function setupBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventSelect = form.querySelector('#event');
    const selectedOption = eventSelect.options[eventSelect.selectedIndex];

    try {
      const bookingData = {
        eventId: eventSelect.value,
        eventTitle: selectedOption.text.split(' (')[0],
        eventDateTime: selectedOption.dataset.datetime,
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        phone: form.querySelector('#phone').value,
        tickets: Number(form.querySelector('#tickets').value),
        message: form.querySelector('#message').value,
        status: 'pending'
      };

      // Skicka via apiClient (centraliserad fetch med felhantering)
      const saved = await apiClient.post('/bookings', {
        ...bookingData,
        customer: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone
        }
      });
      console.log('Sparad bokning:', saved);

      form.innerHTML = `
        <div class="booking-success">
          <h3>Tack för din bokning!</h3>
          <p>Din bokning är nu registrerad. Vi har skickat en bekräftelse till din e-post.</p>
          <p><strong>Bokningsnummer:</strong> ${saved.id}</p>
          <p><strong>Föreställning:</strong> ${saved.eventTitle}</p>
          <p><strong>Datum:</strong> ${new Date(saved.eventDateTime).toLocaleDateString('sv-SE')}</p>
          <p><strong>Antal biljetter:</strong> ${saved.tickets}</p>
        </div>
      `;
    } catch (error) {
      console.error('Bokningsfel:', error);
      // Mer hjälpsamt felmeddelande vid nätverksfel eller server nere
      const msg = (error && error.message) ? error.message : String(error);
      if (msg.includes('failed') || msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
        alert('Kunde inte nå servern (http://localhost:5000). Starta backend och försök igen.');
      } else {
        alert('Något gick fel vid bokningen. Försök igen eller kontakta oss.');
      }
    }
  });
}
