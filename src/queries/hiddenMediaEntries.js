{name: "Hidden media entries",code: function(){
	miscResults.innerText = "";
	let pageCounter = create("p",false,false,miscResults);
	let pager = function(page,user){
		generalAPIcall(
`query ($userName: String,$page:Int) {
	Page(page:$page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(userName:$userName){
			hiddenFromStatusLists
			mediaId
			media{
				type
				title{romaji}
			}
			customLists(asArray:true)
		}
	}
}`,
			{
			  	page: page,
				userName: user
			},
			function(data){
				if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage){
					setTimeout(function(){
						pager(data.data.Page.pageInfo.currentPage + 1,user)
					},800);
				}
				pageCounter.innerText = "Searching page " + data.data.Page.pageInfo.currentPage + " of " + data.data.Page.pageInfo.lastPage;
				data.data.Page.mediaList.forEach(function(media){
					if(
						media.hiddenFromStatusLists
						&& media.customLists.every(cl => cl.enabled === false)
					){
						create("a","newTab",media.media.title.romaji,miscResults,"display:block;")
							.href = "/" + media.media.type.toLowerCase() + "/" + media.mediaId
					}
				})
			}
		);
	};pager(1,user);
}},
