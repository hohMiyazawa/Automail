exportModule({
	id: "infoTable",
	description: translate("$setting_infoTable"),
	isDefault: false,
	importance: 1,
	categories: ["Media"],
	visible: true,
	css: `
.media-page-unscoped > .content.container{
	grid-template-columns: 215px auto;
}
.media-page-unscoped .sidebar > .data{
	padding: 15px;
}
.media-page-unscoped .data-set,
.media-page-unscoped .data-set #hohMALserialization{
	display: inline-block;
	width: 100%;
	padding-bottom: 9px!important;
	padding-top: 4px;
}
.media-page-unscoped .data-set ~ .data-set{
	border-top-style: solid;
	border-top-width: 1px;
	border-top-color: rgb(var(--color-background));
}
.media-page-unscoped .data-set .type{
	display: inline;
}
.media-page-unscoped .data-set .value{
	display: inline;
	float: right;
	margin-top: 2px;
}`
})
