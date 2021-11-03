import { readFile, writeFile } from 'fs/promises'
import { marked } from 'marked'
import hb from 'handlebars'
import jsdom from 'jsdom'
import yaml from 'js-yaml'
const { JSDOM } = jsdom

const format = {
    list_item: (id) => `<li><a href="#${id}"></a></li>`,
    sublist: (acc, curr, index, { length }) => {
        if (index === length - 1) {
            return `<li class="sublist"> <ul> ${acc}${curr} </ul> </li>`
        } else {
            return acc.concat(curr)
        }
    },
    chapter: (chapter) => `<article class="chapter">${chapter}</article>`,
}

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

export const formatContents = async ({ contents, format }) => {
    let result = ''

    for (const content of contents) {
        if (Array.isArray(content)) {
            result = result.concat(format.list_item(content[0]))
            result = result.concat(
                content[1].map(format.list_item).reduce(format.sublist, '')
            )
        } else {
            result = result.concat(format.list_item(content))
        }
    }

    return result
}

export const formatChapters = async ({ chapters, format }) => {
    let formated = ''

    for (const chapter of chapters) {
        formated = formated.concat(format.chapter(chapter))
    }

    return formated
}

const options = {
    config: 'document.yaml',
    main: 'index.html',
    output: (path) => `${path}/document.html`,
    chapters: 'chapters',
}

export const readConfig = async ({ path }) =>
    yaml.load(await readFile(`${path}/${options.config}`, 'utf8'))

export const readIndex = async ({ path }) =>
    await readFile(`${path}/${options.main}`, 'utf8')

export const readChapter = async ({ path, name }) => {
    const data = await readFile(
        `${path}/${options.chapters}/${name}.md`,
        'utf8'
    )
    return marked.parse(data, { gfm: 'true' })
}

export const writeDocument = async ({ html, path }) => {
    try {
        const data = new Uint8Array(Buffer.from(html))
        writeFile(options.output(path), data)
    } catch (err) {
        console.error(err)
    }
}

export const readChapters = async ({ path, index }) => {
    const chapters = []
    for (const name of index) {
        chapters.push(await readChapter({ path, name }))
    }
    return chapters
}

export const generateDocument = async ({ path = '.' } = {}) => {
    let config = Object.assign(await readConfig({ path }), { path })

    const index = await readIndex(config)
    const chapters = await readChapters(config)
    const contents = generateContents({ chapters })

    const document = hb.compile(index, { noEscape: true })

    const html = document(
        Object.assign(config, {
            chapters: await formatChapters({ chapters, format }),
            contents: await formatContents({ contents, format }),
        })
    )

    writeDocument(Object.assign(config, { html }))
}
