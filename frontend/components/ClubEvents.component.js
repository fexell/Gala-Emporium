import { apiClient } from '../helpers/Api.helper.js'
import '../components/BookingForm.component.js'

class ClubEvents extends HTMLElement {
  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
  }

  async connectedCallback() {
    const clubId                            = Number( this.getAttribute( 'club-id' ) )

    if( !clubId ) {
      console.error( 'Club ID is required' )
      return
    }

    this.addEventListener( 'booking-changed', async () => {
      await this.render( clubId )
    })

    await this.render( clubId )
  }

  async render( clubId ) {
    try {
      const [ club, events ]                = await Promise.all([
        apiClient.get( `/clubs/${ clubId }` ),
        apiClient.get( '/events', { params: { clubId } } ),
      ])

      if( !events.length ) {
        this.shadowRoot.innerHTML           = `<p>No events found for ${ club.name }</p>`
        return
      }

      this.shadowRoot.innerHTML             = `
        <div class='club'>
          <h1>${ club.name }</h1>
          <p>Capacity: ${ club.capacity }</p>
          <hr />
          <div id='events'></div>
        </div>
      `

      const eventsContainer                 = this.shadowRoot.querySelector( '#events' )

      events.forEach( event => {
        const eventDiv                      = document.createElement( 'div' )
        eventDiv.classList.add( 'event' )
        eventDiv.innerHTML                  = `
          <h2>${ event.name }</h2>
          <p><strong>Date:</strong> ${ event.date }</p>
          <p><strong>Time:</strong> ${ event.time }</p>
          <p><strong>Tickets left:</strong> ${ event.availableTickets }</p>
          <p><strong>Price:</strong> ${ event.ticketPrice } SEK</p>
          <booking-form event-id='${ Number( event.id ) }'></booking-form>
        `

        eventsContainer.appendChild( eventDiv )
      } )
    } catch( error ) {
      console.error( 'Error loading template:', error )
      this.shadowRoot.innerHTML           = `<p>⚠️Failed to load club data</p>`
    }
  }
}

customElements.define( 'club-events', ClubEvents )
