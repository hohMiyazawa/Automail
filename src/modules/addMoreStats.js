exportModule({
	id: "moreStats",
	description: "$setting_moreStats",
	extendedDescription: `
On every users' stats page, there will be an additonal tab called "more stats".
The "more stats" page also has a section for running various statistical queries about the site or specific users.

There will also be a tab called "Genres & Tags", which contains aggregate stats for anime and manga.

In addition, the individual sections for anime/manga staff and tags will have full tables not limited to the default 30.
In these tables, you can click the rows to see the individual works contributing to the stats.
	`,
	isDefault: true,
	importance: 9,
	categories: ["Stats"],
	visible: true
})

function addMoreStats(){
	if(!document.URL.match(/\/stats\/?/)){
		return
	}
	if(document.querySelector(".hohStatsTrigger")){
		return
	}
	let filterGroup = document.querySelector(".filter-wrap");
	if(!filterGroup){
		setTimeout(function(){
			addMoreStats()
		},200);//takes some time to load
		return;
	}
	let hohStats;
	let hohGenres;
	let regularFilterHeading;
	let regularGenresTable;
	let regularTagsTable;
	let regularAnimeTable;
	let regularMangaTable;
	let animeStaff;
	let mangaStaff;
	let animeStudios;
	let hohStatsTrigger = create("span","hohStatsTrigger",translate("$stats_moreStats_title"),filterGroup);
	let hohGenresTrigger = create("span","hohStatsTrigger",translate("$stats_genresTags_title"),filterGroup);
	let hohSiteStats = create("a","hohStatsTrigger",translate("$stats_siteStats_title"),filterGroup);
	hohSiteStats.href = "/site-stats";
	cheapReload(hohSiteStats,{name: "SiteStats"});
	let generateStatPage = async function(){
		let personalStats = create("div","#personalStats",translate("$stats_loadingAnime"),hohStats);
		let personalStatsManga = create("div","#personalStatsManga",translate("$stats_loadingManga"),hohStats);
		let miscQueries = create("div","#miscQueries",false,hohStats);
		create("hr","hohSeparator",false,miscQueries);
		create("h1","hohStatHeading",translate("$stats_varousStats_heading"),miscQueries);
		let miscInput = create("div",false,false,miscQueries,"padding-top:10px;padding-bottom:10px;");
		let miscOptions = create("div","#queryOptions",false,miscQueries);
		let miscResults = create("div","#queryResults",false,miscQueries);
		let nameContainer = document.querySelector(".banner-content h1.name");
		let user;
		if(nameContainer){
			user = nameContainer.innerText
		}
		else{
			user = decodeURIComponent(document.URL.match(/user\/(.+)\/stats\/?/)[1])
		}
		const loginMessage = "Requires being signed in to the script. You can do that at the bottom of the settings page https://anilist.co/settings/apps";
		let statusSearchCache = [];
		let availableQueries = [
			m4_include(queries/queries.js)
		];
		let miscInputSelect = create("select",false,false,miscInput);
		let miscInputButton = create("button",["button","hohButton"],translate("$button_run"),miscInput);
		availableQueries.forEach(que => {
			create("option",false,que.name,miscInputSelect).value = que.name
		});
		miscInputSelect.oninput = function(){
			miscOptions.innerText = "";
			let relevant = availableQueries.find(que => que.name === miscInputSelect.value);
			miscResults.innerText = "";
			if(relevant.setup){
				relevant.setup()
			}
		};
		miscInputButton.onclick = function(){
			miscResults.innerText = translate("$loading");
			availableQueries.find(que => que.name === miscInputSelect.value).code()
		}

		let customTagsCollection = function(list,title,fields){
			let customTags = new Map();
			let regularTags = new Map();
			let customLists = new Map();
			(
				JSON.parse(localStorage.getItem("regularTags" + title)) || []
			).forEach(
				tag => regularTags.set(tag,{
					name : tag,
					list : []
				})
			);
			customLists.set("Not on custom list",{name: "Not on custom list",list: []});
			customLists.set("All media",{name: "All media",list: []});
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				if(media.notes){
					(
						media.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					});
					(//candidates for multi word tags, which we try to detect even if they are not allowed
						media.notes.match(/(#\S+ [^#]\S+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					})
				}
				media.media.tags.forEach(mediaTag => {
					if(regularTags.has(mediaTag.name)){
						regularTags.get(mediaTag.name).list.push(item)
					}
				});
				if(media.isCustomList){
					media.listLocations.forEach(location => {
						if(!customLists.has(location)){
							customLists.set(location,{name: location,list: []})
						}
						customLists.get(location).list.push(item)
					})
				}
				else if(useScripts.negativeCustomList){
					customLists.get("Not on custom list").list.push(item)
				}
				if(useScripts.globalCustomList){
					customLists.get("All media").list.push(item)
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			else{
				for(let [key,value] of customTags){//filter our multi word candidates
					if(key.includes(" ")){
						if(value.list.length === 1){//if it's just one of them, the prefix tag takes priority
							customTags.delete(key)
						}
						else{
							let prefix = key.split(" ")[0];
							if(customTags.has(prefix)){
								if(customTags.get(prefix).list.length === value.list.length){
									customTags.delete(prefix)
								}
								else{
									customTags.delete(key)
								}
							}
						}
					}
				}
				for(let [key,value] of customTags){//fix the basic casing error, like #shoujo vs #Shoujo. Will only merge if one is of length 1
					if(key[1] === key[1].toUpperCase()){
						let lowerCaseKey = "#" + key[1].toLowerCase() + key.slice(2);
						let lowerCaseValue = customTags.get(lowerCaseKey);
						if(lowerCaseValue){
							if(value.list.length === 1){
								lowerCaseValue.list = lowerCaseValue.list.concat(value.list);
								customTags.delete(key)
							}
							else if(lowerCaseValue.list.length === 1){
								value.list = value.list.concat(lowerCaseValue.list);
								customTags.delete(lowerCaseKey)
							}
						}
					}
				}
			}
			if(!customLists.get("Not on custom list").list.length){
				customLists.delete("Not on custom list")
			}
			if(!customLists.get("All media").list.length){
				customLists.delete("All media")
			}
			return [...customTags, ...regularTags, ...customLists].map(
				pair => pair[1]
			).map(tag => {
				let amountCount = 0;
				let average = 0;
				tag.list.forEach(item => {
					if(item.score !== 0){
						amountCount++;
						average += item.score;
					}
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key]);
						}
					})
				});
				tag.average = average/amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score);
				return tag;
			}).sort(
				(b,a) => a.list.length - b.list.length || b.name.localeCompare(a.name)
			)
		};
		let regularTagsCollection = function(list,fields,extracter){
			let tags = new Map();
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				extracter(media).forEach(tag => {
					if(useScripts.SFWmode && tag.name === "Hentai"){
						return
					}
					if(!tags.has(tag.name)){
						tags.set(tag.name,{name: tag.name,list: []})
					}
					tags.get(tag.name).list.push(item)
				})
			});
			tags.forEach(tag => {
				tag.amountCount = 0;
				tag.average = 0;
				tag.list.forEach(item => {
					if(item.score){
						tag.amountCount++;
						tag.average += item.score;
					}
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key])
						}
					})
				});
				tag.average = tag.average/tag.amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score)
			});
			return [...tags].map(
				tag => tag[1]
			).sort(
				(b,a) => (a.average*a.amountCount + ANILIST_WEIGHT)/(a.amountCount + 1) - (b.average*b.amountCount + ANILIST_WEIGHT)/(b.amountCount + 1) || a.list.length - b.list.length
			)
		};
		let drawTable = function(data,formatter,tableLocation,isTag,autoHide){
			removeChildren(tableLocation)
			tableLocation.innerText = "";
			let hasScores = data.some(elem => elem.average);
			let header = create("p",false,formatter.title);
			let tableContent = create("div",["table","hohTable"]);
			let headerRow = create("div",["header","row"],false,tableContent);
			let indexAccumulator = 0;
			formatter.headings.forEach(function(heading){
				if(!hasScores && heading === "Mean Score"){
					return
				}
				let columnTitle = create("div",false,heading,headerRow);
				if((heading === "Tag" || heading === translate("$stats_tag")) && !isTag && formatter.isMixed){
					columnTitle.innerText = translate("$stats_genre")
				}
				if(formatter.focus === indexAccumulator){
					columnTitle.innerText += " ";
					columnTitle.appendChild(svgAssets2.angleDown.cloneNode(true))
				}
				columnTitle.index = +indexAccumulator;
				columnTitle.addEventListener("click",function(){
					formatter.focus = this.index;
					data.sort(formatter.sorting[this.index]);
					drawTable(data,formatter,tableLocation,isTag,autoHide)
				});
				indexAccumulator++;
			});
			for(let i=0;i<data.length;i++){
				let row = create("div","row");
				formatter.celData.forEach((celData,index) => {
					if(index === 2 && !hasScores){
						return
					}
					celData(
						create("div",false,false,row),
						data,i,true,isTag
					)
				});
				row.onclick = function(){
					if(this.nextSibling.style.display === "none"){
						this.nextSibling.style.display = "block"
					}
					else{
						this.nextSibling.style.display = "none"
					}
				};
				tableContent.appendChild(row);
				let showList = create("div");

				if(formatter.focus === 1){//sorting by count is meaningless, sort alphabetically instead
					data[i].list.sort(formatter.sorting[0])
				}
				else if(formatter.focus === 2){//average != score
					data[i].list.sort((b,a) => a.score - b.score)
				}
				else if(formatter.focus === -1){//average != score
					//nothing, duh
				}
				else{
					data[i].list.sort(formatter.sorting[formatter.focus]);
				}
				data[i].list.forEach((nil,ind) => {
					let secondaryRow = create("div",["row","hohSecondaryRow"]);
					formatter.celData.forEach(celData => {
						let cel = create("div");
						celData(cel,data[i].list,ind,false,isTag);
						secondaryRow.appendChild(cel)
					});
					showList.appendChild(secondaryRow)
				});
				showList.style.display = "none";
				tableContent.insertBefore(showList,row.nextSibling);
			}
			tableLocation.appendChild(header);
			tableLocation.appendChild(tableContent);
			if(autoHide){
				let tableHider = create("span",["hohMonospace","hohTableHider"],"[-]",header);
				let regularTagsSetting = create("p",false,false,tableLocation);
				let regularTagsSettingLabel = create("span",false,translate("$stats_regularTags"),regularTagsSetting);
				let regularTagsSettingContent = create("span",false,false,regularTagsSetting);
				let regularTagsSettingNew = create("input",false,false,regularTagsSetting);
				let regularTagsSettingAdd = create("button",["hohButton","button"],"+",regularTagsSetting);
				let regularTags = JSON.parse(localStorage.getItem("regularTags" + formatter.title)) || [];
				for(let i=0;i<regularTags.length;i++){
					let tag = create("span","hohRegularTag",false,regularTagsSettingContent);
					let tagContent = create("span",false,regularTags[i],tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = regularTags[i] + "";
					tagCross.addEventListener("click",function(){
						for(let j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						}
						this.parentNode.remove();
					})
				}
				regularTagsSettingAdd.addEventListener("click",function(){
					let newTagName = this.previousSibling.value;
					if(!newTagName){
						return
					}
					newTagName = capitalize(newTagName);
					regularTags.push(newTagName);
					let tag = create("span","hohRegularTag");
					let tagContent = create("span",false,newTagName,tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = newTagName + "";
					tagCross.addEventListener("click",function(){
						for(let j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						}
						this.parentNode.remove();
					});
					this.previousSibling.previousSibling.appendChild(tag);
					localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
				});
				tableHider.onclick = function(){
					if(this.innerText === "[-]"){
						tableHider.innerText = "[+]";
						tableContent.style.display = "none";
						regularTagsSetting.style.display = "none";
						formatter.display = false
					}
					else{
						tableHider.innerText = "[-]";
						tableContent.style.display = "block";
						regularTagsSetting.style.display = "block";
						formatter.display = true
					}
				};
				if(!formatter.display){
					tableHider.innerText = "[+]";
					tableContent.style.display = "none";
					regularTagsSetting.style.display = "none";
				}
			}
		};
		let semaPhoreAnime = false;//I have no idea what "semaphore" means in software
		let semaPhoreManga = false;//but it sounds cool so this is a semaphore
//
		let nativeTagsReplacer = function(){
			if(useScripts.replaceNativeTags === false || semaPhoreAnime === false || semaPhoreManga === false){
				return
			}
			const mixedFields = [
				{
					key : "name",
					method : function(media){
						return titlePicker({
							id: media.mediaId,
							title: media.media.title
						})
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0
							})
						}
						acc[val]++;
						return acc;
					},
					method : media => media.status
				},{
					key : "type",
					method : function(media){
						if(!media.progressVolumes && !(media.progressVolumes === 0)){
							return "ANIME"
						}
						return "MANGA"
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration || 0
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead || 0
				}
			];
			let mixedFormatter = {
				title: "",
				display: true,
				isMixed: true,
				headings: [translate("$stats_tag"),translate("$stats_count"),"Mean Score","Time Watched","Chapters Read"],
				focus: -1,
				anime: true,
				manga: true,
				celData: [
					function(cel,data,index,isPrimary,isTag){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							if(isTag){
								if(mixedFormatter.anime && data[index].list.some(media => media.type === "ANIME")){
									nameCellTag.href = "/search/anime?includedTags=" + data[index].name + "&onList=true";
								}
								else{
									nameCellTag.href = "/search/manga?includedTags=" + data[index].name + "&onList=true"
								}
							}
							else{
								if(mixedFormatter.anime && data[index].list.some(media => media.type === "ANIME")){
									nameCellTag.href = "/search/anime?includedGenres=" + data[index].name + "&onList=true"
								}
								else{
									nameCellTag.href = "/search/manga?includedGenres=" + data[index].name + "&onList=true"
								}
								if(data[index].name === "Hentai"){
									nameCellTag.href += "&adult=true"
								}
							}
							let nameCellStatus = create("span","hohSummableStatusContainer",false,cel);
							semmanticStatusOrder.forEach(function(status){
								if(data[index].status[status]){
									let statusSumDot = create("div","hohSummableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(statusTypes[status]);
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(child => {
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							let nameCellTag = create("a",["title","hohNameCel"],data[index].name,cel);
							if(data[index].type === "ANIME"){
								nameCellTag.href = "/anime/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-blue))"
							}
							else{
								nameCellTag.href = "/manga/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-green))"
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true))
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = (data[index].average).roundPlaces(1) || "-"
						}
						else{
							cel.innerText = (data[index].score).roundPlaces(1) || "-"
						}
					},
					function(cel,data,index,isPrimary){
						if(!isPrimary && data[index].type === "MANGA"){
							cel.innerText = "-"
						}
						else if(data[index].duration === 0){
							cel.innerText = "-"
						}
						else if(data[index].duration < 60){
							cel.innerText = Math.round(data[index].duration) + "min"
						}
						else{
							cel.innerText = Math.round(data[index].duration/60) + "h"
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary || data[index].type === "MANGA"){
							cel.innerText = data[index].chaptersRead;
						}
						else{
							cel.innerText = "-"
						}
					}
				],
				sorting : [
					ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.chaptersRead - b.chaptersRead
				]
			};
			let collectedMedia = semaPhoreAnime.concat(semaPhoreManga);
			let listOfTags = regularTagsCollection(collectedMedia,mixedFields,media => media.media.tags);
			if(!document.URL.match(/\/stats/)){
				return
			}
			let drawer = function(){
				if(regularFilterHeading.children.length === 0){
					let filterWrap = create("div",false,false,regularFilterHeading);
					create("p",false,"tip: click a row to show individual media entries",regularFilterHeading);
					let filterLabel = create("span",false,translate("$filters"),filterWrap);
					let tableHider = create("span",["hohMonospace","hohTableHider"],"[+]",filterWrap);
					let filters = create("div",false,false,filterWrap,"display: none");

					let animeSetting = create("p","hohSetting",false,filters);
					let input_a = createCheckbox(animeSetting);
					input_a.checked = true;
					create("span",false,translate("$generic_anime"),animeSetting);

					let mangaSetting = create("p","hohSetting",false,filters);
					let input_m = createCheckbox(mangaSetting);
					input_m.checked = true;
					create("span",false,translate("$generic_manga"),mangaSetting);

					let minSetting = create("p","hohSetting",false,filters);
					let min_s_input = create("input","hohNativeInput",false,minSetting,"width: 80px;margin-right: 10px;");
					min_s_input.type = "number";
					min_s_input.min = 0;
					min_s_input.max = 100;
					min_s_input.step = 1;
					min_s_input.value = 0;
					create("span",false,"Minimum rating",minSetting);

					let minEpisodeSetting = create("p","hohSetting",false,filters);
					let min_e_input = create("input","hohNativeInput",false,minEpisodeSetting,"width: 80px;margin-right: 10px;");
					min_e_input.type = "number";
					min_e_input.min = 0;
					min_e_input.step = 1;
					min_e_input.value = 0;
					create("span",false,"Minimum episode progress",minEpisodeSetting);

					let minChapterSetting = create("p","hohSetting",false,filters);
					let min_c_input = create("input","hohNativeInput",false,minChapterSetting,"width: 80px;margin-right: 10px;");
					min_c_input.type = "number";
					min_c_input.min = 0;
					min_c_input.step = 1;
					min_c_input.value = 0;
					create("span",false,"Minimum chapter progress",minChapterSetting);

					let statusFilter = {};
					create("p",false,"Status",filters);
					let statusLine = create("p","hohSetting",false,filters);
					Object.keys(statusTypes).sort().forEach(key => {
						statusFilter[key] = true;
						let input_status = createCheckbox(statusLine);
						input_status.checked = true;
						create("span",false,capitalize(statusTypes[key]),statusLine,"margin-right: 20px");
						input_status.onchange = function(){
							statusFilter[key] = input_status.checked
						}
					})

					let formatFilter = {};
					create("p",false,"Format",filters);
					let formatLine_a = create("p","hohSetting",false,filters);
					let formatLine_m = create("p","hohSetting",false,filters);
					Object.keys(distributionFormats).forEach(key => {
						formatFilter[key] = true;
						let input_format;
						if(["MANGA","NOVEL","ONE_SHOT"].includes(key)){
							input_format = createCheckbox(formatLine_m);
							create("span",false,distributionFormats[key],formatLine_m,"margin-right: 20px")
						}
						else{
							input_format = createCheckbox(formatLine_a);
							create("span",false,distributionFormats[key],formatLine_a,"margin-right: 20px")
						}
						input_format.checked = true;
						input_format.onchange = function(){
							formatFilter[key] = input_format.checked
						}
					})

					input_m.onchange = function(){
						if(input_m.checked){
							minChapterSetting.style.opacity = 1;
							formatLine_m.style.opacity = 1;
						}
						else{
							input_a.checked = true;
							minEpisodeSetting.style.opacity = 1;
							minChapterSetting.style.opacity = 0.5;
							formatLine_m.style.opacity = 0.5;
							formatLine_a.style.opacity = 1;
						}
					}
					input_a.onchange = function(){
						if(input_a.checked){
							minEpisodeSetting.style.opacity = 1;
							formatLine_a.style.opacity = 1;
						}
						else{
							input_m.checked = true;
							minEpisodeSetting.style.opacity = 0.5;
							minChapterSetting.style.opacity = 1;
							formatLine_m.style.opacity = 1;
							formatLine_a.style.opacity = 0.5;
						}
					}

					let applyButton = create("button",["hohButton","button"],translate("$button_submit"),filters);
					applyButton.onclick = function(){
						let base_media = collectedMedia;
						if(!input_a.checked){
							base_media = semaPhoreManga
						}
						else if(!input_m.checked){
							base_media = semaPhoreAnime
						}
						mixedFormatter.anime = input_a.checked;
						mixedFormatter.manga = input_m.checked;
						base_media = base_media.filter(mediaEntry => {
							if(hasOwn(mediaEntry, "progressVolumes")){
								if(mediaEntry.progress < parseInt(min_c_input.value)){
									return false
								}
							}
							else{
								if(mediaEntry.progress < parseInt(min_e_input.value)){
									return false
								}
							}
							return mediaEntry.scoreRaw >= parseInt(min_s_input.value)
								&& statusFilter[mediaEntry.status]
								&& formatFilter[mediaEntry.media.format]
						})
						listOfTags = regularTagsCollection(base_media,mixedFields,media => media.media.tags);
						drawTable(listOfTags,mixedFormatter,regularTagsTable,true);
						drawTable(
							regularTagsCollection(
								base_media,
								mixedFields,
								media => media.media.genres.map(a => ({name: a}))
							),
							mixedFormatter,
							regularGenresTable
						)
					}

					tableHider.onclick = function(){
						if(this.innerText === "[-]"){
							tableHider.innerText = "[+]";
							filters.style.display = "none"
						}
						else{
							tableHider.innerText = "[-]";
							filters.style.display = "block"
						}
					}

				}
				drawTable(listOfTags,mixedFormatter,regularTagsTable,true);
				//recycle most of the formatter for genres
				drawTable(
					regularTagsCollection(
						collectedMedia,
						mixedFields,
						media => media.media.genres.map(a => ({name: a}))
					),
					mixedFormatter,
					regularGenresTable
				);
				hohGenresTrigger.removeEventListener("mouseover",drawer);
			}
			hohGenresTrigger.addEventListener("mouseover",drawer);
			if(hohGenresTrigger.classList.contains("hohActive")){
				drawer()
			}
		};
//get anime list
		let personalStatsCallback = async function(data,filterSettings,onlyStats){
			personalStats.innerText = "";
			create("hr","hohSeparator",false,personalStats);

			let regularFilterHeading = create("div",false,false,personalStats,"margin-bottom: 10px;");
			let filterWrap = create("div",false,false,regularFilterHeading);
			let filterLabel = create("span",false,translate("$filters"),filterWrap);
			let tableHider = create("span",["hohMonospace","hohTableHider"],"[+]",filterWrap);
			let filters = create("div",false,false,filterWrap,"display: none");

			let listFilterHeading = create("p",false,translate("$filters_lists"),filters);
			filterSettings = filterSettings || {
				lists: {}
			};
			data.data.MediaListCollection.lists.forEach(mediaList => {
				let listSetting = create("p","hohSetting",false,filters);
				let listSetting_input = createCheckbox(listSetting);
				if(!hasOwn(filterSettings.lists, mediaList.name) || filterSettings.lists[mediaList.name]){
					listSetting_input.checked = true;
					filterSettings.lists[mediaList.name] = true
				}
				listSetting_input.oninput = function(){
					filterSettings.lists[mediaList.name] = listSetting_input.checked
				}
				create("span",false,mediaList.name,listSetting);
			});

			let applyButton = create("button",["hohButton","button"],translate("$button_submit"),filters);
			applyButton.onclick = function(){
				personalStatsCallback(data,filterSettings,true);
			}

			tableHider.onclick = function(){
				if(this.innerText === "[-]"){
					tableHider.innerText = "[+]";
					filters.style.display = "none"
				}
				else{
					tableHider.innerText = "[-]";
					filters.style.display = "block"
				}
			}

			create("h1","hohStatHeading",translate("$stats_anime_heading",user),personalStats);
			let list = returnList({
				data: {
					MediaListCollection: {
						lists: data.data.MediaListCollection.lists.filter(
							mediaList => filterSettings.lists[mediaList.name]
						)
					}
				}
			});
			let scoreList = list.filter(element => element.scoreRaw);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStats);
				let compatLocation = create("div","#hohCheckCompat",false,personalStats);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = translate("$loading");
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"ANIME",
						data => formatCompat(data,compatLocation,user)
					)
				};
			}
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStats);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					create("span",false,false,newStat)
						.innerText = comment
				}
			};
