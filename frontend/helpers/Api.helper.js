

// Wrapper for API requests
const createApiClient                       = ({ baseUrl, defaultHeaders = {} } = {}) => {

  // Core request function
  const request                             = async ( endpoint, { sort, order, params = {}, ...options } = {} ) => {
    
    // Construct URL with endpoint and query parameters
    const url                               = new URL( baseUrl + endpoint )

    // Sort the results if specified
    if( sort )
      url.searchParams.append( '_sort', sort )

    // Order the results if specified
    if( order )
      url.searchParams.append( '_order', order )

    // Append query parameters
    for( const [ key, value ] of Object.entries( params ) )
      url.searchParams.append( key, value )

    // Make the fetch request
    const response                          = await fetch( url, {
      headers                               : { ...defaultHeaders, ...( options.headers || {} ) },
      ...options,
    } )

    // Throw an error if the request failed
    if( !response.ok )
      throw new Error( `API request failed with status ${ response.status }` )

    // Return the JSON response
    return response.json()
  }

  return {

    // Get request
    get: ( url, opts ) => request( url, { ...opts, method: 'GET' } ),

    // Post request
    post: ( url, body, opts ) => request(
      url,
      {
        ...opts,
        method                              : 'POST',
        body                                : body instanceof FormData
          ? body
          : JSON.stringify( body ),
        headers                             : body instanceof FormData
          ? defaultHeaders
          : { 'Content-Type': 'application/json', ...defaultHeaders }
      }
    ),

    // Put request
    put: ( url, body, opts ) => request(
      url,
      {
        ...opts,
        method                              : 'PUT',
        body                                : body instanceof FormData
          ? body
          : JSON.stringify( body ),
        headers                             : body instanceof FormData
          ? defaultHeaders
          : { 'Content-Type': 'application/json', ...defaultHeaders }
      }
    ),

    // Delete request
    delete: ( url, opts ) => request( url, { ...opts, method: 'DELETE' } ),
  }
}

// Create a default API client instance
const apiClient                             = createApiClient({
  baseUrl: 'http://localhost:5000',
})

export {
  createApiClient,
  apiClient,
}