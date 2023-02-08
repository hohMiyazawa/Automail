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
	height: auto;
	box-shadow: none;
	background: rgb(var(--color-foreground));
}
.list-editor-wrap .header::after{
	background: none;
}
.list-editor-wrap .header .content{
	align-items: center;
}
.list-editor-wrap .header .title{
	padding: 0;
}
.list-editor-wrap .header .favourite{
	margin-bottom: 0;
}
.list-editor-wrap .header .save-btn{
	margin-bottom: 0;
}
.list-editor-wrap .list-editor .body{
	padding-top: 20px;
}
@media (max-width: 760px){
	.list-editor-wrap .header .content{
		padding-top: 60px;
	}
}
	`
})
