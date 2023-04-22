//begin "utilities.js"

/*
create()

This is the main framework code of the script
It shortens the otherwise verbose procedure of creating a new HTML element and inserting it into the DOM.
Instead of:

	let element = document.createElement("p");
	element.innerText = "lorem ipsum";
	element.classList.add("hohParagraph");
	pageParentElement.append(element);

You would do:

	create("p","hohParagraph","lorem ipsum");

All arguments except for the HTML tag are optional.
*/
function create(
	HTMLtag,//<string>: The kind of DOM element to create
	classes,//(optional) <string>: The css class to give the element  OR   [<strings>]: A list of multiple class names
	//(the first string of the list could optionally start with a "#", in which case it will be an id instead)
	text,//(optional) <string>: The innerText to give the element
	appendLocation,//(optional) DOMnode: a node to immediately append the created element to
	cssText//(optional) <string>: Inline CSS to appy to the element
){
	let element = document.createElement(HTMLtag);
	if(Array.isArray(classes)){
		element.classList.add(...classes);
		if(classes.includes("newTab")){
			element.setAttribute("target","_blank")
		}
	}
	else if(classes){
		if(classes[0] === "#"){
			element.id = classes.substring(1)
		}
		else{
			element.classList.add(classes);
			if(classes === "newTab"){
				element.setAttribute("target","_blank")
			}
		}
	}
	if(text || text === 0){
		element.innerText = text
	}
	if(appendLocation && appendLocation.appendChild){
		appendLocation.appendChild(element)
	}
	if(cssText){
		element.style.cssText = cssText
	}
	return element
}

function safeURL(URL){
/*
	NOTE: DO NOT USE THIS FOR ANYTHING 'UNSAFE'!
	This is a cosmetic utility, not a security feature
	consider using "purify.js" if you have to deal with naughty user input, or better, please stop what you are doing
 */
	let compo = encodeURIComponent((URL || "")
		.replace(/\s|\/|:|★|☆/g,"-")
		.replace(/\((\d+)\)/g,(string,year) => year)
		.replace(/(\.|\)|\\|\?|#|!|,|%|’)/g,"")
		.replace(/ä/g,"a")
		.replace(/×/g,"x")
	);
	if(useScripts.SFWmode){
		if(badWords.some(
			word => compo.includes(word)
		)){
			return ""
		}
	}
	return compo
}

function fuzzyDateCompare(first,second){//returns an INDEX, not to be used for sorting. That is, "-1" means they are equal.
	if(!first.year || !second.year){
		return -1
	}
	if(first.year > second.year){
		return 0
	}
	else if(first.year < second.year){
		return 1
	}
	if(!first.month || !second.month){
		return -1
	}
	if(first.month > second.month){
		return 0
	}
	else if(first.month < second.month){
		return 1
	}
	if(!first.day || !second.day){
		return -1
	}
	if(first.day > second.day){
		return 0
	}
	else if(first.day < second.day){
		return 1
	}
	return -1
}

//time in seconds, not milliseconds
function formatTime(diff,type){
	let magRound = function(num){
		if(num < 1){
			return Math.round(num);
		}
		else{
			if(
				Math.log(Math.ceil(num)) < 2*Math.log(num) - Math.log(Math.floor(num))
			){
				return Math.ceil(num)
			}
			else{
				return Math.floor(num)
			}
		}
	};
	let times = [
		{name: "year",short: translate("$time_short_year"),medium: translate("$time_medium_year"),Mmedium: translate("$time_medium_Myear"),value: 60*60*24*365},
		{name: "month",short: translate("$time_short_month"),medium: translate("$time_medium_month"),Mmedium: translate("$time_medium_Mmonth"),value: 60*60*24*30},
		{name: "week",short: translate("$time_short_week"),medium: translate("$time_medium_week"),Mmedium: translate("$time_medium_Mweek"),value: 60*60*24*7},
		{name: "day",short: translate("$time_short_day"),medium: translate("$time_medium_day"),Mmedium: translate("$time_medium_Mday"),value: 60*60*24},
		{name: "hour",short: translate("$time_short_hour"),medium: translate("$time_medium_hour"),Mmedium: translate("$time_medium_Mhour"),value: 60*60},
		{name: "minute",short: translate("$time_short_minute"),medium: translate("$time_medium_minute"),Mmedium: translate("$time_medium_Mminute"),value: 60},
		{name: "second",short: translate("$time_short_second"),medium: translate("$time_medium_second"),Mmedium: translate("$time_medium_Msecond"),value: 1}
	];
	let timeIndex = 0;
	let significantValue = 0;
	let remainder = 0;
	do{
		significantValue = diff/times[timeIndex].value;
		remainder = (diff - Math.floor(significantValue) * times[timeIndex].value)/times[timeIndex + 1].value;
		timeIndex++;
	}while(!Math.floor(significantValue) && timeIndex < (times.length - 1));
	timeIndex--;
	if(!Math.floor(significantValue)){
		if(type === "short"){
			return magRound(diff) + translate("$time_short_second")
		}
		if(magRound(diff) === 1){
			return magRound(diff) + " " + translate("$time_medium_second")
		}
		return magRound(diff) + " " + translate("$time_medium_Msecond");
	}
	if(Math.floor(significantValue) > 1){
		if(type === "short"){
			return magRound(significantValue) + times[timeIndex].short
		}
		else if(type === "twoPart"){
			let rem = magRound(remainder);
			if(rem === 1){
				return Math.floor(significantValue) + " " + times[timeIndex].Mmedium + " 1 " + times[timeIndex + 1].medium	
			}
			else if(rem){
				return Math.floor(significantValue) + " "+ times[timeIndex].Mmedium + " " + rem + " " + times[timeIndex + 1].Mmedium	
			}
			else{
				return magRound(significantValue) + " " + times[timeIndex].Mmedium;
			}
		}
		return magRound(significantValue) + " " + times[timeIndex].Mmedium;
	}
	if(magRound(remainder) > 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " " + magRound(remainder) + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].medium + " " + magRound(remainder) + " " + times[timeIndex + 1].Mmedium
	}
	if(magRound(remainder) === 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " 1" + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].medium + " 1 " + times[timeIndex + 1].medium;
	}
	if(type === "short"){
		return "1" + times[timeIndex].short
	}
	return "1 " + times[timeIndex].medium;
}

