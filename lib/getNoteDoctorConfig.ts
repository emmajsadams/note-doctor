import fs from 'fs'
import NoteDoctorConfig from '../types/NoteDoctorConfig'

let NOTE_DOCTOR_CONFIG: NoteDoctorConfig

export default function getNoteDoctorConfig(): NoteDoctorConfig {
	if (NOTE_DOCTOR_CONFIG) {
		return NOTE_DOCTOR_CONFIG
	}

	try {
		const config = JSON.parse(fs.readFileSync('noteDoctorConfig.json', 'utf-8'))
		console.log(
			'Found noteDoctorConfig.json. Prioritizing JSON config over cli',
		)
		NOTE_DOCTOR_CONFIG = config as NoteDoctorConfig

		return NOTE_DOCTOR_CONFIG
	} catch (err) {
		return {} as NoteDoctorConfig
	}
}
