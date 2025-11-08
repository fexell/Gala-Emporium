

const newEvent = {} /* 
    id: 1,
    category: music,
    title: Jazz Night,
    datetime: 2024-07-15T20:00:00,
    location: The Blue Note,
    description: An evening of smooth jazz with local artists.,
    price: 25,
    clubId: 1,
    ticketCount: 100,
    maxTickets: 200,
    eventImage: jazz-night.jpg
}
 */

fetch('http://localhost:5000/events',
{
    method: 'POST',
    headers:  {
        'Content-Type' : 'application/json'
    },
    body: JSON.stringify(newEvent)
})
.then(response => response.json())
.then(data => {
    console.log('You made it! The POST was successful.')
})



console.log(events);
