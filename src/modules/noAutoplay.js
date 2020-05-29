exportModule({
	id: "noAutoplay",
	description: "Do not autoplay videos",
	extendedDescription: `
Your browser may also provide ways to control this:

Firefox: about:config > media.autoplay has a wide range of options

Chrome: chrome://flags/#autoplay-policy
`,
	isDefault: false,
	categories: ["Feeds","Newly Added"],
	visible: true
})

if(useScripts.noAutoplay){
	setInterval(function(){
		document.querySelectorAll("video").forEach(video => {
			if(video.hasAttribute("autoplay")){
				if(!video.querySelector("source").src.match(/#image$/)){
					video.removeAttribute("autoplay");
					video.load()
				}
				else{
					video.removeAttribute("controls")
				}
			}
		})
	},500)
}
