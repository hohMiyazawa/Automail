{name: "Autorecs (anime)",code: function(){
	miscResults.innerText = "Collecting list data...";
	generalAPIcall(
		`query($name: String!){
			User(name: $name){
				statistics{
					anime{
						meanScore
						standardDeviation
					}
				}
			}
			MediaListCollection(userName: $name,type: ANIME,status_not: PLANNING){
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
			const statistics = data.data.User.statistics.anime;
			const recsMap = new Map();
			list.filter(
				media => media.score
			).forEach(media => {
				let adjustedScore = (media.score - statistics.meanScore)/statistics.standardDeviation;
				media.media.recommendations.nodes.forEach(rec => {
					if(
						!existingSet.has(rec.mediaRecommendation.id)
						&& rec.rating > 0
					){
						if(!recsMap.has(rec.mediaRecommendation.id)){
							recsMap.set(
								rec.mediaRecommendation.id,
								{title: titlePicker(rec.mediaRecommendation),score: 0}
							)
						}
						recsMap.get(rec.mediaRecommendation.id).score += (1 + Math.log(rec.rating)) * adjustedScore
					}
				})
			});
			miscResults.innerText = "";
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
					.href = "/anime/" + rec.id + "/"
			})
		}
	)
}},
