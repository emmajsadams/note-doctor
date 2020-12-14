import childProcess from 'child_process'
import fm from 'front-matter'
import fs from 'fs'
import util from 'util'
import Category from '../types/Category'
import Note from '../types/Note'
import NoteFrontMatter from '../types/NoteFrontMatter'
import Priority from '../types/Priority'
import Status from '../types/Status'
import getDate from './getDate'

const exec = util.promisify(childProcess.exec)

// TODO: validate all metadata is present (including preventing / in name)
export default async function getNotes(notesGlob: string): Promise<Note[]> {
	const notePaths = (await exec(`ls ${notesGlob}`)).stdout.split('\n')

	const notes: Note[] = []
	for (const notePath of notePaths) {
		// Remove invalid paths
		if (notePath === '') {
			continue
		}

		const fileName = notePath.split('/').pop().replace('.md', '')
		const noteFrontMatter = fm<NoteFrontMatter>(
			fs.readFileSync(notePath, 'utf8'),
		)

		if (!noteFrontMatter.attributes.priority) {
			throw new Error(`${fileName} has no priority`)
		}

		if (!noteFrontMatter.attributes.status) {
			throw new Error(`${fileName} has no status`)
		}

		if (!noteFrontMatter.attributes.category) {
			throw new Error(`${fileName} has no category`)
		}

		notes.push({
			title: noteFrontMatter.attributes.title || fileName,
			url: notePath,
			category: Category[noteFrontMatter.attributes.category.toLowerCase()],
			priority: Priority[noteFrontMatter.attributes.priority.toLowerCase()],
			// remove whitespace for status since "in progress" might be a status
			status:
				Status[
					noteFrontMatter.attributes.status.replace(' ', '').toLowerCase()
				],
			due: getDate(noteFrontMatter.attributes.due),
			body: noteFrontMatter.body,
		})
	}

	return Promise.resolve(notes)
}
