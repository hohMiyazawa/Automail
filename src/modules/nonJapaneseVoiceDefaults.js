exportModule({
	id: "nonJapaneseVoiceDefaults",
	description: "defaults to Chinese and Korean voice actors for non-Japanese shows",
	isDefault: true,
	categories: ["Media"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match(/\/anime\/.*\/characters\/?$/)
	},
	code: function(){
		let checker = function(){
			if(!document.URL.match(/\/anime\/.*\/characters\/?$/)){
				return
			}
			let sidebarInfo = document.querySelector(".sidebar .data-set .value");
			if(!sidebarInfo){
				setTimeout(checker,500);
				return
			}
			let country = sidebarInfo.innerText.match(/Chinese|South Korean|Taiwanese/);
			if(!country){
				return
			}
			let selector = document.querySelector('.language-select input[placeholder="Language"]');
			if(!selector){
				setTimeout(checker,500);
				return
			}
			//opens the dropdown, spawning the alternate options
			selector.click();
			let selection = function(){
				if(!document.URL.match(/\/anime\/.*\/characters\/?$/)){
					return
				}
				let dropdown = document.querySelector(".el-select-dropdown");
				if(!dropdown){
					setTimeout(selection,100);
					return
				}
				let options = Array.from(dropdown.querySelectorAll(".el-select-dropdown__item span"));
				if(options.length === 0){
					selector.click()
				}
				options.forEach(option => {
					if(
						(option.innerText === "Chinese" && (country[0] === "Chinese" || country[0] === "Taiwanese"))
						|| (option.innerText === "Korean" && country[0] === "South Korean")
					){
						option.click()
					}
				})
			};selection()
		};checker()
	}
})
