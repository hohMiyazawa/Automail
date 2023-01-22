exportModule({
	id: "youtubeFullscreen",
	description: "$youtubeFullscreen_description",
	isDefault: false,
	categories: ["Feeds"],
	visible: true
})

if(useScripts.youtubeFullscreen){
	setInterval(function(){
		document.querySelectorAll(".youtube iframe").forEach(video => {
			if(!video.hasAttribute("allowfullscreen")){
				video.setAttribute("allowfullscreen","allowfullscreen");
				video.setAttribute("frameborder","0");
				video.setAttribute("src",video.getAttribute("src").replace("autohide=1","autohide=0"))
			}
		})
	},1000)
}
