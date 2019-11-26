function safeURL(URL){
	let compo = encodeURIComponent((URL || "").replace(/\s|\/|:|★/g,"-").replace(/(\.|\)|\\|#|!|,|%|’)/g,"").replace(/ä/g,"a"));
	if(useScripts.SFWmode){
		if(badWords.some(
			word => compo.match(word)
		)){
			return ""
		}
	}
	return compo
}

function fuzzyDateCompare(first,second){//returns and INDEX, not to be used for sorting
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
		{name: "year",short: "y",value: 60*60*24*365},
		{name: "month",short: "m",value: 60*60*24*30},
		{name: "week",short: "w",value: 60*60*24*7},
		{name: "day",short: "d",value: 60*60*24},
		{name: "hour",short: "h",value: 60*60},
		{name: "minute",short: "m",value: 60},
		{name: "second",short: "s",value: 1},
	];
	let timeIndex = 0;
	let significantValue = 0;
	let reminder = 0;
	do{
		significantValue = diff/times[timeIndex].value;
		reminder = (diff - Math.floor(significantValue) * times[timeIndex].value)/times[timeIndex + 1].value;
		timeIndex++;
	}while(!Math.floor(significantValue) && timeIndex < (times.length - 1));
	timeIndex--;
	if(!Math.floor(significantValue)){
		if(type === "short"){
			return magRound(diff) + "s"
		};
		if(magRound(diff) === 1){
			return magRound(diff) + " second"
		};
		return magRound(diff) + " seconds";
	}
	if(Math.floor(significantValue) > 1){
		if(type === "short"){
			return magRound(significantValue) + times[timeIndex].short
		};
		return magRound(significantValue) + " " + times[timeIndex].name + "s";
	}
	if(magRound(reminder) > 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " " + magRound(reminder) + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].name + " " + magRound(reminder) + " " + times[timeIndex + 1].name + "s";
	}
	if(magRound(reminder) === 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " 1" + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].name + " 1 " + times[timeIndex + 1].name;
	}
	if(type === "short"){
		return "1" + times[timeIndex].short
	}
	return "1 " + times[timeIndex].name;
}

function nativeTimeElement(timestamp){
	let dateObj = new Date(timestamp*1000);
	let elem = create("time");
	elem.setAttribute("datetime",dateObj);
	elem.title = dateObj.toLocaleDateString() + ", " + dateObj.toLocaleTimeString();
	let calculateTime = function(){
		let now = new Date();
		let diff = Math.round(now.valueOf()/1000) - Math.round(dateObj.valueOf()/1000);
		if(diff === 0){
			elem.innerText = "Just now";
		}
		if(diff === 1){
			elem.innerText = "1 second ago";
		}
		else if(diff < 60){
			elem.innerText = diff + " seconds ago";
		}
		else{
			diff = Math.floor(diff/60);
			if(diff === 1){
				elem.innerText = "1 minute ago";
			}
			else if(diff < 60){
				elem.innerText = diff + " minutes ago";
			}
			else{
				diff = Math.floor(diff/60);
				if(diff === 1){
					elem.innerText = "1 hour ago";
				}
				else if(diff < 24){
					elem.innerText = diff + " hours ago";
				}
				else{
					diff = Math.floor(diff/24);
					if(diff === 1){
						elem.innerText = "1 day ago";
					}
					else if(diff < 7){
						elem.innerText = diff + " days ago";
					}
					else if(diff === 7){
						elem.innerText = "1 week ago";
					}
					else if(diff < 30){
						elem.innerText = Math.floor(diff/7) + " weeks ago";
					}
					else if(diff < 365){
						if(Math.floor(diff/30) === 1){
							elem.innerText = "1 month ago";
						}
						else{
							elem.innerText = Math.floor(diff/30) + " months ago";
						}
					}
					else{
						diff = Math.floor(diff/365);
						if(diff === 1){
							elem.innerText = "1 year ago";
						}
						else{
							elem.innerText = diff + " years ago";
						}
					}
				}
			}
		};
		setTimeout(function(){
			if(!document.body.contains(elem)){
				return
			}
			calculateTime()
		},60*1000)
	};calculateTime();
	return elem;
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
	const z = 1.96;
	// implement the algorithm https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
	let a = phat + z * z / (2 * total);
	let b = z * Math.sqrt((phat * (1 - phat) + z * z / (4 * total)) / total);
	let c = 1 + z * z / total;
	return {
		left: (a - b) / c,
		right: Math.min(1,(a + b) / c)
	};
};

