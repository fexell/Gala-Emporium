// Booking form submission handling
const ticketForm = document.querySelector('.ticket-form')

ticketForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(ticketForm)
    const customerData = Object.fromEntries(formData.entries())
    console.log(customerData)
})
