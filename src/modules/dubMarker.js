function dubMarker(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
		return
	}
	if(document.getElementById("dubNotice")){
		return
	}
	const variables = {
		id: document.URL.match(/\/anime\/(\d+)\//)[1],
		page: 1,
		language: useScripts.dubMarkerLanguage.toUpperCase()
	};
	const query = `
query($id: Int!, $type: MediaType, $page: Int = 1, $language: StaffLanguage){
	Media(id: $id, type: $type){
		characters(page: $page, sort: [ROLE], role: MAIN){
			edges {
				node{id}
				voiceActors(language: $language){language}
			}
		}
	}
}`;
	let dubCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
			return
		};
		let dubNoticeLocation = document.querySelector(".sidebar");
		if(!dubNoticeLocation){
			setTimeout(function(){
				dubCallback(data)
			},200);
			return
		}
		if(data.data.Media.characters.edges.reduce(
			(actors,a) => actors + a.voiceActors.length,0
		)){//any voice actors for this language?
			if(document.getElementById("dubNotice")){
				return
			}
			let dubNotice = create("p","#dubNotice",
				translate("$dubMarker_notice",translate("$language_" + useScripts.dubMarkerLanguage))
			);
			dubNoticeLocation.insertBefore(dubNotice,dubNoticeLocation.firstChild)
		}
	};
	generalAPIcall(query,variables,dubCallback,"hohDubInfo" + variables.id + variables.language)
}
