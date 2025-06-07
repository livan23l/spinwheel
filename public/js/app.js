class Roulette {
    #$roulette = document.querySelector('#roulette')  // DOM roulette
    #$textarea = document.querySelector('#wheel-textarea')  // DOM textarea
    #$optionTemplate = document.querySelector('#template-wheel-option').content
    #colors = [
        '#EB6F6F', '#85E485', '#4B71EE', '#DC9332', '#AF32DC',
        '#21D8E7', '#95EE96', '#FFB97A', '#E77AFF', '#A5869C']
    #currentOptions = []

    #round(number) {
        return Math.round(number * 100) / 100
    }

    #getPath(angle) {
        // Get the diameter and radius
        const diameter = this.#$roulette.getBoundingClientRect().width
        const radius = this.#round(diameter / 2)

        // Define the arch path properties
        let archProperties = `${radius} ${radius} 0 0 1`

        // Setting the four points (defined with '[x, y]')
        let pointInitial, pointCentral, pointFinal, pointUnion
        let isAcute, isObtuse, unionAngle

        // Set initial and central points
        pointInitial = [radius, 0]
        pointCentral = [radius, radius]

        // Get the union angle
        unionAngle = 90 - angle + (angle / 2)

        // Verify if it's an acute angle
        isAcute = angle < 90
        isObtuse = angle < 180
        if (isAcute) {
            angle = 90 - angle
        } else if (isObtuse) {
            angle = 180 - angle
        }

        if (isAcute || isObtuse) {
            // Change angles to radians (JS works with radians)
            angle = this.#round(angle * Math.PI / 180)
            unionAngle = this.#round(unionAngle * Math.PI / 180)

            // Calculation of trigonometric functions to obtain the points
            const radCos = radius * Math.cos(angle)
            const radSin = radius * Math.sin(angle)
            const unRadCos = radius * Math.cos(unionAngle)
            const unRadSin = radius * Math.sin(unionAngle)

            if (isAcute) {
                pointFinal = [
                    this.#round(radius + radCos),
                    this.#round(radius - radSin)
                ]
            } else {
                pointFinal = [
                    this.#round(radius + radSin),
                    this.#round(radius + radCos)
                ]
            }

            pointUnion = [
                this.#round(radius + unRadCos),
                this.#round(radius - unRadSin)
            ]
        } else {  // Straight angle
            pointFinal = [radius, diameter]
            pointUnion = [diameter, radius]
        }

        // Return the path
        let path = `
            M ${pointInitial[0]} ${pointInitial[1]}
            A ${archProperties} ${pointUnion[0]} ${pointUnion[1]}
            A ${archProperties} ${pointFinal[0]} ${pointFinal[1]}
            L ${pointCentral[0]} ${pointCentral[1]}
            Z
        `.replace(/\s+/g, ' ').trim()

        return path
    }

    #clearRoullette() {
        this.#$roulette.innerHTML = ""
    }

    #showOptions() {
        // Clear the old options
        this.#clearRoullette()

        // Get the options length
        const options = this.#currentOptions.length

        // Set the path and degrees by option
        let rotation = 360 / options  // Rotation by option
        let path = this.#getPath(rotation)
        rotation = this.#round(rotation)

        // Color properties
        const colorsLen = this.#colors.length
        let color = 0;

        // Set all the options
        for (let i = 0; i < options; i++) {
            // Get the current option text
            const text = this.#currentOptions[i]

            // Create the an option copy and get the 'p' element
            const $optionCopy = this.#$optionTemplate.cloneNode(true).querySelector('div')
            const $optionP = $optionCopy.querySelector('p')

            // Set the color of the option
            // Condition for not setting two consecutive colors
            if (i + 1 == options && color == 0) color = 1
            $optionCopy.style.backgroundColor = this.#colors[color++]
            color = (color == colorsLen) ? 0 : color

            // Add the text to the option
            // $optionP.innerText = text

            // Set the size and text position
            if (rotation == 360) {  // There is only one option
                // Set the text in the center
                $optionP.style.top = '50%'
                $optionP.style.left = '50%'
                $optionP.style.translate = '-50% -50%'
            } else {  // Two or more options
                // Set the clip path
                $optionCopy.style.clipPath = `path("${path}")`

                // Rotate the option
                $optionCopy.style.rotate = `${rotation * i}deg`
            }

            // Add the option to the roulette
            this.#$roulette.appendChild($optionCopy)
        }
    }

    constructor() {
        // Add the first five options
        for (let i = 0; i < 5; i++) {
            const text = `Opción #${i + 1}`

            // Add the option to the textarea
            this.#$textarea.textContent += `${text}\n`

            // Add the option to the current options
            this.#currentOptions.push(text)
        }

        // Show all the options
        this.#showOptions()

        window.addEventListener("resize", () => {
            this.#showOptions()
        })
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Roulette()
})