//first activity
			let oldest = list.filter(
				item => item.startedAt.year
			).map(
				item => item.startedAt
			).sort((b,a) =>
				(a.year < b.year)
				|| (a.year === b.year && a.month < b.month)
				|| (a.year === b.year && a.month === b.month && a.day < b.day)
			)[0];
//scoring stats
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let amount = scoreList.length;
			let sumWeight = 0;
			let sumEntriesWeight = 0;
			let average = 0;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumDuration = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let histogram = new Array(100).fill(0);
			let longestDuration = {
				time: 0,
				name: "",
				status: "",
				rewatch: 0,
				id: 0
			};
			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			list.forEach(item => {
				let entryDuration = (item.media.duration || 1)*(item.progress || 0);//current round
				item.episodes = item.progress || 0;
				if(useScripts.noRewatches && item.repeat){
					entryDuration = Math.max(
						item.progress || 0,
						item.media.episodes || 1,
					) * (item.media.duration || 1);//first round
					item.episodes = Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				else{
					entryDuration += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					) * (item.media.duration || 1);//repeats
					item.episodes += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				if(item.listJSON && item.listJSON.adjustValue){
					item.episodes = Math.max(0,item.episodes + item.listJSON.adjustValue);
					entryDuration = Math.max(0,entryDuration + item.listJSON.adjustValue*(item.media.duration || 1));
				}
				item.watchedDuration = entryDuration;
				sumDuration += entryDuration;
				if(entryDuration > longestDuration.time){
					longestDuration.time = entryDuration;
					longestDuration.name = item.media.title.romaji;
					longestDuration.status = item.status;
					longestDuration.rewatch = item.repeat;
					longestDuration.id = item.mediaId
				}
			});
			scoreList.forEach(item => {
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{
					runLength = 1;
					previouScore = item.scoreRaw
				}
				sumWeight += (item.media.duration || 1) * (item.media.episodes || 0);
				sumEntriesWeight += item.scoreRaw*(item.media.duration || 1) * (item.media.episodes || 0);
				histogram[item.scoreRaw - 1]++
			});
			if(amount){
				average = sumEntries/amount
			}
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2)
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore)
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
//display scoring stats
			addStat(translate("$stats_animeOnList"),list.length);
			addStat(translate("$stats_animeRated"),amount);
			if(amount !== 0){//no scores
				if(amount === 1){
					addStat(translate("$stats_onlyOne"),maxRunLengthScore)
				}
				else{
					addStat(
						translate("$stats_averageScore"),
						average.toPrecision(4)
					);
					addStat(
						translate("$stats_averageScore"),
						(sumEntriesWeight/sumWeight).toPrecision(4),
						translate("$stats_weightComment_duration")
					);
					addStat(translate("$stats_medianScore"),median);
					addStat(
						translate("$stats_globalDifference"),
						publicDifference.roundPlaces(2),
						translate("$stats_globalDifference_comment")
					);
					addStat(
						translate("$stats_globalDeviation"),
						publicDeviation.roundPlaces(2),
						translate("$stats_globalDeviation_comment")
					);
					addStat(
						translate("$stats_ratingEntropy"),
						-histogram.reduce((acc,val) => {
							if(val){
								return acc + Math.log2(val/amount) * val/amount
							}
							return acc
						},0).toPrecision(3),
						translate("$stats_ratingEntropy_comment")
					);
					if(maxRunLength > 1){
						addStat(translate("$stats_mostCommonScore"),maxRunLengthScore, " " + translate("$stats_instances",maxRunLength))
					}
					else{
						addStat(translate("$stats_mostCommonScore"),"",translate("$stats_instances_unique"))
					}
				}
//longest activity
			}
			let singleText = translate("$stats_longestTime",[(100*longestDuration.time/sumDuration).roundPlaces(2),longestDuration.name]) + ". ";
			if(longestDuration.rewatch === 0){
				if(longestDuration.status === "CURRENT"){
					singleText += translate("$stats_longest_watching")
				}
				else if(longestDuration.status === "PAUSED"){
					singleText += translate("$stats_longest_paused")
				}
				else if(longestDuration.status === "DROPPED"){
					singleText += translate("$stats_longest_dropped")
				}
			}
			else{
				if(longestDuration.status === "COMPLETED"){
					if(longestDuration.rewatch === 1){
						singleText += translate("$stats_longest_1rewatch")
					}
					else if(longestDuration.rewatch === 2){
						singleText += translate("$stats_longest_2rewatch")
					}
					else{
						singleText += translate("$stats_longest_Mrewatch",longestDuration.rewatch)
					}
				}
				else if(longestDuration.status === "CURRENT" || status === "REPEATING"){
					if(longestDuration.rewatch === 1){
						singleText += translate("$stats_longest_1rewatching")
					}
					else if(longestDuration.rewatch === 2){
						singleText += translate("$stats_longest_2rewatching")
					}
					else{
						singleText += translate("$stats_longest_Mrewatching",longestDuration.rewatch)
					}
				}
				else if(longestDuration.status === "PAUSED"){
					if(longestDuration.rewatch === 1){
						singleText += translate("$stats_longest_1rewatchPaused")
					}
					else if(longestDuration.rewatch === 2){
						singleText += translate("$stats_longest_2rewatchPaused")
					}
					else{
						singleText += translate("$stats_longest_MrewatchPaused",longestDuration.rewatch)
					}
				}
				else if(longestDuration.status === "DROPPED"){
					if(longestDuration.rewatch === 1){
						singleText += translate("$stats_longest_1rewatchDropped")
					}
					else if(longestDuration.rewatch === 2){
						singleText += translate("$stats_longest_2rewatchDropped")
					}
					else{
						singleText += translate("$stats_longest_MrewatchDropped",longestDuration.rewatch)
					}
				}
			}
			addStat(
				translate("$stats_timeWatched"),
				(sumDuration/(60*24)).roundPlaces(2),
				" " + translate("$time_medium_Mday") + " (" + singleText + ")"
			)
			let TVepisodes = 0;
			let TVepisodesLeft = 0;
			list.filter(show => show.media.format === "TV").forEach(function(show){
				TVepisodes += show.progress;
				TVepisodes += show.repeat * Math.max(1,(show.media.episodes || 0),show.progress);
				if(show.status === "CURRENT"){
					TVepisodesLeft += Math.max((show.media.episodes || 0) - show.progress,0)
				}
			});
			addStat(translate("$stats_TVEpisodesWatched"),TVepisodes);
			addStat(translate("$stats_TVEpisodesRemaining"),TVepisodesLeft);
			if(oldest){
				create("p",false,translate("$stats_firstLoggedAnime") + [oldest.year, oldest.month, oldest.day].filter(TRUTHY).join("-") + ". " + translate("$stats_firstLoggedAnime_note"),personalStats)
			}
			let animeFormatter = {
				title: translate("$stats_customTagsAnime"),
				display: !useScripts.hideCustomTags,
				headings: [translate("$stats_tag"),translate("$stats_count"),translate("$stats_meanScore"),"Time Watched","Episodes","Eps remaining"],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSummableStatusContainer",false,cel);
							semmanticStatusOrder.forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSummableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/anime/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true))
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1)
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1)
							}
						}
					},
					function(cel,data,index){
						if(!data[index].duration){
							cel.innerText = "-"
						}
						else{
							cel.innerText = formatTime(data[index].duration*60,"short");
							cel.title = (data[index].duration/60).roundPlaces(1) + " " + translate("$time_medium_Mhour")
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(!data[index].list.length){
								cel.innerText = translate("$missing_N/A_data")
							}
							else{
								cel.innerText = data[index].episodes
							}
						}
						else{
							cel.innerText = data[index].episodes
						}
					},
					function(cel,data,index,isPrimary){
						if(data[index].episodes === 0 && data[index].remaining === 0 || isPrimary && !data[index].list.length){
							cel.innerText = translate("$missing_N/A_data")
						}
						else if(data[index].remaining === 0){
							cel.innerText = translate("$mediaStatus_completed")
						}
						else{
							if(useScripts.timeToCompleteColumn){
								cel.innerText = data[index].remaining + " (" + formatTime(data[index].remainingTime*60,"short") + ")"
							}
							else{
								cel.innerText = data[index].remaining
							}
						}
					}
				],
				sorting: [
					ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.episodes - b.episodes,
					(b,a) => a.remaining - b.remaining
				]
			};
			const animeFields = [
				{
					key : "name",
					method : function(media){
						return titlePicker({
							id: media.mediaId,
							title: media.media.title
						})
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0
							})
						}
						acc[val]++;
						return acc
					},
					method : media => media.status
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration
				},{
					key : "episodes",
					sumable : ACCUMULATE,
					method : media => media.episodes
				},{
					key : "remaining",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max((media.media.episodes || 0) - media.progress,0)
					}
				},{
					key : "remainingTime",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max(((media.media.episodes || 0) - media.progress) * (media.media.duration || 1),0)
					}
				}
			];
			let customTags = customTagsCollection(list,animeFormatter.title,animeFields);
			if(customTags.length){
				let customTagsAnimeTable = create("div","#customTagsAnimeTable",false,personalStats);
				drawTable(customTags,animeFormatter,customTagsAnimeTable,true,true)
			}

			if(onlyStats){
				return
			}

			let listOfTags = regularTagsCollection(list,animeFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			semaPhoreAnime = list;
	if(script_type !== "Boneless"){
			drawTable(listOfTags,animeFormatter,regularAnimeTable,true,false);
			nativeTagsReplacer();
			const staffData = await anilistAPI(queryMediaListStaff, {
				variables: {name: user,listType: "ANIME"},
				cacheKey: "hohListCacheAnimeStaff" + user,
				duration: 15*60*1000
			})
			if(staffData.errors){
				return
			}
			let rawStaff = returnList(staffData);
			rawStaff.forEach((raw,index) => {
				raw.status = list[index].status;
				raw.watchedDuration = list[index].watchedDuration;
				raw.scoreRaw = list[index].scoreRaw
			});
			let staffMap = {};
			rawStaff.filter(obj => obj.status !== "PLANNING").forEach(media => {
				media.media.staff.forEach(staff => {
					if(!staffMap[staff.id]){
						staffMap[staff.id] = {
							watchedDuration: 0,
							count: 0,
							scoreCount: 0,
							scoreSum: 0,
							id: staff.id,
							name: staff.name
						}
					}
					if(media.watchedDuration){
						staffMap[staff.id].watchedDuration += media.watchedDuration;
						staffMap[staff.id].count++
					}
					if(media.scoreRaw){
						staffMap[staff.id].scoreSum += media.scoreRaw;
						staffMap[staff.id].scoreCount++
					}
				})
			});
			let staffList = [];
			Object.keys(staffMap).forEach(
				key => staffList.push(staffMap[key])
			);
			staffList = staffList.filter(
				obj => obj.count >= 1
			).sort(
				(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
			);
			if(staffList.length > 300){
				staffList = staffList.filter(obj => obj.count >= 3)
			}
			if(staffList.length > 300){
				staffList = staffList.filter(obj => obj.count >= 5)
			}
			if(staffList.length > 300){
				staffList = staffList.filter(obj => obj.count >= 10)
			}
			let staffHasScores = staffList.some(a => a.scoreCount);
			let drawStaffList = function(){
				removeChildren(animeStaff)
				animeStaff.innerText = "";
				let table        = create("div",["table","hohTable","hohNoPointer"],false,animeStaff);
				let headerRow    = create("div",["header","row","good"],false,table);
				let nameHeading  = create("div",false,translate("$stats_name"),headerRow,"cursor:pointer;");
				let countHeading = create("div",false,translate("$stats_count"),headerRow,"cursor:pointer;");
				let scoreHeading = create("div",false,translate("$stats_meanScore"),headerRow,"cursor:pointer;");
				if(!staffHasScores){
					scoreHeading.style.display = "none"
				}
				let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
				staffList.forEach(function(staff,index){
					let row = create("div",["row","good"],false,table);
					let nameCel = create("div",false,(index + 1) + " ",row);
					let staffLink = create("a",["link","newTab"],(staff.name.first + " " + (staff.name.last || "")).trim(),nameCel);
					staffLink.href = "/staff/" + staff.id;
					create("div",false,staff.count,row);
					if(staffHasScores){
						create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row);
					}
					let timeCel = create("div",false,formatTime(staff.watchedDuration*60),row);
					timeCel.title = (staff.watchedDuration/60).roundPlaces(1) + " hours";
				});
				let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStaff,"margin-top:10px;");
				let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStaff,"margin-top:10px;");
				csvButton.onclick = function(){
					let csvContent = 'Staff,Count,"Mean Score","Time Watched"\n';
					staffList.forEach(staff => {
						csvContent += csvEscape(
							[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
						) + ",";
						csvContent += staff.count + ",";
						csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
						csvContent += (staff.watchedDuration/60).roundPlaces(1) + "\n"
					});
					saveAs(csvContent,"Anime staff stats for " + user + ".csv",true)
				};
				jsonButton.onclick = function(){
					saveAs({
						type: "ANIME",
						user: user,
						timeStamp: NOW(),
						version: "1.00",
						scriptInfo: scriptInfo,
						url: document.URL,
						description: "Anilist anime staff stats for " + user,
						fields: [
							{name: "name",   description: "The full name of the staff member, as firstname lastname"},
							{name: "staffID",description: "The staff member's database number in the Anilist database"},
							{name: "count",  description: "The total number of media this staff member has credits for, for the current user"},
							{name: "score",  description: "The current user's mean score for the staff member out of 100"},
							{name: "minutesWatched",description: "How many minutes of this staff member's credited media the current user has watched"}
						],
						data: staffList.map(staff => {
							return {
								name: (staff.name.first + " " + (staff.name.last || "")).trim(),
								staffID: staff.id,
								count: staff.count,
								score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
								minutesWatched: staff.watchedDuration
							}
						})
					},"Anime staff stats for " + user + ".json");
				}
				nameHeading.onclick = function(){
					staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
					drawStaffList()
				};
				countHeading.onclick = function(){
					staffList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
					drawStaffList()
				};
				scoreHeading.onclick = function(){
					staffList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
					drawStaffList()
				};
				timeHeading.onclick = function(){
					staffList.sort((b,a) => a.watchedDuration - b.watchedDuration);
					drawStaffList()
				}
			};
			let staffClickOnce = function(){
				drawStaffList();
				let place = document.querySelector(`[href$="/stats/anime/staff"]`);
				if(place){
					place.removeEventListener("click",staffClickOnce)
				}
			}
			let staffWaiter = function(){
				if(location.pathname.includes("/stats/anime/staff")){
					staffClickOnce();
					return
				}
				let place = document.querySelector(`[href$="/stats/anime/staff"]`);
				if(place){
					place.addEventListener("click",staffClickOnce)
				}
				else{
					setTimeout(staffWaiter,200)
				}
			};staffWaiter();


			let studioMap = {};
			list.forEach(function(anime){
				anime.media.studios.nodes.forEach(function(studio){
					if(!useScripts.allStudios && !studio.isAnimationStudio){
						return
					}
					if(!studioMap[studio.name]){
						studioMap[studio.name] = {
							watchedDuration: 0,
							count: 0,
							scoreCount: 0,
							scoreSum: 0,
							id: studio.id,
							isAnimationStudio: studio.isAnimationStudio,
							name: studio.name,
							media: []
						}
					}
					if(anime.watchedDuration){
						studioMap[studio.name].watchedDuration += anime.watchedDuration;
						studioMap[studio.name].count++
					}
					if(anime.scoreRaw){
						studioMap[studio.name].scoreSum += anime.scoreRaw;
						studioMap[studio.name].scoreCount++
					}
					let title = anime.media.title.romaji;
					if(anime.status !== "PLANNING"){
						if(useScripts.titleLanguage === "NATIVE" && anime.media.title.native){
							title = anime.media.title.native
						}
						else if(useScripts.titleLanguage === "ENGLISH" && anime.media.title.english){
							title = anime.media.title.english
						}
						studioMap[studio.name].media.push({
							watchedDuration: anime.watchedDuration,
							score: anime.scoreRaw,
							title: title,
							id: anime.mediaId,
							repeat: anime.repeat,
							status: anime.status
						})
					}
				})
			});
			let studioList = [];
			Object.keys(studioMap).forEach(
				key => studioList.push(studioMap[key])
			);
			studioList = studioList.filter(
				studio => studio.count >= 1
			).sort(
				(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
			);
			studioList.forEach(
				studio => studio.media.sort((b,a) => a.score - b.score)
			);
			let studioHasScores = studioList.some(a => a.scoreCount);
			let drawStudioList = function(){
				removeChildren(animeStudios)
				animeStudios.innerText = "";
				let table = create("div",["table","hohTable"],false,animeStudios);
				let headerRow = create("div",["header","row","good"],false,table);
				let nameHeading = create("div",false,translate("$stats_name"),headerRow,"cursor:pointer;");
				let countHeading = create("div",false,translate("$stats_count"),headerRow,"cursor:pointer;");
				let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
				if(!studioHasScores){
					scoreHeading.style.display = "none"
				}
				let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
				studioList.forEach(function(studio,index){
					let row = create("div",["row","good"],false,table);
					let nameCel = create("div",false,(index + 1) + " ",row);
					let studioLink = create("a",["link","newTab"],studio.name,nameCel);
					studioLink.href = "/studio/" + studio.id;
					if(!studio.isAnimationStudio){
						studioLink.style.color = "rgb(var(--color-green))"
					}
					let nameCellStatus = create("span","hohSummableStatusContainer",false,nameCel);
					semmanticStatusOrder.forEach(status => {
						let statCount = studio.media.filter(media => media.status === status).length;
						if(statCount){
							let statusSumDot = create("div","hohSummableStatus",statCount,nameCellStatus);
							statusSumDot.style.background = distributionColours[status];
							statusSumDot.title = statCount + " " + capitalize(status.toLowerCase());
							if(statCount > 99){
								statusSumDot.style.fontSize = "8px"
							}
							if(statCount > 999){
								statusSumDot.style.fontSize = "6px"
							}
							statusSumDot.onclick = function(e){
								e.stopPropagation();
								Array.from(nameCel.parentNode.nextSibling.children).forEach(function(child){
									if(child.children[1].children[0].title === status.toLowerCase()){
										child.style.display = "grid"
									}
									else{
										child.style.display = "none"
									}
								})
							}
						}
					});
					create("div",false,studio.count,row);
					if(studioHasScores){
						let scoreCel = create("div",false,(studio.scoreSum/studio.scoreCount).roundPlaces(2),row);
						scoreCel.title = studio.scoreCount + " ratings";
					}
					let timeString = formatTime(studio.watchedDuration*60);
					let timeCel = create("div",false,timeString,row);
					timeCel.title = (studio.watchedDuration/60).roundPlaces(1) + " hours";
					let showRow = create("div",false,false,table,"display:none;");
					studio.media.forEach(top => {
						let secondRow = create("div",["row","hohSecondaryRow","good"],false,showRow);
						let titleCel = create("div",false,false,secondRow,"margin-left:50px;");
						let titleLink = create("a","link",top.title,titleCel);
						titleLink.href = "/anime/" + top.id + "/" + safeURL(top.title);
						let countCel = create("div",false,false,secondRow);
						let statusDot = create("div","hohStatusDot",false,countCel);
						statusDot.style.backgroundColor = distributionColours[top.status];
						statusDot.title = top.status.toLowerCase();
						if(top.status === "COMPLETED"){
							statusDot.style.backgroundColor = "transparent";//default case
						}
						if(top.repeat === 1){
							countCel.appendChild(svgAssets2.repeat.cloneNode(true));
						}
						else if(top.repeat > 1){
							countCel.appendChild(svgAssets2.repeat.cloneNode(true));
							create("span",false,top.repeat,countCel)
						}
						create("div",false,(top.score ? top.score : "-"),secondRow);
						let timeString = formatTime(top.watchedDuration*60);
						let timeCel = create("div",false,timeString,secondRow);
						timeCel.title = (top.watchedDuration/60).roundPlaces(1) + " hours";
					});
					row.onclick = function(){
						if(showRow.style.display === "none"){
							showRow.style.display = "block"
						}
						else{
							showRow.style.display = "none"
						}
					}
				});
				let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStudios,"margin-top:10px;");
				let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStudios,"margin-top:10px;");
				csvButton.onclick = function(){
					let csvContent = 'Studio,Count,"Mean Score","Time Watched"\n';
					studioList.forEach(function(studio){
						csvContent += csvEscape(studio.name) + ",";
						csvContent += studio.count + ",";
						csvContent += (studio.scoreSum/studio.scoreCount).roundPlaces(2) + ",";
						csvContent += (studio.watchedDuration/60).roundPlaces(1) + "\n";
					});
					saveAs(csvContent,"Anime studio stats for " + user + ".csv",true);
				};
				jsonButton.onclick = function(){
					saveAs({
						type: "ANIME",
						user: user,
						timeStamp: NOW(),
						version: "1.00",
						scriptInfo: scriptInfo,
						url: document.URL,
						description: "Anilist anime studio stats for " + user,
						fields: [
							{name: "studio",description: "The name of the studio. (Can also be other companies, depending on the user's settings)"},
							{name: "studioID",description: "The studio's database number in the Anilist database"},
							{name: "count",description: "The total number of media this studio has credits for, for the current user"},
							{name: "score",description: "The current user's mean score for the studio out of 100"},
							{name: "minutesWatched",description: "How many minutes of this studio's credited media the current user has watched"},
							{
								name: "media",
								description: "A list of the media associated with this studio",
								subSelection: [
									{name: "title",description: "The title of the media (language depends on user settings)"},
									{name: "ID",description: "The media's database number in the Anilist database"},
									{name: "score",description: "The current user's mean score for the media out of 100"},
									{name: "minutesWatched",description: "How many minutes of the media the current user has watched"},
									{name: "status",description: "The current user's watching status for the media"},
								]
							}
						],
						data: studioList.map(studio => {
							return {
								studio: studio.name,
								studioID: studio.id,
								count: studio.count,
								score: (studio.scoreSum/studio.scoreCount).roundPlaces(2),
								minutesWatched: studio.watchedDuration,
								media: studio.media.map(media => {
									return {
										title: media.title,
										ID: media.id,
										score: media.score,
										minutesWatched: media.watchedDuration,
										status: media.status
									}
								})
							}
						})
					},"Anime studio stats for " + user + ".json");
				}
				nameHeading.onclick = function(){
					studioList.sort(ALPHABETICAL(a => a.name));
					studioList.forEach(studio => {
						studio.media.sort(ALPHABETICAL(a => a.title))
					});
					drawStudioList();
				};
				countHeading.onclick = function(){
					studioList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
					drawStudioList();
				};
				scoreHeading.onclick = function(){
					studioList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
					studioList.forEach(studio => {
						studio.media.sort((b,a) => a.score - b.score)
					});
					drawStudioList();
				};
				timeHeading.onclick = function(){
					studioList.sort((b,a) => a.watchedDuration - b.watchedDuration);
					studioList.forEach(function(studio){
						studio.media.sort((b,a) => a.watchedDuration - b.watchedDuration);
					});
					drawStudioList();
				};
			};
			let studioClickOnce = function(){
				drawStudioList();
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.removeEventListener("click",studioClickOnce)
				}
			}
			let studioWaiter = function(){
				if(location.pathname.includes("/stats/anime/studios")){
					studioClickOnce();
					return;
				}
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.addEventListener("click",studioClickOnce)
				}
				else{
					setTimeout(studioWaiter,200)
				}
			};studioWaiter();
	}//end boneless check
			return
		};
		if(user === whoAmI && reliablePersistentStorage){
			cache.getList("ANIME",function(data){
				personalStatsCallback(data)
			})
		}
		else{
			const animeData = await anilistAPI(queryMediaListAnime, {
				variables: {name: user, listType: "ANIME"}
			})
			if(animeData.errors){
				return
			}
			personalStatsCallback(animeData)
		}
