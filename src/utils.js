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

// New function to extract tables and figures and generate appendices
export const generateAppendices = ({ chapters, logger }) => {
    logger.info('Generating appendices: tables and figures')

    // Extract tables from all chapters
    const extractTables = (chapter) => {
        const { document } = new JSDOM(chapter).window
        const tables = document.querySelectorAll('table')

        return Array.from(tables).map(table => {
            const caption = table.querySelector('caption')
            return {
                id: table.id,
                text: caption ? caption.textContent : `Table (ID: ${table.id})`
            }
        })
    }

    // Extract figures from all chapters
    const extractFigures = (chapter) => {
        const { document } = new JSDOM(chapter).window
        const figures = document.querySelectorAll('figure')

        return Array.from(figures).map(figure => {
            const caption = figure.querySelector('figcaption')
            return {
                id: figure.id,
                text: caption ? caption.textContent : `Figure (ID: ${figure.id})`
            }
        })
    }

    // Collect all tables and figures from chapters
    let allTables = []
    let allFigures = []

    chapters.forEach((chapter, chapterIndex) => {
        const tables = extractTables(chapter)
        const figures = extractFigures(chapter)

        // Add chapter information
        tables.forEach(table => {
            table.chapterIndex = chapterIndex
        })

        figures.forEach(figure => {
            figure.chapterIndex = chapterIndex
        })

        allTables = allTables.concat(tables)
        allFigures = allFigures.concat(figures)
    })

    // Create the appendices objects
    const tableList = {
        title: "List of Tables",
        items: allTables
    }

    const figureList = {
        title: "List of Figures",
        items: allFigures
    }

    logger.info(`Found ${allTables.length} tables and ${allFigures.length} figures`)

    return {
        tables: tableList,
        figures: figureList
    }
}
