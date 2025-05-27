class Roulette {
    #$roulette = document.querySelector('#roulette')
    #$textarea = document.querySelector('#wheel-textarea')
    #$optionTemplate = document.querySelector('#template-wheel-option').content
    #colors = ['#EB6F6F', '#85E485', '#4B71EE', '#DC9332', '#AF32DC']
    #currentOptions = []
    
    #showOptions() {
        // Get the amount of options
        const optionsLen = this.#currentOptions.length

        // Position and size properties
        const totalSize = this.#$roulette.getBoundingClientRect().width
        const halfSize = Math.floor(totalSize / 2)
        let optionsPercent = Math.floor(100 / optionsLen)
        let x = halfSize
        let y = 0

        // Color properties
        const colorsLen = this.#colors.length
        let color = 0;


        for (let i = 0; i < optionsLen; i++) {
            // Get the current option text
            const text = this.#currentOptions[i]

            // Create the option copy and get the 'p' element
            const $optionCopy = this.#$optionTemplate.cloneNode(true).querySelector('div')
            const $optionP = $optionCopy.querySelector('p')

            // Set the color of the option
            $optionCopy.style.backgroundColor = this.#colors[color++]
            color = (color == colorsLen) ? 0 : color

            // Add the text to the option
            $optionP.innerText = text

            // Set the size and text position
            if (optionsPercent == 100) {
                // Set the text in the center
                $optionP.style.top = '50%'
                $optionP.style.left = '50%'
                $optionP.style.translate = '-50% -50%'
            } else {
                let path, pointA, pointB, pointC, size
                size = `${halfSize / 2} ${halfSize / 2} 0 0 1`

                // Define the points
                if (i == 0) {
                    pointA = `${halfSize} 0`
                    pointB = `${totalSize} ${halfSize}`
                    pointC = `${halfSize} ${totalSize}`

                    path = `M ${pointA} A ${size} ${pointB} A ${size} ${pointC} Z`
                } else {
                    pointA = `${halfSize} ${totalSize}`
                    pointB = `0 ${halfSize}`
                    pointC = `${halfSize} 0`

                    path = `M ${pointA} A ${size} ${pointB} A ${size} ${pointC} Z`
                }

                // Set the clip path
                console.log(path)
                $optionCopy.style.clipPath = `path("${path}")`
            }

            // Add the option to the roulette
            this.#$roulette.appendChild($optionCopy)
        }
    }

    constructor() {
        // Add the first five options
        for (let i = 1; i < 3; i++) {
            const text = `Opción #${i}`

            // Add the option to the textarea
            this.#$textarea.textContent += `${text}\n`

            // Add the option to the current options
            this.#currentOptions.push(text)
        }

        // Show all the options
        this.#showOptions()
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new Roulette()
})