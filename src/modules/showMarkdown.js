function showMarkdown(id){
	if(!location.pathname.match(id)){
		return
	}
	if(document.querySelector(".hohGetMarkdown")){
		return
	}
	let timeContainer = document.querySelector(".activity-text .time,.activity-message .time");
	if(!timeContainer){
		setTimeout(function(){showMarkdown(id)},200);
		return
	};
	if(!useScripts.accessToken && document.querySelector(".private-badge")){
		return//can't fetch private messages without privileges
	}
	let codeLink = create("span",["action","hohGetMarkdown"],"</>",false,"font-weight:bolder;");
	timeContainer.insertBefore(codeLink,timeContainer.firstChild);
	codeLink.onclick = function(){
		let activityMarkdown = document.querySelector(".activity-markdown");
		if(activityMarkdown.style.display === "none"){
			document.querySelector(".hohMarkdownSource").style.display = "none";
			activityMarkdown.style.display = "initial"
		}
		else{
			activityMarkdown.style.display = "none";
			let markdownSource = document.querySelector(".hohMarkdownSource");
			if(markdownSource){
				markdownSource.style.display = "initial"
			}
			else{
				const caller = (document.querySelector(".private-badge") ? authAPIcall : generalAPIcall);
				caller("query($id:Int){Activity(id:$id){...on MessageActivity{text:message}...on TextActivity{text}}}",{id:id},function(data){
					if(!location.pathname.match(id) || !data){
						return
					};
					markdownSource = create("div",["activity-markdown","hohMarkdownSource"],data.data.Activity.text,activityMarkdown.parentNode);
				},"hohGetMarkdown" + id,20*1000)
			}
		}
	}
}