if(!String.prototype.includes){//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	String.prototype.includes = function(search,start){
		'use strict';
		if(search instanceof RegExp){
			throw TypeError('first argument must not be a RegExp');
		} 
		if(start === undefined){
			start = 0
		}
		return this.indexOf(search,start) !== -1;
	}
}

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

setInterval(function(){
	document.querySelectorAll(`a[rel="noopener noreferrer"]`).forEach(link => {
		let linker = (new URL(link.href)).host;
		if(linker && linker.split(".").length >= 2){
			linker = linker.split(".")[linker.split(".").length - 2];
			if(
[556415734,1724824539,-779421562,-1111399772,-93654449,1120312799,-781704176,-1550515495,3396395,567115318,-307082983,1954992241,-307211474,-307390044,1222804306,-795095039,-1014860289,403785740].includes(hashCode(linker))
			){
				link.href = "https://anilist.co/forum/thread/14";
				link.innerText = "THIS BE BAD LINK, IT'S NOW VEWY DISPOSED OF OwO (click the report button to call the mods on this naughty user)";
			}
		}
	})
	document.querySelectorAll(".sense-wrap").forEach(link => {
		link.remove()
	})
},2000);

const svgns = "http://www.w3.org/2000/svg";
const svgShape = function(shape,target,attributes){
	shape = shape || "g";
	let obj = document.createElementNS(svgns,shape);
	Object.keys(attributes || {}).forEach(key => {
		obj.setAttributeNS(null,key,attributes[key])
	});
	if(target){
		target.appendChild(obj)
	}
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
		uniquenessFunction = e => e;
	};
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
				modificationFunction(element,list[index + 1]);
			}
		}
		else{
			returnList.push(element);
		}
	});
	return returnList
};

//for the school/workplace methods
let badWords = ["hentai","loli","nsfw","ecchi","sex","gore","porn","violence","lewd","fuck","waifu"];//woooo so bad.
const badTags = ["gore","nudity","ahegao","irrumatio","sex toys","ashikoki","defloration","paizuri","tekoki","nakadashi","large breasts","facial","futanari","public sex","flat chest","voyeur","fellatio","incest","threesome","anal sex","bondage","cunnilingus","harem","masturbation","slavery","gyaru","rape"];
badWords = badWords.concat(badTags);

function create(type,classes,text,appendLocation,cssText){
	let element = document.createElement(type);
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
	};
	if(text || text === 0){
		element.innerText = text
	};
	if(appendLocation && appendLocation.appendChild){
		appendLocation.appendChild(element)
	};
	if(cssText){
		element.style.cssText = cssText
	};
	return element;
};

function createCheckbox(target,id,checked){//target[,id]
	let hohCheckbox = create("label",["hohCheckbox","el-checkbox__input"],false,target);		
	let checkbox = create("input",false,false,hohCheckbox);
	if(id){
		checkbox.id = id
	}
	checkbox.type = "checkbox";
	checkbox.checked = !!checked;
	create("span","el-checkbox__inner",false,hohCheckbox);
	return checkbox;
}

