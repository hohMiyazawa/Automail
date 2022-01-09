//begin "graphql.js"
const queryMediaListManga = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
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
	startedAt{
		year
		month
		day
	}
	media{
		chapters
		volumes
		format
		title{romaji native english}
		tags{name}
		genres
		meanScore
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryMediaListAnime = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	repeat
	notes
	startedAt{
		year
		month
		day
	}
	media{
		episodes
		duration
		nextAiringEpisode{episode}
		format
		title{romaji native english}
		tags{name}
		genres
		meanScore
		studios{nodes{isAnimationStudio id name}}
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryMediaListStaff = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	media{
		a:staff(sort:ID,page:1){nodes{id name{first last}}}
		b:staff(sort:ID,page:2){nodes{id name{first last}}}
	}
}
`;

const queryMediaListStaff_simple = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
				mediaId
				media{
					staff{edges{node{id languageV2 name{first last} primaryOccupations} role}}
				}
			}
		}
	}
}
`;

const queryMediaListCompat = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
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
	startedAt{
		year
		month
		day
	}
	media{
		episodes
		chapters
		volumes
		duration
		nextAiringEpisode{episode}
		format
		title{romaji native english}
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryActivity = `
query($id: Int!){
	Activity(id: $id){
		... on TextActivity{
			id
			userId
			type
			text
			user{
				id
				name
				avatar{large}
			}
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
		... on ListActivity {
			id
			userId
			type
			status
			progress
			user{
				id
				name
				avatar{large}
			}
			media{
				coverImage{large color}
				title{romaji native english}
			}
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
		... on MessageActivity{
			id
			type
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
	}
}
`;

const queryAuthNotifications = `
query($page: Int,$name: String){
	User(name: $name){unreadNotificationCount}
	Page(page: $page){
		notifications{
			... on AiringNotification{type}
			... on FollowingNotification{type user{name}}
			... on ActivityMessageNotification{type user{name}}
			... on ActivityMentionNotification{type user{name}}
			... on ActivityReplyNotification{type user{name}}
			... on ActivityLikeNotification{type user{name}}
			... on ActivityReplyLikeNotification{type user{name}}
			... on ThreadCommentMentionNotification{type user{name}}
			... on ThreadCommentReplyNotification{type user{name}}
			... on ThreadCommentSubscribedNotification{type user{name}}
			... on ThreadCommentLikeNotification{type user{name}}
			... on ThreadLikeNotification{type user{name}}
			... on ActivityReplySubscribedNotification{type user{name}}
			... on RelatedMediaAdditionNotification{type media{title{userPreferred}}}
			... on MediaDataChangeNotification{type media{title{userPreferred}}}
			... on MediaMergeNotification{type media{title{userPreferred}}}
			... on MediaDeletionNotification{type}
		}
	}
}
`;

const titlePicker = function(media){
	if(aliases.has(media.id)){
		return aliases.get(media.id)
	}
	if(useScripts.titleLanguage === "NATIVE" && media.title.native){
		return media.title.native
	}
	else if(useScripts.titleLanguage === "ENGLISH" && media.title.english){
		return media.title.english
	}
	return media.title.romaji
}

const ANILIST_WEIGHT = 41;//weighting center for the weighted score formula

let APIlimit = 90;
let APIcallsUsed = 0;//this is NOT a reliable way to figure out how many more calls we can use, just a way to set some limit
let pending = {};
let APIcounter = setTimeout(function(){
	APIcallsUsed = 0;
},60*1000);//reset counter every minute, as our quota grows back

let handleResponse = function(response){
	APIlimit = response.headers.get("x-ratelimit-limit");
	APIcallsUsed = APIlimit - response.headers.get("x-ratelimit-remaining");
	return response.json().then(function(json){
		return (response.ok ? json : Promise.reject(json))
	})
};
const url = "https://graphql.anilist.co";//Current Anilist API location
const authUrl = "https://anilist.co/api/v2/oauth/authorize?client_id=2751&response_type=token";//2751 = automail, 1933 = aniscripts(legacy)

if(useScripts.autoLogin && !useScripts.accessToken && !useScripts.loginAttempted){
	useScripts.loginAttempted = true;
	useScripts.save();
	window.location = authUrl
}

if(!window.MutationObserver){//either the older webkit implementation, or just a dummy object that doesn't throw any errors when used.
	window.MutationObserver = window.WebKitMutationObserver || function(){return {observe:function(){},disconnect:function(){}}}
}

let aniCast = {postMessage: function(){}};//dummy object for Safari
if(window.BroadcastChannel){
	aniCast = new BroadcastChannel("automail");
	aniCast.onmessage = function(message){
		if(message.data.type){
			if(message.data.type === "cache"){
				sessionStorage.setItem(message.data.key,message.data.value)
			}
			else if(message.data.type === "cachev2"){
				cache.updateIfDifferent(message.data.mediaData,true)
			}
			else if(message.data.type === "sessionToken"){
				window.al_token = message.data.value
				//to prevent "session expired" messages
				//see "modules/keepAlive.js"
			}
		}
	}
}
else{
	/* Safari is the most common case where BroadcastChannel is not available.
	 * It *should* be available in most other browsers, so if it isn't here's a message to those where it fails
	 * Safari users can't really do anything about it, so there's no need to nag them, hence the window.safari test
	 * If Apple implements it in the future, the code should be updated, but the code doesn't do anything *wrong* then either
	 * it will just not print the warning when BroadcastChannel isn't available
	 */
	if(!window.safari){
		console.warn("BroadcastChannel not available. Automail will not be able to share cached data between tabs")
	}
}
//mandatory: query,variables,callback
//optional: cacheKey, and optionally even then, how long the item is fresh in the cache
function generalAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback){
	if(typeof query === "object"){
		variables = query.variables;
		callback = query.callback;
		cacheKey = query.cacheKey;
		timeFresh = query.timeFresh;
		useLocalStorage = query.useLocalStorage;
		overWrite = query.overWrite;
		oldCallback = query.oldCallback;
		query = query.query;
	}
	if(cacheKey && ((useLocalStorage && window.localStorage) || (!useLocalStorage && window.sessionStorage))){
		let cacheItem = JSON.parse(
			(useLocalStorage ? localStorage.getItem(cacheKey) : sessionStorage.getItem(cacheKey))
		);
		if(cacheItem){
			if(
				(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				) && !overWrite
			){
				callback(cacheItem.data,variables);
				return
			}
			else{
				if(oldCallback){
					oldCallback(cacheItem.data,variables)
				}
				(useLocalStorage ? localStorage.removeItem(cacheKey) : sessionStorage.removeItem(cacheKey))
			}
		}
	}
	let handleData = function(data,errors){
		callback(data,variables,errors);
		if(cacheKey && ((useLocalStorage && window.localStorage) || (!useLocalStorage && window.sessionStorage))){
			let saltedHam = JSON.stringify({
				data: data,
				time: NOW(),
				duration: timeFresh
			});
			if(useLocalStorage){
				localStorage.setItem(cacheKey,saltedHam)
			}
			else{
				try{
					sessionStorage.setItem(cacheKey,saltedHam)
				}
				catch(err){
					console.error("Automail cache is full. Searching for expired items...");
					let purgeCounter = 0;
					Object.keys(sessionStorage).forEach(key => {
						try{
							let item = JSON.parse(sessionStorage.getItem(key));
							if(item.time && (NOW() - item.time > item.duration)){
								sessionStorage.removeItem(key);
								purgeCounter++;
							}
						}
						catch(err){
							/*there may be non-JSON objects in session storage.
							the best way to check for JSON-ness is the JSON parser, so this needs a try wrapper
							*/
						}
					});
					if(purgeCounter){
						console.log("Purged " + purgeCounter + " expired items")
					}
					else{
						Object.keys(sessionStorage).slice(0,10).forEach(
							key => sessionStorage.removeItem(key)
						);
						console.log("Found no expired items. Deleted some at random to free up space.")
					}
					try{
						sessionStorage.setItem(cacheKey,saltedHam)
					}
					catch(err){
						console.error("The Automail cache failed for the key '" + cacheKey + "'. ");
						if(saltedHam.length > 50000){
							console.warn("The cache item is possibly too large (approx. " + saltedHam.length + " bytes)")
						}
						else{
							console.warn("Setting cache item failed. Please report or check your localStorage settings.")
						}
					}
				};
				aniCast.postMessage({type:"cache",key:cacheKey,value:saltedHam});
			}
		}
	};
	let options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			"query": query,
			"variables": variables
		})
	};
	let handleError = function(error){
		if(error.errors && error.errors.some(err => err.status === 404)){//not really an error
			handleData(null,error);
			return
		};
		console.error({error: error,variables: variables});
		handleData(null,error)
	};
	fetch(url,options).then(handleResponse).then(handleData).catch(handleError);
	APIcallsUsed++;
}
/*
rawQueries = [
	{
		query: a graphql query
		variables: variables like a normal API call
		callback: like in a normal API call
		cacheKey: [optional]
		duration: [optional]
	}
	...
]
*/
function deleteCacheItem(key){
	sessionStorage.removeItem(key);
	localStorage.removeItem(key)
}
function queryPacker(rawQueries,possibleCallback){//get a list of query calls, and pack them into one query. The result is then split up again and sent back to each call.
	let queries = rawQueries.filter(function(query){//filter out those that have data in our local cache
		if(query.cacheKey){
			let cacheItem = JSON.parse(sessionStorage.getItem(query.cacheKey));
			if(cacheItem){
				if(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				){
					query.callback(cacheItem.data);
					return false;
				}
				else{
					sessionStorage.removeItem(query.cacheKey);//expired data
				}
			}
		}
		return true
	});
	queries.forEach(function(query){//inline all variables
		query.query = query.query.trim().replace(/^query.*?{/,"").slice(0,-1).trim();
		const enums = ["type"];
		Object.keys(query.variables).forEach(variable => {
			let replacement = query.variables[variable];
			if(!enums.includes(variable) && typeof query.variables[variable] === "string"){
				replacement = "\"" + replacement + "\""
			}
			query.query = query.query.split("$" + variable).join(replacement)
		})
	});
	let enumeratedQueries = queries.map(function(query,index){
		query.getFields = [];
		let internalList = [];
		let partial = "";
		let getField = "";
		let collectGetField = true;
		let left = 0;
		Array.from(query.query).forEach(letter => {
			partial += letter;
			if(letter === "{"){
				left++;
				collectGetField = false
			}
			else if(letter === "("){
				collectGetField = false
			}
			else if(letter === "}"){
				left--;
				if(left === 0){
					internalList.push("a" + index + "a" + internalList.length + ":" + partial.trim());
					query.getFields.push(getField.trim());
					partial = "";
					getField = "";
					collectGetField = true
				}
			}
			else if(collectGetField){
				getField += letter
			}
		});
		return internalList.join();
	});
	let mainQuery = `
query{
	${enumeratedQueries.join("\n")}
}
	`;
	let queryUnpacker = function(data){
		if(!data){
			queries.forEach(
				query => query.callback(null)
			)
		}
		else{
			queries.forEach((query,index) => {
				let returnStructure = {data:{}};
				query.getFields.forEach(
					(field,fieldIndex) => returnStructure.data[field] = data.data["a" + index + "a" + fieldIndex]
				);
				query.callback(returnStructure);
				if(query.cacheKey){
					let cacheStrucuture = {
						data: returnStructure
					}
					if(query.duration){
						cacheStrucuture.time = NOW();
						cacheStrucuture.duration = query.duration;
					}
					sessionStorage.setItem(query.cacheKey,JSON.stringify(cacheStrucuture))
				}
			});
			if(possibleCallback){
				possibleCallback()
			}
		}
	}
	if(queries.length){//hey, they might all have been in cache
		generalAPIcall(mainQuery,{},queryUnpacker)//send our "superquery" to the regular API handler
	}
}

function authAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback){//only use this for queries explicitely requiring auth permissions
	if(!useScripts.accessToken){
		generalAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback)
		return
	}
	if(typeof query === "object"){
		variables = query.variables;
		callback = query.callback;
		cacheKey = query.cacheKey;
		timeFresh = query.timeFresh;
		useLocalStorage = query.useLocalStorage;
		overWrite = query.overWrite;
		oldCallback = query.oldCallback;
		query = query.query;
	}
	if(cacheKey){
		let cacheItem = JSON.parse(
			(useLocalStorage ? localStorage.getItem(cacheKey) : sessionStorage.getItem(cacheKey))
		);
		if(cacheItem){
			if(
				(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				) && !overWrite
			){
				callback(cacheItem.data,variables);
				return
			}
			else{
				if(oldCallback){
					oldCallback(cacheItem.data,variables)
				}
				(useLocalStorage ? localStorage.removeItem(cacheKey) : sessionStorage.removeItem(cacheKey))
			}
		}
	}
	let handleData = function(data,errors){
		callback(data,variables,errors);
		if(cacheKey){
			let saltedHam = JSON.stringify({
				data: data,
				time: NOW(),
				duration: timeFresh
			});
			if(useLocalStorage){
				localStorage.setItem(cacheKey,saltedHam)
			}
			else{
				sessionStorage.setItem(cacheKey,saltedHam);
				aniCast.postMessage({type:"cache",key:cacheKey,value:saltedHam})
			}
		}
	};
	let options = {
		method: "POST",
		headers: {
			"Authorization": "Bearer " + useScripts.accessToken,
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			"query": query,
			"variables": variables
		})
	};
	let handleError = function(error){
		console.error(error);
		if(error.errors){
			if(
				error.errors.some(thing => thing.message === "Invalid token")
			){
				useScripts.accessToken = "";
				useScripts.save();
				console.log("access token retracted");
				return
			}
		}
		if(query.includes("mutation")){
			callback(error.errors)
		}
		else{
			handleData(null,error)
		}
	};
	fetch(url,options).then(handleResponse).then(handleData).catch(handleError);
	APIcallsUsed++
}
const ANILIST_QUERY_LIMIT = 90;

