import Note from '../types/Note'
import NoteProperty, { NOTE_PROPERTY_FORMAT } from '../types/NoteProperty'

// TODO: add rest of properties and file url
// TODO: use natural date output
// TODO: use cli output colors
// TODO: add argument for base path
export default function formatSearch(
	notes: Note[],
	noteProperties: NoteProperty[],
): string {
	let output = ''

	for (const note of notes) {
		// Simple one line display for a single property
		if (noteProperties.length == 1) {
			const notePropertyValue = NOTE_PROPERTY_FORMAT[noteProperties[0]](note)
			output += `${notePropertyValue}\n`
			continue
		}

		// Multi property `---` separated output
		output += '---\n'
		for (const noteProperty of noteProperties) {
			try {
				const notePropertyValue = NOTE_PROPERTY_FORMAT[noteProperty](note)
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
