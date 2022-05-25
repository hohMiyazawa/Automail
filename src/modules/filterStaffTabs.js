exportModule({
	id: "filterStaffTabs",
	description: "Add filtering to media staff tabs",
	isDefault: true,
	categories: ["Media"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/(anime|manga)\/\d+\/.*\/staff/)
	},
	code: function(){
		let waiter = function(tries){
			if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/\d+\/.*\/staff/)){
				return
			}
			if(tries > 10){
				return
			}
			let mediaStaff = document.querySelector(".media-staff");
			if(!mediaStaff){
				setTimeout(function(){waiter(0)},250);
				return
			}
			let staffGrid = mediaStaff.querySelector(".grid-wrap");
			if(staffGrid.children.length > 9){
				let filterBoxContainer = create("div","#hohStaffTabFilter");
				mediaStaff.prepend(filterBoxContainer);
				let filterRemover = create("span","#hohFilterRemover",svgAssets.cross,filterBoxContainer)
				let filterBox = create("input",false,false,filterBoxContainer);
				filterBox.placeholder = "Filter by name or role";
				filterBox.setAttribute("list","staffRoles");
				let filterer = function(){
					let val = filterBox.value;
					Array.from(staffGrid.children).forEach(card => {
						if(
							looseMatcher(card.querySelector(".name").innerText,val)
							|| looseMatcher(card.querySelector(".role").innerText,val)
						){
							card.style.display = "inline-grid"
						}
						else{
							card.style.display = "none"
						}
					});
					if(val === ""){
						filterRemover.style.display = "none"
					}
					else{
						filterRemover.style.display = "inline"
					}
				}
				filterRemover.onclick = function(){
					filterBox.value = "";
					filterer()
				}
				filterBox.oninput = filterer;
				let dataList = create("datalist","#staffRoles",false,filterBoxContainer);
				let buildStaffRoles = function(){
					let autocomplete = new Set();
					Array.from(staffGrid.children).forEach(card => {
						autocomplete.add(card.querySelector(".name").innerText);
						autocomplete.add(card.querySelector(".role").innerText.replace(/\s*\(.*\)\.?\s*/,""));
						if(card.querySelector(".role").innerText.includes("OP")){
							autocomplete.add("OP")
						}
						if(card.querySelector(".role").innerText.includes("ED")){
							autocomplete.add("ED")
						}
					})
					removeChildren(dataList);
					autocomplete.forEach(
						value => create("option",false,false,dataList).value = value
					)
				};buildStaffRoles();
				let mutationConfig = {
					attributes: false,
					childList: true,
					subtree: false
				};
				let observer = new MutationObserver(function(){
					filterer();
					buildStaffRoles()
				});
				observer.observe(staffGrid,mutationConfig)
			}
			else{
				setTimeout(function(){waiter(++tries)},250 + tries*100)
			}
		};waiter(0)
	}
})
