import { nSQL } from '@nano-sql/core'
import Note from '../types/Note'
import SearchQuery from '../types/SearchQuery'
import getNotes from './getNotes'

const MAX_DATE = new Date(8640000000000000)

// TODO: validate all metadata is present (including preventing / in name)
// TODO: migrate dates
export default async function search(
	notesGlob: string,
	query: SearchQuery,
): Promise<Note[]> {
	let notes = await getNotes(notesGlob)

	// TODO: filter out notes if endDate or startDate is specified
	// We need to add max dates to all tasks so that the ordering works correctly.
	for (const note of notes) {
		if (!note.due) {
			note.due = MAX_DATE
		}
	}

	notes = (await nSQL(notes)
		.query('select')
		.where([
			['priority', 'IN', query.priorities],
			'AND',
			['status', 'IN', query.statuses],
			'AND',
			['category', 'IN', query.categories],
			'AND',
			['due', '<=', query.endDate],
			'AND',
			['due', '>=', query.startDate],
		])
		.orderBy(['due ASC', 'priority ASC', 'status ASC', 'category ASC'])
		.exec()) as any

	// Remove the max dates after sorting. As a performance boost I could move this step to the formatting
	// stage. However the scale of notes is very small.
	for (const note of notes) {
		if (note.due === MAX_DATE) {
			note.due = null
		}
	}

	return Promise.resolve(notes)
}
