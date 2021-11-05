import jsdom from 'jsdom'
import winston from 'winston'

const { createLogger, format, transports } = winston

const { combine, timestamp, printf } = format

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`
})

export const logger = createLogger({
    format: combine(timestamp('HH:mm:ss'), myFormat),
    transports: [new transports.Console()],
})

const { JSDOM } = jsdom

export const generateContents = ({ chapters }) => {
    const generate = (chapter) => {
        let contents

        const { document } = new JSDOM(chapter).window
        const h2 = document.querySelector('h2')

        const h3 = document.querySelectorAll('h3')

        const sublist = Array.from(h3).map(({ id }) => id)

        if (sublist.length > 1) {
            contents = [h2.id, sublist]
        } else {
            contents = h2.id
        }

        return contents
    }

    return chapters.map(generate)
}
