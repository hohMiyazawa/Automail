//begin "localisation.js"
const languageFiles = {//key: language name in language ("日本語"), filename: language name in English ("Japanese.json")
	"English": m4_include(data/languages/English.json),
	"Français": m4_include(data/languages/French.json),
	"Português": m4_include(data/languages/Portuguese.json),
	"Deutsch": m4_include(data/languages/German.json),
	"日本語": m4_include(data/languages/Japanese.json),
	"Italiano": m4_include(data/languages/Italian.json),
	"Türkçe": m4_include(data/languages/Turkish.json),
	"Åarjelsaemie": m4_include(data/languages/SouthernSami.json),
	"Norsk": m4_include(data/languages/Norwegian.json),
	"Svenska": m4_include(data/languages/Swedish.json),
	"English (US)": m4_include(data/languages/English_US.json),
	"English (CA)": m4_include(data/languages/English_CA.json),
	"English (short)": m4_include(data/languages/English_short.json),
	"Español": m4_include(data/languages/Spanish.json),
	"$raw_keys": m4_include(data/languages/raw_keys.json)
}
Object.keys(languageFiles["English"].keys).forEach(key => {
	languageFiles["$raw_keys"].keys[key] = key
})

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
					console.warn("[" + script_type + " localisation] missing key!",key)
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

if(!languageFiles[useScripts.partialLocalisationLanguage]){
	let candidates = []
	Object.keys(languageFiles).forEach(key => {
		if(key.includes(useScripts.partialLocalisationLanguage)){
			candidates.push(key)
		}
	})
	if(candidates.length){
		alert("No \"" + useScripts.partialLocalisationLanguage +"\" language file for " + script_type + " found. Setting language to \"English\"\nPossible candidates: " + candidates.map(a => "\"" + a + "\"").join(",") +"\nYou can change this in the settings")
	}
	else{
		alert("No \"" + useScripts.partialLocalisationLanguage +"\" language file for " + script_type + " found. Setting language to \"English\"\nYou can change this in the settings")
	}
	useScripts.partialLocalisationLanguage = "English";
	useScripts.save()
}
//end "localisation.js"
