export const Format = ({ logger }) => {
    const format = {
        list_item: (id) => `<li><a href="#${id}"></a></li>`,
        sublist: (acc, curr, index, { length }) => {
            acc = acc.concat(curr)
            if (index === length - 1) {
                return `<li class="sublist"> <ul> ${acc} </ul> </li>`
            } else {
                return acc
            }
        },
        chapter: (chapter) => `<article class="chapter">${chapter}</article>`,
        // New format function for appendix items
        appendix_item: (item) => `<li><a href="#${item.id}">${item.text}</a></li>`,
    }

    const formatContents = async ({ contents }) => {
        let result = ''
        logger.info(`formatting contents.`)
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

    const formatChapters = async ({ chapters }) => {
        let formated = ''
        logger.info(`formatting chapters.`)
        for (const chapter of chapters) {
            formated = formated.concat(format.chapter(chapter))
        }
        return formated
    }

    // New function to format appendices
    const formatAppendix = async ({ appendix }) => {
        if (!appendix || !appendix.items || appendix.items.length === 0) {
            return '' // Return empty string if no items
        }

        logger.info(`formatting ${appendix.title}.`)

        let result = `<section class="appendix">
            <h2>${appendix.title}</h2>
            <ul>`

        for (const item of appendix.items) {
            result = result.concat(format.appendix_item(item))
        }

        result = result.concat(`</ul>
        </section>`)

        return result
    }

    return {
        chapters: formatChapters,
        contents: formatContents,
        appendix: formatAppendix
    }
}
