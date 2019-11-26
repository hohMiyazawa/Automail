function addDblclickZoom(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addDblclickZoom,200);
		return;
	};
	activityFeedWrap.addEventListener("dblclick",function(e){
		e = e || window.event;
		let target = e.target || e.srcElement;
	 	while(target.classList){
			if(target.classList.contains("activity-entry")){
				target.classList.toggle("hohZoom");
				break;
			};
			target = target.parentNode;
		}  
	},false);
}
