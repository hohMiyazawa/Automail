function enhanceForum(){//purpose: reddit-style comment three collapse button
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)){
		return
	}
	let comments = Array.from(document.getElementsByClassName("comment-wrap"));
	comments.forEach(comment => {
		if(!comment.hasOwnProperty("hohVisited")){
			comment.hohVisited = true;
			let hider = create("span","hohForumHider","[-]");
			hider.onclick = function(){
				let parentComment = hider.parentNode.parentNode;
				if(hider.innerText === "[-]"){
					hider.innerText = "[+]";
					parentComment.children[1].style.display = "none";
					parentComment.parentNode.classList.add("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "none"
					}
				}
				else{
					hider.innerText = "[-]";
					parentComment.children[1].style.display = "block";
					parentComment.parentNode.classList.remove("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "block"
					}
				}
			};
			hider.onmouseenter = function(){
				hider.parentNode.parentNode.parentNode.classList.add("hohCommentSelected")
			}
			hider.onmouseleave = function(){
				hider.parentNode.parentNode.parentNode.classList.remove("hohCommentSelected")
			}
			comment.children[0].children[0].insertBefore(
				hider,
				comment.children[0].children[0].children[0]
			)
		}
	});
	setTimeout(enhanceForum,100)
}
