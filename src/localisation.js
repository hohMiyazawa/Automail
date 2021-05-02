//begin "localisation.js"
const languageFiles = {
	"English": m4_include(data/languages/English.json),
	"日本語": m4_include(data/languages/Japanese.json),
	"Åarjelsaemie": m4_include(data/languages/SouthernSami.json),
	"Norsk": m4_include(data/languages/Norwegian.json)
}
function translate(key,subs){
	if(key[0] !== "$"){
		return key
	}
	let immediate = languageFiles[useScripts.partialLocalisationLanguage].keys[key];
	if(!immediate){
		for(let i=0;i<languageFiles[useScripts.partialLocalisationLanguage].info.fallback.length;i++){
			immediate = languageFiles[languageFiles[useScripts.partialLocalisationLanguage].info.fallback].keys[key];
			if(immediate){
				break
			}
		}
		if(!immediate){
			immediate = languageFiles["English"].keys[key];
			if(!immediate){
				console.warn("[Automail localisation] missing key!",key);
				immediate = key
			}
		}
	}
	if(subs){
		if(Array.isArray(subs)){
			subs.forEach(sub => {
				immediate = immediate.replace("{" + i + "}",sub)
			})
		}
		else{
			immediate = immediate.replace("{0}",subs)
		}
	}
	return immediate
}
//end "localisation.js"
