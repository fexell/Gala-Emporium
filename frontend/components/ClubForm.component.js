

async function loadTemplate() {
  const response                            = await fetch( '/components/ClubForm.component.html' )
  const htmlText                            = await response.text()

  const parser                              = new DOMParser()
  const doc                                 = parser.parseFromString( htmlText, 'text/html' )

  const template                            = doc.querySelector( 'template' )

  if( !template )
    throw new Error( 'Template not found in Form.component.html' )

  return template
}

class ClubFormComponent extends HTMLElement {
  static templatePromise                    = loadTemplate()

  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
    this.form                               = null
  }

  async connectedCallback() {
    try {
      const content                         = await ClubFormComponent.templatePromise

      this.shadowRoot.appendChild( content.content.cloneNode( true ) )

      this.form                             = this.shadowRoot.querySelector( 'form' )
      this.submitButton                     = this.shadowRoot.querySelector( 'button[type="submit"]' )

      const closeButton                     = this.shadowRoot.querySelector( '.close-button-container button' )
      closeButton.addEventListener( 'click', () => this.close() )

      this.validateForm()

      this.requiredInputs                   = this.shadowRoot.querySelectorAll( '[required]' )
      this.form.addEventListener( 'input', this.validateForm.bind( this ) )
      // this.form.addEventListener( 'submit', this.handleSubmit.bind( this ) )

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

  open() {
    this.shadowRoot.querySelector( '.modal' ).classList.remove( 'hidden' )
  }

  close() {
    this.shadowRoot.querySelector( '.modal' ).classList.add( 'hidden' )
  }
}

customElements.define( 'club-form', ClubFormComponent )