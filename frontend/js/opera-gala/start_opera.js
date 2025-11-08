

export default function start() {
  return `
  <h1>Gala Emporium: Opera Hall</h1>
    <h2> Föreställningar </h2>
  
    <div class="container">
      <div class="event-box">
        <div class="event-content">
          <div class="date">
            <span class="month">NOV</span>
            <span class="day">06</span>
            <span class="weekday">Onsdag</span>
          </div>
          <div class="time"> 17:00</div>
          <img src="../../images/opera.jpg" alt="La Traviata">
          <div class="event-text">
            <span class="event-type">Opera | Urpremiär</span>
            <h3>
              <a href="#traviata">Traviata – Giuseppe Verdi</a>
            </h3>
            <p>En dramatisk kärlekshistoria med orkester, solister och kör.</p>
          </div>
        </div>
      </div>

      <div class="event-box">
        <div class="event-content">
          <div class="date">
            <span class="month">DEC</span>
            <span class="day">15</span>
            <span class="weekday">Fredag</span>
          </div>
          <div class="time"> 17:00</div>
          <img src="../../images/mozart.jpg" alt="Mozarts Requiem">
          <div class="event-text">
            <span class="event-type">Opera | Nypremiär</span>
            <h3>
              <a href="#requiem">Requiem i levande ljus</a>
            </h3>
            <p>En stämningsfull kväll där Mozarts Requiem framförs i ljuset av levande ljus.</p>
          </div>
        </div>
      </div>

      <div class="event-box">
        <div class="event-content">
          <div class="date">
            <span class="month">DEC</span>
            <span class="day">28</span>
            <span class="weekday">Måndag</span>
          </div>
          <div class="time"> 18:00</div>
          <img src="../../images/operagala.jpg" alt="Operagala">
          <div class="event-text">
            <span class="event-type">Opera | Premiär</span>
            <h3>
              <a href="#operagala">Operagala – De största ariorna</a>
            </h3>
            <p>En kväll med de mest kända ariorna från operor som Carmen, Tosca och Figaros bröllop.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="booking-section">
      <h2>Boka Biljetter</h2>
      <form id="booking-form" class="booking-form">
        <div class="form-group">
          <label for="event">Välj föreställning:</label>
          <select id="event" name="event" required>
            <option value="">Välj en föreställning</option>
            <option value="1" data-datetime="2024-11-06T17:00:00">La Traviata (6 Nov, 17:00)</option>
            <option value="2" data-datetime="2024-12-15T17:00:00">Requiem i levande ljus (15 Dec, 17:00)</option>
            <option value="3" data-datetime="2024-12-28T18:00:00">Operagala (28 Dec, 18:00)</option>
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
  `;
}