localforage.config({name: "automail"});

//begin api v2
const apiCache = localforage.createInstance({name: "automail", storeName: "api"});
let apiResetLimit;

/** Provides default arguments for an {@link anilistAPI()} request */
class QueryOptions{
	/**
	 * Creates an arguments object
	 * @param {object} [args={}] - Contains the options which will override the default options for the request.
	 */
	constructor(args={}){
		this.variables = {};
		this.cacheKey = null;
		this.duration = null;
		this.overwrite = false;
		this.auth = false;
		this.internal = false;
		Object.assign(this, args);
	}
}

/** Configures options for a network request */
class RequestOptions{
	constructor(query, variables, auth, internal){
		this.method = "POST",
		this.headers = new Headers({
			"Content-Type": "application/json",
			"Accept": "application/json"
		}),
		this.body = JSON.stringify({
			"query": query,
			"variables": variables
		})
		this.#isAuth(auth)
		this.#isInternal(internal)
	}
	#isAuth(auth){
		if(auth === true && useScripts.accessToken){
			this.headers.set("Authorization", "Bearer " + useScripts.accessToken)
		}
	}
	#isInternal(internal){
		if(internal === true){
			if(al_token){
				this.headers.set("x-csrf-token", al_token)
			}
			this.headers.set("schema", "internal")
		}
	}
}

