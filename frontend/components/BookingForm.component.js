import { apiClient } from '../helpers/Api.helper.js'

class BookingForm extends HTMLElement {
  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
  }

  async connectedCallback() {
    this.eventId                            = this.getAttribute( 'event-id' )

    await this.render( this.eventId )
  }

  async render( eventId ) {
    try {
      const event                           = await apiClient.get( `/events/${ eventId }` )
      this.event                            = event

      const bookings                        = await apiClient.get( `/bookings?eventId=${ eventId }` )
      this.existingBooking                  = bookings.length > 0 ? bookings[ 0 ] : null

      if( this.existingBooking ) {
        this.shadowRoot.innerHTML           = `
          <p>You have already made a booking for this event.</p>
          <p>Tickets booked: <strong>${ this.existingBooking.numberOfTickets }</strong></p>
          <button id='cancel-booking'>Cancel booking</button>
          <p id='bookingMessage'></p>
        `

        this.shadowRoot.querySelector( '#cancel-booking' )
          .addEventListener( 'click', () => this.handleCancel() )
      } else {
        this.shadowRoot.innerHTML             = `
          <style>
            input[readonly] {
              color: #888;
              cursor: not-allowed;
            }
          </style>
          <form id='bookingForm'>
            <h3>Book for ${ event.name }</h3>
            <p>Available tickets: <strong id='available'>${ event.availableTickets }</strong></p>
            <p>Price per ticket: <strong>${ event.ticketPrice } SEK</strong></p>

            <input type='text' name='customerName' placeholder='Enter your name' required />
            <input type='number' name='numberOfTickets' placeholder='Enter number of tickets' required />
            <input type='number' name='totalPrice' value='0' required readonly />

            <button type='submit'>Confirm booking</button>
            <p id='bookingMessage'></p>
          </form>
        `

        const form                            = this.shadowRoot.querySelector( '#bookingForm' )
        const numberInput                     = this.shadowRoot.querySelector( 'input[name="numberOfTickets"]' )
        const totalInput                      = this.shadowRoot.querySelector( 'input[name="totalPrice"]' )

        numberInput.addEventListener( 'input', () => {
          const quantity                      = Math.max( 0, Number( numberInput.value ) || 0 )
          totalInput.value                    = quantity * event.ticketPrice
        } )

        form.addEventListener( 'submit', this.handleSubmit.bind( this ) )
      }
    } catch( error ) {
      console.error( 'Error loading template:', error )
    }
  }

  async handleSubmit( e ) {
    e.preventDefault()

    const formData                          = new FormData( e.target )
    const customerName                      = formData.get( 'customerName' )
    const numberOfTickets                   = Number( formData.get( 'numberOfTickets' ) )
    const availableElement                  = this.shadowRoot.querySelector( '#available' )

    if( numberOfTickets > this.event.availableTickets ) {
      this.showMessage( 'Not enough tickets available', 'red' )
      return
    }

    const totalPrice                        = numberOfTickets * this.event.ticketPrice

    try {
      const newBooking                      = await apiClient.post( '/bookings', {
        eventId: this.event.id,
        customerName,
        numberOfTickets,
        totalPrice,
        bookingDate: new Date().toISOString().split( 'T' )[ 0 ],
        bookingTime: new Date().toLocaleTimeString(),
      } )

      const updatedTickets                  = this.event.availableTickets - numberOfTickets

      await apiClient.put( `/events/${ this.event.id }`, {
        ...this.event,
        availableTickets: updatedTickets,
      } )

      availableElement.textContent          = updatedTickets

      this.showMessage( `Successfully booked ${ numberOfTickets } tickets for ${ this.event.name }! Total: ${ totalPrice } SEK`, 'green' )

      this.dispatchEvent(new CustomEvent('booking-changed', {
        bubbles: true,   // allows event to bubble up to parent
        composed: true,  // allows crossing shadow DOM boundaries
        detail: { eventId: this.event.id }
      }))

      this.render( this.eventId )

    } catch( error ) {
      console.error( 'Error creating booking:', error )
    }
  }

  async handleCancel() {
    if( !this.existingBooking )
      return

    try {
      const response                        = await apiClient.delete( `/bookings/${ this.existingBooking.id }` )

      console.log( response )

      const updatedTickets                  = this.event.availableTickets + this.existingBooking.numberOfTickets

      await apiClient.put( `/events/${ this.event.id }`, {
        ...this.event,
        availableTickets: updatedTickets,
      } )

      this.showMessage( `Successfully canceled booking for ${ this.event.name }!`, 'green' )

      this.dispatchEvent(new CustomEvent('booking-changed', {
        bubbles: true,   // allows event to bubble up to parent
        composed: true,  // allows crossing shadow DOM boundaries
        detail: { eventId: this.event.id }
      }))

      this.render( this.eventId )

    } catch( error ) {
      console.error( 'Error canceling booking:', error )

      this.showMessage( 'Failed to cancel booking', 'red' )
    }
  }

  showMessage( text, color ) {
    const message                           = this.shadowRoot.querySelector( '#bookingMessage' )
    message.textContent                     = text
    message.style.color                     = color
  }
}

customElements.define( 'booking-form', BookingForm )
