function addForumMediaTitle(){
	if(location.pathname !== "/home"){
		return
	}
	let forumThreads = Array.from(document.querySelectorAll(".home .forum-wrap .thread-card .category"));
	if(!forumThreads.length){
		setTimeout(addForumMediaTitle,200);
		return;
	};
	if(forumThreads.some(
		thread => thread && ["anime","manga"].includes(thread.innerText.toLowerCase())
	)){
		generalAPIcall("query{Page(perPage:3){threads(sort:REPLIED_AT_DESC){title mediaCategories{id title{romaji native english}}}}}",{},function(data){
			if(location.pathname !== "/home"){
				return
			}
			data.data.Page.threads.forEach((thread,index) => {
				if(thread.mediaCategories.length && ["anime","manga"].includes(forumThreads[index].innerText.toLowerCase())){
					let title = titlePicker(thread.mediaCategories[0]);
					if(title.length > 40){
						forumThreads[index].title = title;
						title = title.slice(0,35) + "…";
					};
					forumThreads[index].innerText = title;
				}
			})
		})
	}
}

