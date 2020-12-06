import chalk from 'chalk'

enum Status {
	todo = 0,
	inprogress = 1,
	blocked = 2,
}

export const STATUS_COLORS = {
	[Status.todo]: chalk.blueBright,
	[Status.inprogress]: chalk.greenBright,
	[Status.blocked]: chalk.redBright,
}

export default Status
