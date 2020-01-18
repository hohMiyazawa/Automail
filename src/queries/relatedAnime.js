{name: "Related anime not on list",code: function(){
	generalAPIcall(
`query($name: String!){
	MediaListCollection(userName: $name,type: ANIME){
		lists{
			entries{
				mediaId
				score
				status
				media{
					relations{
						nodes{
							id
							title{romaji}
							type
						}
					}
				}
			}
		}
	}
}`,
	{name: user},function(data){
		let list = returnList(data,true);
		let listEntries = new Set(list.map(a => a.mediaId));
		let found = [];
		list.forEach(function(media){
			if(media.status !== "PLANNING"){
				media.media.relations.nodes.forEach(function(relation){
					if(!listEntries.has(relation.id) && relation.type === "ANIME"){
						relation.host = media.score;
						found.push(relation);
					}
				})
			}
		});
		found = removeGroupedDuplicates(
			found,
			e => e.id,
			(oldElement,newElement) => {
				newElement.host = Math.max(oldElement.host,newElement.host)
			}
		).sort(
			(b,a) => a.host - b.host
		);
		miscResults.innerText = "Found " + found.length + " shows:";
		found.forEach(
			item => create("a",["link","newTab"],item.title.romaji,miscResults,"display:block;padding:5px;")
				.href = "/anime/" + item.id
		)
	})
}},
