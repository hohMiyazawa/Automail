{name: "Related manga not on list",code: function(){
	generalAPIcall(
`query($name: String!){
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
							}
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
		create("p",false,"Found " + found.length + " manga:",miscResults);
		let filters = create("div",false,false,miscResults);

		let row1 = create("p",false,false,filters);
		let checkBox1 = createCheckbox(row1);
		let label1 = create("span",false,"Prequel",row1);

		let row2 = create("p",false,false,filters);
		let checkBox2 = createCheckbox(row2);
		let label2 = create("span",false,"Sequel",row2);

		let row3 = create("p",false,false,filters);
		let checkBox3 = createCheckbox(row3);
		let label3 = create("span",false,"Side Story",row3);

		let row4 = create("p",false,false,filters);
		let checkBox4 = createCheckbox(row4);
		let label4 = create("span",false,"Alternative",row4);

		let row5 = create("p",false,false,filters);
		let checkBox5 = createCheckbox(row5);
		let label5 = create("span",false,"Other Relation",row5);

		let row6 = create("p",false,false,filters);
		let checkBox6 = createCheckbox(row6);
		let label6 = create("span",false,"Include media related to dropped manga",row6);

		checkBox1.checked = true;
		checkBox2.checked = true;
		checkBox3.checked = true;
		checkBox4.checked = true;
		checkBox5.checked = true;

		let f_results = create("div",false,false,miscResults);
		let render = function(){
			removeChildren(f_results);
			found.forEach(item => {
				if(
					(
						(checkBox1.checked && item.relationType.includes("PREQUEL"))
						|| (checkBox2.checked && item.relationType.includes("SEQUEL"))
						|| (checkBox3.checked && item.relationType.includes("SIDE_STORY"))
						|| (checkBox4.checked && item.relationType.includes("ALTERNATIVE"))
						|| (checkBox5.checked && item.relationType.some(type => ["ADAPTATION","CHARACTER","SUMMARY","SPIN_OFF","OTHER","SOURCE","COMPILATION","CONTAINS"].includes(type)))
					)
					&& (checkBox6.checked || item.isDropped.some(val => !val))
				){
					create("a",["link","newTab"],item.node.title.romaji,f_results,"display:block;padding:5px;")
						.href = "/manga/" + item.node.id
				}
			})
		};
		checkBox1.onchange = render;
		checkBox2.onchange = render;
		checkBox3.onchange = render;
		checkBox4.onchange = render;
		checkBox5.onchange = render;
		checkBox6.onchange = render;
		render();
	})
}},
