{name: "Most liked status posts",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		let userId = data.data.User.id;
		let list = [];
		miscResults.innerText = "";
		let progress = create("p",false,false,miscResults);
		let results = create("p",false,false,miscResults);
		const query = `
		query($userId: Int,$page: Int){
			Page(page: $page){
				pageInfo{
					currentPage
					total
					lastPage
				}
				activities (userId: $userId, sort: ID_DESC, type: TEXT){
					... on TextActivity{
						siteUrl
						likes{id}
					}
				}
			}
		}`;
		let addNewUserData = function(data){
			list = list.concat(data.data.Page.activities);
			if(data.data.Page.pageInfo.currentPage === 1){
				for(var i=2;i<=Math.min(data.data.Page.pageInfo.lastPage,50);i++){//FIXME temporary workaround to prevent crashes until anilist fixes the page API. Limits to 2500 posts
					generalAPIcall(query,{userId: userId,page: i},addNewUserData);
				};
			};
			list.sort(function(b,a){return a.likes.length - b.likes.length});
			progress.innerText = "Searching status post " + list.length + "/" + data.data.Page.pageInfo.total + " [total is incorrect until an Anilist bug is fixed. Query limited to 2500]";
			removeChildren(results)
			for(var i=0;i<20;i++){
				let newDate = create("p",false,list[i].likes.length + " likes ",results,"font-family:monospace;margin-right:10px;");
				let newPage = create("a","newTab",list[i].siteUrl,newDate,"color:rgb(var(--color-blue));");
				newPage.href = list[i].siteUrl;
			};
		};
		generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
	},"hohIDlookup" + user.toLowerCase());
}},
