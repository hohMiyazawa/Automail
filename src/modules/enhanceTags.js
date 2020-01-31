function enhanceTags(){//show tag definition in drop down menu when adding tags
	if(!location.pathname.match(/^\/(anime|manga)\/.*/)){
		return
	};
	setTimeout(enhanceTags,400);
	let possibleTagContainers = Array.from(document.querySelectorAll(".el-select-dropdown__list"));
	let bestGuess = possibleTagContainers.find(
		elem => elem.children.length > 205//horrible test, but we have no markup to go from. Assumes the tag dropdown is the only one with more than that number of children
	)
	if(!bestGuess){
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
	Array.from(bestGuess.children).forEach(child => {
		child.onmouseover = function(){
			if(tagDescriptions[child.children[0].innerText]){
				document.getElementById("hohDescription").innerText = tagDescriptions[child.children[0].innerText];
			}
			else if(child.children[0].innerText !== ""){
				document.getElementById("hohDescription").innerText = "Message hoh to get this description added";//should never happen anymore
			}
		};
		child.onmouseout = function(){
			document.getElementById("hohDescription").innerText = ""
		}
	})
};
