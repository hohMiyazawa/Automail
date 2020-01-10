function addCompletedScores(){
	if(!location.pathname.match(/^\/(home|user|activity)\/?([\w\-]+)?\/?$/)){
		return
	}
	setTimeout(addCompletedScores,1000);
	let bigQuery = [];
	let statusCollection = document.querySelectorAll(".status");
	statusCollection.forEach(function(status){
		if(
			(useScripts.completedScore && status.innerText.match(/^completed/i))
			|| (useScripts.droppedScore && status.innerText.match(/^dropped/i))
			|| location.pathname.match(/^\/activity/)
		){
			if(!status.hasOwnProperty("hohScoreMatched")){
				status.hohScoreMatched = true;
				let scoreInfo = create("span",false,false,status);
				const mediaId = /\/(\d+)\//.exec(status.children[0].href);
				if(!mediaId || !mediaId.length){
					return
				};
				scoreInfo.style.display = "none";
				let callback = function(data){
					if(!data){
						return
					};
					data = data.data.MediaList;
					let scoreSuffix = scoreFormatter(
						data.score,
						data.user.mediaListOptions.scoreFormat
					);
					let noteContent = parseListJSON(data.notes);
					let noteSuffix = "";
					if(noteContent){
						if(noteContent.hasOwnProperty("message")){
							noteSuffix += " " + noteContent.message
						}
					};
					let rewatchSuffix = "";
					if(data.repeat > 0){
						if(data.media.type === "ANIME"){
							rewatchSuffix = " [rewatch"
						}
						else{
							rewatchSuffix = " [reread"
						}
						if(data.repeat === 1){
							rewatchSuffix += "]"
						}
						else{
							rewatchSuffix += " " + data.repeat + "]"
						}
					};
					if(data.score){
						//innerHTML because: contains an inline svg in the case of the "star" rating system
						//depends on the parameters score and scoreFormat, which are defined as a float and an enum in the Anilist API docs
						if(status.innerText.match(/^completed/i)){
							scoreInfo.appendChild(scoreSuffix);
							create("span",false,noteSuffix,scoreInfo);
							create("span",false,rewatchSuffix,scoreInfo)
						}
						else{
							scoreInfo.appendChild(scoreSuffix);
							create("span",false,noteSuffix,scoreInfo)
						};
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
};
