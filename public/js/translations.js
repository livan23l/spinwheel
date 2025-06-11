class Translations {
    #attribute = 'data-translate'
    #language
    #$translatableElements
    #translations = undefined

    #setLanguage() {
        if (typeof this.#translations == undefined) return

        this.#$translatableElements.forEach((el) => {
            const key = el.getAttribute(this.#attribute)

            // Get the text according to the language
            let text = key
            if (this.#language == 'es') text = this.#translations[key]

            el.innerText = text
        })
    }

    #changeLanguage() {
        const langAttribute = 'data-language'
        const langSection = document.querySelector('#languages')

        langSection.addEventListener('click', (event) => {
            const clicked = event.target.closest('button')
            if (!clicked) return

            this.#language = clicked.getAttribute(langAttribute)
            this.#setLanguage()
        })
    }

    constructor() {
        // Get all the translatable elements
        this.#$translatableElements = document.querySelectorAll(`[${this.#attribute}]`)

        // Get the user default language removing the region (en-US, es-ES, etc)
        this.#language = navigator.language.split('-')[0]

        // Events for the language buttons
        this.#changeLanguage()

        fetch('/public/translations/es.json')
            .then(response => response.json())
            .then(data => {
                this.#translations = data;
                this.#setLanguage()
            });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new Translations()
})