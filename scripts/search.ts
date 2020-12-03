import { parse } from 'https://deno.land/std/flags/mod.ts'
import formatRelative from 'https://deno.land/x/date_fns/formatRelative/index.js'
import chalk from 'https://jspm.dev/chalk'
import Note from '../types/Note.d.ts'
import Priority from '../types/Priority.ts'
import Status from '../types/Status.ts'
import getNotes from './getNotes.ts'

interface ChalkType {
	blue: any
	blueBright: any
	redBright: any
	yellowBright: any
	greenBright: any
}

const chalkTyped: ChalkType = chalk as any

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
	// TODO: sort by date asc, but show no date after dates
	// const notes = ((await nSQL(await getNotes(notesGlob)).query('select')) as any)
	// 	.where(['priority', 'IN', query.priorities])
	// 	.orderBy({ priority: 'asc', status: 'asc' })
	// 	.exec()

	const notes = await getNotes(notesGlob)
	return Promise.resolve(notes)
}

function formatTitle(title: string): string {
	return chalkTyped.blue(title)
}

function formatPriority(priority: Priority): string {
	const stringPriority = Priority[priority]

	if (stringPriority === 'Urgent') {
		return chalkTyped.redBright(stringPriority)
	}

	if (stringPriority === 'High') {
		return chalkTyped.yellowBright(stringPriority)
	}

	if (stringPriority === 'Low') {
		return chalkTyped.greenBright(stringPriority)
	}

	return ''
}

function formatStatus(status: Status): string {
	const stringStatus = Status[status]

	if (stringStatus === 'Todo') {
		return chalkTyped.blueBright(stringStatus)
	}

	if (stringStatus === 'InProgress') {
		return chalkTyped.greenBright(stringStatus)
	}

	if (stringStatus === 'Blocked') {
		return chalkTyped.redBright(stringStatus)
	}

	return ''
}

// TODO: add rest of properties and file url
// TODO: use natural date output
// TODO: use cli output colors
// TODO: add argument for base path
export function formatSearch(notes: Note[], titleOnly: boolean): string {
	const output = []

	for (const note of notes) {
		if (titleOnly) {
			output.push(note.title)
			continue
		}

		let outputLine = '\n---\n' + formatTitle(note.title)

		if (note.due instanceof Date) {
			outputLine += `\n${formatRelative(note.due, new Date(), {})}`
		}

		outputLine += `\n${formatPriority(note.priority)}\n${
			note.category
		}\n${formatStatus(note.status)}`

		if (note.body) {
			outputLine += `\n\n${note.body}`
		}

		outputLine += '\n---\n'

		output.push(outputLine)
	}

	return output.join('\n')
}

// TODO: remove this. only for testing
// TODO: lower case search args
;(async () => {
	const args = parse(Deno.args)

	if (!args.notes) {
		throw new Error('no notes specified')
	}

	const query: SearchQuery = {
		priorities: [Priority.Urgent, Priority.High, Priority.Low],
		dates: [],
		categories: [],
		statuses: [Status.Todo, Status.InProgress, Status.Blocked],
	}

	if (args['--status']) {
		query.statuses = []
		for (const arg in args['--status']) {
			const status: keyof typeof Status = arg as any
			query.statuses.push(Status[status])
		}
	}

	if (args['--priority']) {
		query.priorities = []
		for (const arg in args['--priority']) {
			const priority: keyof typeof Priority = arg as any
			query.priorities.push(Priority[priority])
		}
	}

	console.log(formatSearch(await search(args.notes, query), args['title-only']))
})()
