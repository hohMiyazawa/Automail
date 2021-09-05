{name: "Autorecs",
	setup: function(){
		let select = create("select","#typeSelect",false,miscOptions);
		let animeOption = create("option",false,"Anime",select);
		let mangaOption = create("option",false,"Manga",select);
		animeOption.value = "ANIME";
		mangaOption.value = "MANGA";
	},
	code: function(){
	miscResults.innerText = "Collecting list data...";
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
			MediaListCollection(userName: $name,type: ${document.getElementById("typeSelect").value},status_not: PLANNING){
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
			miscResults.innerText = "Processing...";
			const list = returnList(data,true).filter(
				media => media.status !== "PLANNING"
			);
			const existingSet = new Set(
				list.map(media => media.mediaId)
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
			miscResults.innerText = "Top picks, based on your ratings, the ratings of others, and the recommendation database. Best matches on top";
			[...recsMap].map(
				pair => ({
					id: pair[0],
					title: pair[1].title,
					score: pair[1].score
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
