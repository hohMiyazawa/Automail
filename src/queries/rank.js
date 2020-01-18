{name: "Rank",code: function(){
	generalAPIcall(
		"query($name:String){User(name:$name){name stats{watchedTime chaptersRead}}}",
		{name: user},
		function(data){
			miscResults.innerText = "";
			create("p",false,"NOTE: Due to an unfixed bug in the Anilist API, these results are increasingly out of date. This query is just kept here in case future changes allows it to work properly again.",miscResults);
			create("p",false,"Time watched: " + (data.data.User.stats.watchedTime/(60*24)).roundPlaces(1) + " days",miscResults);
			create("p",false,"Chapters read: " + data.data.User.stats.chaptersRead,miscResults);
			let ranks = {
				"anime": create("p",false,false,miscResults),
				"manga": create("p",false,false,miscResults)
			};
			let recursiveCall = function(userName,amount,currentPage,minPage,maxPage,type){
				ranks[type].innerText = capitalize(type) + " rank: [calculating...] range " + ((minPage - 1)*50 + 1) + " - " + (maxPage ? maxPage*50 : "");
				generalAPIcall(
					`
query($page:Int){
	Page(page:$page){
		pageInfo{lastPage}
			users(sort:${type === "anime" ? "WATCHED_TIME_DESC" : "CHAPTERS_READ_DESC"}){
			stats{${type === "anime" ? "watchedTime" : "chaptersRead"}}
		}
	}
}`,
					{page: currentPage},
					function(data){
						if(!maxPage){
							maxPage = data.data.Page.pageInfo.lastPage
						}
						let block = (
							type === "anime"
							? Array.from(data.data.Page.users,(a) => a.stats.watchedTime)
							: Array.from(data.data.Page.users,(a) => a.stats.chaptersRead)
						);
						if(block[block.length - 1] > amount){
							recursiveCall(userName,amount,Math.floor((currentPage + 1 + maxPage)/2),currentPage + 1,maxPage,type);
							return;
						}
						else if(block[0] > amount){
							block.forEach(function(item,index){
								if(amount === item){
									ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage - 1)*50 + index + 1);
									return;
								}
							})
						}
						else if(block[0] === amount){
							if(minPage === currentPage){
								ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage-1)*50 + 1)
							}
							else{
								recursiveCall(userName,amount,Math.floor((minPage + currentPage)/2),minPage,currentPage,type)
							};
							return;
						}
						else{
							recursiveCall(userName,amount,Math.floor((minPage + currentPage - 1)/2),minPage,currentPage - 1,type);
							return;
						};
					},"hohRank" + type + currentPage,60*60*1000
				);
			};
			recursiveCall(user,data.data.User.stats.watchedTime,1000,1,undefined,"anime");
			recursiveCall(user,data.data.User.stats.chaptersRead,500,1,undefined,"manga");
		},"hohRankStats" + user,2*60*1000
	);
}},
