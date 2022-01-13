function drawListStuff(){
	const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
	if(!URLstuff){
		return
	}
	if(document.querySelector(".hohExtraFilters")){
		return
	}
	let filters = document.querySelector(".filters-wrap");
	if(!filters){
		setTimeout(drawListStuff,200);
		return
	}
	let extraFilters = create("div","hohExtraFilters");
	extraFilters.style.marginTop = "15px";
	if(useScripts.draw3x3){
		let buttonDraw3x3 = create("span","#hohDraw3x3",translate("$make3x3"),extraFilters);
		buttonDraw3x3.title = translate("$make3x3_title");
		buttonDraw3x3.onclick = function(){
			this.style.color = "rgb(var(--color-blue))";
			let counter = 0;
			let linkList = [];
			let keepUpdating = true;
			let updateCards = function(){
				let cardList = document.querySelectorAll(".entry-card.row,.entry.row");
				cardList.forEach(card => {
					card.onclick = function(){
						if(this.draw3x3selected){
							counter--;
							linkList[this.draw3x3selected - 1] = "";
							this.draw3x3selected = false;
							this.style.borderStyle = "none"
						}
						else{
							counter++;
							linkList.push(this.querySelector(".cover .image").style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',""));
							this.draw3x3selected = +linkList.length;
							this.style.borderStyle = "solid";
							if(counter === 9){
								linkList = linkList.filter(e => e !== "");
								let displayBox = createDisplayBox(false,"3x3 maker");
								create("p",false,"Save the image below:",displayBox);
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
								let finalCanvas = create("canvas",false,false,displayBox);
								finalCanvas.width = 230*3;
								finalCanvas.height = 345*3;
								let ctx = finalCanvas.getContext("2d");
								let drawStuff = function(image,x,y,width,height){
									let img = new Image();
									img.onload = function(){
										ctx.drawImage(img,x,y,width,height)
									}
									img.src = image
								};
								for(var i=0;i<3;i++){
									for(var j=0;j<3;j++){
										drawStuff(linkList[i*3+j],j*230,i*345,230,345)
									}
								}
							}
						}
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
				let sortName = create("span",false,"▲",tagIndex,"cursor:pointer");
				let sortNumber = create("span",false,"▼",tagIndex,"cursor:pointer;float:right");
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
				});
				sortName.onclick = function(){
					customTags.sort((b,a) => b.name.localeCompare(a.name));
					drawTags()
				}
				sortNumber.onclick = function(){
					customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
					drawTags()
				}
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
}
