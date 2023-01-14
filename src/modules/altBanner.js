exportModule({
	id: "altBanner",
	description: "$altBanner_description",
	extendedDescription: "$altBanner_extendedDescription",
	isDefault: false,
	importance: 0,
	categories: ["Media","Newly Added"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/(anime|manga)\/.*/.test(url)
	},
	code: function(){
		let adder = function(mutations,observer){
			let pNode = document.querySelector(".media .header-wrap");
			if(!pNode){
				setTimeout(adder,200);
				return
			}
			if(pNode.childNodes[0] && pNode.childNodes[0].nodeType === 8){
				return
			}
			let banner = pNode.querySelector(".banner");
			if(!banner && !observer){
				let mutationConfig = {
					attributes: false,
					childList: true,
					subtree: false
				}
				let observer = new MutationObserver(adder);
				observer.observe(pNode,mutationConfig);
				return
			}
			else if(!banner){
				return
			}
			observer && observer.disconnect();
			banner.classList.add("blur-filter");
			let bannerFull = document.querySelector(".altBanner") || create("img","altBanner",null,banner);
			bannerFull.height = "400";
			bannerFull.src = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"")
		}
		adder()
	},
	css: `
	.media .header-wrap .banner{
		margin-top: 0px !important;
		position: relative;
		z-index: -2;
	}
	.blur-filter::after{
		backdrop-filter: blur(10px);
		content: "";
		display: block;
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		z-index: -2;
	}
	.altBanner{
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%);
		z-index: -1;
	}
	`
})
