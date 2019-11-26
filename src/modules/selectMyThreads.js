function selectMyThreads(){
	if(document.URL !== "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		return
	}
	let target = document.querySelector(".filter-group span:nth-child(4)");
	if(!target){
		setTimeout(selectMyThreads,100)
	}
	else{
		target.click()
	}
}
