exportModule({
	id: "videoMimeTypeFixer",
	description: "$videoMimeTypeFixer_description",
	extendedDescription: `
Anilist by default serves all video as "video/webm".
However, it's common to use non-webm video, as brower support is common.
But some browsers don't autodetect the proper mime type. This module adds a mime type based on the file extension, which may help if the video won't play otherwise.
	`,
	isDefault: false,
	categories: ["Feeds"],
	visible: true
})

if(useScripts.videoMimeTypeFixer){
	setInterval(function(){
		document.querySelectorAll('source[src$=".av1"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/av1")
		})
		document.querySelectorAll('source[src$=".mp4"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/mp4")
		})
		document.querySelectorAll('source[src$=".avi"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/x-msvideo")
		})
		document.querySelectorAll('source[src$=".mpeg"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/mpeg")
		})
		document.querySelectorAll('source[src$=".ogg"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/ogv")
		})
		document.querySelectorAll('source[src$=".ts"][type="video/webm"]').forEach(video => {
			video.setAttribute("type","video/mp2t")
		})
	},2000)
}