/**
 * Updates the variables tracking the API request limit
 * @param {Response} res - The Response object from a network request.
 */
function updateLimit(res){
	if(res.headers.has("x-ratelimit-limit")){
		APIlimit = res.headers.get("x-ratelimit-limit");
	}
	if(res.headers.has("x-ratelimit-remaining")){
		APIcallsUsed = APIlimit - res.headers.get("x-ratelimit-remaining");
	}
}

/**
 * Checks the API cache for an existing item and returns it if it has not expired
 * @param {string} key - The key to check for in the datastore.
 * @returns {Promise<object>} The cached data if found.
 */
async function checkCache(key){
	const item = await apiCache.getItem(key);
	if(item){
		if(!item.expiresAt || (NOW() < item.expiresAt)){
			return item.data;
		}
		else{
			return apiCache.removeItem(key);
		}
	}
	return;
}

/**
 * Iterates the API cache for expired items and removes them
 * @returns {Promise}
 */
async function flushCache(){
	return apiCache.iterate((item, key) => {
		if(NOW() > item.expiresAt){
			apiCache.removeItem(key);
		}
	})
}

/**
 * Saves data to the API cache
 * @param {string} key - The key used to store the data.
 * @param {object} data - The data to store.
 * @param {number} [duration] - The length of time to store in milliseconds.
 * @return {Promise}
 */