function createDisplayBox(cssProperties){
	let displayBox = create("div","hohDisplayBox",false,document.querySelector("#app"),cssProperties);
	let mousePosition;
	let offset = [0,0];
	let isDown = false;
	let isDownResize = false;
	let displayBoxClose = create("span","hohDisplayBoxClose",svgAssets.cross,displayBox);
	displayBoxClose.onclick = function(){
		displayBox.remove();
	};
	let resizePearl = create("span","hohResizePearl",false,displayBox);
	displayBox.addEventListener("mousedown",function(e){
		isDown = true;
		offset = [
			displayBox.offsetLeft - e.clientX,
			displayBox.offsetTop - e.clientY
		];
	},true);
	resizePearl.addEventListener("mousedown",function(e){
		event.stopPropagation();
		event.preventDefault();
		isDownResize = true;
		offset = [
			displayBox.offsetLeft,
			displayBox.offsetTop
		];
	},true);
	document.addEventListener("mouseup",function(){
		isDown = false;
		isDownResize = false;
	},true);
	document.addEventListener("mousemove",function(event){
		event.preventDefault();
		if(isDownResize){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.width = (mousePosition.x - offset[0]) + "px";
			displayBox.style.height = (mousePosition.y - offset[1]) + "px";
			return;
		}
		if(isDown){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.left = (mousePosition.x + offset[0]) + "px";
			displayBox.style.top  = (mousePosition.y + offset[1]) + "px";
		}
	},true);
	let innerSpace = create("div","scrollableContent",false,displayBox);
	return innerSpace;
}

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
	like : "♥",
	likeNative : `
<svg aria-hidden="true" data-prefix="fas" data-icon="heart" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-heart fa-w-16 fa-sm"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" class=""></path></svg>`,
	frown : `
<svg aria-hidden="true" data-prefix="far" data-icon="frown" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-frown fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-80 128c-40.2 0-78 17.7-103.8 48.6-8.5 10.2-7.1 25.3 3.1 33.8 10.2 8.5 25.3 7.1 33.8-3.1 16.6-19.9 41-31.4 66.9-31.4s50.3 11.4 66.9 31.4c4.8 5.7 11.6 8.6 18.5 8.6 5.4 0 10.9-1.8 15.4-5.6 10.2-8.5 11.5-23.6 3.1-33.8C326 321.7 288.2 304 248 304z">
	</path>
</svg>`,
	meh : `
<svg aria-hidden="true" data-prefix="far" data-icon="meh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-meh fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm8 144H160c-13.2 0-24 10.8-24 24s10.8 24 24 24h176c13.2 0 24-10.8 24-24s-10.8-24-24-24z">
	</path>
</svg>`,
	smile : `
<svg aria-hidden="true" data-prefix="far" data-icon="smile" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-smile fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm84-143.4c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.6-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.2-8.4-25.3-7.1-33.8 3.1zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z">
	</path>
</svg>`,
	star : `
<svg aria-hidden="true" data-prefix="fas" data-icon="star" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="icon svg-inline--fa fa-star fa-w-18">
	<path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z">
	</path>
</svg>`,
	notes: `
<svg aria-hidden="true" data-icon="notes" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-redo-alt fa-w-16">
	<path fill="currentColor" d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z">
	</path>
</svg>`,
	//the column sorting arrow
	angleDown : `
<svg aria-hidden="true" data-prefix="fas" data-icon="angle-down" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="svg-inline--fa fa-angle-down fa-w-10">
	<path fill="currentColor" d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z">
	</path>
</svg>`,
	view : `
<svg aria-hidden="true" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-18 fa-sm">
	<path fill="currentColor" d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z">
	</path>
</svg>`,
	reply : `
<svg aria-hidden="true" data-prefix="fas" data-icon="comments" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-comments fa-w-18 fa-sm">
	<path fill="currentColor" d="M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z">
	</path>
</svg>`,
	repeat : `
<svg aria-hidden="true" data-prefix="fas" data-icon="redo-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-redo-alt fa-w-16 repeat">
	<path fill="currentColor" d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z">
	</path>
</svg>`,
	external : `
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
	<path fill="#fff" stroke="#36c" d="M1.5 4.518h5.982V10.5H1.5z"/>
	<path fill="#36c" d="M5.765 1H11v5.39L9.427 7.937l-1.31-1.31L5.393 9.35l-2.69-2.688 2.81-2.808L4.2 2.544z"/>
	<path fill="#fff" d="M9.995 2.004l.022 4.885L8.2 5.07 5.32 7.95 4.09 6.723l2.882-2.88-1.85-1.852z"/>
</svg>`,
	listView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="list-ul" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-list-ul fa-w-16">
	<g fill="currentColor">
		<circle cx="48" cy="96"  r="48"/>
		<circle cx="48" cy="256" r="48"/>
		<circle cx="48" cy="416" r="48"/>
		<rect x="128" y="60"  width="384" height="72" rx="16"/>
		<rect x="128" y="220" width="384" height="72" rx="16"/>
		<rect x="128" y="380" width="384" height="72" rx="16"/>
	</g>
