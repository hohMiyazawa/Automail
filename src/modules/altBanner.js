exportModule({
	id: "altBanner",
	description: "Alternative banner style on media pages for wider screen resolutions",
	extendedDescription: `
Prevents the banner on media pages from stretching and cropping on screen resolutions wider than 1920 pixels
Instead, it always displays the banner in full with sides filled in by the blurred original banner
	`,
	isDefault: false,
	importance: 0,
	categories: ["Media","Newly Added"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/(anime|manga)\/.*/.test(url)
	},
	code: function(){
		let banner;
		let adder = function(mutations,observer){
			banner = document.querySelector(".media .banner");
			if(!banner){
				return
			};
			observer && observer.disconnect();
			let existingAlt = Array.from(document.querySelectorAll(".altBanner"));
			if (existingAlt.length){
				existingAlt.forEach(oldBanner => {
				oldBanner.remove()
				})
			};
			banner.classList.add("blur-filter");
			let bannerFull = create("img","altBanner",null,banner);
			bannerFull.height = "400";
			bannerFull.src = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"")
		};
		adder();
		let mutationConfig = {
			attributes: false,
			childList: true,
			subtree: true
		};
		let observer = new MutationObserver(adder);
		!banner && observer.observe(document.body,mutationConfig)
	},
	css: `
	.media .banner{
		margin-top: 0px !important;
		position: relative;
		z-index: -2;
	}
	.blur-filter::after {
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
