async function addFollowCount(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	const userData = await anilistAPI("query($name:String){User(name:$name){id}}", {
		variables: {name: decodeURIComponent(URLstuff[1])},
		cacheKey: "hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase(),
		duration: 5*60*1000
	});
	if(userData.errors){
		return
	}
	//these two must be separate calls, because they are allowed to fail individually (too many followers)
	const followerData = await anilistAPI("query($id:Int!){Page(perPage:1){pageInfo{total} followers(userId:$id){id}}}", {
		variables: {id:userData.data.User.id}
	});
	const followingData = await anilistAPI("query($id:Int!){Page(perPage:1){pageInfo{total} following(userId:$id){id}}}", {
		variables: {id:userData.data.User.id}
	});
	const insertCount = function(data, id, pos){
		const target = document.querySelector(".filter-group");
		if(target){
			target.style.position = "relative";
			let followCount = "65536+";
			if(!data.errors){
				followCount = data.data.Page.pageInfo.total
			};
			create("span",[id,"hohCount"],followCount,target.children[pos]);
		}
	}
	insertCount(followerData, "#hohFollowersCount", 2)
	insertCount(followingData, "#hohFollowingCount", 1)
	return
}
