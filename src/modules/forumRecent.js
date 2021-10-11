exportModule({
	id: "forumRecent",
	description: "Make the 'Forum' navbar item lead directly to /forum/recent",
	isDefault: false,
	categories: ["Forum","Navigation","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return false
	}
})

if(useScripts.forumRecent){
	let finder = function(){
		let navLinks = document.querySelector(`#nav .links .link[href="/forum/overview"]`);
		if(navLinks){
			navLinks.href = "/forum/recent";
			navLinks.onclick = function(){
				try{
					document.getElementById("app").__vue__._router.push({ name: "ForumFeed", params: {type: "recent"}});
					return false
				}
				catch(e){
					let forumRecentLink = navLinks.cloneNode(true);//copying and pasting the node should remove all event references to it
					navLinks.parentNode.replaceChild(forumRecentLink,navLinks);
				}
			}
		}
		else{
			setTimeout(finder,1000)
		}
	}
	finder()
}