async function saveCache(key, data, duration){
	const saltedHam = {
		data: data,
		createdAt: NOW(),
		expiresAt: duration ? NOW() + duration : undefined
	};
	try{
		return apiCache.setItem(key, saltedHam);
	}
	catch(e){
		if(e.name === "QuotaExceededError"){
			console.error("Persistent storage quota exceeded. Attempting to purge expired items.")
			try{
				return flushCache();
			}
			catch(e){
				try{
					return apiCache.clear();//clear all items in the store if flushing fails
				}
				catch(e){
					throw new Error(e)
				}
			}
		}
		else{
			throw new Error(e)
		}
	}
}

/**
 * Updates data in the API cache
 * @param {string} key - The existing key to store updated data.
 * @param {object} newData - The new data to overwrite the existing data.
 * @returns {Promise}
 */
async function updateCache(key, newData){
	const data = await apiCache.getItem(key);
	if(data){
		Object.assign(data, {
			data: newData,
			updatedAt: NOW()
		});
		try{
			return apiCache.setItem(key, data);
		}
		catch(e){
			if(e.name === "QuotaExceededError"){
				console.error("Persistent storage quota exceeded. Attempting to purge expired items.")
				try{
					return flushCache();
				}
				catch(e){
					try{
						return apiCache.clear();//clear all items in the store if flushing fails
					}
					catch(e){
						throw new Error(e)
					}
				}
			}
			else{
				throw new Error(e)
			}
		}
	}
	else{
		throw new Error(`Key ${key} does not exist in cache.`)
	}
}

