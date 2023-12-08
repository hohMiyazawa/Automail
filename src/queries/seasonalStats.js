{name: "Monthly stats",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		let userId = data.data.User.id;
		let currentYear = new Date().getFullYear();
		let presentTime = new Date();
		let limitTime;
		for(let i=1;i<12;i++){
			if(new Date(currentYear,i,1) > presentTime){
				limitTime = new Date(currentYear,i - 1,1).valueOf();
				break
			}
			if(i === 11){
				limitTime = new Date(currentYear,11,1).valueOf()
			}
		}
		let activityQuery =
		`query ($userId: Int, $page: Int) {
			Page(perPage: 50, page: $page){
				activities(sort: ID_DESC,userId: $userId){
					... on MessageActivity {
						type
						createdAt
					}
					... on TextActivity {
						type
						createdAt
					}
					... on ListActivity {
						type
						createdAt
						status
						progress
						media{
							episodes
							chapters
							duration
							format
							id
						}
					}
				}
			}
		}`;
		let statsBuffer = [];
		let currentPage = 1;
		let getData = function(){
			generalAPIcall(activityQuery,{userId: userId,page: currentPage},function(data){
				statsBuffer = statsBuffer.concat(data.data.Page.activities.filter(act => act.createdAt*1000 >= limitTime));
				miscResults.innerText = `This month (since ${new Date().getFullYear()}-${("0" + (new Date().getMonth() + 1)).slice(-2)}-01):`;
				let messageCount = statsBuffer.filter(activity => activity.type === "MESSAGE").length;
				let statusCount = statsBuffer.filter(activity => activity.type === "TEXT").length;
				let animeCount = statsBuffer.filter(activity => activity.type === "ANIME_LIST").length;
				let mangaCount = statsBuffer.filter(activity => activity.type === "MANGA_LIST").length;
				create("p",false,"Messages received: " +messageCount,miscResults);
				create("p",false,"Status posts: " + statusCount,miscResults);
				create("p",false,"Anime feed items: " + animeCount,miscResults);
				create("p",false,"Manga feed items: " + mangaCount,miscResults);
				let animeEntries = {};
				let mangaEntries = {};
				statsBuffer.forEach(entry => {
					if(entry.type === "ANIME_LIST"){
						let addDefault = function(){
							animeEntries[entry.media.id] = animeEntries[entry.media.id] || {
								completionCount: 0,
								lowestProgress: entry.media.episodes || Number.MAX_SAFE_INTEGER,
								highestProgress: 0,
								duration: entry.media.duration || 1,
								format: entry.media.format,
								total: entry.media.episodes || 1
							}
						}
						if(entry.status === "watched episode" || entry.status === "rewatched episode"){
							addDefault();
							let splitProgress = entry.progress.split(" - ").map(num => parseInt(num));
							animeEntries[entry.media.id].lowestProgress = Math.min(
								animeEntries[entry.media.id].lowestProgress,
								splitProgress[0]
							)
							animeEntries[entry.media.id].highestProgress = Math.max(
								animeEntries[entry.media.id].highestProgress,
								splitProgress[splitProgress.length - 1]
							)
						}
						else if(entry.status === "completed" || entry.status === "rewatched"){
							addDefault();
							animeEntries[entry.media.id].highestProgress = animeEntries[entry.media.id].total || 1;
							animeEntries[entry.media.id].completionCount++
						}
					}
					else if(entry.type === "MANGA_LIST"){
						let addDefault = function(){
							mangaEntries[entry.media.id] = mangaEntries[entry.media.id] || {
								completionCount: 0,
								lowestProgress: entry.media.chapters || Number.MAX_SAFE_INTEGER,
								highestProgress: 0,
								format: entry.media.format,
								total: entry.media.chapters || 1
							}
						}
						if(entry.status === "read chapter" || entry.status === "reread chapter"){
							addDefault();
							let splitProgress = entry.progress.split(" - ").map(num => parseInt(num));
							mangaEntries[entry.media.id].lowestProgress = Math.min(
								mangaEntries[entry.media.id].lowestProgress,
								splitProgress[0]
							)
							mangaEntries[entry.media.id].highestProgress = Math.max(
								mangaEntries[entry.media.id].highestProgress,
								splitProgress[splitProgress.length - 1]
							)
						}
						else if(entry.status === "completed" || entry.status === "reread"){
							addDefault();
							mangaEntries[entry.media.id].highestProgress = mangaEntries[entry.media.id].total || 1;
							mangaEntries[entry.media.id].completionCount++
						}
					}
				});
				let formatDigest = {};
				Object.keys(distributionFormats).forEach(key => formatDigest[key] = 0);
				let digestMinutesAnime = 0;
				Object.keys(animeEntries).forEach(key => {
					let epCount = Math.max(0,animeEntries[key].highestProgress - animeEntries[key].lowestProgress + 1);
					if(animeEntries[key].completionCount > 1){
						epCount += animeEntries[key].completionCount - 1
					}
					digestMinutesAnime += epCount * animeEntries[key].duration;
					formatDigest[animeEntries[key].format] += epCount
				});
				Object.keys(mangaEntries).forEach(key => {
					let chCount = Math.max(0,mangaEntries[key].highestProgress - mangaEntries[key].lowestProgress + 1);
					if(mangaEntries[key].completionCount > 1){
						chCount += mangaEntries[key].completionCount - 1
					}
					formatDigest[mangaEntries[key].format] += chCount
				});
				create("hr",false,false,miscResults);
				create("p",false,"Time Watched: " + formatTime(digestMinutesAnime * 60),miscResults);
				if(formatDigest["TV"]){
					create("p",false,"TV eps: " + formatDigest["TV"],miscResults)
				}
				if(formatDigest["OVA"]){
					create("p",false,"OVA eps: " + formatDigest["OVA"],miscResults)
				}
				if(formatDigest["ONA"]){
					create("p",false,"ONA eps: " + formatDigest["ONA"],miscResults)
				}
				if(formatDigest["MOVIE"]){
					create("p",false,"Movies: " + formatDigest["MOVIE"],miscResults)
				}
				if(formatDigest["TV_SHORT"]){
					create("p",false,"Short TV eps: " + formatDigest["TV_SHORT"],miscResults)
				}
				if(formatDigest["SPECIAL"]){
					create("p",false,"Specials: " + formatDigest["SPECIAL"],miscResults)
				}
				if(formatDigest["MUSIC"]){
					create("p",false,"Music vids: " + formatDigest["MUSIC"],miscResults)
				}
				create("hr",false,false,miscResults);
				if(formatDigest["MANGA"]){
					create("p",false,"Manga chapters: " + formatDigest["MANGA"],miscResults)
				}
				if(formatDigest["NOVEL"]){
					create("p",false,"LN chapters: " + formatDigest["NOVEL"],miscResults)
				}
				if(formatDigest["ONE_SHOT"]){
					create("p",false,"One shots: " + formatDigest["ONE_SHOT"],miscResults)
				}
				if(data.data.Page.activities[data.data.Page.activities.length - 1].createdAt*1000 >= limitTime){
					currentPage++;
					create("p",false,"Loading more activities...",miscResults);
					getData();
				}
			})
		};getData()
	},"hohIDlookup" + user.toLowerCase());
}},
