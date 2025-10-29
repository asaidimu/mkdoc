import { readFile, writeFile } from 'fs/promises'
import yaml from 'js-yaml'
import { marked } from 'marked'
import hljs from 'highlight.js' // Import highlight.js

export const Io = ({ path, logger }) => {
    const options = {
        config: `${path}/document.yaml`,
        main: `${path}/index.html`,
        out: `${path}/document.html`,
        chapter: `${path}/chapters`,
    }

    // Configure marked to use highlight.js
    marked.setOptions({
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-', // highlight.js css expects this prefix
        gfm: true,
    });

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
        return marked.parse(data) // No need for gfm: 'true' here, it's in setOptions
    }

    const writeDocument = async ({ html }) => {
        const data = new Uint8Array(Buffer.from(html))
        logger.info(`writing ${options.out}`)
        writeFile(options.out, data)
    }

    return { readConfig, readIndex, readChapter, writeDocument }
}