</svg>`,
	simpleListView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="list-ul" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-list-ul fa-w-16">
	<g fill="currentColor">
		<rect x="0" y="60"  width="384" height="72" rx="16"/>
		<rect x="0" y="220" width="384" height="72" rx="16"/>
		<rect x="0" y="380" width="384" height="72" rx="16"/>
	</g>
</svg>`,
	bigListView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-list" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-list fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="149" height="128" rx="24"/>
		<rect x="0"   y="192" width="149" height="128" rx="24"/>
		<rect x="0"   y="352" width="149" height="128" rx="24"/>
		<rect x="181" y="32"  width="331" height="128" rx="24"/>
		<rect x="181" y="192" width="331" height="128" rx="24"/>
		<rect x="181" y="352" width="331" height="128" rx="24"/>
	</g>
</svg>`,
	compactView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-large" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-large fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="155" height="208" rx="24"/>
		<rect x="0"   y="272" width="155" height="208" rx="24"/>
		<rect x="178" y="32"  width="155" height="208" rx="24"/>
		<rect x="178" y="272" width="155" height="208" rx="24"/>
		<rect x="356" y="32"  width="155" height="208" rx="24"/>
		<rect x="356" y="272" width="155" height="208" rx="24"/>
	</g>
</svg>`,
	cardView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-large" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-large fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="240" height="208" rx="24"/>
		<rect x="0"   y="272" width="240" height="208" rx="24"/>
		<rect x="272" y="32"  width="240" height="208" rx="24"/>
		<rect x="272" y="272" width="240" height="208" rx="24"/>
	</g>
</svg>`,
	link : `
<svg aria-hidden="true" data-prefix="fas" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-link fa-w-16 fa-sm">
	<path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path>
</svg>`,
	eye: `
<svg data-v-2b6aef6a="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-18 fa-sm"><path data-v-2b6aef6a="" fill=\"currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" class=""></path></svg>`
};

const distributionColours = {
	"COMPLETED" : "rgb(104, 214,  57)",
	"CURRENT"   : "rgb(  2, 169, 255)",
	"PAUSED"    : "rgb(247, 121, 164)",
	"DROPPED"   : "rgb(232,  93, 117)",
	"PLANNING"  : "rgb(247, 154,  99)",
	"REPEATING" : "violet"
};

const distributionFormats = {
	"TV" : "TV",
	"TV_SHORT" : "TV Short",
	"MOVIE" : "Movie",
	"SPECIAL" : "Special",
	"OVA" : "OVA",
	"ONA" : "ONA",
	"MUSIC" : "Music",
	"MANGA" : "Manga",
	"NOVEL" : "Light Novel",
	"ONE_SHOT" : "One Shot"
};

const distributionStatus = {
	"FINISHED" : "Finished",
	"RELEASING" : "Releasing",
	"NOT_YET_RELEASED" : "Not Yet Released",
	"CANCELLED" : "Cancelled"
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

if(useScripts.mangaBrowse){
	let navLinks = document.querySelector(`#nav .links .link[href="/search/anime"]`);
	if(navLinks){
		navLinks.href = "/search/manga";
		/*must remove the existing evenlistener for clicks.
		the reason for this is that it fires before the link, making the href useless
		this unfortunately turns it into a regular link, which reloads the page, so it's slower than the default behaviour.
		but since user interactions is even slower, this still saves time for those who only are interested in manga
		*/
		let mangaBrowseLink = navLinks.cloneNode(true);//copying and pasting the node should remove all event references to it
		navLinks.parentNode.replaceChild(mangaBrowseLink,navLinks);
	};
};

