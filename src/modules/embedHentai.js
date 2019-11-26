function embedHentai(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(home|user|forum|activity)/)){
		return
	};
	if(useScripts.SFWmode){//saved you there
		return
	};
	setTimeout(embedHentai,1000);
	let mediaEmbeds = document.querySelectorAll(".media-embed");
	let bigQuery = [];//collects all on a page first so we only have to send 1 API query.
	mediaEmbeds.forEach(function(embed){
		if(embed.children.length === 0 && !embed.classList.contains("hohMediaEmbed")){//if( "not-rendered-natively" && "not-rendered-by-this sript" )
			embed.classList.add("hohMediaEmbed");
			let createEmbed = function(data){
				if(!data){
					return
				};
				embed.innerText = "";
				let eContainer = create("div",false,false,embed);
				let eEmbed = create("div","embed",false,eContainer);
				let eCover = create("div","cover",false,eEmbed);
				eCover.style.backgroundImage = "url(" + data.data.Media.coverImage.large + ")";
				let eWrap = create("div","wrap",false,eEmbed);
				let mediaTitle = titlePicker(data.data.Media);
				let eTitle = create("div","title",mediaTitle,eWrap);
				let eInfo = create("div","info",false,eWrap);
				let eGenres = create("div","genres",false,eInfo);
				data.data.Media.genres.forEach((genre,index) => {
					let eGenre = create("span",false,genre,eGenres);
					let comma = create("span",false,", ",eGenre);
					if(index === data.data.Media.genres.length - 1){
						comma.style.display = "none"
					}
				});
				create("span",false,distributionFormats[data.data.Media.format],eInfo);
				create("span",false," · " + distributionStatus[data.data.Media.status],eInfo);
				if(data.data.Media.season){
					create("span",false,
						" · " + capitalize(data.data.Media.season.toLowerCase()) + " " + data.data.Media.startDate.year,
						eInfo
					)
				}
				else if(data.data.Media.startDate.year){
					create("span",false,
						" · " + data.data.Media.startDate.year,
						eInfo
					)
				}
				if(data.data.Media.averageScore){
					create("span",false," · " + data.data.Media.averageScore + "%",eInfo)
				}
				else if(data.data.Media.meanScore){//fallback if it's not popular enough, better than nothing
					create("span",false," · " + data.data.Media.meanScore + "%",eInfo)
				}
			}
			bigQuery.push({
				query: "query($mediaId:Int,$type:MediaType){Media(id:$mediaId,type:$type){id title{romaji native english} coverImage{large} genres format status season meanScore averageScore startDate{year}}}",
				variables: {
					mediaId: +embed.dataset.mediaId,
					type: embed.dataset.mediaType.toUpperCase()
				},
				callback: createEmbed,
				cacheKey: "hohMedia" + embed.dataset.mediaId
			})
		};
	});
	queryPacker(bigQuery);
}
