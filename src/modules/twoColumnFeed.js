exportModule({
	id: "twoColumnFeed",
	description: translate("$twoColumnFeed_description"),
	isDefault: false,
	importance: 0,
	categories: ["Feeds"],
	visible: true,
	css: `
.home .activity-feed{
	grid-template-columns: repeat(2,1fr);
	display: grid;
	grid-column-gap: 15px;
}
.home .activity-feed .activity-entry.activity-text{
	grid-column: 1/3;
}
.home .activity-feed .activity-entry{
	margin-bottom: 15px;
}
`
})

if(useScripts.twoColumnFeed && !useScripts.CSSverticalNav){
	moreStyle.textContent += `
.home{
	margin-left: -15px;
	margin-right: -15px;
}
@media(min-width: 1540px){
	.home{
		margin-left: -95px;
		margin-right: -95px;
	}
}
@media(min-width:1040px) and (max-width:1540px){
	.home{
		margin-left: -45px;
		margin-right: -45px;
	}
}
@media(min-width:760px) and (max-width:1040px){
	.home{
		margin-left: -25px;
		margin-right: -25px;
	}
}
`
}
