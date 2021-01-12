import Category from './Category'
import Priority from './Priority'
import Status from './Status'

export default interface Note {
	title: string
	url: string
	due: Date | null
	category: Category
	priority: Priority
	status: Status
	body: string
}
