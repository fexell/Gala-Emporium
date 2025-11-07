import { apiClient } from '../helpers/Api.helper.js'

import start from './start.js';
import traviata from './traviata.js';
import requiem from './requiem.js';
import operagala from './operagala.js';

const main = document.querySelector('main');

function resetBodyClass() {
  document.body.classList.remove('traviata-bg', 'requiem-bg', 'operagala-bg');
}

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
          await submitBooking({
            eventId,
            eventTitle,
            eventDateTime: combinedDateTime,
            name,
            email,
            tickets
          });

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

async function submitBooking({ eventId, eventTitle, eventDateTime, name, email, tickets }) {
  const res = await fetch('http://localhost:5000/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      eventTitle,
      eventDateTime,
      customer: { name, email },
      tickets: Number(tickets),
      status: 'pending'
    })
  });
  if (!res.ok) throw new Error('Kunde inte spara bokningen');
  const saved = await res.json();
  console.log('Sparad bokning:', saved);
  alert('Bokningen är skickad!');
}
