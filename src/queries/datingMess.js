{name: "Fix your dating mess",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
		let delay = 0;
		miscResults.innerText = "";
		removeChildren(miscResults)
		removeChildren(miscOptions)
		let config = [
			{
				description: "Completion date before start date",
				code: media => fuzzyDateCompare(media.startedAt,media.completedAt) === 0
			},{
				description: "Completion date before official end date",
				code: media => fuzzyDateCompare(media.media.endDate,media.completedAt) === 0
			},{
				description: "Start date before official release date",
				code: media => fuzzyDateCompare(media.media.startDate,media.startedAt) === 0
			},{
				description: "Status completed but no completion date set",
				code: media => media.status === "COMPLETED" && !media.completedAt.year
			},{
				description: "Status completed but no start date set",
				code: media => media.status === "COMPLETED" && !media.startedAt.year
			},{
				description: "Status dropped but no start date set",
				code: media => media.status === "DROPPED" && !media.startedAt.year
			},{
				description: "Status current but no start date set",
				code: media => media.status === "CURRENT" && !media.startedAt.year
			},{
				description: "Planning entry with start date",
				code: media => media.status === "PLANNING" && media.startedAt.year
			},{
				description: "Dates in the far future or past",
				code: media => (
						media.startedAt.year && (media.startedAt.year < 1960 || media.startedAt.year > (new Date().getFullYear() + 3))
					) || (
						media.completedAt.year && (media.completedAt.year < 1960 || media.completedAt.year > (new Date().getFullYear() + 3))
					)
			}
		];
		config.forEach(function(setting){
			let row = create("p",false,false,miscOptions);
			let checkBox = createCheckbox(row);
			let label = create("span",false,setting.description,row);
			checkBox.checked = true;
			checkBox.onchange = function(){
				Array.from(miscResults.children).forEach(res => {
					if(res.children[1].innerText === setting.description){
						if(checkBox.checked){
							res.style.display = "block"
						}
						else{
							res.style.display = "none"
						}
					}
				})
			}
		});
		let proc = function(data){
			let list = returnList(data,true);
			list.forEach(function(item){
				let matches = [];
				config.forEach(setting => {
					if(setting.code(item)){
						matches.push(setting.description)
					}
				});
				if(matches.length){
					let row = create("p",false,false,miscResults);
					let link = create("a",["link","newTab"],item.media.title.romaji,row,"width:440px;display:inline-block;");
					link.href = "/" + item.media.type.toLowerCase() + "/" + item.mediaId + "/" + safeURL(item.media.title.romaji);
					create("span",false,matches.join(", "),row);
					let chance = create("p",false,false,row,"margin-left:20px;margin-top: 2px;");
					create("span",false,"Entry created: " + (new Date(item.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
					if(
						(new Date(item.createdAt*1000)).toISOString().split("T")[0]
						!== (new Date(item.updatedAt*1000)).toISOString().split("T")[0]
					){
						create("span",false,"Entry updated: " + (new Date(item.updatedAt*1000)).toISOString().split("T")[0] + " \n",chance);
					}
					if(item.repeat){
						create("span",false,"Repeats: " + item.repeat + " \n",chance);
					}
					setTimeout(function(){
						generalAPIcall(
							`
							query($userId: Int,$mediaId: Int){
								first:Activity(userId: $userId,mediaId: $mediaId,sort: ID){... on ListActivity{createdAt siteUrl status progress}}
								last:Activity(userId: $userId,mediaId: $mediaId,sort: ID_DESC){... on ListActivity{createdAt siteUrl status progress}}
							}
							`,
							{
								userId: iddata.data.User.id,
								mediaId: item.mediaId
							},
							function(act){
								if(!act){return};
								let progressFirst = [act.data.first.status,act.data.first.progress].filter(TRUTHY).join(" ");
								progressFirst = (progressFirst ? " (" + progressFirst + ")" : "");
								let progressLast = [act.data.last.status,act.data.last.progress].filter(TRUTHY).join(" ");
								progressLast = (progressLast ? " (" + progressLast + ")" : "");
								if(act.data.first.siteUrl === act.data.last.siteUrl){
									let firstLink = create("a",["link","newTab"],"Only activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
									firstLink.href = act.data.first.siteUrl;
									create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
								}
								else{
									let firstLink = create("a",["link","newTab"],"First activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
									firstLink.href = act.data.first.siteUrl;
									create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
									let lastLink = create("a",["link","newTab"],"Last activity" + progressLast + ": ",chance,"color:rgb(var(--color-blue));");
									lastLink.href = act.data.last.siteUrl;
									create("span",false,(new Date(act.data.last.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
								}
							}
						);
					},delay);
					delay += 1000;
				}
			})
		};
		const query = `query($name: String!, $listType: MediaType){
				MediaListCollection(userName: $name, type: $listType){
					lists{
						entries{
							startedAt{year month day}
							completedAt{year month day}
							mediaId
							status
							createdAt
							updatedAt
							repeat
							media{
								title{romaji english native}
								startDate{year month day}
								endDate{year month day}
								type
							}
						}
					}
				}
			}`;
		generalAPIcall(
			query,
			{
				name: user,
				listType: "MANGA"
			},
			proc
		);
		generalAPIcall(
			query,
			{
				name: user,
				listType: "ANIME"
			},
			proc
		);
	},"hohIDlookup" + user.toLowerCase());
}},
