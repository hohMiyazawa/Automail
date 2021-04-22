exportModule({
	id: "extraFavs",
	description: "Make scrollable favourite sections on profiles",
	extendedDescription: `
Work in progress. Only anime so far.`,
	isDefault: false,
	importance: 0,
	categories: ["Profiles","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/user\/(.*?)\/?$/)
	},
	code: function(){
		let finder = function(){
			const URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*?)\/?$/);
			if(!URLstuff){
				return
			}
			const favSection = document.querySelector(".favourites-wrap.anime");
			if(!favSection){
				setTimeout(finder,1000);
				return
			}
			if(favSection.classList.contains("hohExtraFavs")){
				return
			}
			if(favSection.children.length === 0){
				setTimeout(finder,1000);
				return
			}
			if(
				favSection.children.length < 25 //user has all favs on profile
				|| favSection.children.length > 25 //if I have messed up somehow
			){
				return
			}
			favSection.classList.add("hohExtraFavs");
			generalAPIcall(//private users will not be able to use this on themselves, funnily enough.
`
query($user: String!){
	User(name: $user){
		favourites{
			anime1:anime(page:2){
				nodes{
					id
					coverImage{large}
					title{romaji native english}
				}
			}
			anime2:anime(page:3){
				nodes{
					id
					coverImage{large}
					title{romaji native english}
				}
			}
			anime3:anime(page:4){
				nodes{
					id
					coverImage{large}
					title{romaji native english}
				}
			}
		}
	}
}
`,//top 100 is enough in most cases
				{
					user: decodeURIComponent(URLstuff[1]),
				},
				function(data){
					favSection.style.height = (favSection.clientHeight || 615) + "px";
					if(!data){
						return//could be a private profile
					}
					data.data.User.favourites.anime1.nodes.concat(
						data.data.User.favourites.anime2.nodes
					).concat(
						data.data.User.favourites.anime3.nodes
					).forEach(fav => {
						let element = create("a",["favourite","media","hohExtraFav"],false,favSection,'background-image: url("' + fav.coverImage.large + '")');
						element.href = "/anime/" + fav.id + "/" + safeURL(titlePicker(fav));
						element.title = titlePicker(fav)
					})
				},
				"hohExtraFavs" + URLstuff[1],
				60*60*1000//cache for an hour
			)
		};finder()
	},
	css: `
.hohExtraFav{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	border-radius: 4px;
	cursor: pointer;
	display: inline-block;
	height: 115px;
	position: relative;
	width: 85px;
	margin-bottom: 20px;
	margin-right: 21px;
}
.hohExtraFavs:hover{
	overflow-y: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}
.hohExtraFavs:hover::-webkit-scrollbar{
	width: 0;
	height: 0;
}
`
})
