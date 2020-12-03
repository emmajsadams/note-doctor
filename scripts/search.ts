import { nSQL } from '@nano-sql/core'
import arg from 'arg'
import chalk from 'chalk'
import { formatRelative } from 'date-fns'
import marked from 'marked'
import markedTerminal from 'marked-terminal'
import Note from '../types/Note'
import NoteProperty from '../types/NoteProperty'
import Priority from '../types/Priority'
import Status from '../types/Status'
import getNotes from './getNotes'

const MAX_DATE = new Date(8640000000000000)

marked.setOptions({
	// Define custom renderer
	renderer: new markedTerminal(),
})

interface SearchQuery {
	dates: Date[]
	priorities: Priority[]
	categories: string[]
	statuses: Status[]
}

// TODO: validate all metadata is present (including preventing / in name)
// TODO: migrate dates
export default async function search(
	notesGlob: string,
	query: SearchQuery,
): Promise<Note[]> {
	let notes = await getNotes(notesGlob)

	// We need to add max dates to all tasks so that the ordering works correctly.
	for (const note of notes) {
		if (!note.due) {
			note.due = MAX_DATE
		}
	}
	console.log(query.priorities)

	// TODO: sort by date asc, but show no date after dates
	notes = (await nSQL(notes)
		.query('select')
		.where(['priority', 'IN', query.priorities])
		.orderBy(['due ASC', 'priority ASC', 'status ASC'])
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

function formatTitle(note: Note): string {
	return chalk.blue.bold(note.title)
}

function formatDue(note: Note): string {
	if (!(note.due instanceof Date)) {
		throw new Error('due is not a date')
	}

	return formatRelative(note.due, new Date())
}

function formatPriority(note: Note): string {
	const stringPriority = Priority[note.priority]

	if (stringPriority === 'urgent') {
		return chalk.redBright(stringPriority)
	}

	if (stringPriority === 'high') {
		return chalk.yellowBright(stringPriority)
	}

	if (stringPriority === 'low') {
		return chalk.greenBright(stringPriority)
	}

	throw new Error(`Invalid or missing priority: ${stringPriority}`)
}

function formatCategory(note: Note): string {
	return note.category
}

function formatStatus(note: Note): string {
	const stringStatus = Status[note.status]

	if (stringStatus === 'todo') {
		return chalk.blueBright(stringStatus)
	}

	if (stringStatus === 'inprogress') {
		return chalk.greenBright(stringStatus)
	}

	if (stringStatus === 'blocked') {
		return chalk.redBright(stringStatus)
	}

	throw new Error(`Invalid or missing status: ${stringStatus}`)
}

function formatBody(note: Note): string {
	if (!note.body) {
		throw new Error('no body')
	}

	return marked(note.body)
}

const notePropertyFormatDict = {
	[NoteProperty.title]: formatTitle,
	[NoteProperty.due]: formatDue,
	[NoteProperty.priority]: formatPriority,
	[NoteProperty.category]: formatCategory,
	[NoteProperty.status]: formatStatus,
	[NoteProperty.body]: formatBody,
}

// TODO: add rest of properties and file url
// TODO: use natural date output
// TODO: use cli output colors
// TODO: add argument for base path
export function formatSearch(
	notes: Note[],
	noteProperties: NoteProperty[],
): string {
	const output = []

	for (const note of notes) {
		// Simple one line display for a single property
		if (noteProperties.length == 1) {
			output.push(notePropertyFormatDict[noteProperties[0]](note))
			continue
		}

		// Multi property `---` separated output
		let outputLine = '---'
		for (const noteProperty of noteProperties) {
			try {
				const formattedNoteProperty = notePropertyFormatDict[noteProperty](note)
				outputLine += `\n${noteProperty}: ${formattedNoteProperty}`
			} catch (e) {
				continue
			}
		}
		output.push(outputLine)
	}

	output.push('---')

	return output.join('\n')
}

// TODO: remove this. only for testing
// TODO: lower case search args
;(async () => {
	// end and start date are inclusive. together they can create a range, or separate they can ignore dates in the future/past a certain date
	const args = arg({
		'--notes': String,
		'--end-date': String,
		'--start-date': String,
		'--priority': [String],
		'--category': [String],
		'--status': [String],
		'--property': [String],
	})

	if (!args['--notes']) {
		throw new Error('no notes specified')
	}

	const query: SearchQuery = {
		priorities: [Priority.urgent, Priority.high, Priority.low],
		dates: [],
		categories: [],
		statuses: [Status.todo, Status.inprogress, Status.blocked],
	}
	if (args['--status']) {
		query.statuses = []
		for (const arg of args['--status']) {
			query.statuses.push(Status[arg.toLowerCase()] as any)
		}
	}
	if (args['--priority']) {
		query.priorities = []
		for (const arg of args['--priority']) {
			query.priorities.push(Priority[arg.toLowerCase()] as any)
		}
	}

	let noteProperties = [
		NoteProperty.title,
		NoteProperty.due,
		NoteProperty.priority,
		NoteProperty.category,
		NoteProperty.status,
		NoteProperty.body,
	]
	if (args['--property']) {
		noteProperties = []
		for (const arg of args['--property']) {
			noteProperties.push(NoteProperty[arg.toLowerCase()])
		}
	}

	console.log(
		formatSearch(await search(args['--notes'], query), noteProperties),
	)
})()
