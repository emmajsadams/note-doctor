import fm from 'https://jspm.dev/front-matter@4.0.2'
import Note from '../types/Note.d.ts'
import NoteFrontMatter from '../types/NoteFrontMatter.d.ts'
import Priority from '../types/Priority.ts'
import Status from '../types/Status.ts'
import getDate from './getDate.ts'

// TODO: validate all metadata is present (including preventing / in name)
// TODO: validate all metadata is valid (in enum)
export default async function getNotes(notesGlob: string): Promise<Note[]> {
	Deno.chdir(notesGlob)
	const notePaths = Deno.readDirSync(notesGlob)
	const notes: Note[] = []
	for (const notePath of notePaths) {
		// Remove invalid paths
		if (!notePath) {
			continue
		}

		if (notePath.isDirectory) {
			continue
		}
		const rawNote = Deno.readTextFileSync(notePath.name)
		let title = notePath.name.replace('.md', '')
		const noteFrontMatter = (fm as any)(rawNote) as NoteFrontMatter

		if (!noteFrontMatter.attributes.priority) {
			throw new Error(`${title} has no priority`)
		}

		if (!noteFrontMatter.attributes.status) {
			throw new Error(`${title} has no status`)
		}

		if (!noteFrontMatter.attributes.category) {
			throw new Error(`${title} has no category`)
		}

		// TODO: figure out how to handle the space `In Progress`? maybe just force migrate it
		const status: keyof typeof Status = noteFrontMatter.attributes.status.replace(
			'In Progress',
			'InProgress',
		) as any
		const priority: keyof typeof Priority = noteFrontMatter.attributes
			.priority as any
		notes.push({
			title,
			url: notePath.name,
			category: noteFrontMatter.attributes.category,
			priority: Priority[priority],
			status: Status[status],
			due: getDate(noteFrontMatter.attributes.due),
			body: noteFrontMatter.body,
		})
	}

	return Promise.resolve(notes)
}
