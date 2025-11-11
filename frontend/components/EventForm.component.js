import { createEvent } from '../helpers/Api.helper.js'

async function loadTemplate() {
  const response                            = await fetch( '/components/EventForm.component.html' )
  const htmlText                            = await response.text()

  const parser                              = new DOMParser()
  const doc                                 = parser.parseFromString( htmlText, 'text/html' )

  const template                            = doc.querySelector( 'template' )

  if( !template )
    throw new Error( 'Template not found in Form.component.html' )

  return template
}

class EventFormComponent extends HTMLElement {
  static templatePromise                    = loadTemplate()

  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
    this.form                               = null
  }

  async connectedCallback() {
    this.clubId                             = this.getAttribute( 'club-id' ) || null

    try {
      const content                         = await EventFormComponent.templatePromise

      this.shadowRoot.appendChild( content.content.cloneNode( true ) )
      
      this.form                             = this.shadowRoot.querySelector( 'form' )
      this.submitButton                     = this.shadowRoot.querySelector( 'button[type="submit"]' )

      const closeButton                     = this.shadowRoot.querySelector( '.close-button-container button' )
      closeButton.addEventListener( 'click', () => this.close() )

      this.validateForm()

      this.requiredInputs                   = this.shadowRoot.querySelectorAll( '[required]' )
      this._boundValidateForm               = this.validateForm.bind( this )
      this._boundHandleSubmit               = this.handleSubmit.bind( this )
      this.form.addEventListener( 'input', this._boundValidateForm )
      this.form.addEventListener( 'submit', this._boundHandleSubmit )

      const overlay                         = this.shadowRoot.querySelector( '.overlay' )
      overlay.addEventListener( 'click', () => this.close() )
    } catch( error ) {
      console.error( 'Error loading template:', error )
    }
  }

  validateForm() {
    const isFormValid                       = this.form.checkValidity()

    if ( isFormValid ) {
      this.submitButton.removeAttribute( 'disabled' )
    } else {
      this.submitButton.setAttribute( 'disabled', 'true' )
    }
  }

  async handleSubmit( event ) {
    event.preventDefault()

    const formData                          = new FormData( event.target )

    const clubId                            = Number( this.clubId )

    const ticketPriceString                 = formData.get( 'price' )
    const ticketPrice                       = parseInt( ticketPriceString, 10 )

    const data                              = Object.fromEntries( formData )
    data.clubId                             = clubId
    data.price                              = ticketPrice
    data.maxTickets                         = parseInt( data.maxTickets, 10 )

    try {
      const response                        = await createEvent( clubId, data )

      if( response ) {
        this.form.reset()
        this.validateForm()
        this.close()

        this.dispatchEvent(new CustomEvent('event-created', {
          bubbles: true,   // allows event to bubble up to parent
          composed: true,  // allows crossing shadow DOM boundaries
          detail: { eventId: response.id }
        }))

        // Also dispatch a global event on window so sibling components or
        // page-level scripts receive it even after client-side navigation.
        try {
          window.dispatchEvent(new CustomEvent('event-created', {
            detail: { eventId: response.id }
          }))
        } catch (e) {
          console.error( e )
        }
      }
    } catch( error ) {
      console.error( 'Error creating event:', error )
    }
  }

  disconnectedCallback() {
    if( this.form ) {
      if ( this._boundHandleSubmit )
        this.form.removeEventListener( 'submit', this._boundHandleSubmit )
      if ( this._boundValidateForm )
        this.form.removeEventListener( 'input', this._boundValidateForm )
    }
  }

  open() {
    this.shadowRoot.querySelector( '.modal' ).classList.remove( 'hidden' )
  }

  close() {
    this.shadowRoot.querySelector( '.modal' ).classList.add( 'hidden' )
  }
}

customElements.define( 'event-form', EventFormComponent )