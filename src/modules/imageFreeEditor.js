exportModule({
	id: "imageFreeEditor",
	description: "$imageFreeEditor_description",
	isDefault: false,
	importance: -2,
	categories: ["Media","Lists"],
	visible: true,
	css: `
.list-editor-wrap .cover{
	display: none;
}
.list-editor-wrap .header{
	background-image: none!important;
	height: 0px;
}
.list-editor-wrap .header .content{
	padding-top: 2px;
	padding-left: 35px;
	padding-right: 120px;
	height: 60px;
}
	`
})
