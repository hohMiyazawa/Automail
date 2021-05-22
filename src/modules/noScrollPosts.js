exportModule({
	id: "noScrollPosts",
	description: "Display all status posts in full regardless of their length",
	isDefault: false,
	importance: -2,
	categories: ["Feeds","Newly Added"],
	visible: true,
	css: ".activity-text .text .markdown{max-height: unset}"
})
