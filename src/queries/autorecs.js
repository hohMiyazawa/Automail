{name: translate("$query_autorecs"),
	setup: function(){
		let select = create("select","#typeSelect",false,miscOptions);
		let animeOption = create("option",false,translate("$generic_anime"),select);
		let mangaOption = create("option",false,translate("$generic_manga"),select);
		animeOption.value = "ANIME";
		mangaOption.value = "MANGA";
		if(useScripts.mangaBrowse){
			select.selectedIndex = 1
		}
	},
	code: function(){
	miscResults.innerText = translate("$query_autorecs_collecting");
	generalAPIcall(
		`query($name: String!){
			User(name: $name){
				statistics{
					${document.getElementById("typeSelect").value.toLowerCase()}{
						meanScore
						standardDeviation
					}
				}
			}
			MediaListCollection(userName: $name,type: ${document.getElementById("typeSelect").value}){
				lists{
					entries{
						mediaId
						score(format: POINT_100)
						status
						media{
							recommendations(sort:RATING_DESC,perPage:5){
								nodes{
									rating
									mediaRecommendation{
										id
										title{romaji native english}
									}
								}
							}
						}
					}
				}
			}
		}`,
		{name: user},function(data){
			miscResults.innerText = translate("$query_autorecs_processing");
			if(!data){
				miscResults.innerText = translate("$error_connection");
				return
			}
			const filtered = returnList(data,true);
			const list = filtered.filter(
				media => media.status !== "PLANNING"
			);
			const existingSet = new Set(
				list.map(media => media.mediaId)
			);
			const existingSet_planning = new Set(
				filtered.filter(
					media => media.status === "PLANNING"
				).map(media => media.mediaId)
			);
			const statistics = data.data.User.statistics[document.getElementById("typeSelect").value.toLowerCase()];
			const recsMap = new Map();
			list.filter(
				media => media.score
			).forEach(media => {
				let adjustedScore = (media.score - statistics.meanScore)/statistics.standardDeviation;
				media.media.recommendations.nodes.forEach(rec => {
					if(
						rec.mediaRecommendation
						&& !existingSet.has(rec.mediaRecommendation.id)
						&& rec.rating > 0
					){
						if(!recsMap.has(rec.mediaRecommendation.id)){
							recsMap.set(
								rec.mediaRecommendation.id,
								{title: titlePicker(rec.mediaRecommendation),score: 0}
							)
						}
						recsMap.get(rec.mediaRecommendation.id).score += adjustedScore * (2 - 1/rec.rating)
					}
				})
			});
			miscResults.innerText = translate("$query_autorecs_info");
			[...recsMap].map(
				pair => ({
					id: pair[0],
					title: pair[1].title,
					score: (existingSet_planning.has(pair[0]) ? pair[1].score - 2 : pair[1].score)//punish stuff already on planning
				})
			).sort(
				(b,a) => a.score - b.score
			).slice(0,25).forEach(rec => {
				let card = create("p",false,false,miscResults);
				let score = create("span","hohMonospace",rec.score.toPrecision(3) + " ",card,"margin-right:10px;");
				create("a",false,rec.title,card)
					.href = "/" + document.getElementById("typeSelect").value.toLowerCase() + "/" + rec.id + "/"
			})
		}
	)
}},
