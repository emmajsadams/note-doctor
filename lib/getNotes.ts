import fm from 'front-matter'
import fs from 'fs'
import globby from 'globby'
import Category from '../types/Category'
import Note from '../types/Note'
import NoteFrontMatter from '../types/NoteFrontMatter'
import NoteSearchResult from '../types/NoteSearchResult'
import Priority from '../types/Priority'
import Status from '../types/Status'
import getDate from './getDate'

export default async function getNotes(
	notesGlob: string[],
): Promise<NoteSearchResult> {
	const notePaths = await globby(notesGlob)

	const notes: Note[] = []
	const invalidFiles: string[] = []
	for (const notePath of notePaths) {
		// Remove invalid paths
		if (notePath === '') {
			console.log('poop')
			continue
		}

		const fileName = notePath.split('/').pop().replace('.md', '')
		const noteFrontMatter = fm<NoteFrontMatter>(
			fs.readFileSync(notePath, 'utf8'),
		)

		if (!noteFrontMatter.attributes.priority) {
			invalidFiles.push(`${notePath} has no priority`)
			continue
		}

		if (!noteFrontMatter.attributes.status) {
			invalidFiles.push(`${notePath} has no status`)
			continue
		}

		if (!noteFrontMatter.attributes.category) {
			invalidFiles.push(`${notePath} has no category`)
			continue
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

	return Promise.resolve({
		notes,
		invalidFiles,
	})
}
