exportModule({
	id: "dblclickZoom",
	description: "$dblclickZoom_description",
	extendedDescription: "$dblclickZoom_extendedDescription",
	isDefault: false,
	importance: -1,
	categories: ["Feeds"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return location.pathname.match(/^\/home\/?$/)
	},
	code: function(){
		function addDblclickZoom(){
			if(!location.pathname.match(/^\/home\/?$/)){
				return
			};
			let activityFeedWrap = document.querySelector(".activity-feed-wrap");
			if(!activityFeedWrap){
				setTimeout(addDblclickZoom,200);
				return
			};
			activityFeedWrap.addEventListener("dblclick",function(e){
				e = e || window.event;
				let target = e.target || e.srcElement;
			 	while(target.classList){
					if(target.classList.contains("activity-entry")){
						target.classList.toggle("hohZoom");
						break
					};
					target = target.parentNode
				}  
			},false)
		}
	},
	css: `
.hohZoom{
	transform: scale(1.5);
	transform-origin: 0 0;
	transition: transform 0.4s;
	z-index: 200;
	box-shadow: 5px 5px 5px black;
}
.hohZoom .reply-wrap{
	background: rgb(var(--color-background));
}`
})
