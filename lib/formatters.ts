import chalk from 'chalk'
import { formatRelative } from 'date-fns'
import marked from 'marked'
import markedTerminal from 'marked-terminal'
import Category, { CATEGORY_COLORS } from '../types/Category'
import Note from '../types/Note'
import Priority, { PRIORITY_COLORS } from '../types/Priority'
import Status, { STATUS_COLORS } from '../types/Status'

marked.setOptions({
	renderer: new markedTerminal(),
})

export function formatTitle(note: Note): string {
	return chalk.hsl(46, 62, 43).bold(note.title)
}

export function formatDue(note: Note): string {
	if (!(note.due instanceof Date)) {
		throw new Error('due is not a date')
	}

	return formatRelative(note.due, new Date())
}

export function formatPriority(note: Note): string {
	const priorityString = Priority[note.priority]
	const colorFunction = PRIORITY_COLORS[note.priority]

	if (!colorFunction) {
		throw new Error(`Invalid or missing priority: ${priorityString}`)
	}

	return colorFunction(priorityString)
}

export function formatCategory(note: Note): string {
	const categoryString = Category[note.category]
	const colorFunction = CATEGORY_COLORS[note.category]

	if (!colorFunction) {
		throw new Error(`Invalid or missing priority: ${categoryString}`)
	}

	return colorFunction(categoryString)
}

export function formatStatus(note: Note): string {
	const statusString = Status[note.status]
	const colorFunction = STATUS_COLORS[note.status]

	if (!colorFunction) {
		throw new Error(`Invalid or missing status: ${statusString}`)
	}

	return colorFunction(statusString)
}

export function formatBody(note: Note): string {
	if (!note.body) {
		throw new Error('no body')
	}

	return marked(note.body)
}
