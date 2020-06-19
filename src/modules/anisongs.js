//fork of anisongs by morimasa
//https://greasyfork.org/en/scripts/374785-anisongs
const anisongs_options = {
	cacheName: "anison", // name in
	cacheLife: 604800000, // 1 week in ms
	class: "anisongs" // container class
}

const anisongs_temp = {
	last: null,
	target: null
}

exportModule({
	id: "anisongs",
	description: "Add OP/ED data to media pages [by morimasa]",
	isDefault: false,
	categories: ["Media","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return ["anime","manga"].includes(window.location.pathname.split("/")[1])
	},
	code: function(){
const Cache = {
	add(id, data) {
		localforage.getItem(anisongs_options.cacheName,function(err,value){
			let cache = JSON.parse(value) || {};
			cache[id] = data;
			localforage.setItem(anisongs_options.cacheName, JSON.stringify(cache))
		})
	},
	get(id,callback){
		localforage.getItem(anisongs_options.cacheName,function(err,value){
			let cache = value
			if(cache){
				return callback(JSON.parse(cache)[id] || {time:0})
			}
			else{
				return callback({time:0})
			}
		})
	}
}

const API = {
	async getMalId(id) {
		const query = "query($id:Int){Media(id:$id){idMal}}"
		const vars = {id}
		const options = {
			method: "POST",
			body: JSON.stringify({query: query, variables: vars}),
		}
		const resp = await request("https://graphql.anilist.co", options)
		try {
			return resp.data.Media.idMal
		}
		catch {
			console.error("anisongs: Error getting malId")
			return null
		}
	},
	async getSongs(mal_id) {
		let {opening_themes, ending_themes} = await request(`https://api.jikan.moe/v3/anime/${mal_id}/`);
		opening_themes = opening_themes.filter(e => e !== "");
		ending_themes = ending_themes.filter(e => e !== "");
		return {opening_themes, ending_themes}
	}
}

function request(url, options={}) {
	return new Promise((resolve, reject) => {
		GM_xmlhttpRequest({
			url: url,
			method: options.method || "GET",
			headers: options.headers || {
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			responseType: options.responseType || "json",
			data: options.body || options.data,
			onload: res => {
			resolve(res.response)
			},
			onerror: reject
		})
	})
}

function insert(songs, parent) {
	if(!songs || !songs.length){
		return 0
	}
	else{
		songs.forEach((song,i) => {
			create("p","tag",`${i+1}. ${song}`,parent)
		})
	}
}

function createTargetDiv(text, target, pos){
	let el = document.createElement('div');
	el.appendChild(document.createElement('h2'));
	el.children[0].innerText = text;
	el.classList = anisongs_options.class;
	if(target){
		target.insertBefore(el, target.children[pos])
	}
	return el
}

function placeData(data){
	cleaner(anisongs_temp.target);
	let op = createTargetDiv("Openings", anisongs_temp.target, 0);
	let ed = createTargetDiv("Endings", anisongs_temp.target, 1);
	insert(data.opening_themes, op);
	insert(data.ending_themes, ed);
}

function cleaner(target){
	if(!target){
		return
	}
	let el = target.querySelectorAll(`.${anisongs_options.class}`);
	el.forEach((e) => {
		target.removeChild(e)
	})
}

function launch(currentid) {
	// get from cache and check TTL
	Cache.get(currentid,async function(cache){
		if(
			(cache.time + anisongs_options.cacheLife) < NOW()
		){
			const mal_id = await API.getMalId(currentid);
			if(mal_id){
				const {opening_themes, ending_themes} = await API.getSongs(mal_id);
				// add songs to cache if they're not empty
				if (opening_themes.length || ending_themes.length){
					Cache.add(
						currentid,
						{
							opening_themes,
							ending_themes,
							time: NOW()
						}
					)
				}
				// place the data onto site
				placeData({opening_themes, ending_themes});
				return "Downloaded songs"
			}
			else {
				return "No malid"
			}
		}
		else{
			// place the data onto site
			placeData(cache);
			return "Used cache"
		}
	})
}

let currentpath = window.location.pathname.split("/");
if(currentpath[1] === "anime") {
	let currentid = currentpath[2];
	let location = currentpath.pop();
	if(location !== ""){
		anisongs_temp.last = 0
	}
	anisongs_temp.target = document.querySelectorAll(".grid-section-wrap")[2];
	if(anisongs_temp.last !== currentid && location === ""){
		if(anisongs_temp.target){
			anisongs_temp.last = currentid;
			launch(currentid)
		}
		else{
			setTimeout(()=>{this.code.call(this)},500)
		}
	}
}
else if(currentpath[1] === "manga"){
	cleaner(anisongs_temp.target);
	anisongs_temp.last = 0
}
else{
	anisongs_temp.last = 0
}
	}
})
