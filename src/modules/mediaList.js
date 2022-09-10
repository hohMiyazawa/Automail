exportModule({
	id: "mediaList",
	description: "wrapper module for various unrelelated medialist modules",
	isDefault: true,
	categories: ["Lists"],
	visible: false,//not relevant in settings, adjust the wrapped modules instead
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/);
	},
	code: function(){
		const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
		if(!URLstuff){
			return
		}
		if(document.querySelector(".hohExtraFilters")){
			return
		}
		let waiter = function(){
			let filters = document.querySelector(".filters-wrap");
			if(!filters){
				setTimeout(waiter,200);
				return
			}
			let extraFilters = create("div","hohExtraFilters");
			extraFilters.style.marginTop = "15px";
			if(useScripts.draw3x3){
				let buttonDraw3x3 = create("button",["#hohDraw3x3","hohButton","button"],translate("$make3x3"),extraFilters);
				buttonDraw3x3.title = translate("$make3x3_title");
				buttonDraw3x3.onclick = function(){
					//this.style.color = "rgb(var(--color-blue))";
					let displayBox = createDisplayBox(false,"3x3 maker");
					let col_input = create("input","hohNativeInput",false,displayBox);
					let col_label = create("span",false,"columns",displayBox,"margin: 5px");
					col_input.type = "number";
					col_input.value = 3;
					col_input.step = 1;
					col_input.min = 0;
					let row_input = create("input","hohNativeInput",false,displayBox);
					let row_label = create("span",false,"rows",displayBox,"margin: 5px");
					create("br",false,false,displayBox)
					row_input.type = "number";
					row_input.value = 3;
					row_input.step = 1;
					row_input.min = 0;
					let margin_input = create("input","hohNativeInput",false,displayBox);
					let margin_label = create("span",false,"spacing (px)",displayBox,"margin: 5px");
					create("br",false,false,displayBox)
					margin_input.type = "number";
					margin_input.value = 0;
					margin_input.min = 0;
					let width_input = create("input","hohNativeInput",false,displayBox);
					let width_label = create("span",false,"image width (px)",displayBox,"margin: 5px");
					width_input.type = "number";
					width_input.value = 230;
					width_input.min = 0;
					let height_input = create("input","hohNativeInput",false,displayBox);
					let height_label = create("span",false,"image height (px)",displayBox,"margin: 5px");
					create("br",false,false,displayBox)
					height_input.type = "number";
					height_input.value = 345;
					height_input.min = 0;
					let fitMode = create("select","hohNativeInput",false,displayBox);
					let fitMode_label = create("span",false,"image fitting",displayBox,"margin	: 5px");
					let addOption = function(value,text){
						let newOption = create("option",false,text,fitMode);
						newOption.value = value;
					};
					addOption("scale","scale");
					addOption("crop","crop");
					addOption("hybrid","scale/crop hybrid");
					addOption("letterbox","letterbox");
					addOption("transparent","transparent letterbox");


					let recipe = create("p",false,translate("Click 9 media entries, then save the image below"),displayBox);
						
					let linkList = [];
					let keepUpdating = true;
					let image_width = 230;
					let image_height = 345;
					let margin = 0;
					let columns = 3;
					let rows = 3;
					let mode = fitMode.value;

					displayBox.parentNode.querySelector(".hohDisplayBoxClose").onclick = function(){
						displayBox.parentNode.remove();
						keepUpdating = false;
						cardList.forEach(function(card){
							card.draw3x3selected = false;
							card.style.borderStyle = "none"
						});
						counter = 0;
						linkList = []
					};

					let finalCanvas = create("canvas",false,false,displayBox,"max-height: 60%;max-width: 90%");
					let ctx = finalCanvas.getContext("2d");

					let updateDrawing = function(){
						finalCanvas.width = image_width*columns + (columns - 1) * margin;
						finalCanvas.height = image_height*rows + (rows - 1) * margin;
						ctx.clearRect(0,0,finalCanvas.width,finalCanvas.height);
						let drawStuff = function(image,x,y,width,height){
							let img = new Image();
							img.onload = function(){
								let sx = 0;
								let sy = 0;
								let sWidth = img.width;
								let sHeight = img.height;
								let dx = x;
								let dy = y;
								let dWidth = width
								let dHeight = height;
								//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
								if(mode === "crop"){
									if(img.width/img.height > width/height){//crop sides
										let factor = img.height / height;
										sWidth = width * factor;
										sx = (img.width - sWidth)/2;
									}
									else{//crop top and bottom
										let factor = img.width / width;
										sHeight = height * factor;
										sy = (img.height - sHeight)/2;
									}
								}
								else if(mode === "hybrid"){
									if(img.width/img.height > width/height){//crop sides
										let factor = img.height / height;
										sWidth = width * factor;
										sWidth += (img.width - sWidth)/2
										sx = (img.width - sWidth)/2;
									}
									else{//crop top and bottom
										let factor = img.width / width;
										sHeight = height * factor;
										sHeight += (img.height - sHeight)/2;
										sy = (img.height - sHeight)/2;
									}
								}
								else if(mode === "letterbox" || mode === "transparent"){
									if(img.width/img.height > width/height){//too wide
										let factor = img.width / width;
										dHeight = img.height / factor;
										dy = y + (height - dHeight)/2;
									}
									else{//too tall
										let factor = img.height / height;
										dWidth = img.width / factor;
										dx = x + (width - dWidth)/2;
									}
									if(mode === "letterbox"){
										ctx.fillStyle = "black"
										ctx.fillRect(x,y,width,height)
									}

								}
								else{//scale
								}
								ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
							}
							img.src = image
						};
						for(var y=0;y<rows;y++){
							for(var x=0;x<columns;x++){
								if(linkList[y*columns+x] !== "empty"){
									drawStuff(
										linkList[y*columns+x],
										x*image_width + x*margin,
										y*image_height + y*margin,
										image_width,
										image_height
									)
								}
							}
						}
					}

					let updateConfig = function(){
						columns = parseInt(col_input.value) || 3;
						rows = parseInt(row_input.value) || 3;
						margin = parseInt(margin_input.value) || 0;
						image_width = parseInt(width_input.value) || 230;
						image_height = parseInt(height_input.value) || 345;
						mode = fitMode.value;
						displayBox.parentNode.querySelector(".hohDisplayBoxTitle").textContent = columns + "x" + rows + " maker";
						recipe.innerText = "Click " + (rows*columns) + " media entries, then save the image below"
						updateDrawing();
					}
					col_input.oninput = updateConfig;
					row_input.oninput = updateConfig;
					margin_input.oninput = updateConfig;
					width_input.oninput = updateConfig;
					height_input.oninput = updateConfig;
					fitMode.oninput = updateConfig;

					let updateCards = function(){
						let cardList = document.querySelectorAll(".entry-card.row,.entry.row");
						cardList.forEach(card => {
							card.onclick = function(){
								if(this.draw3x3selected){
									//linkList.splice(linkList.indexOf(this.draw3x3selected),1);
									linkList[linkList.indexOf(this.draw3x3selected)] = "empty";
									this.draw3x3selected = false;
									this.style.borderStyle = "none"
								}
								else{
									let val = this.querySelector(".cover .image").style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
									if(!linkList.some((place,index) => {
										if(place === "empty"){
											linkList[index] = val;
											return true
										}
										return false
									})){
										linkList.push(val);
									}
									this.draw3x3selected = val;
									this.style.borderStyle = "solid"
								}
								updateDrawing()
							}
						})
					};
					let waiter = function(){
						updateCards();
						if(keepUpdating){
							setTimeout(waiter,500)
						}
					};waiter();
				}
			}
			if(useScripts.newChapters && URLstuff[2] === "mangalist"){
				newChaptersInsertion(extraFilters)
			}
			if(URLstuff[2] === "mangalist"){
				let alMangaButton = create("button",["button","hohButton"],"Export JSON",extraFilters);
				alMangaButton.onclick = function(){
					generalAPIcall(
						`
query($name: String!){
	MediaListCollection(userName: $name, type: MANGA){
		lists{
			name
			isCustomList
			isSplitCompletedList
			entries{
				... mediaListEntry
			}
		}
	}
	User(name: $name){
		name
		id
		mediaListOptions{
			scoreFormat
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	progressVolumes
	repeat
	notes
	priority
	hiddenFromStatusLists
	customLists
	advancedScores
	startedAt{
		year
		month
		day
	}
	completedAt{
		year
		month
		day
	}
	updatedAt
	createdAt
	media{
		idMal
		title{romaji native english}
	}
	score
}
				`,
						{name: decodeURIComponent(URLstuff[1])},
						function(data){
							if(!data){
								alert("Export failed");
								return
							}
							data.data.version = "1.01";
							data.data.scriptInfo = scriptInfo;
							data.data.type = "MANGA";
							data.data.url = document.URL;
							data.data.timeStamp = NOW();
							saveAs(data.data,"AnilistMangaList_" + decodeURIComponent(URLstuff[1]) + ".json");
						}
					)
				}
			}
			if(URLstuff[2] === "animelist"){
				let alAnimeButton = create("button",["button","hohButton"],"Export JSON",extraFilters);
				alAnimeButton.onclick = function(){
					generalAPIcall(
						`
query($name: String!){
	MediaListCollection(userName: $name, type: ANIME){
		lists{
			name
			isCustomList
			isSplitCompletedList
			entries{
				... mediaListEntry
			}
		}
	}
	User(name: $name){
		name
		id
		mediaListOptions{
			scoreFormat
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	repeat
	notes
	priority
	hiddenFromStatusLists
	customLists
	advancedScores
	startedAt{
		year
		month
		day
	}
	completedAt{
		year
		month
		day
	}
	updatedAt
	createdAt
	media{
		idMal
		title{romaji native english}
	}
	score
}
				`,
						{name: decodeURIComponent(URLstuff[1])},
						function(data){
							if(!data){
								alert("Export failed");
								return
							}
							data.data.version = "1.01";
							data.data.scriptInfo = scriptInfo;
							data.data.type = "ANIME";
							data.data.url = document.URL;
							data.data.timeStamp = NOW();
							saveAs(data.data,"AnilistAnimeList_" + decodeURIComponent(URLstuff[1]) + ".json");
						}
					)
				}
			}
			if(useScripts.tagIndex && (!useScripts.mobileFriendly)){
				let tagIndex = create("div","tagIndex",false,extraFilters);
				let collectNotes = function(data){
					let customTags = new Map();	
					let listData = returnList(data,true);
					let blurbs = [];
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
								blurbs.push(noteContent.lists)
							}
						}
					});
					let applier = function(){
						const URLstuff2 = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
						if(!URLstuff2 || URLstuff[0] !== URLstuff2[0]){
							return
						}
						Array.from(document.querySelectorAll(".hohDescriptions")).forEach(matching => matching.remove());
						blurbs.forEach(blurb => {
							blurb.forEach(list => {
								if(list.name && list.info){
									let titles = document.querySelectorAll("h3.section-name");
									for(var i=0;i<titles.length;i++){
										if(titles[i].innerText === list.name){
											let descriptionNode = create("p","hohDescriptions",list.info);
											titles[i].parentNode.insertBefore(descriptionNode,titles[i].nextSibling);
											break
										}
									}
								}
							})
						});
						setTimeout(applier,1000)
					};
					applier();
					if(customTags.has("##STRICT")){
						customTags.delete("##STRICT")
					}
					customTags = [...customTags].map(pair => pair[1]);
					customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
					let drawTags = function(){
						removeChildren(tagIndex);
						if(customTags.length > 1){
							let sortName = create("span",false,"▲",tagIndex,"cursor:pointer");
							sortName.title = translate("$sortBy_name");
							let sortNumber = create("span",false,"▼",tagIndex,"cursor:pointer;float:right");
							sortNumber.title = translate("$sortBy_count");
							sortName.onclick = function(){
								customTags.sort((b,a) => b.name.localeCompare(a.name));
								drawTags()
							}
							sortNumber.onclick = function(){
								customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
								drawTags()
							}
						}
						customTags.forEach(tag => {
							if(tag.name.match(/,(malSync|last)::/)){
								return
							}
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
						})
					};
					if(customTags.some(tag => !tag.name.match(/,(malSync|last)::/))){
						drawTags()
					}
				};
				let variables = {
					name: decodeURIComponent(URLstuff[1]),
					listType: "ANIME"
				};
				if(URLstuff[2] === "mangalist"){
					variables.listType = "MANGA"
				}
				if(variables.name === whoAmI && reliablePersistentStorage){
					cache.getList(variables.listType,function(data){
						collectNotes(data)
					})
				}
				else{
					generalAPIcall(
`query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
				mediaId
				notes
			}
		}
	}
}`,
						variables,
						collectNotes,
						"hohCustomTagIndex" + variables.listType + variables.name,
						60*1000
					)
				}
			}
			filters.appendChild(extraFilters);
			let filterBox = document.querySelector(".entry-filter input");
			let searchParams = new URLSearchParams(location.search);
			let paramSearch = searchParams.get("search");
			if(paramSearch){
				filterBox.value = decodeURIComponent(paramSearch);
				let event = new Event("input");
				filterBox.dispatchEvent(event)
			}
			let filterChange = function(){
				let newURL = location.protocol + "//" + location.host + location.pathname 
				if(filterBox.value === ""){
					searchParams.delete("search")
				}
				else{
					searchParams.set("search",encodeURIComponent(filterBox.value));
					newURL += "?" + searchParams.toString()
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
					|| document.querySelector(".medialist").classList.contains("POINT_5")
				)
			){
				let minScore = 1;
				let maxScore = 100;
				let stepSize = 1;
				if(document.querySelector(".medialist").classList.contains("POINT_10") || document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
					maxScore = 10
				}
				if(document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
					minScore = 0.1;
					stepSize = 0.1
				}
				if(document.querySelector(".medialist").classList.contains("POINT_5")){
					maxScore = 5;
				}
				let scoreChanger = function(){
					observer.disconnect();
					lists.querySelectorAll(".list-entries .row .score").forEach(function(entry){
						if(!entry.childElementCount){
							let updateScore = function(isUp){
								let score = parseFloat(entry.attributes.score.value);
								if(isUp){
									score += stepSize
								}
								else{
									score -= stepSize
								}
								if(score >= minScore && score <= maxScore){
									let id = parseInt(entry.previousElementSibling.children[0].href.match(/(anime|manga)\/(\d+)/)[2]);
									lists.querySelectorAll("[href=\"" + entry.previousElementSibling.children[0].attributes.href.value + "\"]").forEach(function(rItem){
										rItem.parentNode.nextElementSibling.attributes.score.value = score.roundPlaces(1);
										rItem.parentNode.nextElementSibling.childNodes[1].textContent = " " + score.roundPlaces(1) + " "
									});
									authAPIcall(
										`mutation($id:Int,$score:Float){
											SaveMediaListEntry(mediaId:$id,score:$score){
												score
											}
										}`,
										{id:id,score:score},function(data){
											if(!data){
												if(isUp){
													score -= stepSize
												}
												else{
													score += stepSize
												}
												lists.querySelectorAll("[href=\"" + entry.previousElementSibling.children[0].attributes.href.value + "\"]").forEach(function(rItem){
													rItem.parentNode.nextElementSibling.attributes.score.value = score.roundPlaces(1);
													rItem.parentNode.nextElementSibling.childNodes[1].textContent = " " + score.roundPlaces(1) + " "
												})
											}
										}
									);
								}
							};
							let changeMinus = create("span","hohChangeScore","-");
							entry.insertBefore(changeMinus,entry.firstChild);
							let changePluss = create("span","hohChangeScore","+",entry);
							if(useScripts.CSSdecimalPoint){
								entry.classList.add("hohNeedsPositioning");
								changePluss.style.position = "absolute";
								changePluss.style.right = "calc(50% - 2em)";
							}
							changeMinus.onclick = function(){updateScore(false)};
							changePluss.onclick = function(){updateScore(true)}
						}
					});
					observer.observe(lists,mutationConfig)
				}
				let lists = document.querySelector(".lists");
				let observer = new MutationObserver(scoreChanger);
				observer.observe(lists,mutationConfig);
				scoreChanger()
			}
		};waiter()
	}
})