function nativeTimeElement(timestamp){//time in seconds
	let dateObj = new Date(timestamp*1000);
	let elem = create("time","hohTimeGeneric");
	elem.setAttribute("datetime",dateObj);
	let locale = languageFiles[useScripts.partialLocalisationLanguage].info.locale || undefined;
	elem.title = dateObj.toLocaleString(locale);
	let calculateTime = function(){
		let now = new Date();
		let diff = Math.round(now.valueOf()/1000) - Math.round(dateObj.valueOf()/1000);
		if(diff === 0){
			elem.innerText = translate("$time_now")
		}
		if(diff === 1){
			elem.innerText = translate("$time_1second")
		}
		else if(diff < 60){
			elem.innerText = translate("$time_Msecond",diff)
		}
		else{
			diff = Math.floor(diff/60);
			if(diff === 1){
				elem.innerText = translate("$time_1minute")
			}
			else if(diff < 60){
				elem.innerText = translate("$time_Mminute",diff)
			}
			else{
				diff = Math.floor(diff/60);
				if(diff === 1){
					elem.innerText = translate("$time_1hour")
				}
				else if(diff < 24){
					elem.innerText = translate("$time_Mhour",diff)
				}
				else{
					diff = Math.floor(diff/24);
					if(diff === 1){
						elem.innerText = translate("$time_1day")
					}
					else if(diff < 7){
						elem.innerText = translate("$time_Mday",diff)
					}
					else if(diff < 14){
						elem.innerText = translate("$time_1week")
					}
					else if(diff < 30){
						elem.innerText = translate("$time_Mweek",Math.floor(diff/7))
					}
					else if(diff < 365){
						if(Math.floor(diff/30) === 1){
							elem.innerText = translate("$time_1month")
						}
						else{
							elem.innerText = translate("$time_Mmonth",Math.floor(diff/30))
						}
					}
					else{
						diff = Math.floor(diff/365);
						if(diff === 1){
							elem.innerText = translate("$time_1year")
						}
						else{
							elem.innerText = translate("$time_Myear",diff)
						}
					}
				}
			}
		}
		setTimeout(function(){
			if(!document.body.contains(elem)){
				return
			}
			calculateTime()
		},20*1000)
	};calculateTime();
	return elem
}

