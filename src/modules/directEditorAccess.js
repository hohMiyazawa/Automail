exportModule({
	id: "directListAccess",
	description: "$directListAccess_description",
	extendedDescription: "$directListAccess_extendedDescription",
	isDefault: false,
	importance: 0,
	categories: ["Feeds"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url === "https://anilist.co/home" || url.match(/^https:\/\/anilist\.co\/user\/(.*)\/$/)
	},
	code: function(){
		let adder = function(){
			if(document.querySelector(".activity-feed")){
				document.querySelector(".activity-feed").addEventListener("click",function(e){
					let tmp_target = e.target;
					if(!tmp_target.classList.contains("el-dropdown-menu__item--divided")){
						for(let i=0;i<4;i++){
							if(tmp_target.classList.contains("entry-dropdown")){
								let item = document.getElementById(tmp_target.children[0].getAttribute("aria-controls"));
								if(item){
									item.querySelector(".el-dropdown-menu__item--divided").click();
									item.hidden = true
								}
								break
							}
							else{
								tmp_target = tmp_target.parentNode
							}
						}
					}
				})
			}
			else{
				setTimeout(adder,2000)
			}
		};
		adder()
	}
})
