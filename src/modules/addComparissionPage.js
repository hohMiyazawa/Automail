function addComparissionPage(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/);
	if(!URLstuff){
		return;
	};
	let userA = decodeURIComponent(URLstuff[1]);
	let type = URLstuff[2];
	let compareLocation = document.querySelector(".compare");
	let nativeCompareExists = true;
	if(!compareLocation){
		nativeCompareExists = false;
		compareLocation = document.querySelector(".medialist");
		if(!compareLocation){
			setTimeout(addComparissionPage,200);
			return;
		};
	};
	if(document.querySelector(".hohCompare")){
		return;
	};
	compareLocation.style.display = "none";
	let compareArea = create("div","hohCompare",false,compareLocation.parentNode);
	if(nativeCompareExists){
		let switchButton = create("span",false,"Show default compare",compareLocation.parentNode,"position:absolute;top:0px;right:0px;cursor:pointer;z-index:100;");
		switchButton.onclick = function(){
			if(switchButton.innerText === "Show default compare"){
				switchButton.innerText ="Show hoh compare";
				compareLocation.style.display = "";
				compareArea.style.display = "none";
				switchButton.style.top = "-30px";
			}
			else{
				switchButton.innerText ="Show default compare";
				compareLocation.style.display = "none";
				compareArea.style.display = "";
				switchButton.style.top = "0px";
			}
		};
		compareLocation.parentNode.style.position = "relative";
	};
	let formatFilterLabel = create("span",false,"Filter:",compareArea);
	formatFilterLabel.style.padding = "5px";
	let formatFilter = create("select",false,false,compareArea);
	let addOption = function(value,text){
		let newOption = create("option",false,text,formatFilter);
		newOption.value = value;
	};
	addOption("all","All");
	if(type === "anime"){
		addOption("TV","TV");
		addOption("MOVIE","Movie");
		addOption("TV_SHORT","TV Short");
		addOption("OVA","OVA");
		addOption("ONA","ONA");
		addOption("SPECIAL","Special");
		addOption("MUSIC","Music");
	}
	else if(type === "manga"){
		addOption("MANGA","Manga");
		addOption("NOVEL","Novel");
		addOption("ONE_SHOT","One Shot");
	};
	let ratingFilterLabel = create("span",false,"Min. ratings:",compareArea);
	ratingFilterLabel.style.padding = "5px";
	let ratingFilter = create("input",false,false,compareArea,"width:45px;color:rgb(var(--color-text))");
	ratingFilter.type = "number";
	ratingFilter.value = 1;
	ratingFilter.min = 0;
	let systemFilterLabel = create("span",false,"Individual rating systems:",compareArea,"padding:5px;");
	let systemFilter = createCheckbox(compareArea);
	systemFilter.checked = false;
	let colourLabel = create("span",false,"Colour entire cell:",compareArea,"padding:5px;");
	let colourFilter = createCheckbox(compareArea);
	colourFilter.checked = false;			
	let tableContainer = create("table",false,false,compareArea);
	let table = create("tbody",false,false,tableContainer);
	let digestSelect = {value:"average"};//placeholder
	let shows = [];//the stuff we are displaying in the table
	let users = [];
	let listCache = {};//storing raw anime data
	let ratingMode = "average";let guser = 0;let inverse = false;
	let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",compareLocation.parentNode,"margin-top:10px;");
	let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",compareLocation.parentNode,"margin-top:10px;");
	csvButton.onclick = function(){
		let csvContent = "Title," + digestSelect.selectedOptions[0].text + "," + users.map(user => user.name).join(",") + "\n";
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			csvContent += csvEscape(show.title) + "," + show.digest + "," + show.score.join(",") + "\n";
		});
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".csv";
		saveAs(csvContent,filename,true);
	};
	jsonButton.onclick = function(){
		let jsonData = {
			users: users,
			formatFilter: formatFilter.value,
			digestValue: digestSelect.value,
			type: capitalize(type),
			version: "1.00",
			scriptInfo: scriptInfo,
			url: document.URL,
			timeStamp: NOW(),
			media: shows
		}
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".json";
		saveAs(jsonData,filename);
	}
	let sortShows = function(){
		let averageCalc = function(scoreArray,weight){
			let sum = 0;
			let dividents = 0;
			scoreArray.forEach(function(score){
				if(score){
					sum += score;
					dividents++;
				};
			});
			return {
				average: ((dividents + (weight || 0)) ? (sum/(dividents + (weight || 0))) : 0),
				dividents: dividents
			};
		};
		let sortingModes = {
			"average": function(show){
				show.digest = averageCalc(show.score).average;
			},
			"average0": function(show){
				show.digest = averageCalc(show.score,1).average;
			},
			"standardDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.pow(score - average.average,2);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"absoluteDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.abs(score - average.average);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"max": function(show){
				show.digest = Math.max(...show.score);
			},
			"min": function(show){
				show.digest = Math.min(...show.score.filter(TRUTHY)) || 0;
			},
			"difference": function(show){
				let mini = Math.min(...show.score.filter(TRUTHY)) || 0;
				let maks = Math.max(...show.score);
				show.digest = maks - mini;
			},
			"ratings": function(show){
				show.digest = show.score.filter(TRUTHY).length;
			},
			"planned": function(show){
				show.digest = show.status.filter(value => value === "PLANNING").length;
			},
			"current": function(show){
				show.digest = show.status.filter(value => (value === "CURRENT" || value === "REPEATING")).length;
			},
			"favourites": function(show){
				show.digest = show.favourite.filter(TRUTHY).length;
			},
			"median": function(show){
				let newScores = show.score.filter(TRUTHY);
				if(newScores.length === 0){
					show.digest = 0;
				}
				else{
					show.digest = Stats.median(newScores);
				};
			},
			"popularity": function(show){
				show.digest = show.popularity;
			},
			"averageScore": function(show){
				show.digest = show.averageScore;
			},
			"averageScoreDiff": function(show){
				if(!show.averageScore){
					show.digest = 0;
					return;
				};
				show.digest = averageCalc(show.score).average - show.averageScore;
			}
		};
		if(ratingMode === "user"){
			shows.sort(
				(a,b) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "userInverse"){
			shows.sort(
				(b,a) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "title"){
			shows.sort(ALPHABETICAL(a => a.title))
		}
		else if(ratingMode === "titleInverse"){
			shows = shows.sort(ALPHABETICAL(a => a.title)).reverse()
		}
		else{
			shows.forEach(sortingModes[ratingMode]);
			if(inverse){
				shows.sort((b,a) => b.digest - a.digest)
			}
			else{
				shows.sort((a,b) => b.digest - a.digest)
			}
		}
	};
	let drawTable = function(){
		while(table.childElementCount > 2){
			table.lastChild.remove()
		};
		let columnAmounts = [];
		users.forEach(function(element){
			columnAmounts.push({sum:0,amount:0});
		})
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			let row = create("tr","hohAnimeTable");
			row.onclick = function(){
				if(this.style.background === "rgb(var(--color-blue),0.5)"){
					this.style.background = "unset";
				}
				else{
					this.style.background = "rgb(var(--color-blue),0.5)";
				}
			}
			let showID = create("td",false,false,false,"max-width:250px;");
			create("a","newTab",show.title,showID)
				.href = "/" + type + "/" + show.id + "/" + safeURL(show.title);
			let showAverage = create("td");
			if(show.digest){
				let fractional = show.digest % 1;
				showAverage.innerText = show.digest.roundPlaces(3);
				[
					{s:"½",v:1/2},
					{s:"⅓",v:1/3},
					{s:"¼",v:1/4},
					{s:"¾",v:3/4},
					{s:"⅔",v:2/3},
					{s:"⅙",v:1/6},
					{s:"⅚",v:5/6},
					{s:"⅐",v:1/7}
				].find(symbol => {
					if(Math.abs(fractional - symbol.v) < 0.0001){
						showAverage.innerText = Math.floor(show.digest) + " " + symbol.s;
						return true;
					}
					return false;
				});
			};
			row.appendChild(showID);
			row.appendChild(showAverage);
			for(var i=0;i<show.score.length;i++){
				let showUserScore = create("td",false,false,row);
				if(show.score[i]){
					if(systemFilter.checked){
						showUserScore.appendChild(scoreFormatter(
							show.scorePersonal[i],
							users[i].system
						))
					}
					else{
						showUserScore.innerText = show.score[i]
					};
					columnAmounts[i].sum += show.score[i];
					columnAmounts[i].amount++;
				}
				else{
					if(show.status[i] === "NOT"){
						showUserScore.innerText = " "
					}
					else{
						showUserScore.innerText = "–"//n-dash
					}
				};
				if(show.status[i] !== "NOT"){
					if(colourFilter.checked){
						showUserScore.style.backgroundImage = "linear-gradient(to right,rgb(0,0,0,0)," + distributionColours[show.status[i]] + ")";
					}
					else{
						let statusDot = create("div","hohStatusDot",false,showUserScore);
						statusDot.style.background = distributionColours[show.status[i]];
						statusDot.title = show.status[i].toLowerCase();
					}
				};
				if(show.progress[i]){
					create("span","hohStatusProgress",show.progress[i],showUserScore);
				};
				if(show.favourite[i]){
					let favStar = create("span",false,false,showUserScore,"color:gold;font-size:1rem;vertical-align:middle;padding-bottom:2px;");
					favStar.appendChild(svgAssets2.star.cloneNode(true));
				}
			};
			table.appendChild(row);
		});
		if(columnAmounts.some(amount => amount.amount > 0)){
			let lastRow = create("tr",false,false,table);
			create("td",false,false,lastRow);
			create("td",false,false,lastRow);
			columnAmounts.forEach(amount => {
				let averageCel = create("td",false,"–",lastRow);
				if(amount.amount){
					averageCel.innerText = (amount.sum/amount.amount).roundPlaces(2);
				}
			})
		}
	};
	let changeUserURL = function(){
		const baseState = location.protocol + "//" + location.host + location.pathname;
		let params = "";
		if(users.length){
			params += "&users=" + users.map(user => user.name + (user.demand ? (user.demand === -1 ? "-" : "*") : "")).join(",");
		}
		if(formatFilter.value !== "all"){
			params += "&filter=" + encodeURIComponent(formatFilter.value);
		};
		if(ratingFilter.value !== 1){
			params += "&minRatings=" + encodeURIComponent(ratingFilter.value);
		};
		if(systemFilter.checked){
			params += "&ratingSystems=true";
		};
		if(colourFilter.checked){;
			params += "&fullColour=true";
		};
		if(ratingMode !== "average"){;
			params += "&sort=" + ratingMode;
		};
		if(params.length){
			params = "?" + params.substring(1);
		}
		current = baseState + params;
		history.replaceState({},"",baseState + params);
	};
	let drawUsers = function(){
		removeChildren(table)
		let userRow = create("tr");
		let resetCel = create("td",false,false,userRow);
		let resetButton = create("button",["hohButton","button"],"Reset",resetCel,"margin-top:0px;");
		resetButton.onclick = function(){
			users = [];
			shows = [];
			drawUsers();
			changeUserURL();
		};
		let digestCel = create("td");
		digestSelect = create("select");
		let addOption = (value,text) => {
			create("option",false,text,digestSelect)
				.value = value;
		};
		addOption("average","Average");
		addOption("median","Median");
		addOption("average0","Average~0");
		addOption("min","Minimum");
		addOption("max","Maximum");
		addOption("difference","Difference");
		addOption("standardDeviation","Std. Deviation");
		addOption("absoluteDeviation","Abs. Deviation");
		addOption("ratings","#Ratings");
		addOption("planned","#Planning");
		addOption("current","#Current");
		addOption("favourites","#Favourites");
		addOption("popularity","$Popularity");
		addOption("averageScore","$Score");
		addOption("averageScoreDiff","$Score diff.");
		if(["title","titleInverse","user","userInverse"].includes(ratingMode)){
			digestSelect.value = ratingMode;
		};
		digestSelect.oninput = function(){
			ratingMode = digestSelect.value;
			sortShows();
			drawTable();
			changeUserURL();
		};
		digestCel.appendChild(digestSelect);
		userRow.appendChild(digestCel);
		users.forEach(function(user,index){
			let userCel = create("td",false,false,userRow);
			let avatar = create("img",false,false,userCel);
			avatar.src = listCache[user.name].data.MediaListCollection.user.avatar.medium;
			let name = create("span",false,user.name,userCel);
			name.style.padding = "8px";
			let remove = create("span","hohAnimeTableRemove","✕",userCel);
			remove.onclick = function(){
				deleteUser(index)
			}
		});
		let addCel = create("td");
		let addInput = create("input",false,false,addCel);
		let addButton = create("button",["button","hohButton"],"Add",addCel,"margin-top:0px;");
		addButton.style.cursor = "pointer";
		addButton.onclick = function(){
			if(addInput.value !== ""){
				addUser(addInput.value);
				addButton.innerText = "...";
				addButton.disabled = true;
				addInput.readOnly = true;
			}
		};
		userRow.appendChild(addCel);
		let headerRow = create("tr");
		let typeCel = create("th");
		let downArrowa = create("span","hohArrowSort","▼",typeCel);
		downArrowa.onclick = function(){
			ratingMode = "title";
			sortShows();
			drawTable();
		};
		let typeCelLabel = create("span",false,capitalize(type),typeCel);
		let upArrowa = create("span","hohArrowSort","▲",typeCel);
		upArrowa.onclick = function(){
			ratingMode = "titleInverse";
			sortShows();
			drawTable();
		};
		headerRow.appendChild(typeCel);
		let digestSortCel = create("td");
		digestSortCel.style.textAlign = "center";
		let downArrow = create("span","hohArrowSort","▼",digestSortCel);
		downArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = false;
			sortShows(digestSelect.value);
			drawTable();
		};
		let upArrow = create("span","hohArrowSort","▲",digestSortCel);
		upArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = true;
			sortShows();
			drawTable();
		};
		headerRow.appendChild(digestSortCel);
		users.forEach(function(user,index){
			let userCel = create("td");
			userCel.style.textAlign = "center";
			userCel.style.position = "relative";
			let filter = create("span");
			if(user.demand === 0){
				filter.innerText = "☵"
			}
			else if(user.demand === 1){
				filter.innerText = "✓";
				filter.style.color = "green";
			}
			else{
				filter.innerText = "✕";
				filter.style.color = "red";
			};
			filter.classList.add("hohFilterSort");
			filter.onclick = function(){
				if(filter.innerText === "☵"){
					filter.innerText = "✓";
					filter.style.color = "green";
					user.demand = 1;
				}
				else if(filter.innerText === "✓"){
					filter.innerText = "✕";
					filter.style.color = "red";
					user.demand = -1;
				}
				else{
					filter.innerText = "☵";
					filter.style.color = "";
					user.demand = 0;
				};
				drawTable();
				changeUserURL();
			};
			let downArrow = create("span","hohArrowSort","▼");
			downArrow.onclick = function(){
				ratingMode = "user";
				guser = index;
				sortShows();
				drawTable();
			};
			let upArrow = create("span","hohArrowSort","▲");
			upArrow.onclick = function(){
				ratingMode = "userInverse";
				guser = index;
				sortShows();
				drawTable();
			};
			let statusFilterDot = create("div","hohStatusDot");
			const stati = ["COMPLETED","CURRENT","PLANNING","PAUSED","DROPPED","REPEATING","NOT"];
			statusFilterDot.onclick = function(){
				if(user.status === "NOT"){
					user.status = false;
					statusFilterDot.style.background = "rgb(var(--color-background))";
					statusFilterDot.title = "all";
				}
				else if(user.status === "REPEATING"){
					user.status = "NOT";
					statusFilterDot.style.background = `center / contain no-repeat url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 10 10"><line stroke="red" x1="0" y1="0" x2="10" y2="10"/><line x1="0" y1="10" x2="10" y2="0" stroke="red"/></svg>')`;
					statusFilterDot.title = "no status";
				}
				else if(user.status === false){
					user.status = "COMPLETED";
					statusFilterDot.style.background = distributionColours["COMPLETED"];
					statusFilterDot.title = "completed";
				}
				else{
					user.status = stati[stati.indexOf(user.status) + 1];
					statusFilterDot.style.background = distributionColours[user.status];
					statusFilterDot.title = user.status.toLowerCase();
				};
				drawTable();
			};
			userCel.appendChild(downArrow);
			userCel.appendChild(filter);
			userCel.appendChild(upArrow);
			userCel.appendChild(statusFilterDot);
			headerRow.appendChild(userCel);
		});
		userRow.classList.add("hohUserRow");
		headerRow.classList.add("hohHeaderRow");
		table.appendChild(userRow);
		table.appendChild(headerRow);
	};
	let addUser = function(userName,paramDemand){
		let handleData = function(data,cached){
			users.push({
				name: userName,
				demand: (paramDemand ? (paramDemand === "-" ? -1 : 1) : 0),
				system: data.data.MediaListCollection.user.mediaListOptions.scoreFormat,
				status: false
			});
			let list = returnList(data,true);
			if(!cached){
				list.forEach(function(alia){
					alia.media.id = alia.mediaId;
					alia.media.title = titlePicker(alia.media);
					alia.scoreRaw = convertScore(alia.score,data.data.MediaListCollection.user.mediaListOptions.scoreFormat);
				})
			};
			shows.sort(function(a,b){return a.id - b.id;});
			let listPointer = 0;
			let userIndeks = 0;
			if(shows.length){
				userIndeks = shows[0].score.length
			};
			let favs = data.data.MediaListCollection.user.favourites.fav.nodes.concat(
				data.data.MediaListCollection.user.favourites.fav2.nodes
			).concat(
				data.data.MediaListCollection.user.favourites.fav3.nodes
			).map(media => media.id);
			let createEntry = function(mediaEntry){
				let entry = {
					id: mediaEntry.mediaId,
					average: mediaEntry.scoreRaw,
					title: mediaEntry.media.title,
					format: mediaEntry.media.format,
					score: Array(userIndeks).fill(0),
					scorePersonal: Array(userIndeks).fill(0),
					status: Array(userIndeks).fill("NOT"),
					progress: Array(userIndeks).fill(false),
					numberWatched: mediaEntry.scoreRaw ? 1 : 0,
					favourite: Array(userIndeks).fill(false),
					averageScore: mediaEntry.media.averageScore,
					popularity: mediaEntry.media.popularity
				};
				entry.score.push(mediaEntry.scoreRaw);
				entry.scorePersonal.push(mediaEntry.score);
				entry.status.push(mediaEntry.status);
				if(mediaEntry.status !== "PLANNING" && mediaEntry.status !== "COMPLETED"){
					entry.progress.push(mediaEntry.progress + "/" + (mediaEntry.media.chapters || mediaEntry.media.episodes || ""))
				}
				else{
					entry.progress.push(false)
				}
				entry.favourite.push(favs.includes(entry.id));
				return entry;
			};
			shows.forEach(function(show){
				show.score.push(0);
				show.scorePersonal.push(0);
				show.status.push("NOT");
				show.progress.push(false);
				show.favourite.push(false);
			});
			for(var i=0;i<shows.length && listPointer < list.length;i++){
				if(shows[i].id < list[listPointer].mediaId){
					continue;
				}
				else if(shows[i].id === list[listPointer].mediaId){
					shows[i].score[userIndeks] = list[listPointer].scoreRaw;
					shows[i].scorePersonal[userIndeks] = list[listPointer].score;
					shows[i].status[userIndeks] = list[listPointer].status;
					if(list[listPointer].scoreRaw){
						shows[i].numberWatched++
					};
					if(list[listPointer].status !== "PLANNING" && list[listPointer].status !== "COMPLETED"){
						shows[i].progress[userIndeks] = list[listPointer].progress + "/" + (list[listPointer].media.chapters || list[listPointer].media.episodes || "");
					}
					else{
						shows[i].progress[userIndeks] = false
					};
					shows[i].favourite[userIndeks] = favs.includes(shows[i].id);
					listPointer++;
				}
				else{
					shows.splice(i,0,createEntry(list[listPointer]));
					listPointer++;
				};
			};
			for(;listPointer < list.length;listPointer++){
				shows.push(createEntry(list[listPointer]));
			};
			sortShows();
			drawUsers();
			drawTable();
			changeUserURL();
		};
		if(listCache.hasOwnProperty(userName)){
			handleData(listCache[userName],true)
		}
		else{
			generalAPIcall(
`query($name: String, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
			... mediaListEntry
			}
		}
		user{
			id
			name
			avatar{medium}
			mediaListOptions{scoreFormat}
			favourites{
				fav:${type.toLowerCase()}(page:1){
					nodes{
						id
					}
				}
				fav2:${type.toLowerCase()}(page:2){
					nodes{
						id
					}
				}
				fav3:${type.toLowerCase()}(page:3){
					nodes{
						id
					}
				}
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	score
	media{
		episodes
		chapters
		format
		title{romaji native english}
		averageScore
		popularity
	}
}`,
				{name:userName,listType:type.toUpperCase()},
				function(data){
					listCache[userName] = data;
					handleData(data,false);
				}
			);
		};
	};
	let deleteUser = function(index){
		users.splice(index,1);
		shows.forEach(function(show){
			show.score.splice(index,1);
			show.scorePersonal.splice(index,1);
			show.status.splice(index,1);
			show.progress.splice(index,1);
			show.favourite.splice(index,1);
		});
		shows = shows.filter(function(show){
			return !show.status.every(status => status === "NOT")
		});
		if(guser === index){
			guser = false
		}
		else if(guser > index){
			guser--
		};
		sortShows();
		drawUsers();
		drawTable();
		changeUserURL();
	};
	formatFilter.oninput = function(){drawTable();changeUserURL()};
	ratingFilter.oninput = function(){drawTable();changeUserURL()};
	systemFilter.onclick = function(){drawTable();changeUserURL()};
	colourFilter.onclick = function(){drawTable();changeUserURL()};
	let searchParams = new URLSearchParams(location.search);
	let paramFormat = searchParams.get("filter");
	if(paramFormat){
		formatFilter.value = paramFormat
	};
	let paramRating = searchParams.get("minRatings");
	if(paramRating){
		ratingFilter.value = paramRating
	};
	let paramSystem = searchParams.get("ratingSystems");
	if(paramSystem){
		systemFilter.checked = (paramSystem === "true")
	};
	let paramColour = searchParams.get("fullColour");
	if(paramColour){
		colourFilter.checked = (paramColour === "true")
	};
	let paramSort = searchParams.get("sort");
	if(paramSort){
		ratingMode = paramSort
	};
	let paramUsers = searchParams.get("users");
	if(paramUsers){
		paramUsers.split(",").forEach(user => {
			let paramDemand = user.match(/(\*|\-)$/);
			if(paramDemand){
				paramDemand = paramDemand[0]
			}
			user = user.replace(/(\*|\-)$/,"");
			if(user === "~"){
				addUser(whoAmI,paramDemand)
			}
			else{
				addUser(user,paramDemand)
			}
		})
	}
	else{
		addUser(whoAmI);
		addUser(userA);
	}
}