//manga stats
		let personalStatsMangaCallback = async function(data){
			personalStatsManga.innerText = "";
			create("hr","hohSeparator",false,personalStatsManga);
			create("h1","hohStatHeading",translate("$stats_manga_heading",user),personalStatsManga);
			let list = returnList(data);
			let scoreList = list.filter(element => element.scoreRaw);
			let personalStatsMangaContainer = create("div",false,false,personalStatsManga);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStatsManga);
				let compatLocation = create("div","#hohCheckCompatManga",false,personalStatsManga);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = translate("$loading");
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"MANGA",
						function(data){
							formatCompat(data,compatLocation,user)
						}
					)
				}
			}
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStatsManga);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					let newStatComment = create("span",false,false,newStat);
					newStatComment.innerText = comment
				}
			};
			let chapters = 0;
			let volumes = 0;
			/*
			For most airing anime, Anilist provides "media.nextAiringEpisode.episode"
			Unfortunately, the same is not the case for releasing manga.
			THIS DOESN'T MATTER the first time a user is reading something, as we are then just using the current progress.
			But on a re-read, we need the total length to count all the chapters read.
			I can (and do) get a lower bound for this by using the current progress (this is what Anilist does),
			but this is not quite accurate, especially early in a re-read.
			The list below is to catch some of those exceptions
			*/
			let unfinishedLookup = function(mediaId,mode,mediaStatus,mediaProgress){//wow, this is a mess. But it works
				if(mediaStatus === "FINISHED"){
					return 0//it may have finished since the list was updated
				}
				if(hasOwn(commonUnfinishedManga, mediaId)){
					if(mode === "chapters"){
						return commonUnfinishedManga[mediaId].chapters
					}
					else if(mode === "volumes"){
						return commonUnfinishedManga[mediaId].volumes
					}
					else if(mode === "volumesNow"){
						if(commonUnfinishedManga[mediaId].chapters <= (mediaProgress || 0)){
							return commonUnfinishedManga[mediaId].volumes
						}
						else{
							//if much behind, assume volumes scale linearly
							return Math.floor(commonUnfinishedManga[mediaId].volumes * mediaProgress/commonUnfinishedManga[mediaId].chapters)
						}
					}
					return 0;//fallback
				}
				else{
					return 0//not in our list
				}
			};
			list.forEach(function(item){
				let chaptersRead = 0;
				let volumesRead = 0;
				if(item.status === "COMPLETED"){//if it's completed, we can make some safe assumptions
					chaptersRead += Math.max(//chapter progress on the current read
						item.media.chapters,//in most cases, it has a chapter count
						item.media.volumes,//if not, there's at least 1 chapter per volume
						item.progress,//if it doesn't have a volume count either, the current progress is probably not out of date
						item.progressVolumes,//if it doesn't have a chapter progress, count at least 1 chapter per volume
						1//finally, an entry has at least 1 chapter
					);
					volumesRead += Math.max(
						item.progressVolumes,
						item.media.volumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)//if people have forgotten to update their volume count and have caught up.
					)
				}
				else{//we may only assume what's on the user's list.
					chaptersRead += Math.max(
						item.progress,
						item.progressVolumes
					);
					volumesRead += Math.max(
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)
					)
				}
				if(useScripts.noRewatches && item.repeat){//if they have a reread, they have at least completed it
					chaptersRead = Math.max(//first round
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead = Math.max(
						item.media.volumes,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				}
				else{
					chaptersRead += item.repeat * Math.max(//chapters from rereads
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead += item.repeat * Math.max(//many manga have no volumes, so we can't make all of the same assumptions
						item.media.volumes,
						item.progressVolumes,//better than nothing if a volume count is missing
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				}
				if(item.listJSON && item.listJSON.adjustValue){
					chaptersRead = Math.max(0,chaptersRead + item.listJSON.adjustValue)
				}
				chapters += chaptersRead;
				volumes += volumesRead;
				item.volumesRead = volumesRead;
				item.chaptersRead = chaptersRead;
			});
//
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let average = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let histogram = new Array(100).fill(0);
			let amount = scoreList.length;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumWeight = 0;
			let sumEntriesWeight = 0;

			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			scoreList.forEach(function(item){
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{	
					runLength = 1;
					previouScore = item.scoreRaw
				}
				sumWeight += item.chaptersRead;
				sumEntriesWeight += item.scoreRaw * item.chaptersRead;
				histogram[item.scoreRaw - 1]++
			});
			addStat(translate("$stats_mangaOnList"),list.length);
			addStat(translate("$stats_mangaRated"),amount);
			addStat(translate("$stats_totalChapters"),chapters);
			addStat(translate("$stats_totalVolumes"),volumes);
			if(amount){
				average = sumEntries/amount
			}
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2);
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore);
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
			if(amount){//no scores
				if(amount === 1){
					addStat(
						translate("$stats_onlyOne"),
						maxRunLengthScore
					)
				}
				else{
					addStat(
						translate("$stats_averageScore"),
						average.toPrecision(4)
					);
					addStat(
						translate("$stats_averageScore"),
						(sumEntriesWeight/sumWeight).toPrecision(4),
						translate("$stats_weightComment_chapers")
					);
					addStat(translate("$stats_medianScore"),median);
					addStat(
						translate("$stats_globalDifference"),
						publicDifference.roundPlaces(2),
						translate("$stats_globalDifference_comment")
					);
					addStat(
						translate("$stats_globalDeviation"),
						publicDeviation.roundPlaces(2),
						translate("$stats_globalDeviation_comment")
					);
					addStat(
						translate("$stats_ratingEntropy"),
						-histogram.reduce((acc,val) => {
							if(val){
								return acc + Math.log2(val/amount) * val/amount
							}
							return acc
						},0).toPrecision(3),
						translate("$stats_ratingEntropy_comment")
					);
					if(maxRunLength > 1){
						addStat(translate("$stats_mostCommonScore"),maxRunLengthScore, " " + translate("$stats_instances",maxRunLength))
					}
					else{
						addStat(translate("$stats_mostCommonScore"),"","no two scores alike")
					}
				}
			}
