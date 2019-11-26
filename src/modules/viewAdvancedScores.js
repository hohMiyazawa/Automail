function viewAdvancedScores(url){
	let URLstuff = url.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/);
	let name = decodeURIComponent(URLstuff[1]);
	generalAPIcall(
		`query($name:String!){
			User(name:$name){
				mediaListOptions{
					animeList{advancedScoringEnabled}
					mangaList{advancedScoringEnabled}
				}
			}
		}`,
		{name: name},function(data){
		if(
			!(
				(URLstuff[2] === "anime" && data.data.User.mediaListOptions.animeList.advancedScoringEnabled)
				|| (URLstuff[2] === "manga" && data.data.User.mediaListOptions.mangaList.advancedScoringEnabled)
			)
		){
			return
		};
		generalAPIcall(
			`query($name:String!,$listType:MediaType){
				MediaListCollection(userName:$name,type:$listType){
					lists{
						entries{mediaId advancedScores}
					}
				}
			}`,
			{name: name,listType: URLstuff[2].toUpperCase()},
			function(data2){
				let list = new Map(returnList(data2,true).map(a => [a.mediaId,a.advancedScores]));
				let finder = function(){
					if(!document.URL.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/)){
						return
					};
					document.querySelectorAll(
						".list-entries .entry .title > a:not(.hohAdvanced)"
					).forEach(function(entry){
						entry.classList.add("hohAdvanced");
						let key = parseInt(entry.href.match(/\/(\d+)\//)[1]);
						let dollar = create("span","hohAdvancedDollar","$",entry.parentNode);
						let advanced = list.get(key);
						let reasonable = Object.keys(advanced).map(
							key => [key,advanced[key]]
						).filter(
							a => a[1]
						);
						dollar.title = reasonable.map(
							a => a[0] + ": " + a[1]
						).join("\n");
						if(!reasonable.length){
							dollar.style.display = "none"
						}
					});
					setTimeout(finder,1000);
				};finder();
			}
		)
	})
};
