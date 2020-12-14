import sgMail from '@sendgrid/mail'
import childProcess from 'child_process'
import util from 'util'
import Category from '../types/Category'
import NoteProperty from '../types/NoteProperty'
import Priority from '../types/Priority'
import Status from '../types/Status'
import formatSearch from './formatSearch'
import getNoteDoctorConfig from './getNoteDoctorConfig'
import search from './search'

const exec = util.promisify(childProcess.exec)

export default async function sendEmail(): Promise<void> {
	const noteDoctorConfig = getNoteDoctorConfig()

	if (!noteDoctorConfig.sendGridAPIKey) {
		throw new Error('sendGridAPIKey not defined')
	}

	if (!noteDoctorConfig.noteRepos) {
		throw new Error('noteRepos not defined')
	}

	if (!noteDoctorConfig.emailRecipients) {
		throw new Error('emailRecipients not defined')
	}

	sgMail.setApiKey(noteDoctorConfig.sendGridAPIKey)

	// Pull latest note doctor changes
	console.log(await (await exec(`git pull`)).stdout)

	// Update all note repos
	for (const noteRepo of noteDoctorConfig.noteRepos) {
		console.log(await (await exec(`cd ${noteRepo} && git pull`)).stdout)
	}

	// Send all digest emails
	for (const emailRecipient of noteDoctorConfig.emailRecipients) {
		const endDate = new Date()
		endDate.setDate(endDate.getDate() + 7)
		const noteProperties = [NoteProperty.title, NoteProperty.due]
		const dueNotes = await search(emailRecipient.notesPath, {
			startDate: new Date(8640000000000000),
			endDate,
			categories: [
				Category.health,
				Category.academics,
				Category.career,
				Category.finance,
				Category.legal,
				Category.home,
				Category.social,
				Category.hobby,
				Category.general,
			],
			statuses: [Status.blocked, Status.inprogress, Status.todo],
			priorities: [Priority.high, Priority.low, Priority.urgent],
		})
		const urgentNotes = await search(emailRecipient.notesPath, {
			endDate: new Date(8640000000000000),
			startDate: new Date(-8630000000000000),
			categories: [
				Category.health,
				Category.academics,
				Category.career,
				Category.finance,
				Category.legal,
				Category.home,
				Category.social,
				Category.hobby,
				Category.general,
			],
			statuses: [Status.blocked, Status.inprogress, Status.todo],
			priorities: [Priority.urgent],
		})
		let text = ''
		if (dueNotes.length > 0) {
			text += `# Notes past due and due in the next seven days
${formatSearch(dueNotes, noteProperties, false)}
`
		} else {
			text += 'No notes due in the next seven days!\n\n'
		}

		if (urgentNotes.length > 0) {
			text += `# Urgent notes
${formatSearch(urgentNotes, noteProperties, false)}
`
		} else {
			text += 'No urgent notes!\n\n'
		}

		await sgMail.send({
			to: emailRecipient.email, // Change to your recipient
			from: 'emma@cline.engineer', // Change to your verified sender
			subject: 'NoteDoctor Daily Digest',
			text,
		})
	}

	return Promise.resolve()
}
