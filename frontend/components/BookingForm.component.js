import { apiClient } from '../helpers/Api.helper.js'

class BookingForm extends HTMLElement {
  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
  }

  async connectedCallback() {
    const eventId                           = this.getAttribute( 'eventId' )

    await this.render( eventId )
  }

  async render( eventId ) {
    try {
      const event                           = await apiClient.get( `/events/${ eventId }` )

      this.shadowRoot.innerHTML             = `
        <form id='bookingForm'>
          <h3>Book for ${ event.name }</h3>
          <p>Available tickets: <strong id='available'>${ event.availableTickets }</strong></p>
          <p>Price per ticket: <strong>${ event.ticketPrice } SEK</strong></p>

          <input type='text' name='customerName' placeholder='Enter your name' required />
          <input type='number' name='numberOfTickets' placeholder='Enter number of tickets' required />

          <button type='submit'>Confirm booking</button>
          <p id='bookingMessage'></p>
        </form>
      `

      const form                            = this.shadowRoot.querySelector( '#bookingForm' )
      form.addEventListener( 'submit', this.handleSubmit.bind( this ) )
    } catch( error ) {
      console.error( 'Error loading template:', error )
    }
  }

  async handleSubmit( eventObj, event ) {
    eventObj.preventDefault()

    const formData                          = new FormData( eventObj.target )
    const customerName                      = formData.get( 'customerName' )
    const numberOfTickets                   = Number( formData.get( 'numberOfTickets' ) )
    const availableElement                  = this.shadowRoot.querySelector( '#available' )

    if( numberOfTickets > event.availableTickets ) {
      this.showMessage( 'Not enough tickets available', 'red' )
      return
    }

    const totalPrice                        = numberOfTickets * event.ticketPrice

    try {
      const newBooking                      = await apiClient.post( '/bookings', {
        eventId: event.id,
        customerName,
        numberOfTickets,
        totalPrice,
        bookingDate: new Date().toISOString().split( 'T' )[ 0 ],
      } )

      const updatedTickets                  = event.availableTickets - numberOfTickets

      await apiClient.put( `/events/${ event.id }`, {
        ...event,
        availableTickets: updatedTickets,
      } )

      availableElement.textContent          = updatedTickets

      this.showMessage( `Successfully booked ${ numberOfTickets } tickets for ${ event.name }! Total: ${ totalPrice } SEK`, 'green' )

      console.log( 'Booking created successfully: ', newBooking )
    } catch( error ) {
      console.error( 'Error creating booking:', error )
    }
  }

  showMessage( text, color ) {
    const message                           = this.shadowRoot.querySelector( '#bookingMessage' )
    message.textContent                     = text
    message.style.color                     = color
  }
}

customElements.define( 'booking-form', BookingForm )
