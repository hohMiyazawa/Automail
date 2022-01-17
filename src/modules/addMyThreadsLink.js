function addMyThreadsLink(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/)){
		return
	}
	if(document.querySelector(".hohMyThreads")){
		return
	}
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addMyThreadsLink,100)
	}
	else{
		create("a",["hohMyThreads","link"],translate("$myThreads_link"),target)
			.href = "https://anilist.co/user/" + whoAmI + "/social#my-threads"
	}
}
