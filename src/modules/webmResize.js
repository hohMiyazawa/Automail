exportModule({
	id: "webmResize",
	description: "Resize videos with a width in the URL hash (like #220 or #40%)",
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
