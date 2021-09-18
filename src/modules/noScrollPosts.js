exportModule({
	id: "noScrollPosts",
	description: translate("$noScrollPosts_description"),
	isDefault: false,
	importance: -2,
	categories: ["Feeds","Newly Added"],
	visible: true,
	css: ".activity-text .text .markdown{max-height: unset}"
})
