export const Format = ({ logger }) => {
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

    const formatContents = async ({ contents }) => {
        let result = ''

        logger.info(`formating contents.`)
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

        logger.info(`formating chapters.`)
        for (const chapter of chapters) {
            formated = formated.concat(format.chapter(chapter))
        }

        return formated
    }

    return { chapters: formatChapters, contents: formatContents }
}
