import arg from 'arg'
import chalk from 'chalk'
import { formatRelative } from 'date-fns'
import marked from 'marked'
import markedTerminal from 'marked-terminal'
import { nSQL } from 'nano-sql'
import Note from '../types/Note'
import Priority from '../types/Priority'
import Status from '../types/Status'
import getNotes from './getNotes'

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
export default async function search(query: SearchQuery): Promise<Note[]> {
	let notes = await getNotes('/tasks')
	// TODO parameterize search
	// NOTE: replace with notes.filter
	// let output: Note[] = jsonQuery('notes[*priority=Urgent]', {
	// 	data: notes,
	// }).value
	// notes = notes.filter((note) => {
	// 	if (query.priority && query.priority.includes(note.priority)) {
	// 		return true
	// 	}

	// 	return false
	// })
	// notes = notes.sort(custom_sort)

	// TODO: sort by date asc, but show no date after dates
	notes = await nSQL(notes)
		.query('select')
		.where(['priority', 'IN', query.priorities])
		.orderBy({ priority: 'asc', status: 'asc' })
		.exec()

	return Promise.resolve(notes)
}

// // TODO: also sort by title, category, status like notion
// function custom_sort(a: Note, b: Note) {
// 	if (a.priority !== b.priority) {
// 		const aPriorityIndex = PRIORITIES.indexOf(a.priority)
// 		const bPriorityIndex = PRIORITIES.indexOf(b.priority)

// 		return aPriorityIndex - bPriorityIndex
// 	}

// 	if (a.due !== null && b.due === null) {
// 		return -1
// 	}

// 	return new Date(a.due).getTime() - new Date(b.due).getTime()
// }

function formatTitle(title: string): string {
	return chalk.blue.bold(title)
}

function formatPriority(priority: Priority): string {
	const stringPriority = Priority[priority]

	if (stringPriority === 'Urgent') {
		return chalk.redBright(stringPriority)
	}

	if (stringPriority === 'High') {
		return chalk.yellowBright(stringPriority)
	}

	if (stringPriority === 'Low') {
		return chalk.greenBright(stringPriority)
	}
}

function formatStatus(status: Status): string {
	const stringStatus = Status[status]

	if (stringStatus === 'Todo') {
		return chalk.blueBright(stringStatus)
	}

	if (stringStatus === 'InProgress') {
		return chalk.greenBright(stringStatus)
	}

	if (stringStatus === 'Blocked') {
		return chalk.redBright(stringStatus)
	}
}

// TODO: add rest of properties and file url
// TODO: use natural date output
// TODO: use cli output colors
// TODO: add argument for base path
export function formatSearch(notes: Note[]): string {
	let output = []

	console.log('formatSearch')

	for (const note of notes) {
		let outputLine = formatTitle(note.title)

		if (note.due instanceof Date) {
			outputLine += `\n${formatRelative(note.due, new Date())}`
		}

		outputLine += `\n${formatPriority(note.priority)}\n${
			note.category
		}\n${formatStatus(note.status)}`

		if (note.body) {
			outputLine += `\n\n${marked(note.body)}`
		}
		output.push(outputLine)
	}

	return output.join('\n---\n')
}

// TODO: remove this. only for testing
// TODO: lower case search args
;(async () => {
	const args = arg({
		// Types
		'--date': [String],
		'--priority': [String],
		'--category': [String],
		'--status': [String],
	})
	const query: SearchQuery = {
		priorities: [Priority.Urgent, Priority.High, Priority.Low],
		dates: [],
		categories: [],
		statuses: [Status.Todo, Status.InProgress, Status.Blocked],
	}

	if (args['--status']) {
		query.statuses = []
		for (const arg in args['--status']) {
			query.statuses.push(Status[Status[arg]])
		}
	}

	if (args['--priority']) {
		query.priorities = []
		for (const arg in args['--priority']) {
			query.priorities.push(Priority[Priority[arg]])
		}
	}

	console.log(formatSearch(await search(query)))
})()
