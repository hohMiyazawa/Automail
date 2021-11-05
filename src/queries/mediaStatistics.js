{name: "Media statistics of friends",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		generalAPIcall(
			`
query($userId: Int!){
a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	statistics{
		anime{
			count
			minutesWatched
		}
		manga{
			count
			chaptersRead
			volumesRead
		}
	}
	stats{
		watchedTime
		chaptersRead
	}
}`,
			{userId: data.data.User.id},
			function(stats){
				let userList = [].concat(
					...Object.keys(stats.data).map(
						a => stats.data[a].following || []
					)
				);
				userList.push(stats.data.User);
				//API error polyfill
				userList.forEach(function(wrong){
					if(!wrong.statistics.anime.minutesWatched){
						wrong.statistics.anime.minutesWatched = wrong.stats.watchedTime
					}
					if(!wrong.statistics.manga.chaptersRead){
						wrong.statistics.manga.chaptersRead = wrong.stats.chaptersRead
					}
				});
				userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
				miscResults.innerText = "";
				let drawUserList = function(){
					removeChildren(miscResults)
					let table = create("div",["table","hohTable","hohNoPointer","good"],false,miscResults);
					let headerRow = create("div",["header","row"],false,table);
					let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
					let animeCountHeading = create("div",false,"Anime Count",headerRow,"cursor:pointer;");
					let animeTimeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
					let mangaCountHeading = create("div",false,"Manga Count",headerRow,"cursor:pointer;");
					let mangaChapterHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
					let mangaVolumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
					userList.forEach(function(user,index){
						let row = create("div","row",false,table);
						if(user.name === stats.data.User.name || user.name === whoAmI){
							row.style.color = "rgb(var(--color-blue))";
							row.style.background = "rgb(var(--color-background))";
						}
						let nameCel = create("div",false,(index + 1) + " ",row);
						let userLink = create("a",["link","newTab"],user.name,nameCel);
						userLink.href = "/user/" + user.name;
						create("div",false,user.statistics.anime.count,row);
						let timeString = formatTime(user.statistics.anime.minutesWatched*60);
						if(!user.statistics.anime.minutesWatched){
							timeString = "-"
						}
						create("div",false,timeString,row).title = Math.round(user.statistics.anime.minutesWatched/60) + " hours";
						create("div",false,user.statistics.manga.count,row);
						if(user.statistics.manga.chaptersRead){
							create("div",false,user.statistics.manga.chaptersRead,row)
						}
						else{
							create("div",false,"-",row)
						}
						if(user.statistics.manga.volumesRead){
							create("div",false,user.statistics.manga.volumesRead,row)
						}
						else{
							create("div",false,"-",row)
						}
					});
					nameHeading.onclick = function(){
						userList.sort(ALPHABETICAL(a => a.name));
						drawUserList();
					};
					animeCountHeading.onclick = function(){
						userList.sort((b,a) => a.statistics.anime.count - b.statistics.anime.count);
						drawUserList();
					};
					animeTimeHeading.onclick = function(){
						userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
						drawUserList();
					};
					mangaCountHeading.onclick = function(){
						userList.sort((b,a) => a.statistics.manga.count - b.statistics.manga.count);
						drawUserList();
					};
					mangaChapterHeading.onclick = function(){
						userList.sort((b,a) => a.statistics.manga.chaptersRead - b.statistics.manga.chaptersRead);
						drawUserList();
					};
					mangaVolumeHeading.onclick = function(){
						userList.sort((b,a) => a.statistics.manga.volumesRead - b.statistics.manga.volumesRead);
						drawUserList();
					};
				};drawUserList();
			}
		)
	},"hohIDlookup" + user.toLowerCase());
}},
