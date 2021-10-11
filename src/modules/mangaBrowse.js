exportModule({
	id: "mangaBrowse",
	description: "$mangaBrowse_description",
	isDefault: false,
	categories: ["Browse"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return false
	}
})

if(useScripts.mangaBrowse){
	let finder = function(){
		let navLinks = document.querySelector(`#nav .links .link[href="/search/anime"]`);
		if(navLinks){
			navLinks.href = "/search/manga";
			/*must remove the existing evenlistener for clicks.
			the reason for this is that it fires before the link, making the href useless
			this unfortunately turns it into a regular link, which reloads the page, so it's slower than the default behaviour.
			but since user interactions is even slower, this still saves time for those who only are interested in manga
			*/
			navLinks.onclick = function(){
				try{
					document.getElementById('app').__vue__._router.push({ name: 'Search', params: {type:'manga'}});
					return false
				}
				catch(e){
					let mangaBrowseLink = navLinks.cloneNode(true);//copying and pasting the node should remove all event references to it
					navLinks.parentNode.replaceChild(mangaBrowseLink,navLinks);
				}
			}
		}
		else{
			setTimeout(finder,1000)
		}
	}
	finder()
}
