export default interface NoteFrontMatter {
	attributes: {
		url: string
		due: string
		category: string
		priority: string
		status: string
	}
	body: string
}
