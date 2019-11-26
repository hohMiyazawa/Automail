function addProgressBar(){
	if(location.pathname != "/home"){
		return
	};
	let mediaCards = document.querySelectorAll(".media-preview-card .content .info:not(.hasMeter) > div");
	if(!mediaCards.length){
		setTimeout(function(){
			addProgressBar()
		},200);//may take some time to load
		return
	};
	mediaCards.forEach(card => {
		const progressInformation = card.innerText.match(/Progress:\ (\d+)\/(\d+)/);
		if(progressInformation){
			let pBar = create("meter");
			pBar.value = progressInformation[1];
			pBar.min = 0;
			pBar.max = progressInformation[2];
			card.parentNode.insertBefore(pBar,card);
			card.parentNode.parentNode.parentNode.querySelector(".plus-progress").onclick = function(){
				pBar.value++;
				setTimeout(function(){
					pBar.value = card.innerText.match(/Progress:\ (\d+)\/(\d+)/)[1]
				},1000)
			}
		}
	});
	document.querySelector(".size-toggle").onclick = function(){
		setTimeout(function(){
			addProgressBar()
		},200);
	}
}
