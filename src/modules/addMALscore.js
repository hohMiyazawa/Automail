async function addMALscore(type,id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	}
	let MALscore = document.getElementById("hohMALscore");
	if(MALscore){
		if(parseInt(MALscore.dataset.id) === id){
			return
		}
		else{
			MALscore.remove()
		}
	}
	let MALserial = document.getElementById("hohMALserialization");
	if(MALserial){
		if(parseInt(MALserial.dataset.id) === id){
			return
		}
		else{
			MALserial.remove()
		}
	}
	let possibleReleaseStatus = Array.from(document.querySelectorAll(".data-set .type"));
	const MALlocation = possibleReleaseStatus.find(element => element.innerText === "Mean Score");
	if(MALlocation){
		MALscore = create("div","data-set");
		MALscore.id = "hohMALscore";
		MALscore.dataset.id = id;
		MALlocation.parentNode.parentNode.insertBefore(MALscore,MALlocation.parentNode.nextSibling);
		if(type === "manga"){
			MALserial = create("div","data-set");
			MALserial.id = "hohMALserialization";
			MALserial.dataset.id = id;
			MALlocation.parentNode.parentNode.insertBefore(MALserial,MALlocation.parentNode.nextSibling.nextSibling)
		}
		const data = await anilistAPI("query($id:Int){Media(id:$id){idMal}}", {
			variables: {id},
			cacheKey: "hohIDmal" + id,
			duration: 30*60*1000
		});
		if(data.errors){
			return
		}
		if(data.data.Media.idMal){
			let handler = function(response){
				let score = response.responseText.match(/ratingValue.+?(\d+\.\d+)/);
				if(score && useScripts.MALscore){
					MALscore.style.paddingBottom = "14px";
					create("a",["type","newTab","external"],translate("$MAL_score"),MALscore)
						.href = "https://myanimelist.net/" + type + "/" + data.data.Media.idMal;
					create("div","value",score[1],MALscore)
				}
				if(type === "manga" && useScripts.MALserial){
					let serialization = response.responseText.match(/Serialization:<\/span>\n.*?href="(.*?)"\stitle="(.*?)"/);
					if(serialization){
						create("div","type",translate("$MAL_serialization"),MALserial);
						let link = create("a",["value","newTab","external"],serialization[2].replace(/&#039;/g,"'").replace(/&quot;/g,'"'),MALserial)
						link.href = "https://myanimelist.net" + serialization[1]
					}
				}
				let adder = function(){
					let possibleOverview = document.querySelector(".overview .grid-section-wrap:last-child");
					if(!possibleOverview){
						setTimeout(adder,500);
						return
					}
					(possibleOverview.querySelector(".hohRecContainer") || {remove: ()=>{}}).remove();
					let recContainer = create("div",["grid-section-wrap","hohRecContainer"],false,possibleOverview);
					create("h2",false,"MAL Recommendations",recContainer);
					let pattern = /class="picSurround"><a href="https:\/\/myanimelist\.net\/(anime|manga)\/(\d+)\/[\s\S]*?detail-user-recs-text.*?">([\s\S]*?)<\/div>/g;
					let matching = [];
					let matchingItem;
					while((matchingItem = pattern.exec(response.responseText)) && matching.length < 5){//single "=" is intended, we are setting the value of each match, not comparing
						matching.push(matchingItem)
					}
					if(!matching.length){
						recContainer.style.display = "none"
					}
					matching.forEach(async function(item){
						let idMal = item[2];
						let description = item[3];
						let rec = create("div","hohRec",false,recContainer);
						let recImage = create("a","hohBackgroundCover",false,rec,"border-radius: 3px;");
						let recTitle = create("a","title",false,rec,"position:absolute;top:35px;left:80px;color:rgb(var(--color-blue));");
						recTitle.innerText = "MAL ID " + idMal;
						let recDescription = create("p",false,false,rec,"font-size: 1.4rem;line-height: 1.5;");
						recDescription.innerText = new DOMParser().parseFromString(description, 'text/html').body.textContent.replace(/\s*?read more\s*?$/,"") || "";
						const reverseData = await anilistAPI(
							"query($idMal:Int,$type:MediaType){Media(idMal:$idMal,type:$type){id title{romaji native english} coverImage{large color} siteUrl}}",
							{
								variables: {idMal:idMal,type:item[1].toUpperCase()},
								cacheKey: "hohIDmalReverse" + idMal,
								duration: 30*60*1000
							}
						);
						if(reverseData.errors){
							return
						}
						recImage.style.backgroundColor = reverseData.data.Media.coverImage.color || "rgb(var(--color-foreground))";
						recImage.style.backgroundImage = "url(\"" + reverseData.data.Media.coverImage.large + "\")";
						recImage.href = reverseData.data.Media.siteUrl;
						cheapReload(recImage,{path: recImage.pathname})
						recTitle.innerText = titlePicker(reverseData.data.Media);
						recTitle.href = reverseData.data.Media.siteUrl
						cheapReload(recTitle,{path: recTitle.pathname})
						return
					})
				};
				if(useScripts.MALrecs){
					adder()
				}
			}
			if(window.GM_xmlhttpRequest){
				GM_xmlhttpRequest({
					method: "GET",
					anonymous: true,
					url: "https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs",
					onload: function(response){handler(response)}
				})
			}
			else{
				let oReq = new XMLHttpRequest();
				oReq.addEventListener("load",function(){handler(this)});
				oReq.open("GET","https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs");
				oReq.send()
			}
		}
	}
	else{
		setTimeout(() => {addMALscore(type,id)},200)
	}
	return
}
