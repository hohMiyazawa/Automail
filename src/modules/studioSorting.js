exportModule({
	id: "studioSorting",
	description: "Add sorting options to studio pages [under development]",
	isDefault: true,
	categories: ["Browse","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/https:\/\/anilist\.co\/studio\//)
	},
	code: function(){
		let buttonInserter = function(){
			if(!document.URL.match(/https:\/\/anilist\.co\/studio\//)){
				return
			}
			let switchL = document.querySelector(".page-content .header");
			if(switchL){
				let switcher = create("div","hohStudioSorter",false,switchL,"position: absolute;top: 33px;");
				let fakeContent = create("div",["hohStudioSubstitute","container","grid-wrap"],false,"display:none;");
				switchL.parentNode.parentNode.insertBefore(fakeContent,switchL.parentNode.nextElementSibling);
				let normalSort = create("span","selected","Normal",switcher);
				let popularitySort = create("span",false,"Popularity",switcher);
				let scoreSort = create("span",false,"Score",switcher);

				let rankingData = null;
				const rankingQuery = `
query($id: Int){
	Studio(id: $id){
		popularity:media(sort:POPULARITY_DESC){
			edges{
				isMainStudio
				node{
					... mediaEntry
				}
			}
		}
		score:media(sort:SCORE_DESC){
			edges{
				isMainStudio
				node{
					... mediaEntry
				}
			}
		}
	}
}

fragment mediaEntry on Media{
	id
	format
	coverImage{large color}
	title{romaji native english}
	averageScore
	meanScore
	popularity
	genres
	siteUrl
	description(asHtml: true)
	startDate{year month day}
}`;
				let renderSubstitute = function(){
					rankingData.slice(0,25).forEach(show => {
						let card = create("div","media-card",false,fakeContent);
						if(show.isMain){
							card.classList.add("isMain")
						}
						card.style.cssText = "--media-color:" + (show.coverImage.color || 90) + ";";
						let cover = create("a","cover",false,card)
							cover.href = show.siteUrl;
							cover.style.backgroundImage = "url(\"" + show.coverImage.large + "\")";
							let overlay = create("div","overlay",false,cover);
								let title = create("a","title",titlePicker(show),overlay).href = show.siteUrl;
						let data = create("div","data",false,card);
							let airingCountdown = create("div","airing-countdown",false,data);
							let extra = create("div",["extra","full-width"],false,data);
							let description = create("div","description",false,data);
								description.innerHTML = DOMPurify.sanitize(show.description);
							let genres = create("div","genres",show.genres.join(", "),data);
					})
				}
				normalSort.onclick = function(){
					switcher.querySelector(".selected").classList.remove("selected");
					normalSort.classList.add("selected");
					fakeContent.parentNode.querySelector(".hohStudioSubstitute + .grid-wrap").style.display = "grid";
					removeChildren(fakeContent)
				}
				popularitySort.onclick = function(){
					switcher.querySelector(".selected").classList.remove("selected");
					popularitySort.classList.add("selected");
					fakeContent.parentNode.querySelector(".hohStudioSubstitute + .grid-wrap").style.display = "none";
					removeChildren(fakeContent);
					if(rankingData){
						rankingData.sort((b,a) => a.popularity - b.popularity || a.score - b.score);
						renderSubstitute()
					}
					else{
						generalAPIcall(
							rankingQuery,
							{id: parseInt(document.URL.match(/studio\/(\d+)\//)[1])},function(data){	
								rankingData = uniqueBy(
									data.data.Studio.popularity.edges.concat(
										data.data.Studio.score.edges
									).map(edge => {
										edge.node.isMain = edge.isMainStudio;
										return edge.node
									}),
									a => a.id
								);
								rankingData.sort((b,a) => a.popularity - b.popularity || a.score - b.score);
								renderSubstitute()
							}
						)
					}
				}
				scoreSort.onclick = function(){
					switcher.querySelector(".selected").classList.remove("selected");
					scoreSort.classList.add("selected");
					fakeContent.parentNode.querySelector(".hohStudioSubstitute + .grid-wrap").style.display = "none";
					removeChildren(fakeContent);
					if(rankingData){
						rankingData.sort((b,a) => a.averageScore - b.averageScore || a.meanScore - b.meanScore || a.popularity - b.popularity);
						renderSubstitute()
					}
					else{
						generalAPIcall(
							rankingQuery,
							{id: parseInt(document.URL.match(/studio\/(\d+)\//)[1])},function(data){	
								rankingData = uniqueBy(
									data.data.Studio.popularity.edges.concat(
										data.data.Studio.score.edges
									).map(edge => {
										edge.node.isMain = edge.isMainStudio;
										return edge.node
									}),
									a => a.id
								);
								rankingData.sort((b,a) => a.averageScore - b.averageScore || a.meanScore - b.meanScore || a.popularity - b.popularity);
								renderSubstitute()
							}
						)
					}
				}
			}
			else{
				setTimeout(buttonInserter,200)
			}
		};buttonInserter()
	}
})
