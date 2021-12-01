exportModule({
	id: "unicodifier",
	description: "$module_unicodifier_description",
	extendedDescription: "$module_unicodifier_extendedDescription",
	isDefault: true,
	importance: 0,
	categories: ["Feeds","Forum"],
	visible: true
})

setInterval(function(){
	Array.from(document.querySelectorAll(".activity-edit textarea.el-textarea__inner,.editor textarea.el-textarea__inner")).forEach(editor => {
		if(editor.value){
			editor.value = emojiSanitize(editor.value);
			editor.dispatchEvent(new Event("input",{bubbles: false}))
		}
	})
},2000)
