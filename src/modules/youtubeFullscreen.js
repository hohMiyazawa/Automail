if(useScripts.youtubeFullscreen){
	setInterval(function(){
		document.querySelectorAll(".youtube iframe").forEach(video => {
			if(!video.hasAttribute("allowfullscreen")){
				video.setAttribute("allowfullscreen","allowfullscreen");
				video.setAttribute("frameborder","0")
			}
		})
	},1000)
}

exportModule({
	id: "youtubeFullscreen",
	description: "Enable fullscreen button on youtube videos",
	isDefault: false,
	categories: ["Script"],
	visible: true
})
