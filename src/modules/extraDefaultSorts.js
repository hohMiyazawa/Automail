exportModule({
	id: "extraDefaultSorts",
	description: "Make all list sort options available as options for the default setting",
	extendedDescription: `
Default list order can be selected at https://anilist.co/settings/lists

This module will add extra options in that dropdown.
	`,
	isDefault: true,
	importance: 0,
	categories: ["Lists","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/\/user\/.*\/(anime|manga)list/) || url === "https://anilist.co/settings/lists"
	},
	code: function(){
		if(document.URL === "https://anilist.co/settings/lists"){
			let optionsAdder = function(){
				if(document.URL !== "https://anilist.co/settings/lists"){
					return
				}
				let selector = document.querySelector('input[placeholder="Default List Order"]');
				if(!selector){
					setTimeout(optionsAdder,500);
					return
				}
				if(useScripts.customDefaultListOrder){
					selector.value = useScripts.customDefaultListOrder
				}
				selector.onclick = function(){
					let findDropdown = function(){
						if(document.URL !== "https://anilist.co/settings/lists"){
							return
						}
						let dropdowns = document.querySelectorAll(".el-select-dropdown");
						let correctDropdownFound = true;
						Array.from(dropdowns).forEach(dropdown => {
							if(dropdown.textContent === "ScoreTitleLast UpdatedLast Added"){//will break when more defaults are added. That's intentional
								correctDropdownFound = true;
								let ul = dropdown.querySelector("ul");
								let nativeOrder = "";
								let nativeIndex = 0;
								Array.from(ul.children).forEach((child,index) => {
									child.style.display = "none";
									if(child.classList.contains("selected")){
										nativeOrder = child.textContent;
										nativeIndex = index
									}
								});
								[
{
	name: "Title",
	native: true,
	nativeIndex: 1
},
{
	name: "Score",
	native: true,
	nativeIndex: 0
},
{
	name: "Progress"
},
{
	name: "Last Updated",
	native: true,
	nativeIndex: 2
},
{
	name: "Last Added",
	native: true,
	nativeIndex: 3
},
{
	name: "Start Date"
},
{
	name: "Completed Date"
},
{
	name: "Release Date"
},
{
	name: "Average Score"
},
{
	name: "Popularity"
}
								].forEach(option => {
									let element = create("li","el-select-dropdown__item",false,ul);
									let elementSpan = create("span",false,option.name,element);
									if(
										option.name === useScripts.customDefaultListOrder
										|| (useScripts.customDefaultListOrder === "" && option.name === nativeOrder)
									){
										element.classList.add("selected")
										element.classList.add("hohSelected")
									}
									element.onclick = function(){
										if(option.native){
											nativeOrder = option.name;
											nativeIndex = option.nativeIndex;
											useScripts.customDefaultListOrder = "";
											selector.value = option.name;
											useScripts.save()
										}
										else{
											useScripts.customDefaultListOrder = option.name;
											selector.value = useScripts.customDefaultListOrder;
											useScripts.save()
										}
										let badSelected = ul.querySelector(".hohSelected");
										badSelected.classList.remove("selected");
										badSelected.classList.remove("hohSelected");
										element.classList.add("selected");
										element.classList.add("hohSelected");
										ul.children[nativeIndex].click()
									}
								})
							}
						})
						if(!correctDropdownFound){
							setTimeout(findDropdown,200)
						}
					};findDropdown()
				}
			};optionsAdder()
		}
		else{
			if(useScripts.customDefaultListOrder === ""){
				return
			}
			let optionsAdder = function(){
				const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
				if(!URLstuff){
					return
				}
				if(decodeURIComponent(URLstuff[1]) !== whoAmI){
					return
				}
				let selector = document.querySelector('input[placeholder="Sort"]');
				if(!selector){
					setTimeout(optionsAdder,200);
					return
				}
				if(selector.classList.contains("hohCustomSelected")){
					return
				}
				selector.click();
				selector.classList.add("hohCustomSelected");
				let findDropdown = function(){
					if(!location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/)){
						return
					}
					let dropdowns = document.querySelectorAll(".el-select-dropdown");
					let correctDropdownFound = true;
					Array.from(dropdowns).forEach(dropdown => {
						if(dropdown.textContent === "TitleScoreProgressLast UpdatedLast AddedStart DateCompleted DateRelease DateAverage ScorePopularity"){
							correctDropdownFound = true;
							let ul = dropdown.querySelector("ul");
							Array.from(ul.children).forEach((child,index) => {
								if(child.textContent === useScripts.customDefaultListOrder){
									child.click()
								}
							})
						}
					})
					if(!correctDropdownFound){
						setTimeout(findDropdown,200)
					}
				};findDropdown()
			};optionsAdder()
		}
	}
})