//
			let mangaFormatter = {
				title: translate("$stats_customTagsManga"),
				display: !useScripts.hideCustomTags,
				headings: [translate("$stats_tag"),translate("$stats_count"),translate("$stats_meanScore"),translate("$stats_chapters"),translate("$stats_volumes")],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSummableStatusContainer",false,cel);
							semmanticStatusOrder.forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSummableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(statusTypes[status]);
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/manga/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1)
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].chaptersRead
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].volumesRead
						}
					}
				],
				sorting: [
					ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.chaptersRead - b.chaptersRead,
					(b,a) => a.volumesRead - b.volumesRead
				]
			};
			const mangaFields = [
				{
					key : "name",
					method : function(media){
						return titlePicker({
							id: media.mediaId,
							title: media.media.title
						})
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0
							})
						}
						acc[val]++;
						return acc
					},
					method : media => media.status
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead
				},{
					key : "volumesRead",
					sumable : ACCUMULATE,
					method : media => media.volumesRead
				}
			];
			let customTags = customTagsCollection(list,mangaFormatter.title,mangaFields);
			if(customTags.length){
				let customTagsMangaTable = create("div","#customTagsMangaTable",false,personalStatsManga);
				drawTable(customTags,mangaFormatter,customTagsMangaTable,true,true)
			}
			let listOfTags = regularTagsCollection(list,mangaFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			semaPhoreManga = list;
	if(script_type !== "Boneless"){
			drawTable(listOfTags,mangaFormatter,regularMangaTable,true,false);
			nativeTagsReplacer();
	}

			const staffSimpleData = await anilistAPI(queryMediaListStaff_simple, {
				variables: {name: user,listType: "MANGA"},
				cacheKey: "hohListCacheMangaStaff" + user,
				duration: 10*60*1000
			})
			if(staffSimpleData.errors){
				return
			}
			let rawStaff = returnList(staffSimpleData);
			let cacheOffset = 0;
			rawStaff.forEach(function(raw,index){
				if(raw.mediaId === list[index - cacheOffset].mediaId){
					raw.status = list[index - cacheOffset].status;
					raw.chaptersRead = list[index - cacheOffset].chaptersRead;
					raw.volumesRead = list[index - cacheOffset].volumesRead;
					raw.scoreRaw = list[index - cacheOffset].scoreRaw
				}
				else{
					cacheOffset++;
					raw.status = "CURRENT";
					raw.chaptersRead = 0;
					raw.volumesRead = 0;
					raw.scoreRaw = 0
				}
			});
			let staffMap = {};
			rawStaff.filter(obj => obj.status !== "PLANNING").forEach(function(media){
				media.media.staff.edges.forEach(function(staff){
					if(!staffMap[staff.node.id]){
						staffMap[staff.node.id] = {
							chaptersRead: 0,
							volumesRead: 0,
							count: 0,
							scoreCount: 0,
							scoreSum: 0,
							id: staff.node.id,
							name: staff.node.name,
							roles: []
						}
					}
					staffMap[staff.node.id].roles.push(staff.role);
					if(media.chaptersRead || media.volumesRead){
						staffMap[staff.node.id].volumesRead += media.volumesRead;
						staffMap[staff.node.id].chaptersRead += media.chaptersRead;
						staffMap[staff.node.id].count++
					}
					if(media.scoreRaw){
						staffMap[staff.node.id].scoreSum += media.scoreRaw;
						staffMap[staff.node.id].scoreCount++
					}
				})
			});
			let staffList = [];
			Object.keys(staffMap).forEach(
				key => staffList.push(staffMap[key])
			);
			staffList = staffList.filter(obj => obj.count >= 1).sort(
				(b,a) => a.count - b.count || a.chaptersRead - b.chaptersRead || a.volumesRead - b.volumesRead
			);
			if(staffList.length > 300){
				staffList = staffList.filter(
					obj => obj.count >= 3
					|| (obj.count >= 2 && obj.chaptersRead > 100)
					|| obj.chaptersRead > 200
				)
			}
			if(staffList.length > 300){
				staffList = staffList.filter(
					obj => obj.count >= 5
					|| (obj.count >= 2 && obj.chaptersRead > 200)
					|| obj.chaptersRead > 300
				)
			}
			if(staffList.length > 300){
				staffList = staffList.filter(
					obj => obj.count >= 10
					|| (obj.count >= 2 && obj.chaptersRead > 300)
					|| obj.chaptersRead > 400
				)
			}
			let hasScores = staffList.some(a => a.scoreCount);
			let story_filter;
			let art_filter;
			let assistant_filter;
			let translator_filter;
			let drawStaffList = function(){
				if(mangaStaff.querySelector(".table")){
					mangaStaff.querySelector(".table").remove()
				}
				if(mangaStaff.querySelector(".jsonExport")){
					mangaStaff.querySelector(".jsonExport").remove();
					mangaStaff.querySelector(".csvExport").remove()
				}
				else{
					mangaStaff.innerText = "";
					story_filter = createCheckbox(mangaStaff);
					create("span",false,translate("$role_Story",null,"Story"),mangaStaff,"margin-right:5px;");
					art_filter = createCheckbox(mangaStaff);
					create("span",false,translate("$role_Art",null,"Art"),mangaStaff,"margin-right:5px;");
					assistant_filter = createCheckbox(mangaStaff);
					create("span",false,"Assistants",mangaStaff,"margin-right:5px;");
					translator_filter = createCheckbox(mangaStaff);
					create("span",false,"Translators",mangaStaff,"margin-right:5px;");
					story_filter.checked = true;
					art_filter.checked = true;
					assistant_filter.checked = true;
					translator_filter.checked = true;
					story_filter.oninput = drawStaffList;
					art_filter.oninput = drawStaffList;
					assistant_filter.oninput = drawStaffList;
					translator_filter.oninput = drawStaffList;
				}
				let table = create("div",["table","hohTable","hohNoPointer"],false,mangaStaff);
				let headerRow = create("div",["header","row","good"],false,table);
				let nameHeading = create("div",false,translate("$stats_name"),headerRow,"cursor:pointer;");
				let countHeading = create("div",false,translate("$stats_count"),headerRow,"cursor:pointer;");
				let scoreHeading = create("div",false,translate("$stats_meanScore"),headerRow,"cursor:pointer;");
				if(!hasScores){
					scoreHeading.style.display = "none"
				}
				let timeHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
				let volumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
				staffList.forEach(function(staff,index){
					if(
						(!story_filter.checked && art_filter.checked && staff.roles.every(role => role.toLowerCase().match(/story/) && !role.toLowerCase().match(/art/)))
						|| (story_filter.checked && !art_filter.checked && staff.roles.every(role => role.toLowerCase().match(/art/) && !role.toLowerCase().match(/story/)))
						|| (
							!story_filter.checked
							&& !art_filter.checked
							&& (
								staff.roles.every(role => role.toLowerCase().match(/art|story/))
								|| !staff.roles.some(role => role.toLowerCase().match(/translator|lettering|touch-up|assist(a|e)nt|assistance/i))
							)
						)
						|| (!assistant_filter.checked && staff.roles.every(role => role.toLowerCase().match(/assist(a|e)nt|assistance/i)))
						|| (!translator_filter.checked && staff.roles.some(role => role.toLowerCase().match(/translator|lettering|touch-up/)))
					){
						return
					}
					let row = create("div",["row","good"],false,table);
					let nameCel = create("div",false,(index + 1) + " ",row);
					create("a","newTab",staff.name.first + " " + (staff.name.last || ""),nameCel)
						.href = "/staff/" + staff.id;
					create("div",false,staff.count,row);
					if(hasScores){
						create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row)
					}
					create("div",false,staff.chaptersRead,row);
					create("div",false,staff.volumesRead,row)
				});
				let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",mangaStaff,"margin-top:10px;");
				let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",mangaStaff,"margin-top:10px;");
				csvButton.onclick = function(){
					let csvContent = 'Staff,Count,"Mean Score","Chapters Read","Volumes Read"\n';
					staffList.forEach(staff => {
						csvContent += csvEscape(
							[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
						) + ",";
						csvContent += staff.count + ",";
						csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
						csvContent += staff.chaptersRead + ",";
						csvContent += staff.volumesRead + "\n";
					});
					saveAs(csvContent,"Manga staff stats for " + user + ".csv",true)
				};
				jsonButton.onclick = function(){
					saveAs({
						type: "MANGA",
						user: user,
						timeStamp: NOW(),
						version: "1.00",
						scriptInfo: scriptInfo,
						url: document.URL,
						description: "Anilist manga staff stats for " + user,
						fields: [
							{name: "name",description: "The full name of the staff member, as firstname lastname"},
							{name: "staffID",description: "The staff member's database number in the Anilist database"},
							{name: "count",description: "The total number of media this staff member has credits for, for the current user"},
							{name: "score",description: "The current user's mean score for the staff member out of 100"},
							{name: "chaptersRead",description: "How many chapters of this staff member's credited media the current user has read"},
							{name: "volumesRead",description: "How many volumes of this staff member's credited media the current user has read"}
						],
						data: staffList.map(staff => {
							return {
								name: (staff.name.first + " " + (staff.name.last || "")).trim(),
								staffID: staff.id,
								count: staff.count,
								score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
								chaptersRead: staff.chaptersRead,
								volumesRead: staff.volumesRead
							}
						})
					},"Manga staff stats for " + user + ".json")
				}
				nameHeading.onclick = function(){
					staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
					drawStaffList()
				};
				countHeading.onclick = function(){
					staffList.sort(
						(b,a) => a.count - b.count
							|| a.chaptersRead - b.chaptersRead
							|| a.volumesRead - b.volumesRead
							|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
					);
					drawStaffList()
				};
				scoreHeading.onclick = function(){
					staffList.sort(
						(b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
							|| a.count - b.count
							|| a.chaptersRead - b.chaptersRead
							|| a.volumesRead - b.volumesRead
					);
					drawStaffList()
				};
				timeHeading.onclick = function(){
					staffList.sort(
						(b,a) => a.chaptersRead - b.chaptersRead
							|| a.volumesRead - b.volumesRead
							|| a.count - b.count
							|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
					);
					drawStaffList()
				};
				volumeHeading.onclick = function(){
					staffList.sort(
						(b,a) => a.volumesRead - b.volumesRead
							|| a.chaptersRead - b.chaptersRead
							|| a.count - b.count
							|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
					);
					drawStaffList()
				}
			};
			let clickOnce = function(){
				drawStaffList();
				let place = document.querySelector(`[href$="/stats/manga/staff"]`);
				if(place){
					place.removeEventListener("click",clickOnce)
				}
			}
			let waiter = function(){
				if(location.pathname.includes("/stats/manga/staff")){
					clickOnce();
					return
				}
				let place = document.querySelector(`[href$="/stats/manga/staff"]`);
				if(place){
					place.addEventListener("click",clickOnce)
				}
				else{
					setTimeout(waiter,200)
				}
			};waiter();
			return
		};
		if(user === whoAmI && reliablePersistentStorage){
			cache.getList("MANGA",data => {
				personalStatsMangaCallback(data)
			})
		}
		else{
			const mangaData = await anilistAPI(queryMediaListManga, {
				variables: {name: user, listType: "MANGA"}
			})
			if(mangaData.errors){
				return
			}
			personalStatsMangaCallback(mangaData)
		}
		return
	};
	let tabWaiter = function(){
		let tabMenu = filterGroup.querySelectorAll(".filter-group > a");
		tabMenu.forEach(tab => {
			tab.onclick = function(){
				Array.from(document.querySelector(".stats-wrap").children).forEach(child => {
					child.style.display = "initial";
				});
				Array.from(document.getElementsByClassName("hohActive")).forEach(child => {
					child.classList.remove("hohActive");
				});
				document.getElementById("hohStats").style.display = "none";
				document.getElementById("hohGenres").style.display = "none";
				document.querySelector(".page-content .user").classList.remove("hohSpecialPage")
			}
		});
		if(!tabMenu.length){
			setTimeout(tabWaiter,200)
		}
	};tabWaiter();
	let statsWrap = document.querySelector(".stats-wrap");
	if(statsWrap){
		hohStats = create("div","#hohStats",false,statsWrap,"display:none;");
		hohGenres = create("div","#hohGenres",false,statsWrap,"display:none;");
		regularFilterHeading = create("div","#regularFilterHeading",false,hohGenres);
		regularGenresTable = create("div","#regularGenresTable",translate("$loading"),hohGenres);
		if(script_type !== "Boneless"){
			regularTagsTable = create("div","#regularTagsTable",translate("$loading"),hohGenres);
			regularAnimeTable = create("div","#regularAnimeTable",translate("$loading"),statsWrap);
			regularMangaTable = create("div","#regularMangaTable",translate("$loading"),statsWrap);
			animeStaff = create("div","#animeStaff",translate("$loading"),statsWrap);
			mangaStaff = create("div","#mangaStaff",translate("$loading"),statsWrap);
			animeStudios = create("div","#animeStudios",translate("$loading"),statsWrap);
		}
		hohStats.calculated = false;
		generateStatPage()
	}
	hohStatsTrigger.onclick = function(){
		hohStatsTrigger.classList.add("hohActive");
		hohGenresTrigger.classList.remove("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active");
		}
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "initial";
		hohGenres.style.display = "none"
	};
	hohGenresTrigger.onclick = function(){
		hohStatsTrigger.classList.remove("hohActive");
		hohGenresTrigger.classList.add("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active")
		}
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "none";
		hohGenres.style.display = "initial"
	}
}
