import bluebird from 'bluebird'
import childProcess from 'child_process'
import fs from 'fs'
import lineReader from 'line-reader'
import moment from 'moment'
import util from 'util'

const exec = util.promisify(childProcess.exec)
const eachLine = bluebird.promisify(lineReader.eachLine)

// NOTE: This is not maintained with recent notion upgrades. Please check the notion export format before using.
export default async function migrateFromNotion(
	notesGlob: string,
): Promise<void> {
	const notionExportPaths = (await exec(`ls ${notesGlob}`)).stdout.split('\n')

	for (const notionExportPath of notionExportPaths) {
		let newFilePath = ''
		// Skip invalid paths
		if (notionExportPath === '') {
			continue
		}

		const lines: string[] = ['---']
		let doneParsingFrontMatter = false

		await eachLine(notionExportPath.replace('\n', ''), function (line) {
			if (doneParsingFrontMatter) {
				lines.push(line)
				return
			}

			// Parse title
			if (line.startsWith('#')) {
				line = line.replace('# ', '').replace('/', 'and')
				const splitPath = notionExportPath.split('/')
				splitPath.pop()
				newFilePath = `${splitPath.join('/')}/${line}.md`
				return
			}

			// Handle the space between header and notion metadata
			if (line === '') {
				return
			}

			line = line.toLowerCase()

			if (line.startsWith('due:')) {
				const date = line.replace('due: ', '')
				lines.push(`due: '${moment(date, 'MMM D, YYYY').format()}'`)
				return
			}

			// Parse status and end front matter
			if (line.startsWith('status:')) {
				doneParsingFrontMatter = true
				lines.push(line)
				lines.push('---')
				return
			}

			lines.push(line)
		})

		fs.unlinkSync(notionExportPath)
		fs.writeFileSync(newFilePath, lines.join('\n'))
	}
}
