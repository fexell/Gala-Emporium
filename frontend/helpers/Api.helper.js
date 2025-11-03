

const createApiClient                       = ({ baseUrl, defaultHeaders = {} } = {}) => {
  const request                             = async ( endpoint, { sort, order, params = {}, ...options } = {} ) => {
    const url                               = new URL( baseUrl + endpoint )

    if( sort )
      url.searchParams.append( '_sort', sort )
    if( order )
      url.searchParams.append( '_order', order )

    for( const [ key, value ] of Object.entries( params ) )
      url.searchParams.append( key, value )

    const response                          = await fetch( url, {
      headers                               : { ...defaultHeaders, ...( options.headers || {} ) },
      ...options,
    } )

    if( !response.ok )
      throw new Error( `API request failed with status ${ response.status }` )

    return response.json()
  }

  return {
    get: ( url, opts ) => request( url, { ...opts, method: 'GET' } ),
    post: ( url, body, opts ) => request( url, { ...opts, method: 'POST', body: JSON.stringify( body ) } ),
    put: ( url, body, opts ) => request( url, { ...opts, method: 'PUT', body: JSON.stringify( body ) } ),
    delete: ( url, opts ) => request( url, { ...opts, method: 'DELETE' } ),
  }
}

const apiClient                             = createApiClient({
  baseUrl: 'http://localhost:5000',
})

export {
  createApiClient,
  apiClient,
}