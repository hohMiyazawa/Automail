const sequelList = new Set(m4_include(data/sequels.json))

exportModule({
	id: "noSequel",
	description: "Add a 'no sequels' filter option on the browse page (anime only for now)",
	extendedDescription: `
Attemps to remove sequels and spinoffs from the results when active. This is a fuzzy problem, so the script will not always get it right, producing both false positives and false negatives.
	`,
	isDefault: true,
	importance: 1,
	categories: ["Browse","Newly Added"],
	visible: true,
	urlMatch: function(){
		return /^\/search\/anime/.test(location.pathname)
	},
	code: function(){
		let optionInserter = function(){
			if(!/^\/search\/anime/.test(location.pathname)){
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
			let setting = create("span","hohNoSequelSetting",false,place,"position: absolute;right: 100px;top: 50px;");
			let input = createCheckbox(setting);
			input.classList.add("hohNoSequelSetting_input");
			input.checked = useScripts.noSequel_value;
			input.onchange = function(){
				useScripts.noSequel_value = this.checked;
				useScripts.save();
			}
			create("span",false,"No sequels",setting);
			let remover = setInterval(function(){
				if(!/^\/search\/anime/.test(location.pathname)){
					clearInterval(remove);
					return
				}
				let input = document.querySelector(".hohNoSequelSetting_input");
				if(!input){
					clearInterval(remove);
					return
				}
				Array.from(document.querySelectorAll(".media-card")).forEach(hit => {
					let link = hit.querySelector(".cover");
					if(link){
						let id = (link.href || "").match(/anime\/(\d+)\//);
						if(id && id[1]){
							id = parseInt(id[1]);
							if(sequelList.has(id) && input.checked){
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
