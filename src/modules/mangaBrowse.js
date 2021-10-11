exportModule({
	id: "mangaBrowse",
	description: "$mangaBrowse_description",
	isDefault: false,
	categories: ["Browse","Navigation"],
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
