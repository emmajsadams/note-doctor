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
	console.log((await exec(`git pull`)).stdout)

	// Update all note repos
	for (const noteRepo of noteDoctorConfig.noteRepos) {
		console.log((await exec(`cd ${noteRepo} && git pull`)).stdout)
	}

	// Send all digest emails
	for (const emailRecipient of noteDoctorConfig.emailRecipients) {
		const endDate = new Date()
		endDate.setDate(endDate.getDate() + 7)
		const noteProperties = [NoteProperty.title, NoteProperty.due]
		const dueNoteSearchResult = await search(emailRecipient.notesPath, {
			startDate: new Date(-8640000000000000),
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
		const dueNotes = dueNoteSearchResult.notes
		const urgentNotesSearchResult = await search(emailRecipient.notesPath, {
			endDate: new Date(8640000000000000),
			startDate: new Date(-8640000000000000),
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
		const urgentNotes = urgentNotesSearchResult.notes

		// Remove duplicate notes between each section preferring due dates for duplicate notes
		const dueNoteTitles = new Set<string>()
		for (const dueNote of dueNotes) {
			dueNoteTitles.add(dueNote.title)
		}
		const filteredUrgentNotes = []
		for (const urgentNote of urgentNotes) {
			if (!dueNoteTitles.has(urgentNote.title)) {
				filteredUrgentNotes.push(urgentNote)
			}
		}

		let text = ''

		const invalidFiles = [
			...new Set(
				dueNoteSearchResult.invalidFiles.concat(
					urgentNotesSearchResult.invalidFiles,
				),
			),
		]

		if (invalidFiles.length > 0) {
			text +=
				'The following files are invalid and should be fixed so they can be triaged correctly\n\n'
			text += invalidFiles.join('\n')
			text += '\n############################\n############################\n\n'
		}

		if (dueNotes.length > 0) {
			text += `# Notes past due and due in the next seven days
${formatSearch(dueNotes, noteProperties, false)}

`
		} else {
			text += 'No notes past due or due in the next seven days!\n\n'
		}

		text += '############################\n############################\n\n'

		if (filteredUrgentNotes.length > 0) {
			text += `# Urgent notes
${formatSearch(filteredUrgentNotes, noteProperties, false)}

`
		} else {
			text += 'No urgent notes!\n\n'
		}

		await sgMail.send({
			to: emailRecipient.email, // Change to your recipient
			from: 'notedoctor@cline.engineer', // Change to your verified sender
			subject: 'NoteDoctor Daily Digest',
			text,
		})
	}

	return Promise.resolve()
}
