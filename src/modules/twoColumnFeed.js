exportModule({
	id: "twoColumnFeed",
	description: "$twoColumnFeed_description",
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
@media(max-width: 1040px){
	.home .activity-anime_list .details,.home .activity-manga_list .details{
		padding-right: 15px;
	}
}
@media(max-width: 760px){
	.home .activity-anime_list .details,.home .activity-manga_list .details{
		padding-top: 35px;
	}
}
@media(max-width: 500px){
	.home .activity-anime_list .cover,.home .activity-manga_list .cover{
		padding-top: 35px;
		max-height: 120px;
	}
	.home .activity-entry > .wrap > .actions{
		width: calc(100% - 25px);
		bottom: 7px;
		display: flex;
	}
	.home .activity-feed{
		grid-column-gap: 10px;
	}
}
`
}
