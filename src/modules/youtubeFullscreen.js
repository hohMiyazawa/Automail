if(useScripts.youtubeFullscreen){
	setInterval(function(){
		document.querySelectorAll(".youtube iframe").forEach(video => {
			if(!video.hasAttribute("allowfullscreen")){
				video.setAttribute("allowfullscreen","true")
			}
		})
	},1000)
}

exportModule({
	id: "youtubeFullscreen",
	description: "Allow Youtube videos to play in fullscreen mode",
	isDefault: false,
	categories: ["Script"],
	visible: true
})
