function moreImports(){
	if(document.URL !== "https://anilist.co/settings/import"){
		return
	}
	let target = document.querySelector(".content .import");
	if(!target){
		setTimeout(moreImports,200);
		return;
	}
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let apAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Anime List",apAnime);
	const mapFormatAnime = new Map([["All", ""], ["TV Show", "TV"], ["Movie", "MOVIE"], ["TV Short", "TV_SHORT"],
									["Special", "SPECIAL"], ["OVA", "OVA"], ["ONA", "ONA"], ["MUSIC", "MUSIC"]])
	let selectFormatAnime = create("select", "meter", false, apAnime)
	mapFormatAnime.forEach((_, key) => {
		let option = create("option", false, key, selectFormatAnime)
		option.value = key
	})

	let apAnimeCheckboxContainer = create("label","el-checkbox",false,apAnime);
	let apAnimeOverwrite = createCheckbox(apAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",apAnimeCheckboxContainer);
	let apAnimeDropzone = create("div","dropbox",false,apAnime);
	let apAnimeInput = create("input","input-file",false,apAnimeDropzone);
	let apAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",apAnimeDropzone);
	apAnimeInput.type = "file";
	apAnimeInput.name = "json";
	apAnimeInput.accept = "application/json";
	let apManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Manga List",apManga);

	const mapFormatManga = new Map([["All", ""], ["Manga", "MANGA"], ["Light Novel", "NOVEL"], ["One Shot", "ONE_SHOT"]])
	let selectFormatManga = create("select", "meter", false, apManga)
	mapFormatManga.forEach((_, key) => {
		let option = create("option", false, key, selectFormatManga)
		option.value = key
	})

	let apMangaCheckboxContainer = create("label","el-checkbox",false,apManga);
	let apMangaOverwrite = createCheckbox(apMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",apMangaCheckboxContainer);
	let apMangaDropzone = create("div","dropbox",false,apManga);
	let apMangaInput = create("input","input-file",false,apMangaDropzone);
	let apMangaDropText = create("p",false,"Drop list JSON file here or click to upload",apMangaDropzone);
	apMangaInput.type = "file";
	apMangaInput.name = "json";
	apMangaInput.accept = "application/json";
	let resultsArea = create("div","importResults",false,target);
	let resultsErrors = create("div",false,false,resultsArea,"color:red;padding:5px;");
	let resultsWarnings = create("div",false,false,resultsArea,"color:orange;padding:5px;");
	let resultsStatus = create("div",false,false,resultsArea,"padding:5px;");
	let missingList = create("div",false,false,resultsArea,"padding:5px;");
	let exportErrors = create("button",["hohButton","button", "danger"],"Export all errors and unchecked",resultsArea,"display: none; margin: 5px 10px")
	let uncheckedTitles = [];
	exportErrors.onclick = function() {
		var link = create("a")
		let dataTitles = ""
		uncheckedTitles.map(title => {
			dataTitles += `Unchecked title : ${title}\n`			
		})
		link.href = "data:text/plain;charset=utf-8," + encodeURIComponent(dataTitles + "\n" + missingList.innerText.replace(/[\n\r]+/g, "\n"))
		link.download =  "errors_ap_import.txt"
		link.click()
	}
	let pushResults = create("button",["hohButton","button"],"Import all selected",resultsArea,"display: none; margin: 5px 10px")
	let resultsTable = create("div",false,false,resultsArea);

	let selectedValues = {}

	let apImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrors.innerText = "error parsing JSON";
			}
			if(data.export.type !== type){
				resultsErrors.innerText = "error wrong list";
				return;
			}
			if(data.user.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarnings.innerText = "List for \"" + data.user.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.export.date)) > 1000*86400*30){
				resultsWarnings.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.export.date)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			resultsStatus.innerText = "Trying to find matching media...";
			let shows = [];
			let drawShows = function(){
				removeChildren(resultsTable);
				shows = shows.filter(a => {
					if(a.titles.length){
						return true
					}
					else{
						create("p", false, "No matches found for " + a.apData.name, missingList, "color: rgba(var(--color-peach), .8)")
						exportErrors.style.display = "inline"
						return false
					}
				});
				shows.sort(
					(b,a) => a.titles[0].levDistance - b.titles[0].levDistance
				);
				shows.forEach(show => {
					let row = create("div","hohImportRow",false,resultsTable);
					if(show.isAnthology){
						create("div","hohImportEntry",show.apData.map(a => a.name).join(", "),row)
					}
					else{
						create("div","hohImportEntry",show.apData.name,row)
					}
					create("span","hohImportArrow","→",row);
					let aniEntry = create("div", "hohImportSelect", false, row);

					let selectEntry = create("select", "#typeSelect", false, aniEntry, "width: 100%; white-space: nowrap; text-overflow: ellipsis")

					let images = {}
					show.titles.forEach(title => {
						let optionEntry = create("option", false, title.title + " (" + title.format + ")", selectEntry)
						optionEntry.value = title.id
						images[title.id] = title.cover
					})

					selectedValues[show.apData.name] = parseInt(selectEntry.value)
					let aniLink = create("a", ["hohButton","button","link","newTab"], "View", row, "margin: 0 10px")
					aniLink.href = "/" + type + "/" + selectEntry.value

					const image = create("img", false, false, row, "margin-right: 10px")
					image.src = images[selectEntry.value]

					selectEntry.onchange = () => { 
						selectedValues[show.apData.name] = parseInt(selectEntry.value)
						aniLink.href = "/" + type + "/" + selectEntry.value
						image.src = images[selectEntry.value]
					}

					let button = createCheckbox(row);
					row.style.backgroundColor = "hsl(" + (120 - Math.min(show.titles[0].levDistance,12)*10) + ",30%,50%)";
					if(show.titles[0].levDistance > 8){
						button.checked = false;
						show.toImport = false;
						uncheckedTitles = uncheckedTitles.filter(e => e !== show.apData.name)
						uncheckedTitles.push(show.apData.name)
					}
					else{
						button.checked = true;
						show.toImport = true;
					}
					button.oninput = function(){
						show.toImport = button.checked
						if(!show.toImport) uncheckedTitles.push(show.apData.name)
						else uncheckedTitles = uncheckedTitles.filter(e => e !== show.apData.name)
					}
				})
			};
			const apAnthologies = m4_include(data/AnimePlanet_anthologies.json);
			const apMappings_anime = m4_include(data/AnimePlanet_mappings_anime.json);
			const apMappings_manga = m4_include(data/AnimePlanet_mappings_manga.json);
			let bigQuery = [];
			let myFastMappings = [];
			data.entries.forEach(function(entry,index){
				if(entry.status === "won't watch"){
					return
				}
				if(apAnthologies[entry.name]){
					let already = myFastMappings.findIndex(function(mapping){
						return mapping.id === apAnthologies[entry.name]
					});
					if(already !== -1){
						myFastMappings[already].entries.push(entry)
					}
					else{
						myFastMappings.push({
							entries: [entry],
							isAnthology: true,
							id: apAnthologies[entry.name]
						})
					}
					return;
				}
				if(type === "manga"){
					if(apMappings_manga[entry.name]){
						myFastMappings.push({
							entries: [entry],
							id: apMappings_manga[entry.name]
						})
						return;
					}
				}
				else{
					if(apMappings_anime[entry.name]){
						myFastMappings.push({
							entries: [entry],
							id: apMappings_anime[entry.name]
						})
						return;
					}
				}

				const chosenFormat = type === "manga" ? mapFormatManga.get(selectFormatManga.value) : mapFormatAnime.get(selectFormatAnime.value)
				const formatInQuery = chosenFormat === "" ? "" : `format:${chosenFormat}`
				bigQuery.push({
					query: `query($search:String){Page(perPage:5){media(type:${type.toUpperCase()},search:$search,${formatInQuery}){title{romaji english native} id synonyms format coverImage{medium}}}}`,
					variables: {search: entry.name},
					callback: function(dat){
						let show = {
							apData: entry,
							aniData: dat.data.Page.media,
							titles: []
						}
						show.aniData.forEach(function(hit){
							show.titles.push({
								title: hit.title.romaji,
								id: hit.id,
								levDistance: Math.min(
									levDist(show.apData.name,hit.title.romaji),
									levDist(show.apData.name,hit.title.romaji.toUpperCase()),
									levDist(show.apData.name,hit.title.romaji.toLowerCase())
								),
								format: hit.format,
								cover: hit.coverImage.medium
							});
							if(hit.title.english){
								show.titles.push({
									title: hit.title.english,
									id: hit.id,
									levDistance: Math.min(
										levDist(show.apData.name,hit.title.english),
										levDist(show.apData.name,hit.title.english.toUpperCase()),
										levDist(show.apData.name,hit.title.english.toLowerCase())
									),
									format: hit.format,
									cover: hit.coverImage.medium
								});
							}
							if(hit.title.native){
								show.titles.push({
									title: hit.title.native,
									id: hit.id,
									levDistance: levDist(show.apData.name,hit.title.native),
									format: hit.format,
									cover: hit.coverImage.medium
								})
							}
							hit.synonyms.forEach(
								synonym => show.titles.push({
									title: synonym,
									id: hit.id,
									levDistance: levDist(show.apData.name,synonym),
									format: hit.format,
									cover: hit.coverImage.medium
								})
							)
						});

						const groupBy = (arr) => arr.reduce((prev, cur) => ((prev[cur.cover] = prev[cur.cover] || []).push(cur), prev), {})
						const min = (arr) => Math.min(...arr.map(res => res.levDistance))
						const findTitle = (cover, levDistance) => show.titles.find(element => element.cover === cover && element.levDistance === levDistance)

						show.titles = Object.entries(groupBy(show.titles)).map(([key, val]) => {
							const levDistance = min(val)
							return { id: findTitle(key, levDistance).id, levDistance: levDistance, title: findTitle(key, levDistance).title, format: findTitle(key, levDistance).format, cover: key }
						})
						
						const getMapIndex = (map, format) => {
							let indexMap;
							[...map].some(([_, val], index) => {
								if(val === format) { 
									indexMap = index
									return true
								}
							})
							return indexMap
						}

						show.titles.sort(
							(a,b) => {
								const distance = a.levDistance - b.levDistance
								if(distance === 0) {
									const mapFormat = type === "manga" ? mapFormatManga : mapFormatAnime
									let indexA = getMapIndex(mapFormat, a.format)
									let indexB = getMapIndex(mapFormat, b.format)
									return indexA - indexB
								}
								return distance
							});
					
						shows.push(show);
						drawShows();
					}
				});
				if(index % 40 === 0){
					queryPacker(bigQuery);
					bigQuery = [];
				}
			});
			let apStatusMap = {
				"want to read": "PLANNING",
				"stalled": "PAUSED",
				"read": "COMPLETED",
				"reading": "CURRENT",
				"watched": "COMPLETED",
				"want to watch": "PLANNING",
				"dropped": "DROPPED",
				"watching": "CURRENT"
			}
			queryPacker(bigQuery,function(){
				setTimeout(function(){
					resultsStatus.innerText = "Please review the media matches. The worst matches are on top.";
					pushResults.style.display = "inline";
					pushResults.onclick = function(){
						pushResults.style.display = "none";
						if(!useScripts.accessToken){
							alert("Not signed in with the script. Can't do any changes to your list\n Go to settings > apps to sign in");
							return;
						}
						authAPIcall(
						`query($name: String,$listType: MediaType){
							Viewer{name mediaListOptions{scoreFormat}}
							MediaListCollection(userName: $name, type: $listType){
								lists{
									entries{
										mediaId
									}
								}
							}
						}`,
						{
							listType: type.toUpperCase(),
							name: whoAmI
						},
						function(data){
							if(data.data.Viewer.name !== whoAmI){
								alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Automail's permissions, and sign in with the scirpt again to fix this.");
								return;
							}
							let list = returnList(data,true).map(a => a.mediaId);
							shows = shows.filter(show => {
								if(!show.toImport){
									return false;
								}
								if(type === "anime"){
									if(!apAnimeOverwrite.checked && list.includes(selectedValues[show.apData.name])){
										return false;
									}
								}
								else{
									if(!apMangaOverwrite.checked && list.includes(selectedValues[show.apData.name])){
										return false;
									}
								}
								return true;
							});
							if(!shows.length){
								resultsStatus.innerText = "No entries imported. All the entries already exist in your AniList account."
								return;
							}
							let importSuccess = 0
							let mutater = function(show,index){
								if(index + 1 < shows.length){
									setTimeout(function(){
										mutater(shows[index + 1],index + 1);
									},1000);
								}
								let status = false;
								if(show.isAnthology){
									status = "CURRENT";
								}
								else{
									status = apStatusMap[show.apData.status];
								}
								if(!status){
									console.log("Unknown status \"" + show.apData.status + "\" for " + show.apData.name)
									let unknownStatus = create("p",false, "Unknown status \"" + show.apData.status + "\" for " + show.apData.name, false, "color: rgba(var(--color-orange), .8)")
									missingList.insertBefore(unknownStatus, missingList.firstChild)
									exportErrors.style.display = "inline"
									resultsStatus.innerText = index + 1 === shows.length ? `Import completed !\n${importSuccess} of ${shows.length} entries successfully imported.`
										: `Importing : ${index + 1} of ${shows.length} entries. Closing this tab will stop the import.\n${importSuccess} of ${shows.length} entries successfully imported.`
									return;
								}
								let score = 0;
								if(!show.isAnthology){
									score = show.apData.rating*2;
									if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_100"){
										score = show.apData.rating*20;
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_5"){
										score = Math.floor(show.apData.rating);
										if(show.apData.rating === 0.5){
											score = 1
										}
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_3"){
										if(show.apData.rating === 0){
											score = 0
										}
										else if(show.apData.rating < 2.5){
											score = 1
										}
										else if(show.apData.rating < 4){
											score = 2
										}
										else{
											score = 3
										}
									}
								}
								let progress = 0;
								let progressVolumes = 0;
								let repeat = 0;
								if(show.isAnthology){
									progress = show.apData.length
								}
								else{
									repeat = Math.max(0,show.apData.times - 1) || 0;
									if(status === "DROPPED" || status === "PAUSED" || status === "CURRENT"){
										if(type === "anime"){
											progress = show.apData.eps
										}
										else{
											progress = show.apData.ch
										}
									}
								}
								if(type === "manga"){
									progressVolumes = show.apData.vol
								}
								if(progress || progressVolumes){
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$progress: Int,
											$progressVolumes: Int,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												progress: $progress,
												progressVolumes: $progressVolumes,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: selectedValues[show.apData.name],
											status: status,
											score: score,
											progress: progress,
											progressVolumes: progressVolumes,
											repeat: repeat
										},
										data => {
											if(data.errors){
												const title = show.titles.find(element => element.id === selectedValues[show.apData.name]).title
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + title + "\n"
											}
										}
									)
								}
								else{
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: selectedValues[show.apData.name],
											status: status,
											score: score,
											repeat: repeat
										},
										data => {
											if(data.errors){
												const title = show.titles.find(element => element.id === selectedValues[show.apData.name]).title
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + title +  "\n"
											}
										}
									)
								}
								importSuccess += 1
								resultsStatus.innerText = index + 1 === shows.length ? `Import completed !\n${importSuccess} of ${shows.length} entries successfully imported.`
									: `Importing : ${index + 1} of ${shows.length} entries. Closing this tab will stop the import.\n${importSuccess} of ${shows.length} entries successfully imported.`
							};
							mutater(shows[0],0);
						})
					};
				},2000);
			});
			bigQuery = [];
			myFastMappings.forEach(function(entry){
				bigQuery.push({
					query: `query($id:Int){Media(type:${type.toUpperCase()},id:$id){title{romaji english native} id format coverImage{medium}}}`,
					variables: {id: entry.id},
					callback: function(dat){
						const media =  dat.data.Media
						const titles = [{title: media.title.romaji,id: entry.id,levDistance: 0,format: media.format,cover: media.coverImage.medium}]
						if(entry.isAnthology){
							let show = {
								apData: entry.entries,
								directMapping: true,
								isAnthology: true,
								aniData: media,
								titles: titles
							}
							shows.push(show);
							drawShows();
						}
						else{
							let show = {
								apData: entry.entries[0],
								directMapping: true,
								aniData: media,
								titles: titles
							}
							shows.push(show);
							drawShows();
						}
					}
				})
			});
			queryPacker(bigQuery);
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	apAnimeInput.onchange = function(){
		apImport("anime",apAnimeInput.files[0])
	}
	apMangaInput.onchange = function(){
		apImport("manga",apMangaInput.files[0])
	}
	create("hr","hohSeparator",false,target,"margin-bottom: 40px;");
	let userNameContainer = create("div",false,false,target,"margin-bottom: 20px;");
	let userNameLabel = create("span",false,"User: ",userNameContainer);
	let userName = create("input","hohNativeInput",false,userNameContainer);
	userName.value = whoAmI;
	
	let alAnimeExp = create("div",["section","hohImport"],false,target);
	create("h2",false,"AniList: Export Anime List",alAnimeExp);
	let alAnimeButton = create("button",["button","hohButton"],"Export Anime",alAnimeExp);
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
			{name: userName.value},
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
				saveAs(data.data,"AnilistAnimeList.json");
			}
		);
	}
	create("h2",false,"AniList: Export Manga List",alAnimeExp,"margin-top:20px;");
	let alMangaButton = create("button",["button","hohButton"],"Export Manga",alAnimeExp);
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
			{name: userName.value},
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
				saveAs(data.data,"AnilistMangaList.json");
			}
		);
	};
	let malExport = function(data,type){//maybe some time? But there's always malscraper, which does it better
		let xmlContent = "";
		saveAs(xmlContent,type.toLowerCase() + "list_0_-_0.xml",true);
	}
	let alAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Anime List",alAnime);
	let alAnimeCheckboxContainer = create("label","el-checkbox",false,alAnime,"display:none;");
	let alAnimeOverwrite = createCheckbox(alAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",alAnimeCheckboxContainer);
	let alAnimeDropzone = create("div","dropbox",false,alAnime);
	let alAnimeInput = create("input","input-file",false,alAnimeDropzone);
	let alAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",alAnimeDropzone);
	alAnimeInput.type = "file";
	alAnimeInput.name = "json";
	alAnimeInput.accept = "application/json";
	let alManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Manga List",alManga);
	let alMangaCheckboxContainer = create("label","el-checkbox",false,alManga,"display:none;");
	let alMangaOverwrite = createCheckbox(alMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",alMangaCheckboxContainer);
	let alMangaDropzone = create("div","dropbox",false,alManga);
	let alMangaInput = create("input","input-file",false,alMangaDropzone);
	let alMangaDropText = create("p",false,"Drop list JSON file here or click to upload",alMangaDropzone);
	alMangaInput.type = "file";
	alMangaInput.name = "json";
	alMangaInput.accept = "application/json";
	let resultsAreaAL = create("div","importResults",false,target);
	let resultsErrorsAL = create("div",false,false,resultsAreaAL,"color:red;padding:5px;");
	let resultsWarningsAL = create("div",false,false,resultsAreaAL,"color:orange;padding:5px;");
	let resultsStatusAL = create("div",false,false,resultsAreaAL,"padding:5px;");
	let pushResultsAL = create("button",["hohButton","button"],"Import all",resultsAreaAL,"display:none;");
	let resultsTableAL = create("div",false,false,resultsAreaAL);
	let alImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrorsAL.innerText = "error parsing JSON";
			}
			if(Object.prototype.hasOwnProperty.call(data, "user")){
				resultsErrorsAL.innerText = "This is the Anilist JSON importer, but you uploaded a GDPR JSON file. You either uploaded the wrong file, or ment to use the importer further down the page.";
				return;
			}
			if(parseFloat(data.version) > 1){//was not part of 1.00
				if(data.type !== type.toUpperCase()){
					resultsErrorsAL.innerText = "error wrong list type";
					return;
				}
			}
//
			if(data.User.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarningsAL.innerText = "List for \"" + data.User.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.timeStamp)) > 1000*86400*30){
				resultsWarningsAL.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.timeStamp)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			if(!useScripts.accessToken){
				resultsWarningsAL.innerText += "\nNot signed in to the script! Can't do any changes to your list then. Go to the bottom of the settings > apps page to sign in"
			}
			resultsStatusAL.innerText = "Calculating list differences...";
			if((type === "anime" && alAnimeOverwrite.checked) || (type === "manga" && alMangaOverwrite.checked)){
				alert("Haven't gotten around to support overwriting yet, sorry!")
			}
			else{
				authAPIcall(
					`query($name:String!,$listType:MediaType){
						Viewer{name mediaListOptions{scoreFormat}}
						MediaListCollection(userName:$name,type:$listType){
							lists{
								entries{mediaId}
							}
						}
					}`,
					{
						name: whoAmI,
						listType: type.toUpperCase()
					},
					data2 => {
						if(!data2){
							resultsErrorsAL.innerText = "Could not access the list of " + whoAmI + " do you have persmission to modify this list? (try signing in at settings > apps, scroll down to the bottom)";
							return
						}
						if(data2.data.Viewer.name !== whoAmI){
							alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data2.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Automail's permissions, and sign in with the script again to fix this.");
							return
						}
						let existing = new Set(data2.data.MediaListCollection.lists.map(list => list.entries).flat().map(entry => entry.mediaId));
						let dataList = returnList({data: data},true);
						let already = dataList.filter(entry => existing.has(entry.mediaId)).length;
						let notAlready = dataList.filter(entry => !existing.has(entry.mediaId));
						resultsStatusAL.innerText += "\n" + already + " of " + dataList.length + " entries already on list. Not modifying";
						if(notAlready.length > 0){
							resultsStatusAL.innerText += "\nThe " + notAlready.length + " entries below will be added:";
							pushResultsAL.style.display = "inline";
							notAlready.forEach(show => {
								let row = create("p",false,false,resultsTableAL);
								create("a",false,show.media.title.romaji,row)
									.href = "https://anilist.co/" + type + "/" + show.mediaId
							});
							pushResultsAL.onclick = function(){
								pushResultsAL.style.display = "none";



							let mutater = function(show,index){
								if(index + 1 < notAlready.length){
									setTimeout(function(){
										mutater(notAlready[index + 1],index + 1);
									},1000);
								}
								try{
									authAPIcall(
										`mutation($startedAt: FuzzyDateInput,$completedAt: FuzzyDateInput,$notes: String){
											SaveMediaListEntry(
												mediaId: ${show.mediaId},
												status: ${show.status},
												score: ${show.score},
												progress: ${show.progress},
												progressVolumes: ${show.progressVolumes || 0},
												repeat: ${show.repeat},
												priority: ${show.priority},
												notes: $notes,
												startedAt: $startedAt,
												completedAt: $completedAt
											){id}
										}`,
										{
											startedAt: show.startedAt,
											completedAt: show.completedAt,
											notes: show.notes
										},
										data => {}
									)
								}
								catch(e){
									resultsWarningsAL.innerText += "\nAn error occured for mediaID " + show.mediaID;
								}
								resultsStatusAL.innerText = (index + 1) + " of " + notAlready.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(notAlready[0],0);



							}
						}
					}
				)
			}
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	alAnimeInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("anime",alAnimeInput.files[0])
	}
	alMangaInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("manga",alMangaInput.files[0])
	}

	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let gdpr_import = create("div",["section","hohImport"],false,target);
	create("h2",false,"GDPR data: Import lists",gdpr_import);
	let gdpr_importCheckboxContainer = create("label","el-checkbox",false,gdpr_import);
	let gdpr_importOverwrite = createCheckbox(gdpr_importCheckboxContainer);
	create("span","el-checkbox__label","Overwrite entries already on my list (only overwrite mode implemented so far)",gdpr_importCheckboxContainer);
	let gdpr_importDropzone = create("div","dropbox",false,gdpr_import);
	let gdpr_importInput = create("input","input-file",false,gdpr_importDropzone);
	let gdpr_importDropText = create("p",false,"Drop GDPR JSON file here or click to upload",gdpr_importDropzone);
	gdpr_importInput.type = "file";
	gdpr_importInput.name = "json";
	gdpr_importInput.accept = "application/json";

	let resultsAreaGDPR = create("div","importResults",false,target);
	let resultsErrorsGDPR = create("div",false,false,resultsAreaGDPR,"color:red;padding:5px;");
	let resultsWarningsGDPR = create("div",false,false,resultsAreaGDPR,"color:orange;padding:5px;");
	let resultsStatusGDPR = create("div",false,false,resultsAreaGDPR,"padding:5px;");
	let pushResultsGDPR = create("button",["hohButton","button"],"Import all",resultsAreaGDPR,"display:none;");
	let resultsTableGDPR = create("div",false,false,resultsAreaGDPR);

	gdpr_importInput.onchange = function(){
		let file = gdpr_importInput.files[0];
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		resultsStatusGDPR.innerText = "Loading GDPR JSON file...";
		reader.onload = function(evt){
			resultsStatusGDPR.innerText = "";
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){

				resultsErrorsGDPR.innerText = "error parsing JSON";
				return
			}
			if(Object.prototype.hasOwnProperty.call(data, "User")){
				resultsErrorsAL.innerText = "This is the GDPR JSON importer, but you uploaded a Anilist JSON file. You either uploaded the wrong file, or ment to use the importer further up the page.";
				return
			}
			if(data.user.display_name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarningsGDPR.innerText = "List for \"" + data.user.display_name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if(!useScripts.accessToken){
				resultsWarningsGDPR.innerText += "\nNot signed in to the script! Can't do any changes to your lists then. Go to the bottom of the settings > apps page to sign in"
			}

			if(!gdpr_importOverwrite.checked){
				gdpr_importOverwrite.onclick = function(){
					alert("Non-overwrite mode already selected! Reload this page to start the import in another mode\n(Starting the import now WILL NOT overwrite existing list entries)")
				}
				resultsStatusGDPR.innerText = "Loading anime list...";
				authAPIcall(
					`query($name: String,$listType: MediaType){
						Viewer{name mediaListOptions{scoreFormat}}
						MediaListCollection(userName: $name, type: $listType){
							lists{
								entries{
									mediaId
								}
							}
						}
					}`,
					{
						listType: "ANIME",
						name: whoAmI
					},
					function(dataAnime){
						resultsStatusGDPR.innerText = "";
						if(!dataAnime){
							resultsErrorsGDPR.innerText = "An error occured while loading your anime list";
							return;
						}
						if(dataAnime.data.Viewer.name !== whoAmI){
							alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Automail's permissions, and sign in with the scirpt again to fix this.");
							return;
						}
						let listAnime = new Set(returnList(dataAnime,true).map(a => a.mediaId));
						resultsStatusGDPR.innerText = "Loading manga list...";
						authAPIcall(
							`query($name: String,$listType: MediaType){
								Viewer{name mediaListOptions{scoreFormat}}
								MediaListCollection(userName: $name, type: $listType){
									lists{
										entries{
											mediaId
										}
									}
								}
							}`,
							{
								listType: "MANGA",
								name: whoAmI
							},
							function(dataManga){
								resultsStatusGDPR.innerText = "";
								if(!dataManga){
									resultsErrorsGDPR.innerText = "An error occured while loading your manga list";
									return;
								}
								let listManga = new Set(returnList(dataManga,true).map(a => a.mediaId));

								pushResultsGDPR.style.display = "inline";
								let filtered_list = data.lists.filter(a => !(listAnime.has(a.series_id) || listManga.has(a.series_id)));
								resultsTableGDPR.innerText = filtered_list.length + " list items will be imported (" + (data.lists.length - filtered_list.length) + " items already on list will not be imported).\nEstimated time to import: " + Math.ceil(filtered_list.length/60) + " minutes.\nBrowsing Anilist while the import is running is not recommended.\nClosing this tab will immediately stop the import.";
								resultsTableGDPR.style.marginTop = "10px";

								let mutater = function(index){
									if(index + 1 < filtered_list.length){
										setTimeout(function(){
											mutater(index + 1);
										},1000);
									}
									try{
										let show = filtered_list[index];
										authAPIcall(
											`mutation($startedAt: FuzzyDateInput,$completedAt: FuzzyDateInput,$notes: String){
												SaveMediaListEntry(
													mediaId: ${show.series_id},
													status: ${["CURRENT","PLANNING","COMPLETED","DROPPED","PAUSED","REPEATING"][show.status]},
													score: ${show.score},
													progress: ${show.progress},
													progressVolumes: ${show.progress_volume || 0},
													repeat: ${show.repeat},
													priority: ${show.priority},
													notes: $notes,
													startedAt: $startedAt,
													completedAt: $completedAt
												){id}
											}`,
											{
												startedAt: {
													year: parseInt((show.started_on + "").slice(0,4)),
													month: parseInt((show.started_on + "").slice(4,6)),
													day: parseInt((show.started_on + "").slice(6,8)) 
												},
												completedAt: {
													year: parseInt((show.finished_on + "").slice(0,4)),
													month: parseInt((show.finished_on + "").slice(4,6)),
													day: parseInt((show.finished_on + "").slice(6,8)) 
												},
												notes: show.notes
											},
											data => {
												if(!data){
													throw "expected API to return ID"
												}
											}
										)
									}
									catch(e){
										resultsWarningsGDPR.innerText += "\nAn error occured for mediaID " + filtered_list[index].series_id + ": " + e
									}
									resultsStatusGDPR.innerText = (index + 1) + " of " + filtered_list.length + " entries imported"
								};
								pushResultsGDPR.onclick = function(){
									mutater(0)
								}
							}
						)
					}
				)
			}
			else{
				gdpr_importOverwrite.onclick = function(){
					alert("Overwrite mode already selected! Reload this page to start the import in another mode\n(Starting the import now WILL overwrite existing list entries!!!)")
				}
				pushResultsGDPR.style.display = "inline";
				resultsTableGDPR.innerText = data.lists.length + " list items will be imported.\nEstimated time to import: " + Math.ceil(data.lists.length/60) + " minutes.\nBrowsing Anilist while the import is running is not recommended.\nClosing this tab will immediately stop the import.";
				resultsTableGDPR.style.marginTop = "10px";

				let mutater = function(index){
					if(index + 1 < data.lists.length){
						setTimeout(function(){
							mutater(index + 1);
						},1000);
					}
					try{
						let show = data.lists[index];
						authAPIcall(
							`mutation($startedAt: FuzzyDateInput,$completedAt: FuzzyDateInput,$notes: String){
								SaveMediaListEntry(
									mediaId: ${show.series_id},
									status: ${["CURRENT","PLANNING","COMPLETED","DROPPED","PAUSED","REPEATING"][show.status]},
									score: ${show.score},
									progress: ${show.progress},
									progressVolumes: ${show.progress_volume || 0},
									repeat: ${show.repeat},
									priority: ${show.priority},
									notes: $notes,
									startedAt: $startedAt,
									completedAt: $completedAt
								){id}
							}`,
							{
								startedAt: {
									year: parseInt((show.started_on + "").slice(0,4)),
									month: parseInt((show.started_on + "").slice(4,6)),
									day: parseInt((show.started_on + "").slice(6,8)) 
								},
								completedAt: {
									year: parseInt((show.finished_on + "").slice(0,4)),
									month: parseInt((show.finished_on + "").slice(4,6)),
									day: parseInt((show.finished_on + "").slice(6,8)) 
								},
								notes: show.notes
							},
							data => {
								if(!data){
									throw "expected API to return ID"
								}
							}
						)
					}
					catch(e){
						resultsWarningsGDPR.innerText += "\nAn error occured for mediaID " + data.lists[index].series_id + ": " + e
					}
					resultsStatusGDPR.innerText = (index + 1) + " of " + data.lists.length + " entries imported"
				};
				pushResultsGDPR.onclick = function(){
					mutater(0)
				}
			}
		}
	}
}
