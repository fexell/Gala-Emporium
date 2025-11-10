import { apiClient } from '../helpers/Api.helper.js'
import '../components/BookingForm.component.js'

class ClubEvents extends HTMLElement {
  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
  }

  async connectedCallback() {
    const clubId                            = this.getAttribute( 'club-id' )

    if( !clubId ) {
      console.error( 'Club ID is required' )
      return
    }

    // keep booking-changed local (bubbles from booking-form inside this component)
    this._onBookingChanged = async () => { await this.render( clubId ) }
    this.addEventListener( 'booking-changed', this._onBookingChanged )

    // Listen globally for events created/deleted so navigation and sibling
    // placement won't prevent ClubEvents from updating.
    this._onEventCreated = async () => { await this.render( clubId ) }
    this._onEventDeleted = async () => { await this.render( clubId ) }

    window.addEventListener( 'event-created', this._onEventCreated )
    window.addEventListener( 'event-deleted', this._onEventDeleted )

    window.addEventListener( 'login', () => this.render( clubId ) )
    window.addEventListener( 'logout', () => this.render( clubId ) )

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
        <style>
          .club > h1 {
            margin: 0;
            text-align: center;
            font-size: 3rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 100;
            color: #f1f1f1;
          }
        </style>
        <div class='club'>
          <h1>${ club.name }</h1>
          <div id='events'></div>
        </div>
      `

      const eventsContainer                 = this.shadowRoot.querySelector( '#events' )

      events.forEach( event => {
        this.eventId                        = event.id

        const eventDiv                      = document.createElement( 'div' )
        eventDiv.classList.add( 'event' )
        eventDiv.innerHTML                  = `
          <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css' />
          <style>
            .relative {
              position: relative;
            }

            .absolute {
              position: absolute;
            }
          </style>
          <div class='realtive'>
            <div>
              ${ window.localStorage.getItem( 'admin' ) ? (
              `
              <div class='absolute' style='right: 0;'>
                <div>
                  <button id='deleteEventButton' style='width: 40px; height: 40px; border: none; border-radius: 8px; background-color: #faefd1; cursor: pointer;'>
                    <i class='fa-solid fa-trash'></i>
                  </button>
                </div>
              </div>
              `
              ) : '' }
              <h2>${ event.title }</h2>
              <p>${ event.description }</p>
              <p><strong>Date:</strong> ${ event.datetime }</p>
              <p><strong>Tickets left:</strong> ${ event.maxTickets }</p>
              <p><strong>Price:</strong> ${ event.price } SEK</p>
            </div>
          </div>
          <booking-form event-id='${ event.id }'></booking-form>
        `

        eventsContainer.appendChild( eventDiv )

        if( window.localStorage.getItem( 'admin' ) ) {
          const deleteEventButton             = eventDiv.querySelector( '#deleteEventButton' )
          deleteEventButton.addEventListener( 'click', () => this.handleDeleteEvent( event ) )
        }
      } )
    } catch( error ) {
      console.error( 'Error loading template:', error )
      this.shadowRoot.innerHTML             = `<p>⚠️Failed to load club data</p>`
    }
  }

  async handleDeleteEvent( event ) {
    try {
      const result                          = await window.confirm( `Are you sure you want to delete ${ event.name }?` )

      if( result ) {
        const response                      = await apiClient.delete( `/events/${ event.id }` )
        
        if( response ) {
          this.dispatchEvent(new CustomEvent('event-deleted', {
            bubbles: true,   // allows event to bubble up to parent
            composed: true,  // allows crossing shadow DOM boundaries
            detail: { eventId: event.id }
          }))

          // also emit globally so other parts of the page can react
          try {
            window.dispatchEvent(new CustomEvent('event-deleted', {
              detail: { eventId: event.id }
            }))
          } catch (e) {}
        }
      }

    } catch( error ) {
      console.error( 'Failed to delete event:', error )
    }
  }

  disconnectedCallback() {
    // remove listeners registered in connectedCallback
    if ( this._onBookingChanged )
      this.removeEventListener( 'booking-changed', this._onBookingChanged )

    if ( this._onEventCreated )
      window.removeEventListener( 'event-created', this._onEventCreated )

    if ( this._onEventDeleted )
      window.removeEventListener( 'event-deleted', this._onEventDeleted )
  }
}

customElements.define( 'club-events', ClubEvents )
