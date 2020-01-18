if(useScripts.CSSfavs){
/*adds a logo to most favourite studio entries. Add more if needed */
	const favStudios = m4_include(data/studios.json)
	let favStudioString = "";
	if(useScripts.CSSfavs){
		favStudioString += `
.overview  .favourites > .favourites-wrap > div,
.overview  .favourites > .favourites-wrap > a{
/*make the spaces in the grid even*/
	margin-bottom: 0px!important;
	margin-right: 0px!important;
	column-gap: 10px!important;
}
.user .overview{
	grid-template-columns: 460px auto!important;
}
.overview .favourites > .favourites-wrap{
	display: grid!important;
	padding: 0px!important;
	display: grid;
	grid-gap: 10px;
	column-gap: 10px!important;
	grid-template-columns: repeat(auto-fill,85px);
	grid-template-rows: repeat(auto-fill,115px);
	background: rgb(0,0,0,0) !important;
	width: 470px;
}
.overview .favourite.studio{
	cursor: pointer;
	min-height: 115px;
	font-size: 15px;
	display: grid;
	grid-gap: 10px;
	padding: 2px!important;
	padding-top: 8px!important;
	background-color: rgba(var(--color-foreground))!important;
	text-align: center;
	align-content: center;
}
.site-theme-dark .overview  .favourite.studio{
	background-color: rgb(49,56,68)!important;
}
.preview .favourite.media,
.preview .favourite.staff,
.preview .favourite.character{
	background-color: rgb(var(--color-foreground));
}
.overview .favourite.studio::after{
	display: inline-block;
	background-repeat: no-repeat;
	content:"";
	margin-left:5px;
	background-size: 76px 19px;
	width: 76px;
	height: 19px;
}`;
		favStudios.forEach(studio => {
			if(studio[2] !== ""){
				favStudioString += `.favourite.studio[href="/studio/${studio[0]}/${studio[1]}"]::after{background-image: url("${studio[2]}");`;
				if(studio.length === 5){
					favStudioString += `background-size: ${studio[3]}px ${studio[4]}px;width: ${studio[3]}px;height: ${studio[4]}px;`;
				}
				favStudioString += "}";
			}
		});
	}
	moreStyle.textContent += favStudioString;
}
