import {
	formatBody,
	formatCategory,
	formatDue,
	formatPriority,
	formatStatus,
	formatTitle,
} from '../lib/formatters'

enum NoteProperty {
	title = 'title',
	due = 'due',
	priority = 'priority',
	category = 'category',
	status = 'status',
	body = 'body',
}

export const NOTE_PROPERTY_FORMAT = {
	[NoteProperty.title]: formatTitle,
	[NoteProperty.due]: formatDue,
	[NoteProperty.priority]: formatPriority,
	[NoteProperty.category]: formatCategory,
	[NoteProperty.status]: formatStatus,
	[NoteProperty.body]: formatBody,
}

export default NoteProperty
