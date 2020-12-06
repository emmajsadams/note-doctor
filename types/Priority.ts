import chalk from 'chalk'

enum Priority {
	urgent = 0,
	high = 1,
	low = 2,
}

export const PRIORITY_COLORS = {
	[Priority.urgent]: chalk.redBright,
	[Priority.high]: chalk.yellowBright,
	[Priority.low]: chalk.greenBright,
}

export default Priority
