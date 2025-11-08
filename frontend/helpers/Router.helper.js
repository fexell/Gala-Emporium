import '../components/ClubEvents.component.js'
import '../components/EventForm.component.js'
import '../components/About.component.js'

const initRouter                            = () => {
  const content                             = document.querySelector( '#Content' )

  const routes                              = {
    home                                    : `<club-events club-id='1'></club-events>`,
    about                                   : `<about-component></about-component>`,
    contact                                 : `<p>contact</p>`,
  }

  document.querySelectorAll('header nav a').forEach( link => {
    link.addEventListener( 'click', async (e) => {
      e.preventDefault()

      const page                            = e.target.textContent.trim().toLowerCase()

      if( !routes[ page ] ) return

      if( routes[ page ].endsWith('.html') ) {
        try {
          const response                    = await fetch( routes[ page ] )
          const html                        = await response.text()
          content.innerHTML                 = html
        } catch (error) {
          console.error( error )
        }
      } else {
        content.innerHTML                   = routes[ page ]
      }
    })
  })
}

export {
  initRouter
}
