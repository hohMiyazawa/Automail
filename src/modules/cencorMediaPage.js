function cencorMediaPage(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let possibleLocation = document.querySelectorAll(".tags .tag .name");
	if(possibleLocation.length){
		if(possibleLocation.some(
			tag => badTags.some(
				bad => tag.innerText.toLowerCase().includes(bad)
			)
		)){
			let content = document.querySelector(".page-content");
			if(content){
				content.classList.add("hohCencor")
			}
		}
	}
	else{
		setTimeout(() => {cencorMediaPage(id)},200)
	}
}
