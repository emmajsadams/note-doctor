import { program } from 'commander'
import fs from 'fs'
import formatSearch from '../lib/formatSearch'
import getNoteDoctorConfig from '../lib/getNoteDoctorConfig'
import search from '../lib/search'
import Category from '../types/Category'
import NoteProperty from '../types/NoteProperty'
import Priority from '../types/Priority'
import SearchQuery from '../types/SearchQuery'
import Status from '../types/Status'

// TODO: document valid priorities in error
function collectCategory(value, previous) {
	const category = Category[value.toLowerCase()]
	if (category === undefined) {
		throw new Error(`Invalid category specified: ${value}`)
	}

	return previous.concat([category])
}

// TODO: document valid priorities in error
function collectPriority(value, previous) {
	const priority = Priority[value.toLowerCase()]
	if (priority === undefined) {
		throw new Error(`Invalid priority specified: ${value}`)
	}

	return previous.concat([priority])
}

// TODO: document valid priorities in error
function collectStatus(value, previous) {
	const status = Status[value.toLowerCase()]
	if (status === undefined) {
		throw new Error(`Invalid status specified: ${value}`)
	}

	return previous.concat([status])
}

// TODO: document valid priorities in error
function collectNoteProperty(value, previous) {
	const noteProperty = NoteProperty[value.toLowerCase()]
	if (!noteProperty) {
		throw new Error(`Invalid status specified: ${value}`)
	}

	return previous.concat([noteProperty])
}

function getDate(value) {
	return new Date(value)
}

;(async () => {
	const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
	program
		.version(packageJSON.version)
		.description(
			'A tool for searching markdown files. Results are sorted ascending by date, priority, status, category. Configured by cli or by a noteDoctorConfig.json file in root. See help for more information on config file',
		)
		.option(
			'-n, --notes <value>',
			'required ls glob pattern of the markdown files to search',
		)
		.option(
			'-p, --priority <value>',
			'A repeatable argument representing which priorities to focus the search on. If none specified then all priorities are shown',
			collectPriority,
			[],
		)
		.option(
			'-c, --category <value>',
			'A repeatable argument representing which categories to focus the search on. If none specified then all categories are shown',
			collectCategory,
			[],
		)
		.option(
			'-s, --status <value>',
			'A repeatable argument representing which statuses to focus the search on. If none specified then all statuses are shown',
			collectStatus,
			[],
		)
		.option(
			'-r, --property <value>',
			'A repeatable argument representing which properties to display. If none specified then all properties are shown',
			collectNoteProperty,
			[],
		)
		.option(
			'-e, --end-date <value>',
			'An inclusive end date to focus the search on. If none specified then the end date is the max date',
			getDate,
		)
		.option(
			'-a, --start-date <value>',
			'An inclusive start date to focus the search on. If none specified then the start date is the min date',
			getDate,
		)
		.on('--help', () => {
			console.log('\nExample call:')
			console.log(
				"  $ yarn run search --notes '../notes/tasks/*.md' --property title --property due --category home --category finance",
			)
			console.log('\nExample noteDoctorConfig.json')
			console.log(
				JSON.stringify(
					{
						notesPath: '../notes/tasks/*.md ../family-notes/tasks/*.md',
					},
					null,
					2,
				),
			)
		})

	program.parse(process.argv)
	const noteDoctorConfig = getNoteDoctorConfig()

	const notesPath = noteDoctorConfig.notesPath || program.notes
	if (!notesPath) {
		throw new Error('no notesPath defined in config or cli')
	}

	const query: SearchQuery = {
		priorities:
			program.priority.length == 0
				? [Priority.urgent, Priority.high, Priority.low]
				: program.priority,
		endDate: program.endDate || new Date(8640000000000000),
		startDate: program.startDate || new Date(-8640000000000000),
		categories:
			program.category.length == 0
				? [
						Category.health,
						Category.academics,
						Category.career,
						Category.finance,
						Category.legal,
						Category.home,
						Category.social,
						Category.hobby,
						Category.general,
				  ]
				: program.category,
		statuses:
			program.status.length == 0
				? [Status.todo, Status.inprogress, Status.blocked]
				: program.status,
	}

	const noteProperties =
		program.property.length == 0
			? [
					NoteProperty.title,
					NoteProperty.due,
					NoteProperty.priority,
					NoteProperty.category,
					NoteProperty.status,
					NoteProperty.body,
			  ]
			: program.property

	console.log(
		formatSearch(await search(notesPath, query), noteProperties, true),
	)
})()
