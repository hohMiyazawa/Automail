//begin "localisation.js"
const languageFiles = {
	"English": m4_include(data/languages/English.json),
	"日本語": m4_include(data/languages/Japanese.json),
	"Åarjelsaemie": m4_include(data/languages/SouthernSami.json),
	"Norsk": m4_include(data/languages/Norwegian.json)
}
function translate(key){
	if(key[0] !== "$"){
		return key
	}
	let immediate = languageFiles[useScripts.partialLocalisationLanguage].keys[key];
	if(immediate){
		return immediate
	}
	for(let i=0;i<languageFiles[useScripts.partialLocalisationLanguage].info.fallback.length;i++){
		let possibleFallback = languageFiles[languageFiles[useScripts.partialLocalisationLanguage].info.fallback].keys[key];
		if(possibleFallback){
			return possibleFallback
		}
	}
	let englishFallback = languageFiles["English"].keys[key];
	if(englishFallback){
		return englishFallback
	}
	console.warn("[Automail localisation] missing key!",key)
	return key//better than nothing
}
//end "localisation.js"
