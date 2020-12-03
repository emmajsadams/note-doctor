import childProcess from 'child_process'
import fm from 'front-matter'
import fs from 'fs'
import util from 'util'
import Note from '../types/Note'
import NoteFrontMatter from '../types/NoteFrontMatter'
import Priority from '../types/Priority'
import Status from '../types/Status'
import getDate from './getDate'

const exec = util.promisify(childProcess.exec)

// TODO: validate all metadata is present (including preventing / in name)
export default async function getNotes(notesGlob: string): Promise<Note[]> {
	const notePaths = await (await exec(`ls ${notesGlob}`)).stdout.split('\n')

	const notes: Note[] = []
	for (const notePath of notePaths) {
		// Remove invalid paths
		if (notePath === '') {
			continue
		}

		const title = notePath.split('/').pop().replace('.md', '')
		const noteFrontMatter = fm<NoteFrontMatter>(
			fs.readFileSync(notePath, 'utf8'),
		)

		if (!noteFrontMatter.attributes.priority) {
			throw new Error(`${title} has no priority`)
		}

		if (!noteFrontMatter.attributes.status) {
			throw new Error(`${title} has no status`)
		}

		notes.push({
			title,
			url: notePath,
			category: noteFrontMatter.attributes.category,
			priority: Priority[noteFrontMatter.attributes.priority],
			status:
				Status[
					noteFrontMatter.attributes.status.replace('In Progress', 'InProgress')
				],
			due: getDate(noteFrontMatter.attributes.due),
			body: noteFrontMatter.body,
		})
	}

	return Promise.resolve(notes)
}
