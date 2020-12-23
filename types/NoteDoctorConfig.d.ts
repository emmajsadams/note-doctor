export default interface NoteDoctorConfig {
	notesPath?: string
	sendGridAPIKey?: string
	emailRecipients?: [
		{
			email: string
			notesPath: string[]
		},
	]
	noteRepos?: string[]
}
