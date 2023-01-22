exportModule({
	id: "accessTokenWarning",
	description: "$accessTokenWarning_description",
	isDefault: false,
	importance: 0,
	categories: ["Login","Script"],
	visible: true
})

if(useScripts.accessTokenWarning && !useScripts.accessToken){
	accessTokenRetractedInfo()
}
