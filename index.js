#!/usr/bin/env node

import yargs from 'yargs'
import { generateDocument } from './src/index.js'

const { argv } = yargs(process.argv.slice(2))

const document = await generateDocument(argv)
console.log(`::set-output name=title::${document.title}`)
