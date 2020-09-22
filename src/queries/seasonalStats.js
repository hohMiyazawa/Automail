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
						id
						type
						createdAt
					}
					... on TextActivity {
						id
						type
						createdAt
					}
					... on ListActivity {
						id
						type
						createdAt
					}
				}
			}
		}`;
		let statsBuffer = [];
		let currentPage = 1;
		let getData = function(){
			generalAPIcall(activityQuery,{userId: userId,page: currentPage},function(data){
				statsBuffer = statsBuffer.concat(data.data.Page.activities.filter(act => act.createdAt*1000 >= limitTime));
				miscResults.innerText = "";
				let messageCount = statsBuffer.filter(activity => activity.type === "MESSAGE").length;
				let statusCount = statsBuffer.filter(activity => activity.type === "TEXT").length;
				let animeCount = statsBuffer.filter(activity => activity.type === "ANIME_LIST").length;
				let mangaCount = statsBuffer.filter(activity => activity.type === "MANGA_LIST").length;
				create("p",false,"Messages received: " +messageCount,miscResults);
				create("p",false,"Status posts: " + statusCount,miscResults);
				create("p",false,"Anime feed items: " + animeCount,miscResults);
				create("p",false,"Manga feed items: " + mangaCount,miscResults);
				if(data.data.Page.activities[data.data.Page.activities.length - 1].createdAt*1000 >= limitTime){
					currentPage++;
					create("p",false,"Loading more...",miscResults);
					getData();
				}
			})
		};getData()
	},"hohIDlookup" + user.toLowerCase());
}},
