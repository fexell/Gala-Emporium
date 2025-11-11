// Wrapper for API requests
// Compute a sensible default base URL that matches the current host (avoids localhost vs 127.0.0.1 mismatches)
const DEFAULT_BASE_URL = (typeof window !== 'undefined' && window.location && window.location.hostname)
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000'

const createApiClient = ({ baseUrl = DEFAULT_BASE_URL, defaultHeaders = {} } = {}) => {

  // Core request function
  const request = async (endpoint, { sort, order, params = {}, ...options } = {}) => {

    // Construct URL with endpoint and query parameters
    const url = new URL(baseUrl + endpoint)

    // Sort the results if specified
    if (sort)
      url.searchParams.append('_sort', sort)

    // Order the results if specified
    if (order)
      url.searchParams.append('_order', order)

    // Append query parameters
    for (const [key, value] of Object.entries(params))
      url.searchParams.append(key, value)

    // Make the fetch request
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...(options.headers || {}) },
      ...options,
    })

    // Throw an error if the request failed
    if (!response.ok)
      throw new Error(`API request failed with status ${response.status}`)

    // Return the JSON response
    return response.json()
  }

  return {

    // Get request
    get: (url, opts) => request(url, { ...opts, method: 'GET' }),

    // Post request
    post: (url, body, opts) => request(
      url,
      {
        ...opts,
        method: 'POST',
        body: body instanceof FormData
          ? body
          : JSON.stringify(body),
        headers: body instanceof FormData
          ? defaultHeaders
          : { 'Content-Type': 'application/json', ...defaultHeaders }
      }
    ),

    // Put request
    put: (url, body, opts) => request(
      url,
      {
        ...opts,
        method: 'PUT',
        body: body instanceof FormData
          ? body
          : JSON.stringify(body),
        headers: body instanceof FormData
          ? defaultHeaders
          : { 'Content-Type': 'application/json', ...defaultHeaders }
      }
    ),

    // Delete request
    delete: (url, opts) => request(url, { ...opts, method: 'DELETE' }),
  }
}

// Create a default API client instance
const apiClient = createApiClient()

// Load events along with their associated clubs
const loadEventsWithClubs                   = async () => {
  try {
    const events                            = await apiClient.get( '/events' )
    const clubs                             = await apiClient.get( '/clubs' )

    const eventsWithClubs                   = events.map( event => ({
      ...event,
      club                                  : clubs.find( club => club.id === event.clubId ) || null,
    }))

    console.log( eventsWithClubs )

    return eventsWithClubs
  } catch ( error ) {
    console.error( 'Failed to load events: ', error )
  }
}

// Load full event data including clubs and bookings
const loadFullEventData                     = async () => {
  try {
    const [
      events,
      clubs,
      bookings
    ]                                       = await Promise.all([
      apiClient.get( '/events' ),
      apiClient.get( '/clubs' ),
      apiClient.get( '/bookings' ),
    ])

    const fullEvents                        = events.map( event => ({
      ...event,
      club                                  : clubs.find( club => club.id === event.clubId ) || null,
      bookings                              : bookings.filter( booking => booking.eventId === event.id ),
    }))

    console.log( fullEvents )

    return fullEvents
  } catch ( error ) {
    console.error( 'Failed to load event data: ', error )
  }
}

const createClub                            = async ( data ) => {
  try {
    const club                              = await apiClient.post( '/clubs', {
      ...data,
    } )
  } catch ( error ) {
    console.error( 'Failed to create club: ', error )
  }
}

// Create a new booking
const createBooking                         = async ( eventId, date, time, totalTickets ) => {
  try {
    const booking                           = await apiClient.post( '/bookings', {
      eventId,
      date,
      time,
      totalTickets,
    } )

    console.log( 'Booking created: ', booking )

    return booking
  } catch ( error ) {
    console.error( 'Failed to create booking: ', error )
  }
}

// Create a new event
const createEvent                           = async ( clubId, data ) => {
  try {
    const event                             = await apiClient.post( '/events', {
      ...data,
      clubId,
    } )

    console.log( 'Event created: ', event )

    return event
  } catch ( error ) {
    console.error( 'Failed to create event: ', error )
  }
}

export {
  createApiClient,
  apiClient,

  // Load data
  loadEventsWithClubs,
  loadFullEventData,

  // Create data
  createClub,
  createBooking,
  createEvent,
}