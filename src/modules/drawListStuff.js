function drawListStuff(){
	const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
	if(!URLstuff){
		return
	};
	if(document.querySelector(".hohExtraFilters")){
		return
	};
	let filters = document.querySelector(".filters-wrap");
	if(!filters){
		setTimeout(drawListStuff,200);
		return
	};
	let extraFilters = create("div","hohExtraFilters");
	extraFilters.style.marginTop = "15px";
	if(useScripts.draw3x3){
		let buttonDraw3x3 = create("span","#hohDraw3x3","3x3",extraFilters);
		buttonDraw3x3.title = "Create a 3x3 from 9 selected entries";
		buttonDraw3x3.onclick = function(){
			this.style.color = "rgb(var(--color-blue))";
			let counter = 0;
			let linkList = [];
			let cardList = document.querySelectorAll(".entry-card.row,.entry.row");
			cardList.forEach(function(card){
				card.onclick = function(){
					if(this.draw3x3selected){
						counter--;
						linkList[this.draw3x3selected - 1] = "";
						this.draw3x3selected = false;
						this.style.borderStyle = "none";
					}
					else{
						counter++;
						linkList.push(this.querySelector(".cover .image").style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',""));
						this.draw3x3selected = +linkList.length;
						this.style.borderStyle = "solid";
						if(counter === 9){
							linkList = linkList.filter(e => e !== "");
							let displayBox = createDisplayBox();
							create("p",false,"Save the image below:",displayBox);
							displayBox.querySelector(".hohDisplayBoxClose").onclick = function(){
								displayBox.remove();
								cardList.forEach(function(card){
									card.draw3x3selected = false;
									card.style.borderStyle = "none";
								});
								counter = 0;
								linkList = [];
							};
							create("div",false,false,displayBox);
							let finalCanvas = create("canvas",false,false,displayBox);
							finalCanvas.width = 230*3;
							finalCanvas.height = 345*3;
							let ctx = finalCanvas.getContext("2d");
							let drawStuff = function(image,x,y,width,height){
								let img = new Image();
								img.onload = function(){
									ctx.drawImage(img,x,y,width,height);
								}
								img.src = image;
							};
							for(var i=0;i<3;i++){
								for(var j=0;j<3;j++){
									drawStuff(linkList[i*3+j],j*230,i*345,230,345);
								};
							};
						}
					}
				};
			});
		}
	}
	if(useScripts.newChapters && URLstuff[2] === "mangalist"){
		let buttonFindChapters = create("button",["hohButton","button"],"New Chapters",extraFilters,"display:block;");
		buttonFindChapters.onclick = function(){
			let scrollableContent = createDisplayBox("min-width:400px;height:500px;");
			let loader = create("p",false,"Scanning...",scrollableContent);
			let bannedEntries = new Set();
			generalAPIcall(`
			query($name: String!){
				MediaListCollection(userName: $name, type: MANGA){
					lists{
						entries{
							mediaId
							status
							media{
								status
							}
						}
					}
				}
			}`,
			{name: decodeURIComponent(URLstuff[1])},
			function(data){
				let list = returnList(data,true).filter(a => a.status === "CURRENT" && a.media.status === "RELEASING");
				let returnedItems = 0;
				let goodItems = [];
				let checkListing = function(data){
					returnedItems++;
					if(returnedItems === list.length){
						loader.innerText = "";
						if(!goodItems.length){
							loader.innerText = "No new items found :(";
						};
					};
					let guesses = [];
					let userIdCache = new Set();
					data.data.Page.activities.forEach(function(activity){
						if(activity.progress){
							let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
							if(!userIdCache.has(activity.userId)){
								guesses.push(chapterMatch);
								userIdCache.add(activity.userId);
							};
						};
					});
					guesses.sort(VALUE_DESC);
					if(guesses.length){
						let bestGuess = guesses[0];
						if(guesses.length > 2){
							let diff = guesses[0] - guesses[1];
							let inverseDiff = 1 + Math.ceil(20/(diff+1));
							if(guesses.length >= inverseDiff){
								if(guesses[1] === guesses[inverseDiff]){
									bestGuess = guesses[1];
								}
							};
						};
						if(commonUnfinishedManga.hasOwnProperty(data.data.MediaList.media.id)){
							if(bestGuess < commonUnfinishedManga[data.data.MediaList.media.id].chapters){
								bestGuess = commonUnfinishedManga[data.data.MediaList.media.id].chapters;
							};
						};
						let bestDiff = bestGuess - data.data.MediaList.progress;
						if(bestDiff > 0 && bestDiff < 30){
							goodItems.push({data:data,bestGuess:bestGuess});
							removeChildren(scrollableContent)
							goodItems.sort((b,a) => a.data.data.MediaList.score - b.data.data.MediaList.score);
							goodItems.forEach(function(item){
								let media = item.data.data.MediaList.media;
								if(bannedEntries.has(media.id)){
									return
								}
								let listing = create("p","hohNewChapter",false,scrollableContent);
								let title = titlePicker(media);
								let countPlace = create("span",false,false,listing,"width:110px;display:inline-block;");
								let progress = create("span",false,item.data.data.MediaList.progress + " ",countPlace);
								let guess = create("span",false,"+" + (item.bestGuess - item.data.data.MediaList.progress),countPlace,"color:rgb(var(--color-green));");
								if(useScripts.accessToken){
									progress.style.cursor = "pointer";
									progress.title = "Increment progress by 1";
									progress.onclick = function(){
										item.data.data.MediaList.progress++;
										authAPIcall(
											`mutation($id: Int,$progress: Int){
												SaveMediaListEntry(mediaId: $id,progress: $progress){id}
											}`,
											{
												id: media.id,
												progress: item.data.data.MediaList.progress
											},
											function(fib){
												if(!fib){
													item.data.data.MediaList.progress--;
													progress.innerText = item.data.data.MediaList.progress + " ";
													guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress)
												}
											}
										);
										progress.innerText = item.data.data.MediaList.progress + " ";
										if(item.bestGuess - item.data.data.MediaList.progress > 0){
											guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress)
										}
										else{
											guess.innerText = ""
										}
									}
								};
								create("a",["link","newTab"],title,listing)
									.href = "/manga/" + media.id + "/" + safeURL(title) + "/";
								let chapterClose = create("span","hohDisplayBoxClose",svgAssets.cross,listing);
								chapterClose.onclick = function(){
									listing.remove();
									bannedEntries.add(media.id)
								}
							})
						}
					}
				};
				let bigQuery = [];
				list.forEach(function(entry,index){
					bigQuery.push({
						query: `
query($id: Int,$userName: String){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
	MediaList(
		userName: $userName,
		mediaId: $id
	){
		progress
		score
		media{
			id
			title{romaji native english}
		}
	}
}`,
						variables: {
							id: entry.mediaId,
							userName: decodeURIComponent(URLstuff[1])
						},
						callback: checkListing
					});
					if((index % 20) === 0){
						queryPacker(bigQuery);
						bigQuery = [];
					};
				});
				queryPacker(bigQuery);
			});
		};
	};
	if(useScripts.tagIndex && (!useScripts.mobileFriendly)){
		let tagIndex = create("div","tagIndex",false,extraFilters);
		let collectNotes = function(data){
			let customTags = new Map();	
			let listData = returnList(data,true);
			listData.forEach(function(entry){
				if(entry.notes){
					(
						entry.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,count: 0})
						}
						customTags.get(tagMatch).count++
					})
					let noteContent = parseListJSON(entry.notes);
					if(noteContent && noteContent.lists){
						noteContent.lists.forEach(function(list){
							if(list.name && list.info){
								let titles = document.querySelectorAll("h3.section-name");
								for(var i=0;i<titles.length;i++){
									if(titles[i].innerText === list.name){
										let descriptionNode = create("p",false,list.info);
										titles[i].parentNode.insertBefore(descriptionNode,titles[i].nextSibling);
										break;
									}
								}
							}
						})
					}
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			customTags = [...customTags].map(pair => pair[1]);
			customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
			let drawTags = function(){
				removeChildren(tagIndex);
				let sortName = create("span",false,"▲",tagIndex,"cursor:pointer");
				let sortNumber = create("span",false,"▼",tagIndex,"cursor:pointer;float:right");
				customTags.forEach(tag => {
					let tagElement = create("p",false,tag.name,tagIndex);
					create("span","count",tag.count,tagElement);
					tagElement.onclick = function(){
						let filterBox = document.querySelector(".entry-filter input");
						filterBox.value = tag.name;
						filterBox.dispatchEvent(new Event("input"));
						if(filterBox.scrollIntoView){
							filterBox.scrollIntoView({"behavior": "smooth","block": "start"})
						}
						else{
							document.body.scrollTop = document.documentElement.scrollTop = 0
						}
					}
				});
				sortName.onclick = function(){
					customTags.sort((b,a) => b.name.localeCompare(a.name));
					drawTags()
				}
				sortNumber.onclick = function(){
					customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
					drawTags()
				}
			};drawTags()
		};
		let variables = {
			name: decodeURIComponent(URLstuff[1]),
			listType: "ANIME"
		};
		if(URLstuff[2] === "mangalist"){
			variables.listType = "MANGA"
		};
		if(variables.name === whoAmI && reliablePersistentStorage){
			cache.getList(variables.listType,function(data){
				collectNotes({
					data: {
						MediaListCollection: data
					}
				})
			})
		}
		else{
			generalAPIcall(queryMediaListNotes,variables,collectNotes,"hohCustomTagIndex" + variables.listType + variables.name,60*1000);
		}
	}
	filters.appendChild(extraFilters);
	let filterBox = document.querySelector(".entry-filter input");
	let searchParams = new URLSearchParams(location.search);
	let paramSearch = searchParams.get("search");
	if(paramSearch){
		filterBox.value = decodeURIComponent(paramSearch);
		let event = new Event("input");
		filterBox.dispatchEvent(event);
	}
	let filterChange = function(){
		let newURL = location.protocol + "//" + location.host + location.pathname 
		if(filterBox.value === ""){
			searchParams.delete("search")
		}
		else{
			searchParams.set("search",encodeURIComponent(filterBox.value));
			newURL += "?" + searchParams.toString();
		}
		current = newURL;
		history.replaceState({},"",newURL);
		if(document.querySelector(".el-icon-circle-close")){
			document.querySelector(".el-icon-circle-close").onclick = filterChange
		}
	}
	filterBox.oninput = filterChange;
	filterChange();
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: true
	};
	if(
		decodeURIComponent(URLstuff[1]) === whoAmI
		&& useScripts.accessToken
		&& useScripts.plussMinus
		&& (
			document.querySelector(".medialist").classList.contains("POINT_100")
			|| document.querySelector(".medialist").classList.contains("POINT_10")
			|| document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")
		)
	){
		let minScore = 1;
		let maxScore = 100;
		let stepSize = 1;
		if(document.querySelector(".medialist").classList.contains("POINT_10") || document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			maxScore = 10;
		}
		if(document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			stepSize = 0.1;
		}
		let scoreChanger = function(){
			observer.disconnect();
			lists.querySelectorAll(".list-entries .row .score").forEach(function(entry){
				if(!entry.childElementCount){
					let updateScore = function(isUp){
						let score = parseFloat(entry.attributes.score.value);
						if(isUp){
							score += stepSize;
						}
						else{
							score -= stepSize;
						}
						if(score >= minScore && score <= maxScore){
							let id = parseInt(entry.previousElementSibling.children[0].href.match(/(anime|manga)\/(\d+)/)[2]);
							lists.querySelectorAll("[href=\"" + entry.previousElementSibling.children[0].attributes.href.value + "\"]").forEach(function(rItem){
								rItem.parentNode.nextElementSibling.attributes.score.value = score.roundPlaces(1);
								rItem.parentNode.nextElementSibling.childNodes[1].textContent = " " + score.roundPlaces(1) + " ";
							});
							authAPIcall(
								`mutation($id:Int,$score:Float){
									SaveMediaListEntry(mediaId:$id,score:$score){
										score
									}
								}`,
								{id:id,score:score},function(data){/*later*/}
							);
						};
					};
					let changeMinus = create("span","hohChangeScore","-");
					entry.insertBefore(changeMinus,entry.firstChild);
					let changePluss = create("span","hohChangeScore","+",entry);
					changeMinus.onclick = function(){updateScore(false)};
					changePluss.onclick = function(){updateScore(true)};
				}
			});
			observer.observe(lists,mutationConfig);
		}
		let lists = document.querySelector(".lists");
		let observer = new MutationObserver(scoreChanger);
		observer.observe(lists,mutationConfig);
		scoreChanger();
	}
};
