class Mail {
    #$form
    #$formEmail
    #$formMessage
    #$formButton
    #url

    #showsResponse(type) {
        // Shows the corresponding alert
        const alert = document.querySelector(`.contact__alert--${type}`)
        alert.classList.remove('contact__alert--hidden')

        // Disabled the submit button
        this.#$formButton.setAttribute('disabled', 'disabled')

        // Set a timeout of five seconds
        setTimeout(() => {
            // Hides the alert
            alert.classList.add('contact__alert--hidden')

            // Activate the submit button
            this.#$formButton.removeAttribute('disabled')
        }, 5000)
    }

    #sendEmail() {
        this.#$form.addEventListener('submit', (event) => {
            event.preventDefault()

            // Body of the request
            const email = this.#$formEmail.value
            const message = this.#$formMessage.value
            const body = `email=${email}&message=${message}`

            // Makes an api fetch to send the email
            fetch(
                this.#url,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body
                }
            ).then(res => {
                if (res.ok) {
                    this.#showsResponse("success")
                } else {
                    this.#showsResponse("error")
                }
            })

            // Delete the input values
            this.#$formEmail.value = ""
            this.#$formMessage.value = ""
        })
    }

    constructor() {
        // Get the form elements
        this.#$form = document.querySelector('#contact')
        this.#$formEmail = this.#$form.querySelector('#email')
        this.#$formMessage = this.#$form.querySelector('#message')
        this.#$formButton = this.#$form.querySelector('#contact-button')

        // Set the URL
        this.#url = './mail.php'

        // Event for when the user sends an email
        this.#sendEmail()
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Mail()
})