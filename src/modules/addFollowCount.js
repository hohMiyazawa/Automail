function addFollowCount(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} followers(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",["#hohFollowersCount","hohCount"],followCount,target.children[2]);
			}
		});
		//these two must be separate calls, because they are allowed to fail individually (too many followers)
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} following(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",["#hohFollowingCount","hohCount"],followCount,target.children[1]);
			}
		});
	},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
}
