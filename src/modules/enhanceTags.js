exportModule({
	id: "tagDescriptions",
	description: "$tagDescriptions_description",
	isDefault: true,
	categories: ["Media"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return /^https:\/\/anilist\.co\/(anime|manga)\/\d+\/[^/]+\/?(.*)?/.test(url)
	},
	code: function(){
		function enhanceTags(){
			let possibleTagContainers = Array.from(document.querySelectorAll(".el-select-dropdown__list"));
			let bestGuess = possibleTagContainers.find(
				elem => elem.children.length > 205//horrible test, but we have no markup to go from. Assumes the tag dropdown is the only one with more than that number of children
			)
			if(!bestGuess){
				setTimeout(enhanceTags,400);
				return
			};
			if(bestGuess.hasOwnProperty("hohMarked")){
				return
			}
			else{
				bestGuess.hohMarked = true
			};
			let superBody = document.getElementsByClassName("el-dialog__body")[0];
			let descriptionTarget = create("span","#hohDescription");
			superBody.insertBefore(descriptionTarget,superBody.children[2]);

			function addHandler(child){
				child.onmouseover = function(){
					if(tagDescriptions[child.children[0].innerText]){
						document.getElementById("hohDescription").innerText = tagDescriptions[child.children[0].innerText];
					}
				};
				child.onmouseout = function(){
					document.getElementById("hohDescription").innerText = ""
				}
			}
			function checkCustomTag(){
				if(!bestGuess.children[0].onmouseover || !bestGuess.children[0].onmouseout){
					addHandler(bestGuess.children[0])
				}
			}
			Array.from(bestGuess.children).forEach(child => addHandler(child))
			setInterval(checkCustomTag, 400);
		}
		function checkAddTag(){
			const addTag = document.querySelector(".tags .add-icon")
			if(addTag){
				addTag.addEventListener("click", enhanceTags)
			}
			else{
				setTimeout(checkAddTag, 400)
			}
		}
		checkAddTag()
	}
})
