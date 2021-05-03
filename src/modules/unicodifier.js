exportModule({
	id: "unicodifier",
	description: translate("$module_unicodifier_description"),
	extendedDescription: translate("$module_unicodifier_extendedDescription"),
	isDefault: false,
	importance: 0,
	categories: ["Feeds","Forum","Newly Added"],
	visible: true
})

setInterval(function(){
	Array.from(document.querySelectorAll(".activity-edit textarea.el-textarea__inner,.editor textarea.el-textarea__inner")).forEach(editor => {
		if(editor.value){
			editor.value = emojiSanitize(editor.value)
		}
	})
},2000)
