import chalk from 'chalk'

enum Category {
	health = 0,
	academics = 1,
	career = 2,
	finance = 3,
	legal = 4,
	home = 5,
	social = 6,
	hobby = 7,
	general = 8,
}

export const CATEGORY_COLORS = {
	[Category.health]: chalk.red,
	[Category.academics]: chalk.magenta,
	[Category.career]: chalk.hsl(23, 67, 21),
	[Category.finance]: chalk.green,
	[Category.legal]: chalk.cyan,
	[Category.home]: chalk.yellow,
	[Category.social]: chalk.magenta,
	[Category.hobby]: chalk.grey,
	[Category.general]: chalk.hsl(351, 33.6, 57.5),
}

export default Category
