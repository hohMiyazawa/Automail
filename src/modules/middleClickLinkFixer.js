function linkFixer(){
	if(location.pathname !== "/home"){
		return
	}
	let recentReviews = document.querySelector(".recent-reviews h2.section-header");
	let recentThreads = document.querySelector(".recent-threads h2.section-header");
	if(recentReviews && recentThreads){
		recentReviews.innerText = "";
		create("a",false,"Recent Reviews",recentReviews)
			.href = "/reviews";
		recentThreads.innerText = "";
		create("a",false,"Forum Activity",recentThreads)
			.href = "/forum/overview";
	}
	else{
		setTimeout(linkFixer,2000)//invisible change, does not take priority
	}
}
