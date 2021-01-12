import Category from './Category'
import Priority from './Priority'
import Status from './Status'

export default interface SearchQuery {
	endDate: Date
	startDate: Date
	priorities: Priority[]
	categories: Category[]
	statuses: Status[]
}
