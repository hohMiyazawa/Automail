{name: "Related manga not on list",code: async () => {
	const relationQuery = `
query($name: String!){
	MediaListCollection(userName: $name,type: MANGA){
		lists{
			entries{
				mediaId
				score
				status
				media{
					relations{
						edges{
							relationType(version: 2)
							node{
								id
								title{romaji}
								type
								format
							}
						}
					}
				}
			}
		}
	}
}`;
	function relatedManga(data){
		let list = returnList(data,true);
		let listEntries = new Set(list.map(a => a.mediaId));
		let found = [];
		list.forEach(function(media){
			if(media.status !== "PLANNING"){
				media.media.relations.edges.forEach(relation => {
					if(!listEntries.has(relation.node.id) && relation.node.type === "MANGA"){
						relation.host = media.score;
						relation.relationType = [relation.relationType];
						relation.isDropped = [media.status === "DROPPED"];
						found.push(relation);
					}
				})
			}
		});
		found = removeGroupedDuplicates(
			found,
			e => e.node.id,
			(oldElement,newElement) => {
				newElement.relationType = [...oldElement.relationType,...newElement.relationType];
				newElement.isDropped = [...oldElement.isDropped,...newElement.isDropped];
				newElement.host = Math.max(oldElement.host,newElement.host)
			}
		).sort(
			(b,a) => a.host - b.host
		);
		miscResults.innerText = "";
		const filterSettings = [];
		const filterData = [
			{name: "Prequel", checked: true},
			{name: "Sequel", checked: true},
			{name: "Side Story", checked: true},
			{name: "Alternative", checked: true},
			{name: "Other Relation", checked: true},
			{name: "Include media related to dropped manga", checked: false},
			{name: "Include manga in related media", checked: true},
			{name: "Include one shots in related media", checked: true},
			{name: "Include light novels in related media", checked: true}
		];
		let filters = create("div",false,false,miscResults);
		filterData.forEach((filter, i) => {
			const row = create("p",false,false,filters);
			createCheckbox(row,"filter-"+i,filter.checked);
			create("span",false,filter.name,row);
			filterSettings[i] = filter.checked;
		})
		let foundCount = create("p",false,"Found " + found.length + " manga:",miscResults);
		let f_results = create("div",false,false,miscResults);
		let render = function(){
			removeChildren(f_results);
			let count = 0;
			found.forEach(item => {
				if(
					(
						(filterSettings[0] && item.relationType.includes("PREQUEL"))
						|| (filterSettings[1] && item.relationType.includes("SEQUEL"))
						|| (filterSettings[2] && item.relationType.includes("SIDE_STORY"))
						|| (filterSettings[3] && item.relationType.includes("ALTERNATIVE"))
						|| (filterSettings[4] && item.relationType.some(type => ["ADAPTATION","CHARACTER","SUMMARY","SPIN_OFF","OTHER","SOURCE","COMPILATION","CONTAINS"].includes(type)))
					)
					&& (filterSettings[5] || item.isDropped.some(val => !val))
					&& (filterSettings[6] || item.node.format !== "MANGA")
					&& (filterSettings[7] || item.node.format !== "ONE_SHOT")
					&& (filterSettings[8] || item.node.format !== "NOVEL")
				){
					create("a",["link","newTab"],item.node.title.romaji,f_results,"display:block;padding:5px;")
						.href = "/manga/" + item.node.id;
					count++
				}
			});
			foundCount.innerText = "Found " + count + " manga:";
		};
		filters.querySelectorAll(".hohCheckbox input").forEach(checkBox => {
			checkBox.addEventListener("change",(e) => {
				filterSettings[parseInt(e.target.id.split("-")[1])] = e.target.checked;
				render()
			})
		})
		render();
	}
	const data = await anilistAPI(relationQuery, {
		variables: {name: user}
	});
	relatedManga(data)
}},
