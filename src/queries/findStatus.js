{name: "Find a status",setup: function(){
	let input = create("input","#searchInput",false,miscOptions);
	input.placeholder = "text or regex to match";
},code: function(){
	let searchQuery = document.getElementById("searchInput").value;
	if(statusSearchCache.length){
		miscResults.innerText = "";
		let results = create("p",false,false,miscResults);
		statusSearchCache.forEach(act => {
			if(act.text.match(new RegExp(searchQuery,"i")) || act.text.includes(searchQuery)){
				let newDate = create("p",false,false,results,"font-family:monospace;margin-right:10px;");
				let newPage = create("a","newTab",act.siteUrl,newDate,"color:rgb(var(--color-blue));");
				newPage.href = act.siteUrl;
				newDate.innerHTML += DOMPurify.sanitize(act.text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				create("hr",false,false,results)
			}
		})
	}
	else{
		generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
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
							text(asHtml: true)
						}
					}
				}
			}`;
			miscResults.innerText = "";
			let results = create("p",false,false,miscResults);
			let posts = 0;
			let progress = create("p",false,false,miscResults);
			let userId = data.data.User.id;
			let addNewUserData = function(data){
				console.log(data);
				if(!data){
					return
				}
				if(data.data.Page.pageInfo.currentPage === 1){
					for(var i=2;i<=data.data.Page.pageInfo.lastPage && i < ANILIST_QUERY_LIMIT;i++){
						generalAPIcall(query,{userId: userId,page: i},addNewUserData)
					}
				};
				posts += data.data.Page.activities.length;
				progress.innerText = "Searching status post " + posts + "/" + data.data.Page.pageInfo.total;
				data.data.Page.activities.forEach(act => {
					if(act.text.match(new RegExp(searchQuery,"i")) || act.text.includes(searchQuery)){
						let newDate = create("p",false,false,results,"font-family:monospace;margin-right:10px;");
						let newPage = create("a","newTab",act.siteUrl,newDate,"color:rgb(var(--color-blue));");
						newPage.href = act.siteUrl;
						newDate.innerHTML += DOMPurify.sanitize(act.text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
						create("hr",false,false,results)
					}
					statusSearchCache.push(act)
				})
			};
			generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
		},"hohIDlookup" + user.toLowerCase())
	}
}},
