if(useScripts.ALbuttonReload){
	let logo = document.querySelector(".logo");
	if(logo){
		logo.onclick = function(){
			if(location.pathname.match(/\/home\/?$/)){//we only want this behaviour here
				window.location.reload(false);//reload page, but use cache if possible
			}
		}
	}
}
