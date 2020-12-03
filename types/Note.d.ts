import Status from '../types/Status.ts'
import Priority from './Priority.ts'

export default interface Note {
	title: string
	url: string
	due: Date | null
	category: string
	priority: Priority
	status: Status
	body: string
}
