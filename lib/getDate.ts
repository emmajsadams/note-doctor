export default function getDate(rawDate: string): Date | null {
	if (!rawDate) {
		return null
	}

	return new Date(rawDate)
}
