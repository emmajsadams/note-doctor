import Note from './Note'

export default interface NoteSearchResult {
	notes: Note[]
	invalidFiles: string[]
}
