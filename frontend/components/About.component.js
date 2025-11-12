

async function loadTemplate() {
  const response                            = await fetch( '/components/About.component.html' )
  const htmlText                            = await response.text()

  const parser                              = new DOMParser()
  const doc                                 = parser.parseFromString( htmlText, 'text/html' )

  const template                            = doc.querySelector( 'template' )

  if( !template )
    throw new Error( 'Template not found in Form.component.html' )

  return template
}

class AboutComponent extends HTMLElement {
  static templatePromise                    = loadTemplate()

  constructor() {
    super()

    this.attachShadow( { mode: 'open' } )
    this.form                               = null
  }

  async connectedCallback() {
    try {
      const content                         = await AboutComponent.templatePromise

      this.shadowRoot.appendChild( content.content.cloneNode( true ) )
    } catch( error ) {
      console.error( 'Error loading template:', error )
    }
  }
}

customElements.define( 'about-component', AboutComponent )
