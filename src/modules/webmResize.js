exportModule({
	id: "webmResize",
	description: "$webmResize_description",
	isDefault: true,
	categories: ["Feeds"],
	visible: true
})

if(useScripts.webmResize){
	setInterval(function(){
		document.querySelectorAll("source").forEach(video => {
			let hashMatch = (video.src || "").match(/#(image)?(\d+(\.\d+)?%?)$/);
			if(hashMatch && !video.parentNode.width){
				video.parentNode.setAttribute("width",hashMatch[2])
			}
			if(video.src.match(/#image\d*(\.\d+)?%?$/)){
				video.parentNode.removeAttribute("controls")
			}
		})
	},500)
}
