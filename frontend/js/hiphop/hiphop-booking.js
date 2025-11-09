// hiphop-booking.js - Bokningssystem för Hip-Hop Klubben

// Ladda events till bokningsdropdown
async function loadBookingEvents() {
  try {
    const response = await fetch("http://localhost:5000/events");
    const allEvents = await response.json();

    const hiphopEvents = allEvents.filter(
      (event) => event.category === "hiphop"
    );
    hiphopEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    const eventSelect = document.getElementById("booking-event");

    eventSelect.innerHTML = '<option value="">Välj ett event...</option>';

    hiphopEvents.forEach((event) => {
      const availableTickets = event.maxTickets
        ? event.maxTickets - (event.ticketCount || 0)
        : 50;

      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = `${event.title} - ${event.datetime} (${availableTickets} biljetter kvar)`;

      if (availableTickets === 0) {
        option.disabled = true;
        option.textContent += " - SLUTSÅLT";
      }

      eventSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Fel vid laddning av booking events:", error);
  }
}

// Hantera bokningsformulär
async function handleBooking(event) {
  event.preventDefault();

  const eventId = document.getElementById("booking-event").value;
  const customerName = document.getElementById("booking-name").value;
  const customerEmail = document.getElementById("booking-email").value;
  const requestedTickets = parseInt(
    document.getElementById("booking-tickets").value
  );

  if (!eventId) {
    alert("Välj vilket event du vill gå på!");
    return;
  }

  try {
    // Hämta event-information
    const eventResponse = await fetch(
      `http://localhost:5000/events/${eventId}`
    );
    const selectedEvent = await eventResponse.json();

    // Beräkna tillgängliga biljetter
    const maxTickets = selectedEvent.maxTickets || 200;
    const currentTickets = selectedEvent.ticketCount || 0;
    const availableTickets = maxTickets - currentTickets;
    const ticketPrice = selectedEvent.price || 150;

    if (requestedTickets > availableTickets) {
      alert(`Tyvärr finns det bara ${availableTickets} biljetter kvar!`);
      return;
    }

    const booking = {
      eventId: parseInt(eventId),
      customerName: customerName,
      customerEmail: customerEmail,
      ticketCount: requestedTickets,
      bookingDate: new Date().toISOString(),
      totalPrice: ticketPrice * requestedTickets,
    };

    // Spara bokning till databasen
    const bookingResponse = await fetch("http://localhost:5000/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    });

    if (!bookingResponse.ok) {
      throw new Error("Kunde inte spara bokning");
    }

    const updatedEvent = {
      ...selectedEvent,
      ticketCount: currentTickets + requestedTickets,
      maxTickets: maxTickets,
    };

    const updateResponse = await fetch(
      `http://localhost:5000/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Kunde inte uppdatera biljetträknare");
    }

    alert(
      `Grattis ${customerName}! Din bokning är bekräftad. Du har bokat ${requestedTickets} biljetter till "${selectedEvent.title}". Totalkostnad: ${booking.totalPrice} kr.`
    );

    document.getElementById("booking-form").reset();
    createEvents();
    loadBookingEvents();
  } catch (error) {
    console.error("Fel vid bokning:", error);
    alert("Något gick fel vid bokningen. Försök igen!");
  }
}
