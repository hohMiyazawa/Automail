exportModule({
	id: "addForumMedia",
	description: "Add a link back to a work's database page on its forum feed",
	isDefault: true,
	importance: -1,
	categories: ["Forum","Navigation"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.includes("https://anilist.co/forum/recent?media=")
	},
	code: function(){
		let id = parseInt(document.URL.match(/\d+$/)[0]);
		let adder = function(data){
			if(!document.URL.includes(id) || !data){
				return
			}
			let feed = document.querySelector(".feed");
			if(!feed){
				setTimeout(function(){adder(data)},200);
				return
			}
			data.data.Media.id = id;
			let mediaLink = create("a",false,titlePicker(data.data.Media),false,"padding:10px;display:block;");
			mediaLink.href = data.data.Media.siteUrl;
			if(data.data.Media.siteUrl.includes("manga") && useScripts.CSSgreenManga){
				mediaLink.style.color = "rgb(var(--color-green))"
			}
			else{
				mediaLink.style.color = "rgb(var(--color-blue))"
			}
			feed.insertBefore(mediaLink,feed.firstChild);
		}
		generalAPIcall(
			`query($id:Int){Media(id:$id){title{native english romaji} siteUrl}}`,
			{id: id},
			adder,
			"hohMediaLookup" + id
		)
	}
})
