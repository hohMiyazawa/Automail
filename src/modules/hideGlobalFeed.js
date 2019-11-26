function hideGlobalFeed(){
	if(!location.pathname.match(/^\/home/)){
		return
	};
	let toggle = document.querySelector(".feed-type-toggle");
	if(!toggle){
		setTimeout(hideGlobalFeed,100);
		return
	};
	toggle.children[1].style.display = "none";
	if(toggle.children[1].classList.contains("active")){
		toggle.children[0].click()
	}
};
