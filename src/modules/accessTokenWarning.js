exportModule({
	id: "accessTokenWarning",
	description: "Warn me when I get signed out from " + script_type,
	isDefault: false,
	importance: 0,
	categories: ["Login","Script","Newly Added"],
	visible: true
})

if(useScripts.accessTokenWarning && !useScripts.accessToken){
	accessTokenRetractedInfo()
}
