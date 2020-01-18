{name: "Find a message",setup: function(){
	let input = create("input","#searchInput",false,miscOptions);
	input.placeholder = "text or regex to match";
},code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		let userId = data.data.User.id;
		miscResults.innerText = "";
		let posts = 0;
		let progress = create("p",false,false,miscResults);
		let results = create("p",false,false,miscResults);
		let searchQuery = document.getElementById("searchInput").value;
		const query = `
		query($userId: Int,$page: Int){
			Page(page: $page){
				pageInfo{
					currentPage
					total
					lastPage
				}
				activities (userId: $userId, sort: ID_DESC, type: MESSAGE){
					... on MessageActivity{
						siteUrl
						message(asHtml: true)
					}
				}
			}
		}`;
		let addNewUserData = function(data){
			if(data.data.Page.pageInfo.currentPage === 1){
				for(var i=2;i<=data.data.Page.pageInfo.lastPage;i++){
					generalAPIcall(query,{userId: userId,page: i},addNewUserData)
				}
			};
			posts += data.data.Page.activities.length;
			progress.innerText = "Searching message post " + posts + "/" + data.data.Page.pageInfo.total;
			data.data.Page.activities.forEach(function(act){
				if(act.message.match(new RegExp(searchQuery,"i"))){
					let newDate = create("p",false,false,results,"font-family:monospace;margin-right:10px;");
					let newPage = create("a","newTab",act.siteUrl,newDate,"color:rgb(var(--color-blue));");
					newPage.href = act.siteUrl;
					newDate.innerHTML += DOMPurify.sanitize(act.message);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
					create("hr",false,false,results)
				}
			})
		};
		generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
	},"hohIDlookup" + user.toLowerCase())
}},
