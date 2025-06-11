class Roulette {
    #$roulette = document.querySelector('#roulette')  // DOM roulette
    #$textarea = document.querySelector('#wheel-textarea')  // DOM textarea
    #$backdrop = document.querySelector('#backdrop')  // DOM backdrop
    #$selection = document.querySelector('#selection')  // DOM selection
    #$optionTemplate = document.querySelector('#template-wheel-option').content
    #colors = [
        '#EB6F6F', '#85E485', '#4B71EE', '#DC9332', '#AF32DC',
        '#21D8E7', '#BBF1BB', '#FFB97A', '#E77AFF', '#A5869C']
    #currentOptions = []
    #isSpining = false

    #getTextDimensions(optDim) {
        const { radius, centralPoint, unionPoint } = optDim

        // Calculate top and left values in pixels
        const top = radius - Math.abs(unionPoint[1] - centralPoint[1]) / 2
        const left = radius + Math.abs(unionPoint[0] - centralPoint[0]) / 2

        // Calculate the rotation angle (in degrees)
        const slope = (unionPoint[1] - centralPoint[1]) / (unionPoint[0] - centralPoint[0])
        const angle = Math.atan(slope)  // Return the angle in radians
        const rotate = angle * 180 / Math.PI  // Transform to degrees

        return {
            left,
            top,
            rotate
        }
    }

    #generatePath(dimensions) {
        // Get the dimension
        const { radius, initialPoint, centralPoint, finalPoint, unionPoint } = dimensions

        // Define the arch path properties
        const archProperties = `${radius} ${radius} 0 0 1`

        // Define and return the path
        let path = `M ${initialPoint[0]} ${initialPoint[1]}` +
            `A ${archProperties} ${unionPoint[0]} ${unionPoint[1]}` +
            `A ${archProperties} ${finalPoint[0]} ${finalPoint[1]}` +
            `L ${centralPoint[0]} ${centralPoint[1]} Z`

        return path
    }

    #getOptionDimensions(angle) {
        // Get the diameter and radius
        const diameter = this.#$roulette.clientWidth
        const radius = diameter / 2

        // Setting the four points (defined with '[x, y]')
        let initialPoint, centralPoint, finalPoint, unionPoint
        let isAcute, isObtuse, unionAngle

        // Set initial and central points
        initialPoint = [radius, 0]
        centralPoint = [radius, radius]

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
            angle = angle * Math.PI / 180
            unionAngle = unionAngle * Math.PI / 180

            // Calculation of trigonometric functions to obtain the points
            const radCos = radius * Math.cos(angle)
            const radSin = radius * Math.sin(angle)

            // Obtain the final point
            if (isAcute) {
                finalPoint = [
                    radius + radCos,
                    radius - radSin
                ]
            } else {
                finalPoint = [
                    radius + radSin,
                    radius + radCos
                ]
            }

            // Obtain the union point
            const unRadCos = radius * Math.cos(unionAngle)
            const unRadSin = radius * Math.sin(unionAngle)
            unionPoint = [
                radius + unRadCos,
                radius - unRadSin
            ]
        } else {  // Straight angle
            finalPoint = [radius, diameter]
            unionPoint = [diameter, radius]
        }

        return {
            radius,
            initialPoint,
            centralPoint,
            finalPoint,
            unionPoint
        }
    }

    #showOptions() {
        // Clear the old options
        this.#$roulette.innerHTML = ""

        // Get the options length
        const options = this.#currentOptions.length

        // Set rotation by option
        const rotation = 360 / options

        // If there is more than one option obtain dimensions and set path
        let path, optDim, textDim
        if (rotation != 360) {
            optDim = this.#getOptionDimensions(rotation)
            path = this.#generatePath(optDim)
            textDim = this.#getTextDimensions(optDim)
        }

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
            //--Condition for not setting two consecutive colors
            if (i + 1 == options && color == 0) color = 1
            $optionCopy.style.backgroundColor = this.#colors[color++]
            color = (color == colorsLen) ? 0 : color

            // Set the size and text position
            if (rotation == 360) {  // There is only one option
                // Add the text to the option 'p'
                $optionP.innerText = text

                // The 'p' element will have a 100% width
                $optionP.style.width = "100%"

                // Set the text in the center
                $optionP.style.top = '50%'
                $optionP.style.left = '50%'
                $optionP.style.translate = '-50% -50%'
            } else {  // Two or more options
                // Set the clip path
                $optionCopy.style.clipPath = `path("${path}")`

                // Set the text in the option
                //--Add the text to the option 'p'
                $optionP.innerText = text

                //--Put the text according to its dimensions
                $optionP.style.top = `${textDim['top']}px`
                $optionP.style.left = `${textDim['left']}px`
                $optionP.style.translate = '-50% -50%'

                //--Rotate the text according to the option size
                $optionP.style.rotate = `${textDim['rotate']}deg`

                // Rotate the option
                $optionCopy.style.rotate = `${rotation * i}deg`
            }

            // Add the option to the roulette
            this.#$roulette.appendChild($optionCopy)
        }
    }

    #handleOptions() {
        // Event when the user changes the content of the textarea
        this.#$textarea.addEventListener('input', () => {
            // To fix the scroll move on firefox
            const scrollY = window.scrollY

            // Get the options of the textarea
            const lines = this.#$textarea.value.split('\n')
                .map(line => line.trim())  // Trim every line
                .filter(line => line)  // Filter to get only truthy values

            // Put the options in the roulette
            this.#currentOptions = lines
            this.#showOptions()

            // Put the scroll where it was before if it's firefox
            if (navigator.userAgent.toLowerCase().includes('firefox')) {
                window.scrollTo(0, scrollY)
            }
        })
    }

    #spinRoulette() {
        // This function will be executed when the spins end
        const endOfSpin = (option) => {
            // Set variables and cursor to its normal values
            this.#isSpining = false
            this.#$roulette.style.cursor = ''

            // Remove 'disabled' attribute from the textarea
            this.#$textarea.removeAttribute('disabled')

            // Get the selection 'p' element and the color of the option
            const $selectionP = this.#$selection.querySelector('#selection-text')
            const color = getComputedStyle(
                this.#$roulette.querySelectorAll('.wheel__option')[option]
            ).backgroundColor

            // Show the selection with the text and the color
            $selectionP.innerText = this.#currentOptions[option]
            this.#$selection.style.setProperty('--color', color);
            this.#$selection.setAttribute('open', 'open')
            this.#$backdrop.classList.remove('backdrop--hidden')

            // Remove temporary the scroll from the page
            document.querySelector('body').style.overflow = 'hidden'

            // Puts the option on the delete button
            const deleteBtn = this.#$selection.querySelector('#selection-delete')
            deleteBtn.removeAttribute('data-option')
            deleteBtn.setAttribute('data-option', option)
        }

        this.#$roulette.addEventListener('click', () => {
            const optionsLen = this.#currentOptions.length

            if (optionsLen == 0) return
            if (this.#isSpining) return

            // Set that now the roulette is spining
            this.#isSpining = true
            this.#$roulette.style.cursor = 'no-drop'

            // Ends the initial roulette animation
            if (this.#$roulette.classList.contains('roulette--spining')) {
                // Get the current angle of the rotation
                const currentAngle = getComputedStyle(this.#$roulette).rotate

                // Remove the spining animation class
                this.#$roulette.classList.remove('roulette--spining')

                // Add the current angle to the inline styles
                this.#$roulette.style.rotate = currentAngle
            }

            // Disabled the textarea
            this.#$textarea.setAttribute('disabled', 'disabled')

            // Choose randomly one option
            const option = Math.floor(Math.random() * optionsLen)

            // Choose where is the option going to be selected
            const optionDegrees = 360 / optionsLen
            //--Randomly select the degrees where the option will be placed
            const selectedDegrees = Math.floor(Math.random() * optionDegrees)

            // Spin variables
            const maxVelocity = 20
            let velocity = 1
            let isAccelerating = true
            let angle = parseFloat(this.#$roulette.style.rotate) || 0

            // Calculate the final degrees of the roulette to put the option
            // In the correct position according to 'selectedDegrees'
            let finalDeg = Math.round(
                (90 - selectedDegrees) +
                (360 - optionDegrees * option)
            )

            // Validate angles to be in range [0 - 360)
            if (finalDeg >= 360) finalDeg -= 360
            if (angle >= 360) angle -= 360

            const spin = () => {
                if (velocity <= 0) {
                    endOfSpin(option)
                    return
                }

                // Apply the angle to the roulette
                angle += velocity
                if (angle >= 360) angle -= 360
                this.#$roulette.style.rotate = `${angle}deg`

                // Increase or decrease the velocity
                if (isAccelerating) {
                    velocity += 0.1
                    isAccelerating = velocity < maxVelocity

                    if (!isAccelerating) {
                        // When the maximum velocity is reached, translate the
                        // angle to the final angle that was selected
                        angle = finalDeg
                    }
                } else {
                    // Decrease the velocity by the exact value to mantain the
                    // final angle when the velocity is 0
                    velocity -= 0.11173185  // Obtained by trial and error
                }

                requestAnimationFrame(spin)
            }

            requestAnimationFrame(spin)
        })
    }

    #selectionEvents() {
        // Get the selection delete button
        const deleteBtn = this.#$selection.querySelector('#selection-delete')

        // Function that hides backdrop and selection dialog
        const hideSelection = () => {
            document.querySelector('body').style.overflow = 'auto'
            this.#$backdrop.classList.add('backdrop--hidden')
            this.#$selection.removeAttribute('open')
        }

        // Event when the user press the backdrop
        this.#$backdrop.addEventListener('click', hideSelection)

        // Event when the user press the close button
        this.#$selection.querySelector('#selection-close')
            .addEventListener('click', hideSelection)

        // Event when the user press the deleteBtn
        deleteBtn.addEventListener('click', () => {
            hideSelection();

            // Gets the selected option
            const option = deleteBtn.getAttribute('data-option')

            // Delete the option of the current options
            this.#currentOptions.splice(option, 1)

            // Update the textarea
            this.#$textarea.value = this.#currentOptions.join('\n')

            // Update the current options
            this.#showOptions()
        })
    }

    constructor() {
        // Add the first options
        for (let i = 0; i < 5; i++) {
            const text = `Opción #${i + 1}`

            // Add the option to the textarea
            this.#$textarea.textContent += `${text}\n`

            // Add the option to the current options
            this.#currentOptions.push(text)
        }

        // Show all the options
        this.#showOptions()

        // Handle the options in the textarea
        this.#handleOptions()

        // Method to spin the roulette
        this.#spinRoulette()

        // Events when the option in selected
        this.#selectionEvents()

        // Adjust the roulette when the window resizes
        window.addEventListener('resize', () => {
            this.#showOptions()
        })
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Roulette()
})