async function addForumMediaTitle(){
	if(location.pathname !== "/home"){
		return
	}
	// Forum previews may contain multiple categories but only show the first one
	let forumThreads = Array.from(document.querySelectorAll(".home .forum-wrap .thread-card .categories span:first-child .category"));
	if(!forumThreads.length){
		setTimeout(addForumMediaTitle,200);
		return;
	};
	if(forumThreads.some(
		thread => thread && ["anime","manga"].includes(thread.innerText.toLowerCase())
	)){
		const {data, errors} = await anilistAPI("query{Page(perPage:3){threads(sort:REPLIED_AT_DESC){title mediaCategories{id title{romaji native english}}}}}");
		if(errors){
			return
		}
		if(location.pathname !== "/home"){
			return
		}
		data.Page.threads.forEach((thread,index) => {
			if(thread.mediaCategories.length && ["anime","manga"].includes(forumThreads[index].innerText.toLowerCase())){
				let title = titlePicker(thread.mediaCategories[0]);
				if(title.length > 40){
					forumThreads[index].title = title;
					title = title.slice(0,35) + "…";
				};
				forumThreads[index].innerText = title;
			}
		})
	}
	return
}
