import arg from 'arg'
import migrateFromNotion from '../lib/migrateFromNotion'
;(async () => {
	const args = arg({
		'--notes': String,
	})

	if (!args['--notes']) {
		throw new Error('no notes specified')
	}

	await migrateFromNotion(args['--notes'])
})()
