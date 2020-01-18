{name: "How many people have blocked you",code: function(){
	if(!useScripts.accessToken){
		miscResults.innerText = loginMessage;
		return
	}
	authAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data){
		generalAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data2){
			miscResults.innerText = "This only applies to you, regardless of what stats page you ran this query from.";
			if(data.data.Page.pageInfo.total === data2.data.Page.pageInfo.total){
				create("p",false,"No users have blocked you",miscResults)
			}
			else if((data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) < 0){
				create("p",false,"Error: The elevated privileges of moderators makes this query fail",miscResults)
			}
			else{
				create("p",false,(data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) + " users have blocked you",miscResults)
			}
		})
	})
}},
