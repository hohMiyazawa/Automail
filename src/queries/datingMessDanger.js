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
	create("p",false,"- Completed entries with 1 episode/chapter, no repeat watches/reads and only one of start/end dates, will have the empty date set equal to the filled date",miscResults);
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
		authAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
			let proc = function(data){
				list = list.concat((returnList(data,true) || []).filter(
					item => item.status === "COMPLETED" && (item.media.episodes || item.media.chapters) === 1 && ((!item.startedAt.year && item.completedAt.year) || (item.startedAt.year && !item.completedAt.year)) && !item.repeat
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
				const ol = create("ol", false, "Found " + list.length + " entries.", changeLog);
				create("p",false,"Found " + list.length + " entries.",changeLog);
				list.forEach(item => {
					if(!allowRun){
						return
					};
					const hasStart = item.startedAt.year > 0;
					const li = create("li", false, false, ol);
					const hl = create("a", ["link", "newTab"], item.media.title.romaji, li, "width:440px;display:inline-block;");
					hl.href = "/" + item.media.type.toLowerCase() + "/" + item.mediaId + "/" + safeURL(item.media.title.romaji);
					li.append(
						(hasStart ? "End" : "Start")  + " date " +
						(isDryRun ? "will be" : "was") + " set to " +
						item[hasStart ? "startedAt" : "completedAt"].year + "-" +
						item[hasStart ? "startedAt" : "completedAt"].month + "-" +
						item[hasStart ? "startedAt" : "completedAt"].day
					)
					if(!isDryRun){
						authAPIcall(
							`mutation($date: FuzzyDateInput,$mediaId: Int){
								SaveMediaListEntry(${[hasStart ? "completedAt" : "startedAt"]}: $date,mediaId: $mediaId){
									id
								}
							}`,
							{mediaId: item.mediaId,date: item[hasStart ? "startedAt" : "completedAt"]},
							data => {}
						);
					};
				})
				stopRun.disabled = true;
				fullRun.disabled = false;
				dryRun.disabled = false;
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
									type
									chapters
									episodes
								}
							}
						}
					}
				}`;
			authAPIcall(
				query,
				{
					name: user,
					listType: "MANGA"
				},
				proc
			);
			authAPIcall(
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
		stopRun.disabled = true;
		fullRun.disabled = false;
		dryRun.disabled = false;
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
