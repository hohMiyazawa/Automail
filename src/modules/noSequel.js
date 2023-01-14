const sequelList = new Set(m4_include(data/sequels.json))
const sequelList_manga = new Set(m4_include(data/sequels_manga.json))

exportModule({
	id: "$noSequel",
	description: "$noSequel_description",
	extendedDescription: "noSequel_extendedDescription",
	isDefault: true,
	importance: 1,
	categories: ["Browse","Newly Added"],
	visible: true,
	urlMatch: function(){
		return /^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname)
	},
	code: function(){
		let optionInserter = function(){
			if(!(/^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname))){
				return
			}
			let place = document.querySelector(".primary-filters .filters");
			if(!place){
				setTimeout(optionInserter,500);
				return
			};
			place.style.position = "relative";
			if(document.querySelector(".hohNoSequelSetting")){
				return
			}
			let setting = create("span","hohNoSequelSetting",false,place);
			let input = createCheckbox(setting);
			input.classList.add("hohNoSequelSetting_input");
			input.checked = useScripts.noSequel_value;
			input.onchange = function(){
				useScripts.noSequel_value = this.checked;
				useScripts.save();
			}
			create("span",false,translate("$hideSequels"),setting);
			let remover = setInterval(function(){
				if(!(/^\/search\/anime/.test(location.pathname) || /^\/search\/manga/.test(location.pathname))){
					clearInterval(remover);
					return
				}
				let input = document.querySelector(".hohNoSequelSetting_input");
				if(!input){
					clearInterval(remover);
					return
				}
				Array.from(document.querySelectorAll(".media-card")).forEach(hit => {
					let link = hit.querySelector(".cover");
					if(link){
						let id = (link.href || "").match(/(anime|manga)\/(\d+)\//);
						if(id && id[2]){
							id = parseInt(id[2]);
							if((sequelList.has(id) || sequelList_manga.has(id) || (link.href || "").match(/2nd|season-2|season-3/i)) && input.checked){
								hit.classList.add("hohHiddenSequel")
							}
							else{
								hit.classList.remove("hohHiddenSequel")
							}
						}
					}
				})
			},500)
		};
		optionInserter()
	},
	css: ".hohHiddenSequel{display: none!important}"
})
