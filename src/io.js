import { readFile, writeFile } from 'fs/promises'
import yaml from 'js-yaml'
import { marked } from 'marked'

export const Io = ({ path, logger }) => {
    const options = {
        config: `${path}/document.yaml`,
        main: `${path}/index.html`,
        out: `${path}/document.html`,
        chapter: `${path}/chapters`,
    }

    const readConfig = async (_) => {
        logger.info(`reading ${options.config}`)
        return yaml.load(await readFile(`${options.config}`, 'utf8'))
    }

    const readIndex = async (_) => {
        logger.info(`reading ${options.main}`)
        return await readFile(`${options.main}`, 'utf8')
    }

    const readChapter = async ({ name }) => {
        logger.info(`reading ${options.chapter}/${name}.md`)
        const data = await readFile(`${options.chapter}/${name}.md`, 'utf8')
        return marked.parse(data, { gfm: 'true' })
    }

    const writeDocument = async ({ html }) => {
        const data = new Uint8Array(Buffer.from(html))
        logger.info(`writing ${options.out}`)
        writeFile(options.out, data)
    }

    return { readConfig, readIndex, readChapter, writeDocument }
}
