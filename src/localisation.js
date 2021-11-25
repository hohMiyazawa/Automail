//begin "localisation.js"
const languageFiles = {
	"English": m4_include(data/languages/English.json),
	"Português": m4_include(data/languages/Portuguese.json),
	"Deutsch": m4_include(data/languages/German.json),
	"日本語": m4_include(data/languages/Japanese.json),
	"Åarjelsaemie": m4_include(data/languages/SouthernSami.json),
	"Norsk": m4_include(data/languages/Norwegian.json),
	"Svenska": m4_include(data/languages/Swedish.json),
	"English (US)": m4_include(data/languages/English_US.json)
	"Spanish": m4_include(data/languages/Spanish.json)
}
function translate(key,subs,fallback){
	if(key[0] !== "$"){
		return key
	}
	let immediate = languageFiles[useScripts.partialLocalisationLanguage].keys[key];
	if(!immediate){
		for(let i=0;i<languageFiles[useScripts.partialLocalisationLanguage].info.fallback.length;i++){
			immediate = languageFiles[languageFiles[useScripts.partialLocalisationLanguage].info.fallback[i]].keys[key];
			if(immediate){
				break
			}
		}
		if(!immediate){
			immediate = languageFiles["English"].keys[key];
			if(!immediate){
				if(fallback){
					return fallback
				}
				if(key.substring(0,6) !== "$role_"){
					console.warn("[Automail localisation] missing key!",key)
				}
				immediate = key
			}
		}
	}
	if(subs){
		if(Array.isArray(subs)){
			subs.forEach((sub,i) => {
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