if(useScripts.colourPicker && (!useScripts.mobileFriendly)){
	let colourStyle = create("style");
	colourStyle.id = "colour-picker-styles";
	colourStyle.type = "text/css";
	documentHead.appendChild(colourStyle);
	const basicStyles = `
.footer .links{
	margin-left: calc(0px + 1%);
	transform: translate(0px,10px);
}
.hohColourPicker .hohCheckbox{
	margin-left: 10px;
}
`;
	if(Array.isArray(useScripts.colourSettings)){//legacy styles
		let newObjectStyle = {};
		useScripts.colourSettings.forEach(
			colour => newObjectStyle[colour.colour] = {
				initial: colour.initial,
				dark: colour.dark,
				contrast: colour.contrast
			}
		);
		useScripts.colourSettings = newObjectStyle;
		useScripts.save()
	}
	let applyColourStyles = function(){
		colourStyle.textContent = basicStyles;//eh, fix later.
		Object.keys(useScripts.colourSettings).forEach(key => {
			let colour = useScripts.colourSettings[key];
			let hexToRgb = function(hex){
				let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? [
					parseInt(result[1],16),
					parseInt(result[2],16),
					parseInt(result[3],16)
				] : null;
			}
			if(colour.initial){
				colourStyle.textContent += `:root{${key}:${hexToRgb(colour.initial).join(",")};}`
			};
			if(colour.dark){
				colourStyle.textContent += `.site-theme-dark{${key}:${hexToRgb(colour.dark).join(",")};}`
			};
			if(colour.contrast){
				colourStyle.textContent += `.site-theme-contrast{${key}:${hexToRgb(colour.contrast).join(",")};}`
			}
		})
	};applyColourStyles();
	let colourPickerLocation = document.querySelector("#app > .wrap > .footer > .container");
	if(colourPickerLocation){
		const supportedColours = [
			"--color-background",
			"--color-foreground",
			"--color-foreground-grey",
			"--color-foreground-grey-dark",
			"--color-foreground-blue",
			"--color-foreground-blue-dark",
			"--color-background-blue-dark",
			"--color-overlay",
			"--color-shadow",
			"--color-shadow-dark",
			"--color-text",
			"--color-text-light",
			"--color-text-lighter",
			"--color-text-bright",
			"--color-blue",
			"--color-blue-dim",
			"--color-white",
			"--color-black",
			"--color-red",
			"--color-peach",
			"--color-orange",
			"--color-yellow",
			"--color-green"
		];
		let colourChanger = function(){
			useScripts.colourSettings[cpSelector.value] = {
				"initial" :  (cpInitialBox.checked  ? cpInput.value : false),
				"dark" :     (cpDarkBox.checked     ? cpInput.value : false),
				"contrast" : (cpContrastBox.checked ? cpInput.value : false)
			}
			applyColourStyles();
			useScripts.save()
		};
		let cpContainer = create("div","hohColourPicker",false,colourPickerLocation);
		let cpTitle = create("h2",false,"Adjust Colours",cpContainer);
		let cpInput = create("input",false,false,cpContainer);
		cpInput.type = "color";
		let cpSelector = create("select",false,false,cpContainer);
		supportedColours.forEach(colour => {
			let option = create("option",false,colour,cpSelector);
			option.value = colour;
		});
		let cpDomain = create("p",false,false,cpContainer);
		let cpInitialBox = createCheckbox(cpDomain);
		create("span",false,"default",cpDomain);
		let cpDarkBox = createCheckbox(cpDomain);
		create("span",false,"dark",cpDomain);
		let cpContrastBox = createCheckbox(cpDomain);
		create("span",false,"contrast",cpDomain);
		let cpSelectorChanger = function(){
			if(useScripts.colourSettings[cpSelector.value]){
				cpInitialBox.checked  = !!useScripts.colourSettings[cpSelector.value].initial;
				cpDarkBox.checked     = !!useScripts.colourSettings[cpSelector.value].dark;
				cpContrastBox.checked = !!useScripts.colourSettings[cpSelector.value].contrast;
				cpInput.value = useScripts.colourSettings[cpSelector.value].initial
			}
			cpInitialBox.checked = false;
			cpDarkBox.checked = false;
			cpContrastBox.checked = false;
		};
		cpSelector.onchange = cpSelectorChanger;
		cpInput.onchange = colourChanger;
		cpInitialBox.onchange = colourChanger;
		cpDarkBox.onchange = colourChanger;
		cpContrastBox.onchange = colourChanger;
		cpSelectorChanger()
	}
}

