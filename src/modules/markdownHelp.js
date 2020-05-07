exportModule({
	id: "markdownHelp",
	description: "Add a markdown helper to the bottom left corner",
	isDefault: false,
	categories: ["Navigation","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return true
	},
	code: function(){
		let markdownHelper = document.getElementById("hohMarkdownHelper");
		if(markdownHelper){
			return
		}
		markdownHelper = create("span","#hohMarkdownHelper","</>?",document.getElementById("app"));
		markdownHelper.title = "Markdown help";
		markdownHelper.onclick = function(){
			let existing = document.querySelector(".hohDisplayBox");
			if(existing){
				existing.remove()
			}
			else{
				let disp = createDisplayBox(false,"Markdown help");
				create("h3","hohGuideHeading","Images",disp);
				create("pre","hohCode","img(your link here)",disp);
				create("pre","hohCode","img(https://i.stack.imgur.com/Wlvkk.jpg)",disp);
				create("p",false,"(you must upload it somewhere else to get a link)",disp);
				create("p",false,"Adjusting size:",disp);
				create("pre","hohCode","img300(your link here)",disp);
				create("p",false,"or",disp);
				create("pre","hohCode","img40%(your link here)",disp);
				create("h3","hohGuideHeading","Links",disp);
				create("pre","hohCode","[link text](URL)",disp);
				create("pre","hohCode","[cool show](https://en.wikipedia.org/wiki/Urusei_Yatsura)",disp);
				create("p",false,"To get a media preview card, just put the Anilist URL of the show:",disp);
				create("pre","hohCode","https://anilist.co/anime/1293/Urusei-Yatsura/",disp);
				create("p",false,"To make an image a link, but the image markdown insdie the link markdown, with a space on both sides",disp);
				create("pre","hohCode","[ img(image URL) ](link URL)",disp);
				create("h3","hohGuideHeading","Formatting",disp);
				create("i",false,"italics",disp);
				create("pre","hohCode","*italics* or _italics_",disp);
				create("b",false,"bold",disp);
				create("pre","hohCode","**bold** or __bold__",disp);
				create("del",false,"strikethrough",disp);
				create("pre","hohCode","~~strikethrough~~",disp);
				create("a",["link","hohGuideHeading"],"Full guide",disp).href = "https://anilist.co/forum/thread/6125";
				create("span",false," ◆ ",disp);
				create("a",["link","hohGuideHeading"],"Make emojis work",disp).href = "https://files.kiniro.uk/unicodifier.html";
			}
		}
	}
})
