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
          <style>
            #cancel-booking {
              padding: 20px;
              border: none;
              border-radius: 8px;
              outline: none;
              font-size: 14px;
              color: #000;
              background-color: #faefd1;
              cursor: pointer;

              &:hover {
                background-color: #c8bfa7;
              }
            }
          </style>
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
            .flex {
              display: flex;
              gap: 8px;
            }

            .flex-row {
              flex-direction: row;
            }

            .flex-1 {
              flex: 1;
            }

            .rounded-full {
              border-radius: 9999px;
            }

            input {
              width: 100%;
              border: 1px solid transparent;
              border-radius: 8px;
              outline: none;
              padding: 18px;
              padding-inline: 24px;
              color: #f1f1f1;
              background-color: oklch(25.5% 0 0);

              &:focus {
                border-color: #faefd1;
                box-shadow: 0 10px 0 rgba(0, 0, 0, 1);
              }
            }

            input[name='numberOfTickets'] {
              border-bottom-color: #faefd1;

              &:focus {
                box-shadow: 0 10px 0 rgba(0, 0, 0, 1);
              }
            }

            input[readonly] {
              border: none;
              color: #f1f1f1;
              background-color: transparent;
              text-align: right;
              cursor: not-allowed;
            }

            input[name='numberOfTickets'] {
              max-width: 80px;
              width: 80px;
              text-align: center;
              font-size: 12px;
              background-color: transparent;
            }

            input[name='totalPrice'] {
              font-size: 42px;
            }

            button[type='submit'] {
              padding: 20px;
              border: none;
              border-radius: 8px;
              outline: none;
              font-size: 14px;
              color: #000;
              background-color: #faefd1;
              cursor: pointer;

              &:hover {
                background-color: #c8bfa7;
              }
            }

            .form-wrapper {
              padding: 16px;
              border-radius: 8px;
              background-color: #111217;
            }

            .form-wrapper .totalPrice {
              color: #f1f1f1;
            }
          </style>
          <form id='bookingForm'>
            <h3>Book for ${ event.title }</h3>

            <div class='form-wrapper'>
              <div class='flex flex-row'>
                <input class='flex-1' type='text' name='customerName' placeholder='Enter your name' required />
                <input class='flex-1' type='number' name='numberOfTickets' min='1' placeholder='# of tickets' required />
                <button type='submit'>Book tickets</button>
              </div>
            </div>

            <div>
              <div class='flex flex-row'>
                <div class='flex-1'>
                  <p>Available tickets: <strong id='available'>${ event.maxTickets }</strong></p>
                  <p>Price per ticket: <strong>${ event.price } SEK</strong></p>
                </div>
                <div class='flex-1'>
                  <p class='totalPrice' style='display: block; text-align: right;'>Total: <strong id='total'>0</strong> SEK</p>
                </div>
              </div>
            </div>

            <p id='bookingMessage'></p>
          </form>
        `

        const form                            = this.shadowRoot.querySelector( '#bookingForm' )
        const numberInput                     = this.shadowRoot.querySelector( 'input[name="numberOfTickets"]' )
        const totalInput                      = this.shadowRoot.querySelector( '#total' )

        numberInput.addEventListener( 'input', () => {
          const quantity                      = Math.max( 0, Number( numberInput.value ) || 0 )
          totalInput.textContent              = quantity * event.price
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

    const totalPrice                        = numberOfTickets * this.event.price

    try {
      const newBooking                      = await apiClient.post( '/bookings', {
        eventId: this.event.id,
        customerName,
        numberOfTickets,
        totalPrice,
        bookingDate: new Date().toISOString().split( 'T' )[ 0 ],
        bookingTime: new Date().toLocaleTimeString(),
      } )

      const updatedTickets                  = this.event.maxTickets - numberOfTickets

      await apiClient.put( `/events/${ this.event.id }`, {
        ...this.event,
        maxTickets: updatedTickets,
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

      const updatedTickets                  = this.event.maxTickets + this.existingBooking.numberOfTickets

      await apiClient.put( `/events/${ this.event.id }`, {
        ...this.event,
        maxTickets: updatedTickets,
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
