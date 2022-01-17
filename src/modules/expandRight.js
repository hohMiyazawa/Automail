function expandRight(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	}
	let possibleFullWidth = document.querySelector(".home.full-width");
	if(possibleFullWidth){
		let homeContainer = possibleFullWidth.parentNode;
		let sideBar = document.querySelector(".activity-feed-wrap")
		if(!sideBar){
			setTimeout(expandRight,100);
			return;
		}
		sideBar = sideBar.nextElementSibling;
		sideBar.insertBefore(possibleFullWidth,sideBar.firstChild);
		let setSemantics = function(){
			let toggle = document.querySelector(".size-toggle.fa-compress");
			if(toggle){
				toggle.onclick = function(){
					homeContainer.insertBefore(possibleFullWidth,homeContainer.firstChild)
				}
			}
			else{
				setTimeout(setSemantics,200)
			}
		};setSemantics();
	}
}