/**
 * Constructs and sends a request to the AniList GraphQL API
 * @param {string} query - A GraphQL query string.
 * @param {object} [queryArgs] - An object containing request parameters. (e.g. GraphQL variables)
 * @param {object} [queryArgs.variables] - GraphQL variables.
 * @param {string} [queryArgs.cacheKey] - A key used to cache API data.
 * @param {number} [queryArgs.duration] - How long data should remain cached (in milliseconds.)
 * @param {boolean} [queryArgs.overwrite] - Ignore cached data when making a request.
 * @param {boolean} [queryArgs.auth] - Make an authenticated request as the current user.
 * @param {boolean} [queryArgs.internal] - Make an internal request. Only uses the internal schema.
 * @returns {Promise<object>} Response data from the API or cached data.
 */
async function anilistAPI(query, queryArgs){
	if(!query){
		throw new Error("No query provided")
	}
	let apiUrl = url;
	const args = new QueryOptions(queryArgs);
	const options = new RequestOptions(query, args.variables, args.auth, args.internal);
	if(args.cacheKey && !args.overwrite){
		const cache = await checkCache(args.cacheKey);
		if(cache){
			return cache;
		}
	}
	if(apiResetLimit){
		if(NOW() < apiResetLimit*1000){
			return {
				"data": null,
				"errors": [{"message": "Too Many Requests.","status": 429}]
			};
		}
		apiResetLimit = undefined;
	}
	if(args.internal === true){
		apiUrl = "https://anilist.co/graphql";
	}
	try{
		const res = await fetch(apiUrl, options);
		if(args.internal !== true){
			updateLimit(res);
		}
		const data = await res.json();
		if(res.ok){
			if(args.cacheKey){
				saveCache(args.cacheKey, data, args.duration);
			}
		}
		else{
			if(data.errors){
				if(data.errors.some(thing => thing.message === "Invalid token")){//status 400
					useScripts.accessToken = "";
					useScripts.save();
					console.warn("Access token retracted.");
				}
			}
			if(res.status === 429){
				if(res.headers.has("retry-after")){
					console.warn(`Exceeded AniList API request limit. Limit resets in ${res.headers.get("retry-after")} seconds.`)
				}
				if(res.headers.has("x-ratelimit-reset")){
					apiResetLimit = res.headers.get("x-ratelimit-reset");
				}
				else{
					apiResetLimit = (NOW()+60*1000)/1000;
					throw new Error("Exceeded AniList API request limit. Please report the issue at https://github.com/hohMiyazawa/Automail/issues")
				}
			}
			else if(res.status !== 404){
				console.error(`AniList API returned ${res.status} ${res.statusText}`)
			}
		}
		return data;
	}
	catch(e){
		throw e
	}
}

/** Runs an API cache checkup weekly */
const cacheCheckup = () => {
	const check = localStorage.getItem("automail-db-check")
	if(check){
		if(NOW() > check){
			localStorage.setItem("automail-db-check", NOW()+7*24*60*60*1000)
			flushCache();
		}
	}
	else{
		localStorage.setItem("automail-db-check", NOW()+7*24*60*60*1000)
	}
};
cacheCheckup()
//end api v2
//end "graphql.js"
