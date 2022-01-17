//TODO: many of the separate arrays here should really be a single array of objects instead
function addComparisionPage(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/);
	if(!URLstuff){
		return
	}
	let userA = decodeURIComponent(URLstuff[1]);
	let type = URLstuff[2];
	let compareLocation = document.querySelector(".compare");
	let nativeCompareExists = true;
	if(!compareLocation){
		nativeCompareExists = false;
		compareLocation = document.querySelector(".medialist");
		if(!compareLocation){
			setTimeout(addComparisionPage,200);
			return
		}
	}
	if(document.querySelector(".hohCompare")){
		return
	}
	compareLocation.style.display = "none";
	let compareArea = create("div","hohCompare",false,compareLocation.parentNode);
	if(nativeCompareExists){
		let isDefaultCompare = false;
		let switchButton = create("span","hohCompareUIfragment",translate("$compare_default"),compareLocation.parentNode,"position:absolute;top:0px;right:0px;cursor:pointer;z-index:100;");
		switchButton.onclick = function(){
			isDefaultCompare = !isDefaultCompare;
			if(isDefaultCompare){
				switchButton.innerText = translate("$compare_hoh");
				compareLocation.style.display = "";
				compareArea.style.display = "none";
				switchButton.style.top = "-30px"
			}
			else{
				switchButton.innerText = translate("$compare_default");
				compareLocation.style.display = "none";
				compareArea.style.display = "";
				switchButton.style.top = "0px"
			}
		};
		compareLocation.parentNode.style.position = "relative"
	}
	let formatFilterLabel = create("span",false,"Filter:",compareArea);
	formatFilterLabel.style.padding = "5px";
	let formatFilter = create("select","hohNativeInput",false,compareArea);
	let addOption = function(value,text){
		let newOption = create("option",false,text,formatFilter);
		newOption.value = value
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
	}
	let ratingFilterLabel = create("span",false,translate("$compare_minRatings"),compareArea);
	ratingFilterLabel.style.padding = "5px";
	let ratingFilter = create("input","hohNativeInput",false,compareArea,"width:45px;color:rgb(var(--color-text))");
	ratingFilter.type = "number";
	ratingFilter.value = 1;
	ratingFilter.min = 0;
	let systemFilterLabel = create("span",false,translate("$compare_individualRatings"),compareArea,"padding:5px;");
	let systemFilter = createCheckbox(compareArea);
	systemFilter.checked = useScripts.comparisionSystemFilter;
	let normalFilterLabel = create("span",false,translate("$compare_normalizeRatings"),compareArea,"padding:5px;");
	let normalFilter = createCheckbox(compareArea);
	normalFilter.checked = false;
	let colourLabel = create("span",false,translate("$compare_colourCell"),compareArea,"padding:5px;");
	let colourFilter = createCheckbox(compareArea);
	colourFilter.checked = useScripts.comparisionColourFilter;		
	let tableContainer = create("table",false,false,compareArea);
	let table = create("tbody",false,false,tableContainer);
	let digestSelect = {value:"average"};//placeholder
	let shows = [];//the stuff we are displaying in the table
	let users = [];
	let listCache = {};//storing raw anime data
	let ratingMode = "average";let guser = 0;let inverse = false;
	let csvButton = create("button",["csvExport","button","hohButton","hohCompareUIfragment"],"CSV data",compareLocation.parentNode,"margin-top:10px;");
	let jsonButton = create("button",["jsonExport","button","hohButton","hohCompareUIfragment"],"JSON data",compareLocation.parentNode,"margin-top:10px;");
	csvButton.onclick = function(){
		let csvContent = "Title," + digestSelect.selectedOptions[0].text + "," + users.map(user => user.name).join(",") + "\n";
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false
				}
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false
				}
			}
			if(show.numberWatched < ratingFilter.value){
				display = false;
			}
			if(!display){
				return
			}
			csvContent += csvEscape(show.title) + "," + show.digest + "," + show.score.join(",") + "\n"
		});
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others"
		}
		filename += ".csv";
		saveAs(csvContent,filename,true)
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
			filename += " for " + users[0].name
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others"
		}
		filename += ".json";
		saveAs(jsonData,filename)
	}
	let sortShows = function(){
		let averageCalc = function(scoreArray,weight){//can maybe be delegated to the stats object? look into later
			let sum = 0;
			let dividents = 0;
			scoreArray.forEach(function(score){
				if(score !== null){
					sum += score;
					dividents++
				}
			});
			return {
				average: ((dividents + (weight || 0)) ? (sum/(dividents + (weight || 0))) : null),
				dividents: dividents
			}
		};
		let scoreField = (normalFilter.checked ? "scoreNormal" : "score");
		let sortingModes = {
			"average": function(show){
				show.digest = averageCalc(show[scoreField]).average
			},
			"average0": function(show){
				show.digest = averageCalc(show[scoreField],1).average
			},
			"standardDeviation": function(show){
				let average = averageCalc(show[scoreField]);
				let variance = 0;
				show.digest = null;
				if(average.dividents > 1){
					show[scoreField].forEach(score => {
						if(score !== null){
							variance += Math.pow(score - average.average,2)
						}
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance)
				}
			},
			"absoluteDeviation": function(show){
				let average = averageCalc(show[scoreField]);
				let variance = 0;
				show.digest = null;
				if(average.dividents > 1){
					show[scoreField].forEach(score => {
						if(score !== null){
							variance += Math.abs(score - average.average)
						}
					});
					variance = variance/average.dividents;
					show.digest = variance
				}
			},
			"max": function(show){
				let newScores = show[scoreField].filter(score => score !== null);
				if(newScores.length){
					show.digest = Math.max(...newScores)
				}
				else{
					show.digest = null
				}
			},
			"min": function(show){
				let newScores = show[scoreField].filter(score => score !== null);
				if(newScores.length){
					show.digest = Math.min(...newScores)
				}
				else{
					show.digest = null
				}
			},
			"difference": function(show){
				if(show[scoreField].filter(score => score !== null).length){
					let mini = Math.min(...show[scoreField].filter(score => score !== null)) || 0;
					let maks = Math.max(...show[scoreField].filter(score => score !== null));
					show.digest = maks - mini
				}
				else{
					show.digest = null
				}
			},
			"ratings": function(show){
				show.digest = show[scoreField].filter(score => score !== null).length || null
			},
			"planned": function(show){
				show.digest = show.status.filter(value => value === "PLANNING").length || null
			},
			"current": function(show){
				show.digest = show.status.filter(value => (value === "CURRENT" || value === "REPEATING")).length || null
			},
			"favourites": function(show){
				show.digest = show.favourite.filter(TRUTHY).length || null
			},
			"median": function(show){
				let newScores = show[scoreField].filter(score => score !== null);
				if(newScores.length === 0){
					show.digest = null
				}
				else{
					show.digest = Stats.median(newScores)
				}
			},
			"popularity": function(show){
				show.digest = show.popularity
			},
			"averageScore": function(show){
				show.digest = show.averageScore
			},
			"averageScoreDiff": function(show){
				if(!show.averageScore){
					show.digest = 0;
					return
				}
				show.digest = averageCalc(show[scoreField]).average - show.averageScore
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
		}
		let columnAmounts = [];
		users.forEach(function(element){
			columnAmounts.push({sum:0,amount:0})
		})
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false
				}
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false
				}
			}
			if(show.numberWatched < ratingFilter.value){
				display = false
			}
			if(!display){
				return
			}
			let row = create("tr","hohAnimeTable");
			row.onclick = function(){
				if(this.style.background === "rgb(var(--color-blue),0.5)"){
					this.style.background = "unset"
				}
				else{
					this.style.background = "rgb(var(--color-blue),0.5)"
				}
			}
			let showID = create("td",false,false,false,"max-width:250px;");
			create("a","newTab",show.title,showID)
				.href = "/" + type + "/" + show.id + "/" + safeURL(show.title);
			let showAverage = create("td");
			if(show.digest !== null){
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
						return true
					}
					return false
				})
			}
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
					else if(normalFilter.checked){
						showUserScore.innerText = show.scoreNormal[i].roundPlaces(3)
					}
					else{
						showUserScore.innerText = show.score[i]
					}
					columnAmounts[i].sum += show.score[i];
					columnAmounts[i].amount++
				}
				else{
					if(show.status[i] === "NOT"){
						showUserScore.innerText = " "
					}
					else{
						showUserScore.innerText = "–"//n-dash
					}
				}
				if(show.status[i] !== "NOT"){
					if(colourFilter.checked){
						showUserScore.style.backgroundImage = "linear-gradient(to right,rgb(0,0,0,0)," + distributionColours[show.status[i]] + ")";
					}
					else{
						let statusDot = create("div","hohStatusDot",false,showUserScore);
						statusDot.style.background = distributionColours[show.status[i]];
						statusDot.title = show.status[i].toLowerCase();
					}
				}
				if(show.progress[i]){
					create("span","hohStatusProgress",show.progress[i],showUserScore)
				}
				if(show.favourite[i]){
					let favStar = create("span",false,false,showUserScore,"color:gold;font-size:1rem;vertical-align:middle;padding-bottom:2px;");
					favStar.appendChild(svgAssets2.star.cloneNode(true))
				}
			}
			table.appendChild(row);
		});
		if(columnAmounts.some(amount => amount.amount > 0)){
			let lastRow = create("tr",false,false,table);
			create("td",false,"Average",lastRow,"border-left-width: 1px;padding-left: 15px;font-weight: bold;");
			create("td",false,false,lastRow);
			columnAmounts.forEach(amount => {
				let averageCel = create("td",false,"–",lastRow);
				if(amount.amount){
					averageCel.innerText = (amount.sum/amount.amount).roundPlaces(2)
				}
			})
		}
	};
	let changeUserURL = function(){
		const baseState = location.protocol + "//" + location.host + location.pathname;
		let params = "";
		if(users.length){
			params += "&users=" + users.map(user => user.name + (user.demand ? (user.demand === -1 ? "-" : "*") : "")).join(",")
		}
		if(formatFilter.value !== "all"){
			params += "&filter=" + encodeURIComponent(formatFilter.value)
		}
		if(ratingFilter.value !== 1){
			params += "&minRatings=" + encodeURIComponent(ratingFilter.value)
		}
		if(systemFilter.checked){
			params += "&ratingSystems=true"
		}
		if(normalFilter.checked){
			params += "&normalizeRatings=true"
		}
		if(colourFilter.checked){
			params += "&fullColour=true"
		}
		if(ratingMode !== "average"){
			params += "&sort=" + ratingMode
		}
		if(params.length){
			params = "?" + params.substring(1)
		}
		current = baseState + params;
		history.replaceState({},"",baseState + params)
	};
	let drawUsers = function(){
		removeChildren(table)
		let userRow = create("tr");
		let resetCel = create("td",false,false,userRow);
		let resetButton = create("button",["hohButton","button"],translate("$button_add"),resetCel,"margin-top:0px;");
		resetButton.onclick = function(){
			users = [];
			shows = [];
			drawUsers();
			changeUserURL()
		};
		let digestCel = create("td");
		digestSelect = create("select");
		let addOption = (value,text,title) => {
			let option = create("option",false,text,digestSelect);
			option.value = value;
			if(title){
				option.title = title
			}
		};
		addOption("average","Average");
		addOption("median","Median");
		addOption("average0","Average~0","Zero-weighted average. Good for sorting by 'best'");
		addOption("min","Minimum");
		addOption("max","Maximum");
		addOption("difference","Difference","Highest rating minus lowest rating");
		addOption("standardDeviation","Std. Deviation");
		addOption("absoluteDeviation","Abs. Deviation");
		addOption("ratings","#Ratings","Sort by number of users in table who have given a rating");
		addOption("planned","#Planning","Sort by number of users in table who have this as planning");
		addOption("current","#Current","Sort by number of users in table who have this as current");
		addOption("favourites","#Favourites","Sort by number of users in table who have this as a favourite");
		addOption("popularity","$Popularity","Sort by site-wide popularity");
		addOption("averageScore","$Score","Sort by site-wide score");
		addOption("averageScoreDiff","$Score diff.","Sort by difference between site-wide score and average score of the users in the table");
		if(["title","titleInverse","user","userInverse"].includes(ratingMode)){
			digestSelect.value = ratingMode;
		}
		digestSelect.oninput = function(){
			ratingMode = digestSelect.value;
			sortShows();
			drawTable();
			changeUserURL()
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
		let addInput = create("input","hohNativeInput",false,addCel);
		let addButton = create("button",["button","hohButton"],translate("$button_add"),addCel,"margin-top:0px;");
		addButton.style.cursor = "pointer";
		addButton.onclick = function(){
			if(addInput.value !== ""){
				addUser(addInput.value);
				addButton.innerText = "...";
				addButton.disabled = true;
				addInput.readOnly = true
			}
		};
		userRow.appendChild(addCel);
		let headerRow = create("tr");
		let typeCel = create("th");
		let downArrowa = create("span","hohArrowSort","▼",typeCel);
		downArrowa.onclick = function(){
			ratingMode = "title";
			sortShows();
			drawTable()
		};
		let typeCelLabel = create("span",false,capitalize(type),typeCel);
		let upArrowa = create("span","hohArrowSort","▲",typeCel);
		upArrowa.onclick = function(){
			ratingMode = "titleInverse";
			sortShows();
			drawTable()
		};
		headerRow.appendChild(typeCel);
		let digestSortCel = create("td");
		digestSortCel.style.textAlign = "center";
		let downArrow = create("span","hohArrowSort","▼",digestSortCel);
		downArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = false;
			sortShows(digestSelect.value);
			drawTable()
		};
		let upArrow = create("span","hohArrowSort","▲",digestSortCel);
		upArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = true;
			sortShows();
			drawTable()
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
				filter.style.color = "green"
			}
			else{
				filter.innerText = "✕";
				filter.style.color = "red"
			}
			filter.classList.add("hohFilterSort");
			filter.onclick = function(){
				if(filter.innerText === "☵"){
					filter.innerText = "✓";
					filter.style.color = "green";
					user.demand = 1
				}
				else if(filter.innerText === "✓"){
					filter.innerText = "✕";
					filter.style.color = "red";
					user.demand = -1
				}
				else{
					filter.innerText = "☵";
					filter.style.color = "";
					user.demand = 0
				}
				drawTable();
				changeUserURL()
			};
			let downArrow = create("span","hohArrowSort","▼");
			downArrow.onclick = function(){
				ratingMode = "user";
				guser = index;
				sortShows();
				drawTable()
			};
			let upArrow = create("span","hohArrowSort","▲");
			upArrow.onclick = function(){
				ratingMode = "userInverse";
				guser = index;
				sortShows();
				drawTable()
			};
			let statusFilterDot = create("div","hohStatusDot");
			if(user.status === false){
				statusFilterDot.title = translate("$compare_listStatus")
			}
			const stati = ["COMPLETED","CURRENT","PLANNING","PAUSED","DROPPED","REPEATING","NOT"];
			statusFilterDot.onclick = function(){
				if(user.status === "NOT"){
					user.status = false;
					statusFilterDot.style.background = "rgb(var(--color-background))";
					statusFilterDot.title = translate("$compare_listStatus")
				}
				else if(user.status === "REPEATING"){
					user.status = "NOT";
					statusFilterDot.style.background = `center / contain no-repeat url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 10 10"><line stroke="red" x1="0" y1="0" x2="10" y2="10"/><line x1="0" y1="10" x2="10" y2="0" stroke="red"/></svg>')`;
					statusFilterDot.title = "no status";
				}
				else if(user.status === false){
					user.status = "COMPLETED";
					statusFilterDot.style.background = distributionColours["COMPLETED"];
					statusFilterDot.title = "completed"
				}
				else{
					user.status = stati[stati.indexOf(user.status) + 1];
					statusFilterDot.style.background = distributionColours[user.status];
					statusFilterDot.title = user.status.toLowerCase()
				}
				drawTable()
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
		table.appendChild(headerRow)
	};
	let addUser = async function(userName,paramDemand){
		let handleData = function(data,cached){
			users.push({
				name: userName,
				demand: (paramDemand ? (paramDemand === "-" ? -1 : 1) : 0),
				system: data.data.MediaListCollection.user.mediaListOptions.scoreFormat,
				status: false
			});
			let list = returnList(data,true);
			if(!cached){
				let averageSum = 0;
				let averageCount = 0;
				list.forEach(alia => {
					alia.media.id = alia.mediaId;
					alia.media.title = titlePicker(alia.media);
					alia.scoreRaw = convertScore(alia.score,data.data.MediaListCollection.user.mediaListOptions.scoreFormat);
					if(alia.scoreRaw){
						averageSum += alia.scoreRaw;
						averageCount++
					}
				});
				averageSum = averageSum/averageCount;
				let varianceSum = 0;
				list.forEach(alia => {
					if(alia.scoreRaw){
						varianceSum += Math.pow(alia.scoreRaw - averageSum,2)
					}
				})
				let std = Math.sqrt(varianceSum/averageCount);
				list.forEach(alia => {
					if(alia.scoreRaw){
						alia.scoreNormal = (alia.scoreRaw - averageSum)/std
					}
					else{
						alia.scoreNormal = null
					}
				})
			}
			shows.sort(function(a,b){return a.id - b.id});
			let listPointer = 0;
			let userIndeks = 0;
			if(shows.length){
				userIndeks = shows[0].score.length
			}
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
					score: Array(userIndeks).fill(null),
					scorePersonal: Array(userIndeks).fill(null),
					scoreNormal: Array(userIndeks).fill(null),
					status: Array(userIndeks).fill("NOT"),
					progress: Array(userIndeks).fill(false),
					numberWatched: mediaEntry.scoreRaw ? 1 : 0,
					favourite: Array(userIndeks).fill(false),
					averageScore: mediaEntry.media.averageScore,
					popularity: mediaEntry.media.popularity
				};
				entry.score.push(mediaEntry.scoreRaw || null);
				entry.scorePersonal.push(mediaEntry.score || null);
				entry.scoreNormal.push(mediaEntry.scoreNormal);
				entry.status.push(mediaEntry.status);
				if(mediaEntry.status !== "PLANNING" && mediaEntry.status !== "COMPLETED"){
					entry.progress.push(mediaEntry.progress + "/" + (mediaEntry.media.chapters || mediaEntry.media.episodes || ""))
				}
				else{
					entry.progress.push(false)
				}
				entry.favourite.push(favs.includes(entry.id));
				return entry
			};
			shows.forEach(show => {
				show.score.push(null);
				show.scorePersonal.push(null);
				show.scoreNormal.push(null);
				show.status.push("NOT");
				show.progress.push(false);
				show.favourite.push(false)
			});
			for(var i=0;i<shows.length && listPointer < list.length;i++){
				if(shows[i].id < list[listPointer].mediaId){
					continue
				}
				else if(shows[i].id === list[listPointer].mediaId){
					shows[i].score[userIndeks] = list[listPointer].scoreRaw || null;
					shows[i].scorePersonal[userIndeks] = list[listPointer].score || null;
					shows[i].scoreNormal[userIndeks] = list[listPointer].scoreNormal;
					shows[i].status[userIndeks] = list[listPointer].status;
					if(list[listPointer].scoreRaw){
						shows[i].numberWatched++
					}
					if(list[listPointer].status !== "PLANNING" && list[listPointer].status !== "COMPLETED"){
						shows[i].progress[userIndeks] =
							list[listPointer].progress
							+ "/"
							+ (
								list[listPointer].media.chapters
								|| list[listPointer].media.episodes
								|| ""
							)
					}
					else{
						shows[i].progress[userIndeks] = false
					}
					shows[i].favourite[userIndeks] = favs.includes(shows[i].id);
					listPointer++
				}
				else{
					shows.splice(i,0,createEntry(list[listPointer]));
					listPointer++
				}
			}
			for(;listPointer < list.length;listPointer++){
				shows.push(createEntry(list[listPointer]))
			}
			sortShows();
			drawUsers();
			drawTable();
			changeUserURL()
		};
		if(listCache.hasOwnProperty(userName)){
			handleData(listCache[userName],true)
		}
		else{
			const listQuery = `
query($name: String, $listType: MediaType){
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
}`
			const data = await anilistAPI(listQuery, {
				variables: {name:userName,listType:type.toUpperCase()}
			})
			if(data.errors){
				return
			}
			listCache[userName] = data;
			handleData(data,false)
		}
		return
	};
	let deleteUser = function(index){
		users.splice(index,1);
		shows.forEach(function(show){
			show.score.splice(index,1);
			show.scorePersonal.splice(index,1);
			show.status.splice(index,1);
			show.progress.splice(index,1);
			show.favourite.splice(index,1)
		});
		shows = shows.filter(function(show){
			return !show.status.every(status => status === "NOT")
		});
		if(guser === index){
			guser = false
		}
		else if(guser > index){
			guser--
		}
		sortShows();
		drawUsers();
		drawTable();
		changeUserURL()
	};
	formatFilter.oninput = function(){drawTable();changeUserURL()};
	ratingFilter.oninput = function(){drawTable();changeUserURL()};
	systemFilter.onclick = function(){
		useScripts.comparisionSystemFilter = systemFilter.checked;
		useScripts.save();
		if(systemFilter.checked){
			normalFilter.checked = false;
			sortShows()
		}
		drawTable();changeUserURL()
	};
	normalFilter.onclick = function(){
		if(normalFilter.checked){
			systemFilter.checked = false;
			useScripts.comparisionSystemFilter = false;
			useScripts.save();
		}
		sortShows();drawTable();changeUserURL()
	}
	colourFilter.onclick = function(){
		useScripts.comparisionColourFilter = colourFilter.checked;
		useScripts.save();
		drawTable();changeUserURL()
	};
	let searchParams = new URLSearchParams(location.search);
	let paramFormat = searchParams.get("filter");
	if(paramFormat){
		formatFilter.value = paramFormat
	}
	let paramRating = searchParams.get("minRatings");
	if(paramRating){
		ratingFilter.value = paramRating
	}
	let paramSystem = searchParams.get("ratingSystems");
	if(paramSystem){
		systemFilter.checked = (paramSystem === "true")
	}
	let normalSystem = searchParams.get("normalizeRatings");
	if(normalSystem){
		normalFilter.checked = (normalSystem === "true")
	}
	let paramColour = searchParams.get("fullColour");
	if(paramColour){
		colourFilter.checked = (paramColour === "true")
	}
	let paramSort = searchParams.get("sort");
	if(paramSort){
		ratingMode = paramSort
	}
	let paramUsers = searchParams.get("users");
	if(paramUsers){
		paramUsers.split(",").forEach(user => {
			let paramDemand = user.match(/(\*|-)$/);
			if(paramDemand){
				paramDemand = paramDemand[0]
			}
			user = user.replace(/(\*|-)$/,"");
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
		addUser(userA)
	}
}
