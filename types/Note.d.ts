import Status from '../types/Status'
import Priority from './Priority'

export default interface Note {
	title: string
	url: string
	due: Date | null
	category: string
	priority: Priority
	status: Status
	body: string
}
