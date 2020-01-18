{name: "BroomCat linter",setup: function(){
	create("p",false,"Welcome to BroomCat. It will help you find stray database items",miscOptions);
	let select = create("select","#typeSelect",false,miscOptions);
	let animeOption = create("option",false,"Anime",select);
	let mangaOption = create("option",false,"Manga",select);
	animeOption.value = "ANIME";
	mangaOption.value = "MANGA";
	createCheckbox(miscOptions,"restrictToList");
	create("span",false,"Restrict to personal list",miscOptions);
	create("h3",false,"Config",miscOptions);
	let conf = function(description,id,defaultValue,titleText){
		let option = create("p",false,false,miscOptions);
		let check = createCheckbox(option,id);
		let descriptionText = create("span",false,description + " ",option);
		if(defaultValue){
			check.checked = defaultValue
		}
		if(titleText){
			descriptionText.title = titleText
		}
	};
	[
		["End date before start date","startEnd",true],
		["Dates before 1900","earlyDates",true],
		["Missing dates","missingDates",true],
		["Incomplete dates","incompleteDates"],
		["No tags","noTags"],
		["No genres","noGenres"],
		["Has tag below 20%","lowTag",false,"Tags start out at 20%, so if it's below it's controversial"],
		["Has invalid genre","badGenre",true,"There's a fixed list of 19 genres, so anything else must be wrong"],
		["Missing banner","noBanner"],
		["Oneshot without one chapter","oneshot",false,"This is a requirement in the documentation"],
		["Missing MAL ID","idMal",false,"Anilist stores MAL IDs to make list imports and interactions between databases simpler"],
		["Duplicated MAL ID","duplicatedMALID"],
		["Missing native title","nativeTitle",true,"Everything has a native title, even if it's the same"],
		["Missing english title","englishTitle",false,"Not necessarily wrong, not everything is licensed"],
		["No duration","noDuration",true],
		["No chapter or episode count","noLength",true],
		["Multiple demographic tags","demographics"],
		["No studios","noStudios"],
		["Unusual length","unusualLength",true,"Doesn't have to be wrong, just check them"],
		["No source","noSource"],
		["Source = other","otherSource",false,"Anilist introduced new sources, so some of these may need to be changed"],
		["Source = original, but has source relation","badOriginalSource"],
		["More than one source","moreSource",false,"Doesn't have to be wrong, but many of these are"],
		["Adaptation older than source","newSource"],
		["Source field not equal to source media format","formatSource"],
		["Hentai with isAdult = false","nonAdultHentai"],
		["Synonym equal to title","redundantSynonym",true],
		["No extraLarge cover image","extraLarge"],
		["Temporary title","tempTitle",true,"Common for manga announcements"],
		["Romaji inconsistencies","badRomaji",true,"Catches some common romanisation errors"],
		["Weird spacing in title","weirdSpace",true],
		["TV/TV Short mixup","tvShort"],
		["Duplicated studio","duplicatedStudio"],
		["Has Twitter hashtag","hashtag",false,"Keep up with news"],
		["Releasing manga with non-zero chapter or volume count","releasingZero"],
		["Bad character encoding in description","badEncoding"],
		["Commonly misspelled words in description","badSpelling",true],
		["No description (or very short)","noDescription",true],
		["Very long description","longDescription"],
		["Likely outdated description","outdatedDescription",true,"Checks if the description appears to have been written before the series aired"]
	].forEach(ig => conf(...ig));
},code: function(){
	let type = document.getElementById("typeSelect").value;
	let restrict = document.getElementById("restrictToList").checked;
	let require = new Set();
	let malIDs = new Set();
	let config = [
		{name: "startEnd",description: "End date before start date",code: function(media){
			if(!media.startDate.year || !media.endDate.year){
				return false
			}
			if(media.startDate.year > media.endDate.year){
				return true
			}
			else if(media.startDate.year < media.endDate.year){
				return false
			}
			if(!media.startDate.month || !media.endDate.month){
				return false
			}
			if(media.startDate.month > media.endDate.month){
				return true
			}
			else if(media.startDate.month < media.endDate.month){
				return false
			}
			if(!media.startDate.day || !media.endDate.day){
				return false
			}
			if(media.startDate.day > media.endDate.day){
				return true
			}
			return false;
		},require: ["startDate{year month day}","endDate{year month day}"]},
		{name: "earlyDates",description: "Dates before 1900",code: function(media){
			return (media.startDate.year && media.startDate.year < 1900) || (media.endDate.year && media.endDate.year < 1900)
		},require: ["startDate{year month day}","endDate{year month day}"]},
		{name: "missingDates",description: "Missing dates",code: function(media){
			if(media.status === "FINISHED"){
				return (!media.startDate.year) || (!media.endDate.year);
			}
			else if(media.status === "RELEASING"){
				return !media.startDate.year;
			}
			return false;
		},require: ["startDate{year month day}","endDate{year month day}","status"]}
,
		{name: "incompleteDates",description: "Incomplete dates",code: function(media){
			if(media.status === "FINISHED"){
				return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day) || (!media.endDate.year) || (!media.endDate.month) || (!media.endDate.day);
			}
			else if(media.status === "RELEASING"){
				return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day)
			}
			return false;
		},require: ["startDate{year month day}","endDate{year month day}","status"]},
		{name: "noTags",description: "No tags",code: function(media){
			return media.tags.length === 0;
		},require: ["tags{rank name}"]},
		{name: "noGenres",description: "No genres",code: function(media){
			return media.genres.length === 0;
		},require: ["genres"]},
		{name: "lowTag",description: "Has tag below 20%",code: function(media){
			return media.tags.some(tag => tag.rank < 20);
		},require: ["tags{rank name}"]},
		{name: "demographics",description: "Multiple demographic tags",code: function(media){
			return media.tags.filter(tag => ["Shounen","Shoujo","Josei","Seinen","Kids"].includes(tag.name)).length > 1;
		},require: ["tags{rank name}"]},
		{name: "badGenre",description: "Has invalid genre",code: function(media){
			return media.genres.some(genre => !["Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Hentai","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"].includes(genre));
		},require: ["genres"]},
		{name: "noBanner",description: "Missing banner",code: function(media){
			return !media.bannerImage
		},require: ["bannerImage"]},
		{name: "oneshot",description: "Oneshot without one chapter",code: function(media){
			return media.format === "ONE_SHOT" && media.chapters !== 1;
		},require: ["chapters"]},
		{name: "idMal",description: "Missing MAL ID",code: function(media){
			return !media.idMal
		},require: ["idMal"]},
		{name: "duplicatedMALID",description: "Duplicated MAL ID",code: function(media){
			if(media.idMal){
				if(malIDs.has(media.idMal)){
					return true
				}
				else{
					malIDs.add(media.idMal)
					return false
				}
			}
		},require: ["idMal"]},
		{name: "nativeTitle",description: "Missing native title",code: function(media){
			return !media.title.native
		}},
		{name: "englishTitle",description: "Missing english title",code: function(media){
			return !media.title.english
		}},
		{name: "noDuration",description: "No duration",code: function(media){
			return media.type === "ANIME" && media.status !== "NOT_YET_RELEASED" && !media.duration;
		},require: ["type","duration","status"]},
		{name: "noLength",description: "No chapter or episode count",code: function(media){
			if(media.status !== "FINISHED"){
				return false
			}
			if(media.type === "ANIME"){
				return !media.episodes
			}
			else{
				return !media.chapters
			}
		},require: ["type","chapters","episodes","status"]},
		{name: "noStudios",description: "No studios",code: function(media){
			return media.type === "ANIME" && !media.studios.nodes.length;
		},require: ["type","studios{nodes{id}}"]},
		{name: "unusualLength",description: "Unusual Length",code: function(media){
			if(media.type === "ANIME"){
				return (media.episodes && media.episodes > 1000) || (media.duration && media.duration > 180);
			}
			else{
				return (media.cahpters && media.chapters > 2000) || (media.volumes && media.volumes > 150);
			}
		},require: ["type","chapters","volumes","duration","episodes"]},
		{name: "noSource",description: "No source",code: function(media){
			return !media.source;
		},require: ["source(version: 2)"]},
		{name: "otherSource",description: "Source = other",code: function(media){
			return (media.source && media.source === "OTHER");
		},require: ["source(version: 2)"]},
		{name: "badOriginalSource",description: "Source = original, but has source relation",code: function(media){
			let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
			return source.length && (media.source && media.source === "ORIGINAL")
		},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
		{name: "redundantSynonym",description: "Synonym equal to title",code: function(media){
			return media.synonyms.some(
				word => word === media.title.romaji
			)
			|| (media.title.native && media.synonyms.some(
				word => word === media.title.native
			))
			|| (media.title.english && media.synonyms.some(
				word => word === media.title.english
			));
		},require: ["synonyms"]},
		{name: "hashtag",description: "Has Twitter hashtag",code: function(media){
			return !!media.hashtag;
		},require: ["hashtag"]},
		{name: "nonAdultHentai",description: "Hentai with isAdult = false",code: function(media){
			return (media.genres.includes("Hentai") && !media.isAdult);
		},require: ["genres","isAdult"]},
		{name: "extraLarge",description: "No extraLarge cover image",code: function(media){
			return media.coverImage.large && media.coverImage.large === media.coverImage.extraLarge;
		},require: ["coverImage{large extraLarge}"]},
		{name: "tempTitle",description: "Temporary title",code: function(media){
			return media.title.romaji.toLowerCase() === "(Title to be Announced)".toLowerCase()
				|| (media.title.native && media.title.native.toLowerCase() === "(Title to be Announced)".toLowerCase())
				|| media.title.romaji.includes("(Provisional Title)")
				|| (media.title.native && media.title.native.includes("（仮）"));
		}},
		{name: "badRomaji",description: "Romaji inconsistencies",code: media =>
			["～","「","」","ō","ū","。","！","？","Toukyou","Oosaka"].some(
				char => media.title.romaji.includes(char)
			) || (
				media.title.native && (
					(media.title.native.includes("っち") && media.title.romaji.includes("tchi"))
					|| (media.title.native.includes("っちゃ") && media.title.romaji.includes("tcha"))
					|| (media.title.native.includes("っちょ") && media.title.romaji.includes("tcho"))
					|| (media.title.native.includes("☆") && !media.title.romaji.includes("☆"))
					|| (media.title.native.includes("♪") && !media.title.romaji.includes("♪"))
				)
			)
		},
		{name: "weirdSpace",description: "Weird spacing in title",code: function(media){
			return (
				(media.title.native || "").trim().replace("  "," ") !== (media.title.native || "")
				|| (media.title.romaji || "").trim().replace("  "," ") !== (media.title.romaji || "")
				|| (media.title.english || "").trim().replace("  "," ") !== (media.title.english || "")
			)
		},require: ["duration"]},
		{name: "tvShort",description: "TV/TV Short mixup",code: function(media){
			if(media.duration){
				return (media.format === "TV" && media.duration < 15) || (media.format === "TV_SHORT" && media.duration >= 15)
			}
			return false;
		},require: ["duration"]},
		{name: "newSource",description: "Adaptation older than source",code: function(media){
			return media.sourcing.edges.some(function(edge){
				if(edge.relationType === "SOURCE"){
					return fuzzyDateCompare(edge.node.startDate,media.startDate) === 0
				}
				return false
			})
		},require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
		{
			name: "moreSource",
			description: "More than one source",
			code: media => media.sourcing.edges.filter(edge => edge.relationType === "SOURCE").length > 1
				&& ![477,6].includes(media.id),//aria, trigun
			require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]
		},
		{name: "formatSource",description: "Source field not equal to source media format",code: function(media){
			let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
			return source.length && media.source
				&& (
					(source[0].node.format !== media.source)
					&& !(source[0].node.format === "NOVEL" && media.source === "LIGHT_NOVEL")
				)
		},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
		{name: "releasingZero",description: "Releasing manga with non-zero chapter or volume count",code: function(media){
			return media.format === "MANGA" && media.status === "RELEASING" && (media.chapters || media.volumes)
		},require: ["status","chapters","volumes"]},
		{name: "duplicatedStudio",description: "Duplicated studio",code: function(media){
			return (new Set(media.studios.nodes)).size !== media.studios.nodes.length;
		},require: ["studios{nodes{id}}"]},
		{
			name: "badEncoding",
			description: "Bad character encoding in description",
			code: media => {
				return ["</br>","&#39","[1]","[2]","â€™"].some(error => media.description.includes(error))
			},
			require: ["description"]
		},
		{
			name: "badSpelling",
			description: "Bad character encoding in description",
			code: media => {
				return ["animes ","mangas "].some(error => media.description.includes(error))
			},
			require: ["description"]
		},
		{
			name: "noDescription",
			description: "No description",
			code: media => media.description.length < 15,
			require: ["description"]
		},
		{
			name: "longDescription",
			description: "Very long description",
			code: media => media.description.length > 4000,
			require: ["description"]
		},
		{
			name: "outdatedDescription",
			description: "Likely outdated description",
			code: media => [
"upcoming adaptation","will cover","sceduled for","next year","will adapt","announced","will air"," tba"
			].some(text => media.description.toLowerCase().includes(text)) && media.status === "FINISHED",
			require: ["description","status"]
		}
	];
	config.forEach(function(setting){
		setting.active = document.getElementById(setting.name).checked;
		if(setting.active && setting.require){
			setting.require.forEach(field => require.add(field))
		}
	});
	let query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
		currentPage
		lastPage
	}
	media(type: $type,sort: POPULARITY_DESC){
		id
		title{romaji native english}
		format
		${[...require].join(" ")}
		}
	}
}`;
	if(restrict){
		query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(type: $type,sort: MEDIA_ID,userName: "${user}"){
			media{
				id
				title{romaji native english}
				format
				${[...require].join(" ")}
			}
		}
	}
}`;
	}
	miscResults.innerText = "";
	let flag = true;
	let stopButton = create("button",["button","hohButton"],"Stop",miscResults);
	let progress = create("p",false,false,miscResults);
	stopButton.onclick = function(){
		flag = false;
	};
	let caller = function(page){
		generalAPIcall(query,{type: type,page: page},function(data){
			data = data.data.Page;
			if(data.mediaList){
				data.media = data.mediaList.map(item => item.media);
			};
			data.media.forEach(media => {
				progress.innerText = "Page " + page + " of " + data.pageInfo.lastPage;
				let matches = config.filter(
					setting => setting.active && setting.code(media)
				).map(setting => setting.description);
				if(matches.length){
					let row = create("p",false,false,miscResults);
					create("a",["link","newTab"],"[" + media.format + "] " + media.title.romaji,row,"width:440px;display:inline-block;")
						.href = "/" + type.toLowerCase() + "/" + media.id;
					create("span",false,matches.join(", "),row);
				};
			});
			if(flag && data.pageInfo.currentPage < data.pageInfo.lastPage && document.getElementById("queryOptions")){
				setTimeout(function(){caller(page + 1)},1000)
			}
		});
	};caller(1);
}},
