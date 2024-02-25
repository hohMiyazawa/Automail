exportModule({
	id: "recommendationsFade",
	description: "$recommendationsFade_description",
	isDefault: false,
	importance: 0,
	categories: ["Media","Newly Added"],
	visible: true,
	css: ".recommendation-card .cover:has(.hohStatusDot):not(:hover){opacity: 0.3 !important;}"
})