import Note from '../types/Note'
import NoteProperty, { NOTE_PROPERTY_FORMAT } from '../types/NoteProperty'

export default function formatSearch(
	notes: Note[],
	noteProperties: NoteProperty[],
	cliColor: boolean,
): string {
	let output = ''

	for (const note of notes) {
		// Simple one line display for a single property
		if (noteProperties.length == 1) {
			const notePropertyValue = NOTE_PROPERTY_FORMAT[noteProperties[0]](
				note,
				cliColor,
			)
			output += `${notePropertyValue}\n`
			continue
		}

		// Multi property `---` separated output
		output += '---\n'
		for (const noteProperty of noteProperties) {
			try {
				const notePropertyValue = NOTE_PROPERTY_FORMAT[noteProperty](
					note,
					cliColor,
				)
				output += `${noteProperty}: ${notePropertyValue}`
				if (noteProperty !== 'body') {
					output += '\n'
				}
			} catch (e) {
				continue
			}
		}
	}

	output += '---'

	return output
}
