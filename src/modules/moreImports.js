function moreImports(){
	if(document.URL !== "https://anilist.co/settings/import"){
		return
	}
	let target = document.querySelector(".content .import");
	if(!target){
		setTimeout(moreImports,200);
		return;
	};
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let apAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Anime List",apAnime);
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
	let pushResults = create("button",["hohButton","button"],"Import all selected",resultsArea,"display:none;");
	let resultsTable = create("div",false,false,resultsArea);
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
				removeChildren(resultsTable)
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
					let aniEntry = create("div","hohImportEntry",false,row,"margin-left:50px");
					let aniLink = create("a",["link","newTab"],show.titles[0].title,aniEntry);
					aniLink.href = "/" + type + "/" + show.titles[0].id;
					let button = createCheckbox(row);
					row.style.backgroundColor = "hsl(" + (120 - Math.min(show.titles[0].levDistance,12)*10) + ",30%,50%)";
					if(show.titles[0].levDistance > 8){
						button.checked = false;
						show.toImport = false;
					}
					else{
						button.checked = true;
						show.toImport = true;
					}
					button.oninput = function(){
						show.toImport = button.checked
					}
				})
			};
			const apAnthologies = {
				"The Dragon Dentist": 20947,
				"Hill Climb Girl": 20947,
				"20min Walk From Nishi-Ogikubo Station": 20947,
				"Collection of Key Animation Films": 20947,
				"(Making of) Evangelion: Another Impact": 20947,
				"Sex and Violence with Mach Speed": 20947,
				"Memoirs of Amorous Gentlemen": 20947,
				"Denkou Choujin Gridman: boys invent great hero": 20947,
				"Evangelion: Another Impact": 20947,
				"Bureau of Proto Society": 20947,
				"Cassette Girl": 20947,
				"Bubu & Bubulina": 20947,
				"I can Friday by day!": 20947,
				"Three Fallen Witnesses": 20947,
				"Robot on the Road": 20947,
				"Comedy Skit 1989": 20947,
				"Power Plant No.33": 20947,
				"Me! Me! Me! Chronic": 20947,
				"Endless Night": 20947,
				"Neon Genesis IMPACTS": 20947,
				"Obake-chan": 20947,
				"Hammerhead": 20947,
				"Girl": 20947,
				"Yamadeloid": 20947,
				"Me! Me! Me!": 20947,
				"Ibuseki Yoruni": 20947,
				"Rapid Rouge": 20947,
				"Tomorrow from there": 20947,
				"The Diary of Ochibi": 20947,
				"until You come to me.": 20947,
				"Tsukikage no Tokio": 20947,
				"Carnage": 20947,
				"Iconic Field": 20947,
				"The Ultraman (2015)": 20947,
				"Kanoun": 20947,
				"Ragnarok": 20947,
				"Death Note Rewrite 1: Visions of a God": 2994,
				"Death Note Rewrite 2: L's Successors": 2994,
			}
			const apMappings = {
				"Rebuild of Evangelion: Final": 3786,
				"KonoSuba – God’s blessing on this wonderful world!! Movie: Legend of Crimson": 102976,
				"Puella Magi Madoka Magica: Magica Quartet x Nisioisin": 20891,
				"Kanye West: Good Morning": 8626,
				"Patlabor 2: The Movie": 1096,
				"She and Her Cat": 1004,
				"Star Blazers: Space Battleship Yamato 2199": 12029,
				"Digimon Season 3: Tamers": 874,
				"The Anthem of the Heart": 20968,
				"Digimon Movie 1: Digimon Adventure": 2961,
				"Love, Chunibyo & Other Delusions!: Sparkling... Slapstick Noel": 16934,
				"The Labyrinth of Grisaia Special": 21312,
				"Candy Boy EX01": 5116,
				"Candy Boy EX02": 6479,
				"Attack on Titan 3rd Season": 99147,
				"Attack on Titan 2nd Season": 20958,
				"Nichijou - My Ordinary Life: Episode 0": 8857,
				"March Comes in like a Lion 2nd Season": 98478,
				"KonoSuba – God’s blessing on this wonderful world!! 2 OVA": 97996,
				"KonoSuba – God’s blessing on this wonderful world!! OVA": 21574,
				"Laid-Back Camp Specials": 101206,
				"Spice and Wolf II OVA": 6007,
				"Mob Psycho 100 Specials": 102449
			}
			let bigQuery = [];
			let myFastMappings = [];
			data.entries.forEach(function(entry,index){
				if(entry.status === "won't watch"){
					return
				};
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
				if(apMappings[entry.name]){
					myFastMappings.push({
						entries: [entry],
						id: apMappings[entry.name]
					})
					return;
				}
				bigQuery.push({
					query: `query($search:String){Page(perPage:3){media(type:${type.toUpperCase()},search:$search){title{romaji english native} id synonyms}}}`,
					variables: {search: entry.name},
					callback: function(dat){
						let show = {
							apData: entry,
							aniData: dat.data.Page.media
						}
						show.titles = [];
						show.aniData.forEach(function(hit){
							show.titles.push({
								title: hit.title.romaji,
								id: hit.id,
								levDistance: Math.min(
									levDist(show.apData.name,hit.title.romaji),
									levDist(show.apData.name,hit.title.romaji.toUpperCase()),
									levDist(show.apData.name,hit.title.romaji.toLowerCase())
								)
							});
							if(hit.title.native){
								show.titles.push({
									title: hit.title.native,
									id: hit.id,
									levDistance: levDist(show.apData.name,hit.title.native)
								});
							}
							if(hit.title.english){
								show.titles.push({
									title: hit.title.english,
									id: hit.id,
									levDistance: Math.min(
										levDist(show.apData.name,hit.title.english),
										levDist(show.apData.name,hit.title.english.toUpperCase()),
										levDist(show.apData.name,hit.title.english.toLowerCase())
									)
								});
							}
							hit.synonyms.forEach(
								synonym => show.titles.push({
									title: synonym,
									id: hit.id,
									levDistance: levDist(show.apData.name,synonym)
								})
							)
						});
						show.titles.sort(
							(a,b) => a.levDistance - b.levDistance
						);
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
							alert("Not signed in to the script. Can't do any changes to your list\n Go to settings > apps to sign in");
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
								alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the scirpt again to fix this.");
								return;
							};
							let list = returnList(data,true).map(a => a.mediaId);
							shows = shows.filter(function(show){
								if(!show.toImport){
									return false;
								}
								if(type === "anime"){
									if(!apAnimeOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								else{
									if(!apMangaOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								return true;
							});
							if(!shows.length){
								return;
							};
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
									console.log("Unknown status: " + show.apData.status);
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
									};
								};
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
								if(progress){
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
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											progress: progress,
											progressVolumes: progressVolumes,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title + "\n"
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
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title +  "\n"
											}
										}
									)
								}
								resultsStatus.innerText = (index + 1) + " of " + shows.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(shows[0],0);
						})
					};
				},2000);
			});
			bigQuery = [];
			myFastMappings.forEach(function(entry){
				bigQuery.push({
					query: `query($id:Int){Media(type:${type.toUpperCase()},id:$id){title{romaji english native} id}}`,
					variables: {id: entry.id},
					callback: function(dat){
						if(entry.isAnthology){
							let show = {
								apData: entry.entries,
								directMapping: true,
								isAnthology: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
							}
							shows.push(show);
							drawShows();
						}
						else{
							let show = {
								apData: entry.entries[0],
								directMapping: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
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
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
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
			{name: whoAmI},
			function(data){
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
			{name: whoAmI},
			function(data){
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
				resultsWarningsAL.innerText += "\nNot singned in to the script! Can't do any changes to your list then. Go to the bottom of the settings > apps page to sign in"
			}
			resultsStatusAL.innerText = "Calculating list differences...";
			if((type === "anime" && alAnimeOverwrite.checked) || (type === "manga" && alMangaOverwrite.checked)){
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
							return;
						}
						if(data2.data.Viewer.name !== whoAmI){
							alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data2.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the script again to fix this.");
							return
						};
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
}
