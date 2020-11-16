{name: "Fix your dating mess [Dangerous edition]",setup: function(){
	if(!useScripts.accessToken){
		miscResults.innerText = loginMessage;
		return
	};
	if(user.toLowerCase() !== whoAmI.toLowerCase()){
		miscResults.innerText = "This is the profile of\"" + user + "\", but currently signed in as \"" + whoAmI + "\". Are you sure this is right?";
		return
	};
	let warning = create("b",false,"Clicking on red buttons means changes to your data!",miscResults);
	let description = create("p",false,"When run, this will do the following:",miscResults);
	create("p",false,"- Completed entries with 1 episode/chapter, no rewatches, no start date, but a completion date will have the start date set equal to the completion date",miscResults);
	create("p",false,"- A list of all the changes will be printed.",miscResults);
	create("p",false,"- This will run slowly, and can be stopped at any time.",miscResults);
	let dryRun = create("button",["button","hohButton"],"Dry run",miscResults);
	let dryRunDesc = create("span",false,"(no changes made)",miscResults);
	create("hr",false,false,miscResults);
	let fullRun = create("button",["button","hohButton","danger"],"RUN",miscResults);
	let stopRun = create("button",["button","hohButton"],"Abort!",miscResults);
	create("hr",false,false,miscResults);
	let changeLog = create("div",false,false,miscResults);
	let allowRunner = true;
	let allowRun = true;
	let isDryRun = true;
	let list = [];
	let firstTime = true;
	let runner = function(){
		if(!allowRunner){
			return
		}
		allowRunner = false;
		fullRun.disabled = true;	
		dryRun.disabled = true;
		generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
			let proc = function(data){
				list = list.concat((returnList(data,true) || []).filter(
					item => item.status === "COMPLETED" && (item.media.episodes || item.media.chapters) === 1 && (!item.startedAt.year) && item.completedAt.year && !item.repeat
				));
				if(firstTime){
					firstTime = false;
					return
				};
				if(isDryRun){
					create("p",false,"DRY RUN",changeLog)
				};
				if(!list.length){
					changeLog.innerText = "Found no entries to change";
					return
				};
				create("p",false,"Found " + list.length + " entries.",changeLog);
				let changer = function(index){
					if(!allowRun){
						return
					};
					create("p",false,list[index].media.title.romaji + " start date set to " + list[index].completedAt.year + "-" + list[index].completedAt.month + "-" + list[index].completedAt.day,changeLog);
					if(!isDryRun){
						authAPIcall(
							`mutation($date: FuzzyDateInput,$mediaId: Int){
								SaveMediaListEntry(startedAt: $date,mediaId: $mediaId){
									id
								}
							}`,
							{mediaId: list[index].mediaId,date: list[index].completedAt},
							data => {}
						)
					};
					index++;
					if(index < list.length){
						setTimeout(function(){changer(index)},1000)
					};
				};changer(0);
			};
			const query = `query($name: String!, $listType: MediaType){
					MediaListCollection(userName: $name, type: $listType){
						lists{
							entries{
								startedAt{year month day}
								completedAt{year month day}
								mediaId
								status
								repeat
								media{
									title{romaji english native}
									chapters
									episodes
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
		},"hohIDlookup" + user.toLowerCase())
	};
	stopRun.onclick = function(){
		allowRun = false;
		stopRun.disable = true;
		alert("Stopped!")
	};
	fullRun.onclick = function(){
		isDryRun = false;
		runner()
	};
	dryRun.onclick = function(){
		runner()
	};
},code: function(){
	alert("Read the description first!")
}},
