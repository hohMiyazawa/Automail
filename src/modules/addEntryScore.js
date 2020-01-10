function addEntryScore(id,tries){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let existing = document.getElementById("hohEntryScore");
	if(existing){
		if(existing.dataset.mediaId === id && !tries){
			return
		}
		else{
			existing.remove()
		}
	};
	let possibleLocation = document.querySelector(".actions .list .add");
	if(possibleLocation){
		let miniHolder = create("div","#hohEntryScore",false,possibleLocation.parentNode.parentNode,"position:relative;");
		miniHolder.dataset.mediaId = id;
		let type = possibleLocation.innerText;
		if(type === "Reading" || type === "Completed" || type === "Watching" || type === "Paused" || type === "Repeating" || type === "Dropped"){
			generalAPIcall(
				"query($id:Int,$name:String){MediaList(mediaId:$id,userName:$name){score progress}}",
				{id: id,name: whoAmI},
				function(data){
					let MediaList = data.data.MediaList;
					let scoreSpanContainer = create("div","hohMediaScore",false,miniHolder);
					let scoreSpan = create("span",false,false,scoreSpanContainer);
					let minScore = 1;
					let maxScore = 100;
					let stepSize = 1;
					if(["POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
						maxScore = 10
					}
					if(userObject.mediaListOptions.scoreFormat === "POINT_10_DECIMAL"){
						stepSize = 0.1
					}
					if(MediaList.score){
						scoreSpan.appendChild(scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat));
						if(useScripts.accessToken && ["POINT_100","POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
							let updateScore = function(isUp){
								let score = MediaList.score;
								if(isUp){
									MediaList.score += stepSize
								}
								else{
									MediaList.score -= stepSize
								}
								if(MediaList.score >= minScore && MediaList.score <= maxScore){
									scoreSpan.appendChild(scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat));
									authAPIcall(
										`mutation($id:Int,$score:Float){
											SaveMediaListEntry(mediaId:$id,score:$score){
												score
											}
										}`,
										{id: id,score: MediaList.score},
										data => {}
									);
									let blockingCache = JSON.parse(sessionStorage.getItem("hohEntryScore" + id + whoAmI));
									blockingCache.data.data.MediaList.score = MediaList.score.roundPlaces(1);
									blockingCache.time = NOW();
									sessionStorage.setItem("hohEntryScore" + id + whoAmI,JSON.stringify(blockingCache));
								}
								else if(MediaList.score < minScore){
									MediaList.score = minScore
								}
								else if(MediaList.score > maxScore){
									MediaList.score = maxScore
								}
							};
							let changeMinus = create("span","hohChangeScore","-",false,"padding:2px;position:absolute;left:-1px;top:-2.5px;");
							scoreSpanContainer.insertBefore(changeMinus,scoreSpanContainer.firstChild);
							let changePluss = create("span","hohChangeScore","+",scoreSpanContainer,"padding:2px;");
							changeMinus.onclick = function(){updateScore(false)};
							changePluss.onclick = function(){updateScore(true)};
						}
					};
					if(type !== "Completed"){
						let progressPlace = create("span","hohMediaScore",false,miniHolder,"right:0px;");
						let progressVal = create("span",false,MediaList.progress,progressPlace);
						if(useScripts.accessToken){
							let changePluss = create("span","hohChangeScore","+",progressPlace,"padding:2px;position:absolute;top:-2.5px;");
							changePluss.onclick = function(){
								MediaList.progress++;
								authAPIcall(
									`mutation($id:Int,$progress:Int){
										SaveMediaListEntry(mediaId:$id,progress:$progress){
											progress
										}
									}`,
									{id: id,progress: MediaList.progress},
									data => {}
								);
								progressVal.innerText = MediaList.progress;
							};
						}
					};
				},
				"hohEntryScore" + id + whoAmI,30*1000
			);
		}
		else if(type === "Add to List" && (tries || 0) < 10){
			setTimeout(function(){addEntryScore(id,(tries || 0) + 1)},200);
		}
	}
	else{
		setTimeout(function(){addEntryScore(id)},200);
	}
}
