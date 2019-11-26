function addForumMedia(){
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
		let mediaLink = create("a",false,titlePicker(data.data.Media),false,"color:rgb(var(--color-blue));padding:10px;display:block;");
		mediaLink.href = data.data.Media.siteUrl;
		feed.insertBefore(mediaLink,feed.firstChild);
	}
	generalAPIcall(
		`query($id:Int){Media(id:$id){title{native english romaji} siteUrl}}`,
		{id: id},
		adder,
		"hohMediaLookup" + id
	)
}