let wilson = function(positiveScore,total){
	if(total === 0){
		return {
			left: 0,
			right: 0
		}
	}
	// phat is the proportion of successes
	// in a Bernoulli trial process
	let phat = positiveScore / total;
	// z is 1-alpha/2 percentile of a standard
	// normal distribution for error alpha=5%
	const z = 1.959963984540;
	// implement the algorithm https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
	let a = phat + z * z / (2 * total);
	let b = z * Math.sqrt((phat * (1 - phat) + z * z / (4 * total)) / total);
	let c = 1 + z * z / total;
	return {
		left: (a - b) / c,
		right: Math.min(1,(a + b) / c)
	}
};



//consider getting rid of this one
Number.prototype.roundPlaces = function(places){
	return +(
		Math.round(
			this * Math.pow(10,places)
		) / Math.pow(10,places)
	)
}

function capitalize(string){
	return (string + "").charAt(0).toUpperCase() + (string + "").slice(1)
}

function csvEscape(string){
	return "\"" + (string || "").replace(/"/g,"\"\"") + "\""
}

function entityUnescape(string){
	return string.replace(/&lt;/g,"<")
		.replace(/&gt;/g,">")
		.replace(/&quot;/g,"\"")
		.replace(/&#039;/g,"'")
		.replace(/<br\s?\/?>\n?/g,"\n")
		.replace(/&nbsp;/g," ")//not a nbsp, but close enough in most cases. Better than the raw entity at least
		.replace(/&amp;/g,"&")
}

//https://stackoverflow.com/a/7616484/5697837
function hashCode(string){//non-cryptographic hash
	var hash = 0, i, chr;
	if(string.length === 0){
		return hash
	}
	for(i = 0; i < string.length; i++) {
		chr   = string.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash
}

//piracy links begone
setInterval(function(){
	document.querySelectorAll(`a[rel="noopener noreferrer"]`).forEach(link => {
		if(!link || !link.href){
			return
		}
		let linker;
		try{
			linker = (new URL(link.href)).host;
		}
		catch(e){
			console.log("invalid URL:", link.href);
			return
		}
		if(linker && linker.split(".").length >= 2){
			linker = linker.split(".")[linker.split(".").length - 2];
			if(
				m4_include(data/badDomains.json).includes(hashCode(linker))
			){
				link.href = "https://anilist.co/forum/thread/14";
				link.innerText = translate("$piracy_message")
			}
		}
	})
	document.querySelectorAll(".sense-wrap").forEach(link => {
		link.style.display = "none"
	})
},2000);

const svgns = "http://www.w3.org/2000/svg";
const svgShape = function(shape,target,attributes,children,content){
	shape = shape || "g";
	let obj = document.createElementNS(svgns,shape);
	Object.keys(attributes || {}).forEach(key => {
		obj.setAttributeNS(null,key,attributes[key])
	});
	if(content){
		obj.appendChild(document.createTextNode(content))
	}
	if(target){
		target.appendChild(obj)
	}
	(children || []).forEach(
		child => {
			if(child.element){
				svgShape(child.element,obj,child.attributes,child.children,child.content)
			}
			else{
				obj.appendChild(child)
			}
		}
	)
	return obj
}
const VALUE = ((a,b) => a - b);//Used for sorting functions
const VALUE_DESC = ((b,a) => a - b);
const TRUTHY = (a => a);//filtering
const ACCUMULATE = (a,b) => (a || 0) + (b || 0);
const ALPHABETICAL = function(valueFunction){
	if(valueFunction){
		return (a,b) => ("" + valueFunction(a)).localeCompare("" + valueFunction(b))
	}
	return (a,b) => ("" + a).localeCompare("" + b)
}
const NOW = () => (new Date()).valueOf();

const Stats = {
	average: function(list){
		return list.reduce((a,b) => (a || 0) + (b || 0))/list.length
	},
	median: function(list){
		let temp = [...list].sort((a,b) => a - b);
		return (
			temp[Math.floor((temp.length - 1)/2)]
			+ temp[Math.ceil((temp.length - 1)/2)]
		)/2;
	},
	mode: function(list){
		return [...list].sort(
			(b,a) => list.filter(
				e => e === a
			).length - list.filter(
				e => e === b
			).length
		)[0];
	}
}

const evalBackslash = function(text){
	let output = "";
	let special = false;
	Array.from(text).forEach(char => {
		if(char === "\\"){
			if(special){
				output += "\\"
			}
			special = !special;
		}
		else{
			output += char;
		}
	});
	return output
}

//this function is for removing duplicates in a sorted list.
//the twist is that it also provides a way to merge the duplicates with a custom function
const removeGroupedDuplicates = function(
	list,
	uniquenessFunction,
	modificationFunction
){//both functions optional
	if(!uniquenessFunction){
		uniquenessFunction = e => e
	}
	list = list.sort(
		(a,b) => uniquenessFunction(a) - uniquenessFunction(b)
	);
	let returnList = [];
	list.forEach((element,index) => {
		if(index === list.length - 1){
			returnList.push(element);
			return;
		}
		if(uniquenessFunction(element) === uniquenessFunction(list[index + 1])){
			if(modificationFunction){
				modificationFunction(element,list[index + 1])
			}
		}
		else{
			returnList.push(element)
		}
	});
	return returnList
};

//for the school/workplace methods
let badWords = ["hentai","loli","nsfw","ecchi","sex","gore","porn","violence","lewd","fuck","waifu","nigger","卍"];//woooo so bad.
const badTags = ["gore","nudity","ahegao","irrumatio","sex toys","ashikoki","defloration","paizuri","tekoki","nakadashi","large breasts","facial","futanari","public sex","flat chest","voyeur","fellatio","incest","threesome","anal sex","bondage","cunnilingus","harem","masturbation","slavery","gyaru","rape","netori","milf","handjob","blackmail","sumata","watersports","boobjob","femdom","exhibitionism","human pet","virginity","group sex"];
badWords = badWords.concat(badTags);

function createCheckbox(target,id,checked){//target[,id]
	let hohCheckbox = create("label",["hohCheckbox","el-checkbox__input"],false,target);		
	let checkbox = create("input",false,false,hohCheckbox);
	if(id){
		checkbox.id = id
	}
	checkbox.type = "checkbox";
	checkbox.checked = !!checked;
	create("span","el-checkbox__inner",false,hohCheckbox);
	return checkbox
}

m4_include(utilities/displayBox.js)

function removeChildren(node){
	if(node){
		while(node.childElementCount){
			node.lastChild.remove()
		}
	}
}

const svgAssets = {
	envelope : "✉",
	cross : "✕",
	check: "✓",
	loading: "…",
	like : "♥"
};

const svgAssets2 = {};
m4_include(data/inlineSVG.json).forEach(inlineSVG => {
	svgAssets2[inlineSVG.name] = svgShape(inlineSVG.shape.element,false,inlineSVG.shape.attributes,inlineSVG.shape.children,inlineSVG.shape.content)
})

const statusTypes = {
	"COMPLETED" : translate("$mediaStatus_completed"),
	"CURRENT"   : translate("$mediaStatus_current"),
	"PAUSED"    : translate("$mediaStatus_paused"),
	"DROPPED"   : translate("$mediaStatus_dropped"),
	"PLANNING"  : translate("$mediaStatus_planning"),
	"REPEATING" : translate("$mediaStatus_repeating")
};

//semantic order, from "very positive", completed, to "very negative", dropped.
//planning is a neutral in the middle.
//repeating is kinda like a middle ground between current and completed
const semmanticStatusOrder = ["COMPLETED","REPEATING","CURRENT","PLANNING","PAUSED","DROPPED"];

const distributionColours = {
	"COMPLETED" : "rgb(104, 214,  57)",
	"CURRENT"   : "rgb(  2, 169, 255)",
	"PAUSED"    : "rgb(247, 121, 164)",
	"DROPPED"   : "rgb(232,  93, 117)",
	"PLANNING"  : "rgb(247, 154,  99)",
	"REPEATING" : "violet"
};

const distributionFormats = {
	"TV" : translate("$mediaFormat_TV"),
	"TV_SHORT" : translate("$mediaFormat_TV_SHORT"),
	"MOVIE" : translate("$mediaFormat_MOVIE"),
	"SPECIAL" : translate("$mediaFormat_SPECIAL"),
	"OVA" : translate("$mediaFormat_OVA"),
	"ONA" : translate("$mediaFormat_ONA"),
	"MUSIC" : translate("$mediaFormat_MUSIC"),
	"MANGA" : translate("$mediaFormat_MANGA"),
	"NOVEL" : translate("$mediaFormat_NOVEL"),
	"ONE_SHOT" : translate("$mediaFormat_ONE_SHOT")
};

const distributionStatus = {
	"FINISHED" : translate("$mediaReleaseStatus_finished",null,"Finished"),
	"RELEASING" : translate("$mediaReleaseStatus_releasing",null,"Releasing"),
	"NOT_YET_RELEASED" : translate("$mediaReleaseStatus_notYetReleased",null,"Not Yet Released"),
	"CANCELLED" : translate("$mediaReleaseStatus_cancelled",null,"Cancelled"),
	"HIATUS"    : translate("$mediaReleaseStatus_hiatus",null,"Hiatus"),
	anime: {
		"FINISHED" : translate("$mediaReleaseStatusAnime_finished",null,"Finished"),
		"RELEASING" : translate("$mediaReleaseStatusAnime_releasing",null,"Releasing"),
		"NOT_YET_RELEASED" : translate("$mediaReleaseStatusAnime_notYetReleased",null,"Not Yet Released"),
		"CANCELLED" : translate("$mediaReleaseStatusAnime_cancelled",null,"Cancelled"),
		"HIATUS"    : translate("$mediaReleaseStatusAnime_hiatus",null,"Hiatus"),
	},
	manga: {
		"FINISHED" : translate("$mediaReleaseStatusManga_finished",null,"Finished"),
		"RELEASING" : translate("$mediaReleaseStatusManga_releasing",null,"Releasing"),
		"NOT_YET_RELEASED" : translate("$mediaReleaseStatusManga_notYetReleased",null,"Not Yet Released"),
		"CANCELLED" : translate("$mediaReleaseStatusManga_cancelled",null,"Cancelled"),
		"HIATUS"    : translate("$mediaReleaseStatusManga_hiatus",null,"Hiatus"),
	}
};

const categoryColours = new Map([
	[1,"rgb(0, 170, 255)"],
	[2,"rgb(76, 175, 80)"],
	[3,"rgb(75, 179, 185)"],
	[4,"rgb(75, 179, 185)"],
	[5,"rgb(103, 58, 183)"],
	[7,"rgb(78, 163, 230)"],
	[8,"rgb(0, 150, 136)"],
	[9,"rgb(96, 125, 139)"],
	[10,"rgb(36, 36, 169)"],
	[11,"rgb(251, 71, 30)"],
	[12,"rgb(239, 48, 81)"],
	[13,"rgb(233, 30, 99)"],
	[15,"rgb(184, 90, 199)"],
	[16,"rgb(255, 152, 0)"],
	[17,"rgb(121, 85, 72)"],
	[18,"rgb(43, 76, 105)"]
]);

m4_include(utilities/colourPicker.js)

function scoreFormatter(score,format){
	let scoreElement = create("span","hohScore");
	if(format === "POINT_100"){
		scoreElement.innerText = score + "/100"
	}
	else if(
		format === "POINT_10_DECIMAL"
		|| format === "POINT_10"
	){
		scoreElement.innerText = score + "/10"
	}
	else if(format === "POINT_3"){
		scoreElement.classList.add("hohSmiley");
		if(score === 3){
			scoreElement.appendChild(svgAssets2.smile.cloneNode(true));
		}
		else if(score === 2){
			scoreElement.appendChild(svgAssets2.meh.cloneNode(true));
		}
		else if(score === 1){
			scoreElement.appendChild(svgAssets2.frown.cloneNode(true));
		}
	}
	else if(format === "POINT_5"){
		scoreElement.innerText = score;
		scoreElement.appendChild(svgAssets2.star.cloneNode(true));
	}
	else{//future types. Just gambling that they look okay in plain text
		scoreElement.innerText = score
	}
	return scoreElement
}

function convertScore(score,format){
	if(format === "POINT_100"){
		return score || 0
	}
	else if(
		format === "POINT_10_DECIMAL" ||
		format === "POINT_10"
	){
		return score*10 || 0
	}
	else if(format === "POINT_3"){
		if(score === 3){
			return 85
		}
		else if(score === 2){
			return 60
		}
		else if(score === 1){
			return 35
		}
		return 0
	}
	else if(format === "POINT_5"){
		if(score === 0){
			return 0
		}
		return (score*20 - 10) || 0
	}
}

m4_include(utilities/saveAs.js)

m4_include(utilities/levDist.js)

m4_include(utilities/lz-string.js)

m4_include(utilities/localforage.js)

m4_include(utilities/showdown.js)

showdown.setOption("strikethrough", true);
showdown.setOption("ghMentions", true);
showdown.setOption("emoji", true);
showdown.setOption("tables", false);
showdown.setOption("simpleLineBreaks", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("ghMentionsLink", "https://anilist.co/user/{u}/");
const converter = new showdown.Converter();

let makeHtml = function(markdown){
	markdown = markdown.replace("----","---");
	let centerSplit = markdown.split("~~~");
	let imgRegex = /img(\d+%?)?\(http.+?\)/gi;
	centerSplit = centerSplit.map(component => {
		let images = component.match(imgRegex);
		if(images){
			images.forEach(image => {
				let imageParts = image.match(/^img(\d+%?)?\((http.+?)\)$/i);
				component = component.replace(image,`<img width="${imageParts[1] || ""}" src="${imageParts[2]}">`)
			})
			return component
		}
		else{
			return component
		}
	})
	let webmRegex = /webm\(http.+?\)/gi;
	centerSplit = centerSplit.map(component => {
		let webms = component.match(webmRegex);
		if(webms){
			webms.forEach(webm => {
				let webmParts = webm.match(/^webm\((http.+?)\)$/i);
				component = component.replace(webm,`<video src="${webmParts[1]}" controls="true" loop="" ${useScripts.noAutoplay ? "" : 'autoplay="" '}muted=""></video>`)
			})
			return component
		}
		else{
			return component
		}
	})
	let youtubeRegex = /youtube\(.+?\)/gi;
	centerSplit = centerSplit.map(component => {
		let videos = component.match(youtubeRegex);
		if(videos){
			videos.forEach(video => {
				let videoParts = video.match(/^youtube\((.+?)\)$/i);
				component = component.replace(video,`<a href="${videoParts[1]}">${videoParts[1]}</a>`)
			})
		}
		return component
	});
	let preProcessed = [centerSplit[0]];
	let openCenter = false;
	for(let i=1;i<centerSplit.length;i++){
		if(openCenter){
			preProcessed.push("</center>");
		}
		else{
			preProcessed.push("<center>");
		}
		preProcessed.push(centerSplit[i]);
		openCenter = !openCenter
	}
	preProcessed = preProcessed.map(element => {
		if(/~!/.test(element) || /!~/.test(element)){
			return element.replace(/~!/g,"<span class=\"markdown_spoiler\">").replace(/!~/g,"</span>");
		}
		return element
		
	})
	return converter.makeHtml(preProcessed.join(""))
}

function returnList(_list,skipProcessing){
	if(!_list){
		return null
	}
	const list = window.structuredClone ? structuredClone(_list) : _list;
	let retl = [];
	if(skipProcessing){
		retl = list.data.MediaListCollection.lists.map(list => list.entries).flat();
	}
	else {
		retl = list.data.MediaListCollection.lists.map(list => {
			return list.entries.map(entry => {
				entry.isCustomList = list.isCustomList;
				if(entry.isCustomList){
					entry.listLocations = [list.name]
				}
				else{
					entry.listLocations = []
				}
				entry.scoreRaw = Math.min(entry.scoreRaw,100);
				if(!entry.media.episodes && entry.media.nextAiringEpisode){
					entry.media.episodes = entry.media.nextAiringEpisode.episode - 1
				}
				if(entry.notes){
					entry.listJSON = parseListJSON(entry.notes)
				}
				if(entry.media.a){
					entry.media.staff = removeGroupedDuplicates(
						entry.media.a.nodes.concat(
							entry.media.b.nodes
						),
						e => e.id
					);
					delete entry.media.a;
					delete entry.media.b;
				}
				if(entry.repeat > 10000){//counting eps as repeat, 10x One Piece as the plausibility baseline
					entry.repeat = 0
				}
				if(entry.status === "REPEATING" && entry.repeat === 0){
					entry.repeat = 1
				}
				return entry;
			})
		}).flat();
	}
	return removeGroupedDuplicates(
		retl,
		e => e.mediaId,
		(oldElement,newElement) => {
			if(!skipProcessing){
				newElement.listLocations = newElement.listLocations.concat(oldElement.listLocations);
				newElement.isCustomList = oldElement.isCustomList || newElement.isCustomList;
			}
		}
	)
}

m4_include(utilities/parseListJSON.js)

function formatCompat(compatData,targetLocation,name){
	let differenceSpan = create("span",false,compatData.difference.roundPlaces(3));
	if(compatData.difference < 0.9){
		differenceSpan.style.color = "green"
	}
	else if(compatData.difference > 1.1){
		differenceSpan.style.color = "red"
	}
	targetLocation.innerText = "";
	targetLocation.appendChild(differenceSpan);
	let countSpan = create("span",false," based on " + compatData.shared + " shared entries. Lower is better. 0.8 - 1.1 is common\nFormally, this is 'standard deviation between normalized ratings'",targetLocation);
	let canvas = create("canvas",false,false,targetLocation,"display:block;");
	canvas.title = "Blue = " + name + "\nRed = you";
	canvas.width = 200;
	canvas.height = 100;
	let r1 = Math.sqrt(compatData.list1/(compatData.list1 + compatData.list2));
	let r2 = Math.sqrt(compatData.list2/(compatData.list1 + compatData.list2));
	let distance;
	if(compatData.shared === compatData.list1 || compatData.shared === compatData.list2){
		distance = Math.abs(r1 - r2)
	}
	else if(compatData.shared === 0){
		distance = r1 + r2
	}
	else{
		let areaOfIntersection = function(d,r0,r1){
			let rr0 = r0 * r0;
			let rr1 = r1 * r1;
			let phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
			let theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
			let area1 = (theta * rr1 - rr1 * Math.sin(theta))/2;
			let area2 = (phi * rr0 - rr0 * Math.sin(phi))/2;
			return area1 + area2;
		};
		let overlapArea = Math.PI*compatData.shared/(compatData.list1 + compatData.list2);
		let pivot0 = Math.abs(r1 - r2);
		let pivot1 = r1 + r2;
		while(pivot1 - pivot0 > (r1 + r2)/100){
			distance = (pivot0 + pivot1)/2;
			if(areaOfIntersection(distance,r1,r2) > overlapArea){
				pivot0 = distance
			}
			else{
				pivot1 = distance
			}
		}
	}
	let ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(250,122,122)";
	ctx.arc(50 + 50*distance,50,50*r2,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242,0.5)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
}

function compatCheck(list,name,type,callback){
	const variables = {
		name: name,
		listType: type
	};
	generalAPIcall(queryMediaListCompat,variables,function(data){
		list.sort((a,b) => a.mediaId - b.mediaId);
		let list2 = returnList(data).filter(element => element.scoreRaw);
		let list3 = [];
		let indeks1 = 0;
		let indeks2 = 0;
		while(indeks1 < list.length && indeks2 < list2.length){
			if(list2[indeks2].mediaId > list[indeks1].mediaId){
				indeks1++;
				continue
			}
			if(list2[indeks2].mediaId < list[indeks1].mediaId){
				indeks2++;
				continue
			}
			if(list2[indeks2].mediaId === list[indeks1].mediaId){
				list3.push({
					mediaId: list[indeks1].mediaId,
					score1: list[indeks1].scoreRaw,
					score2: list2[indeks2].scoreRaw
				});
				indeks1++;
				indeks2++
			}
		}
		let average1 = 0;
		let average2 = 0;
		list3.forEach(item => {
			average1 += item.score1;
			average2 += item.score2;
			item.sdiff = item.score1 - item.score2
		});
		average1 = average1/list3.length;
		average2 = average2/list3.length;
		let standev1 = 0;
		let standev2 = 0;
		list3.forEach(item => {
			standev1 += Math.pow(item.score1 - average1,2);
			standev2 += Math.pow(item.score2 - average2,2)
		});
		standev1 = Math.sqrt(standev1/(list3.length - 1));
		standev2 = Math.sqrt(standev2/(list3.length - 1));
		let difference = 0;
		list3.forEach(item => {
			difference += Math.abs(
				(item.score1 - average1)/standev1
				- (item.score2 - average2)/standev2
			)
		});
		difference = difference/list3.length;
		callback({
			difference: difference,
			shared: list3.length,
			list1: list.length,
			list2: list2.length,
			user: name
		})
	})
}

//used by the stats module, and to safeguard the manga chapter guesses
//publishing manga is a bit tricky, since Anilist doesn't track chapters
const commonUnfinishedManga = m4_include(data/commonUnfinishedManga.json)
if(NOW() - new Date(2022,11,11) > 365*24*60*60*1000){
	console.log("remind hoh to update the commonUnfinishedManga list")
}

//idea by GoBusto: https://gitlab.com/gobusto/unicodifier
function emojiSanitize(string){
	return Array.from(string).map(char => {
		let codePoint = char.codePointAt(0);
		if(codePoint > 0xFFFF){
			return "&#" + codePoint + ";"
		}
		return char
	}).join("")
}

function looseMatcher(string,searcher){
	return string.toLowerCase().includes(searcher.toLowerCase())
	|| RegExp(searcher,"i").test(string.toLowerCase())
}

const titlePicker = function(media){
	let title = media.title.romaji
	if(aliases.has(media.id)){
		title = aliases.get(media.id)
	}
	else if(useScripts.titleLanguage === "NATIVE" && media.title.native){
		title = media.title.native
	}
	else if(useScripts.titleLanguage === "ENGLISH" && media.title.english){
		title = media.title.english
	}
	if(useScripts.SFWmode){
		badWords.forEach(word => {
			title = title.replace(word,"*")
		})
	}
	return title
}

function cheapReload(linkElement,vueData){
	linkElement.onclick = function(){
		try{
			document.getElementById('app').__vue__._router.push(vueData);
			return false
		}
		catch(e){
			console.warn("vue routes are outdated!")
		}
	}
}

/**
 * Check if a property exists in the given object
 * @param {object} obj
 * @param {string} prop
 * @returns {boolean}
 */
function hasOwn(obj, prop){
	return Object.hasOwn ? Object.hasOwn(obj, prop) : Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Watch for an element's existence
 * @param {string} selector
 * @param {any} [parent]
 * @returns {Promise<Element>}
 */
function watchElem(selector, parent) {
	return new Promise(resolve => {
		new MutationObserver((_mutations, observer) => {
			const elem = (parent || document).querySelector(selector);
			if (elem) {
				observer.disconnect()
				resolve(elem)
			}
		}).observe(parent || document.body, { subtree: true, childList: true })
	})
}
//end "utilities.js"