function scoreFormatter(score,format,name){
	if(name === "shuurei" && format === "POINT_5"){
		const shuureiSystem = ["",">:(",":/",":)",":D","<3"];
		return `<span class="shuureiScore" title="${score}/5 stars">${shuureiSystem[score]}</span>`
	}
	else if(name === "shuurei" && format === "POINT_10"){
		const shuureiSystem = ["",">:(","Ew","Ugh","Hm","Ok","Nice","Ooh","Wow","Fave",":D"];
		return `<span class="shuureiScore" title="${score}/10">${shuureiSystem[score]}</span>`
	}
	else if(format === "POINT_100"){
		return score + "/100"
	}
	else if(
		format === "POINT_10_DECIMAL"
		|| format === "POINT_10"
	){
		return score + "/10"
	}
	else if(format === "POINT_3"){
		if(score === 3){
			return svgAssets.smile
		}
		else if(score === 2){
			return svgAssets.meh
		}
		else if(score === 1){
			return svgAssets.frown
		}
	}
	else if(format === "POINT_5"){
		return score + svgAssets.star
	}
	else{//future types. Just gambling that they look okay in plain text
		return score
	}
}

function convertScore(score,format){
	if(format === "POINT_100"){
		return score
	}
	else if(
		format === "POINT_10_DECIMAL" ||
		format === "POINT_10"
	){
		return score*10
	}
	else if(format === "POINT_3"){
		if(score === 3){
			return 85
		}
		else if(score === 2){
			return 60
		}
		else if(score === 1){
			return 45
		}
		return 0
	}
	else if(format === "POINT_5"){
		if(score === 0){
			return 0
		};
		return score*20 - 10
	}
}

function saveAs(data,fileName,pureText){
	let link = create("a");
	document.body.appendChild(link);
	let json = pureText ? data : JSON.stringify(data);
	let blob = new Blob([json],{type: "octet/stream"});
	let url = window.URL.createObjectURL(blob);
	link.href = url;
	link.download = fileName || "File from Anilist.co";
	link.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(link);
}

function levDist(s,t){//https://stackoverflow.com/a/11958496/5697837
	// Step 1
	let n = s.length;
	let m = t.length;
	if(!n){
		return m
	}
	if(!m){
		return n
	}
	let d = []; //2d matrix
	for(var i = n; i >= 0; i--) d[i] = [];
	// Step 2
	for(var i = n; i >= 0; i--) d[i][0] = i;
	for(var j = m; j >= 0; j--) d[0][j] = j;
	// Step 3
	for(var i = 1; i <= n; i++){
		let s_i = s.charAt(i - 1);
		// Step 4
		for(var j = 1; j <= m; j++){
			//Check the jagged ld total so far
			if(i === j && d[i][j] > 4){
				return n
			}
			let t_j = t.charAt(j - 1);
			let cost = (s_i === t_j) ? 0 : 1; // Step 5
			//Calculate the minimum
			let mi = d[i - 1][j] + 1;
			let b = d[i][j - 1] + 1;
			let c = d[i - 1][j - 1] + cost;
			if(b < mi){
				mi = b
			}
			if(c < mi){
				mi = c;
			}
			d[i][j] = mi; // Step 6
			//Damerau transposition
			/*if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
			}*/
		}
	}
	return d[n][m]
}
