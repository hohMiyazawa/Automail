function scoreOverviewFixer(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\//)){
		return;
	}
	let overview = document.querySelector(".media .overview");
	if(!overview){
		setTimeout(scoreOverviewFixer,300);
		return;
	}
	let follows = overview.querySelectorAll(".follow");
	if(follows.length){
		follows.forEach(el => {
			scoreColors(el);
		});
	}
	else{
		setTimeout(scoreOverviewFixer,300);
	}
}
