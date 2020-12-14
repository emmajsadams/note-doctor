import fs from 'fs'
import NoteDoctorConfig from '../types/NoteDoctorConfig'

export default function getNoteDoctorConfig(): NoteDoctorConfig {
	try {
		const config = JSON.parse(fs.readFileSync('noteDoctorConfig.json', 'utf-8'))
		console.log(
			'Found noteDoctorConfig.json. Prioritizing JSON config over cli',
		)
		return {
			notesPath: config.notesPath,
		} as NoteDoctorConfig
	} catch (err) {
		return {} as NoteDoctorConfig
	}
}
