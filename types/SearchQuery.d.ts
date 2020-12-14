import Category from '../types/Category'
import Priority from '../types/Priority'
import Status from '../types/Status'

export default interface SearchQuery {
	endDate: Date
	startDate: Date
	priorities: Priority[]
	categories: Category[]
	statuses: Status[]
}
