function addCompletedScores(){
	//also for dropped, if in the settings
	if(! /^\/(home|user|activity)\/?([\w-]+)?\/?$/.test(location.pathname)){
		return
	}
	setTimeout(addCompletedScores,1000);
	let bigQuery = [];
	let statusCollection = document.querySelectorAll(".status");
	statusCollection.forEach(function(status){
		if(
			(useScripts.completedScore
				&& (
					/^completed/i.test(status.innerText)
					|| status.childNodes[0].textContent.trim() === "Rewatched"
					|| status.childNodes[0].textContent.trim() === "Reread"
					|| status.classList.contains("activityCompleted")
					|| status.classList.contains("activityRewatched")
					|| status.classList.contains("activityReread")
				)
			)
			|| (useScripts.droppedScore && (/^dropped/i.test(status.innerText) || status.classList.contains("activityDropped")))
			|| /^\/activity/.test(location.pathname)
		){
			if(!Object.prototype.hasOwnProperty.call(status, "hohScoreMatched")){
				status.hohScoreMatched = true;
				let scoreInfo = create("span","hohFeedScore",false,status);
				const mediaId = /\/(\d+)\//.exec(status.children[0].href);
				if(!mediaId || !mediaId.length){
					return
				}
				scoreInfo.style.display = "none";
				let callback = function(data){
					if(!data){
						return
					}
					data = data.data.MediaList;
					let scoreSuffix = scoreFormatter(
						data.score,
						data.user.mediaListOptions.scoreFormat
					);
					let noteContent = parseListJSON(data.notes);
					let noteSuffix = "";
					if(noteContent){
						if(Object.prototype.hasOwnProperty.call(noteContent, "message")){
							noteSuffix += " " + noteContent.message
						}
					}
					let rewatchSuffix = "";
					if(data.repeat > 0){
						if(data.media.type === "ANIME"){
							if(data.repeat === 1){
								rewatchSuffix = " " + translate("$rewatch_suffix_1")
							}
							else{
								rewatchSuffix = " " + translate("$rewatch_suffix_M",data.repeat)
							}
						}
						else{
							if(data.repeat === 1){
								rewatchSuffix = " " + translate("$reread_suffix_1")
							}
							else{
								rewatchSuffix = " " + translate("$reread_suffix_M",data.repeat)
							}
						}
					}
					if(data.score){
						//depends on the parameters score and scoreFormat, which are defined as a float and an enum in the Anilist API docs
						if(
							/^completed/i.test(status.innerText)
							|| status.classList.contains("activityCompleted")
							|| status.classList.contains("activityRewatched")
							|| status.classList.contains("activityReread")
						){
							scoreInfo.appendChild(scoreSuffix);
							create("span","hohNoteSuffix",noteSuffix,scoreInfo);
							create("span","hohRewatchSuffix",rewatchSuffix,scoreInfo)
						}
						else{
							scoreInfo.appendChild(scoreSuffix);
							create("span","hohNoteSuffix",noteSuffix,scoreInfo)
						}
						scoreInfo.style.display = "inline"
					}
				};
				const variables = {
					userName: status.parentNode.children[0].innerText.trim(),
					mediaId: +mediaId[1]
				};
				const query = `
query($userName: String,$mediaId: Int){
	MediaList(
		userName: $userName,
		mediaId: $mediaId
	){
		score
		mediaId
		notes
		repeat
		media{type}
		user{
			name
			mediaListOptions{scoreFormat}
		}
	}
}`;
				//generalAPIcall(query,variables,callback,"hohCompletedScores" + variables.mediaId + variables.userName,60*1000)
				bigQuery.push({
					query: query,
					variables: variables,
					callback: callback,
					cacheKey: "hohCompletedScores" + variables.mediaId + variables.userName,
					duration: 60*1000
				})
			}
		}
		else if(status.children.length === 2 && !status.classList.contains("form")){
			status.children[1].remove()
		}
	});
	queryPacker(bigQuery)
}
