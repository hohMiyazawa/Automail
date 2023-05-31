exportModule({
	id: "noAutoplay",
	description: "$noAutoplay_description",
	extendedDescription: "$noAutoplay_extendedDescription",
	isDefault: false,
	categories: ["Feeds"],
	visible: true
})

if(useScripts.noAutoplay){
	setInterval(function(){
		document.querySelectorAll("video").forEach(video => {
			if(video.hasAttribute("autoplay")){
				if(!(video.querySelector("source") && video.querySelector("source").src.match(/#image$/))){
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
