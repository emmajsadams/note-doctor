import chalk from 'chalk'
import { formatRelative } from 'date-fns'
import marked from 'marked'
import markedTerminal from 'marked-terminal'
import Category from '../types/Category'
import Note from '../types/Note'
import NoteProperty from '../types/NoteProperty'
import Priority from '../types/Priority'
import Status from '../types/Status'

marked.setOptions({
	renderer: new markedTerminal(),
})

const NOTE_PROPERTY_FORMAT_DICT = {
	[NoteProperty.title]: formatTitle,
	[NoteProperty.due]: formatDue,
	[NoteProperty.priority]: formatPriority,
	[NoteProperty.category]: formatCategory,
	[NoteProperty.status]: formatStatus,
	[NoteProperty.body]: formatBody,
}

export function formatTitle(note: Note): string {
	return chalk.blue.bold(note.title)
}

export function formatDue(note: Note): string {
	if (!(note.due instanceof Date)) {
		throw new Error('due is not a date')
	}

	return formatRelative(note.due, new Date())
}

export function formatPriority(note: Note): string {
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

// TODO: color category
export function formatCategory(note: Note): string {
	return Category[note.category]
}

export function formatStatus(note: Note): string {
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

export function formatBody(note: Note): string {
	if (!note.body) {
		throw new Error('no body')
	}

	return marked(note.body)
}

// TODO: add rest of properties and file url
// TODO: use natural date output
// TODO: use cli output colors
// TODO: add argument for base path
export default function formatSearch(
	notes: Note[],
	noteProperties: NoteProperty[],
): string {
	const output = []

	for (const note of notes) {
		// Simple one line display for a single property
		if (noteProperties.length == 1) {
			output.push(NOTE_PROPERTY_FORMAT_DICT[noteProperties[0]](note))
			continue
		}

		// Multi property `---` separated output
		let outputLine = '---'
		for (const noteProperty of noteProperties) {
			try {
				const formattedNoteProperty = NOTE_PROPERTY_FORMAT_DICT[noteProperty](
					note,
				)
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
