exportModule({
	id: "directListAccess",
	description: "Make the down arrow links in the feeds open the list editor directly",
	extendedDescription: "When hovering over the cover image of an entry in the activity feeds, an arrow will appear. Clicking the arrow will present you with various options, including opening the list editor. I never use any of the other options, so this module turns this into a one-click experience.",
	isDefault: false,
	importance: 0,
	categories: ["Feeds","Newly Added"],
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
									item.querySelector(".el-dropdown-menu__item--divided").click()
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
