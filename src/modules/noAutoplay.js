exportModule({
	id: "noAutoplay",
	description: "Do not autoplay videos",
	extendedDescription: `
Your browser may also provide ways to controll this:

Firefox: about:config > media.autoplay has a wide range of options

Chrome: chrome://flags/#autoplay-policy
`,
	isDefault: false,
	categories: ["Script","Newly Added"],
	visible: true
})

if(useScripts.noAutoplay){
	setInterval(function(){
		document.querySelectorAll("video").forEach(video => {
			if(video.hasAttribute("autoplay")){
				video.removeAttribute("autoplay");
				video.load()
			}
		})
	},500)
}
