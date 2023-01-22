exportModule({
	id: "filterStaffTabs",
	description: "$filterStaffTabs_description",
	isDefault: true,
	categories: ["Media"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/(anime|manga)\/\d+\/.*\/staff/)
	},
	code: async function(){
		const mediaStaff = document.querySelector(".media-staff") || await watchElem(".media-staff");
		const staffGrid = mediaStaff.querySelector(".grid-wrap") || await watchElem(".grid-wrap",mediaStaff);
		if(staffGrid.children.length > 9){
			let filterBoxContainer = create("div","#hohStaffTabFilter");
			mediaStaff.prepend(filterBoxContainer);
			let filterRemover = create("span","#hohFilterRemover",svgAssets.cross,filterBoxContainer)
			let filterBox = create("input",false,false,filterBoxContainer);
			filterBox.placeholder = translate("$mediaStaff_filter");
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
	}
})
