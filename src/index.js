import hb from 'handlebars'
import { Io } from './io.js'
import { Format } from './format.js'
import { logger, generateContents, generateAppendices } from './utils.js'

export const generateDocument = async ({ path = '.', tag = 'v1.0.0' } = {}) => {
    const { readConfig, readChapter, readIndex, writeDocument } = Io({
        path,
        logger,
    })
    const config = await readConfig()
    const index = await readIndex()
    const chapters = []

    for (const name of config.chapters) {
        chapters.push(await readChapter({ name }))
    }

    const contents = generateContents({ chapters, logger })

    // Generate appendices for tables and figures
    const appendices = generateAppendices({ chapters, logger })

    const document = hb.compile(index, { noEscape: true })
    const format = Format({ logger })

    const html = document(
        Object.assign({}, config, {
            chapters: await format.chapters({ chapters }),
            contents: await format.contents({ contents }),
            tableList: await format.appendix({ appendix: appendices.tables }),
            figureList: await format.appendix({ appendix: appendices.figures }),
            tag,
        })
    )

    writeDocument(Object.assign({ html }))
    return config
}
