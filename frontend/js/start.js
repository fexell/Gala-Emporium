

export default function start() {
  return `
  <h1>Gala Emporium: Opera Hall</h1>
    <h2> Föreställningar Kalender </h2>
  
    <div class="container">
      <div class="event-box">
        <div class="event-content">
          <div class="date">
            <span class="month">NOV</span>
            <span class="day">06</span>
            <span class="weekday">Onsdag</span>
          </div>
          <div class="time"> 17:00</div>
          <img src="images/opera.jpg" alt="La Traviata">
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
          <img src="images/mozart.jpg" alt="Mozarts Requiem">
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
          <img src="images/operagala.jpg" alt="Operagala">
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
  `;
}

