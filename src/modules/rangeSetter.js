exportModule({
	id: "rangeSetter",
	description: "Add a progress range setter to the list editor",
	extendedDescription: `
When changing the number in the "progress" field, a button will appear.
When clicked, it sets the lower number on an activity ("user read chapter 65 - 69 of manga")
You then change the field to the higher number and click save as usual.
	`,
	isDefault: true,
	importance: 0,
	categories: ["Media","Newly Added","Lists","Login"],
	visible: true,
	css: `
.input-wrap .form.progress{
	position: relative;
}
.hohRangeSetter{
	width: 15px;
	height: 15px;
	position: absolute;
	right: -20px;
	top: 37.5px;
	background: rgb(var(--color-blue));
	border-radius: 2px;
	cursor: pointer;
}
`
})

if(useScripts.rangeSetter && useScripts.accessToken){
	setInterval(function(){
		let inputPlace = document.querySelector(".input-wrap .form.progress");
		if(inputPlace){
			if(inputPlace.querySelector(".hohRangeSetter")){
				return
			}
			let rangeSetter = create("div","hohRangeSetter",false,inputPlace);
			rangeSetter.title = "Click to set lower part of activity range";
			rangeSetter.style.display = "none";
			let realInput = inputPlace.querySelector("input");
			if(!realInput){
				return
			}
			let seriesID = null;//we need to gather this quickly!
			let possibleDirectMatch = document.URL.match(/\/(anime|manga)\/(\d+)/);
			if(possibleDirectMatch){
				seriesID = parseInt(possibleDirectMatch[2])
			}
			else{
				let secondPosition = inputPlace.parentNode.parentNode.parentNode.querySelector(".cover img");
				if(secondPosition && secondPosition.src.match(/cover\/.*\/[a-z]?[a-z]?(\d+)-/)){
					seriesID = parseInt(secondPosition.src.match(/cover\/.*\/[a-z]?[a-z]?(\d+)-/)[1]);
				}
				else{//oh no! pray the query is fast enough
					let title = inputPlace.parentNode.parentNode.parentNode.querySelector(".title").innerText;
					generalAPIcall(
`query{Media(search:"${title}"){id}}`,{},function(data){
							if(!data){
								return
							}
							seriesID = data.data.Media.id
						}
					)
				}
			}
			let changer = function(){
				if(!seriesID){
					return//too late!
				}
				if(!realInput.value){
					return
				}
				realInput.onclick = null;
				inputPlace.querySelector(".el-input-number__decrease").onclick = null;
				inputPlace.querySelector(".el-input-number__increase").onclick = null;
				rangeSetter.style.display = "block";
			}
			realInput.oninput = function(){
				changer()
			};
			inputPlace.querySelector(".el-input-number__decrease").onclick = function(){
				changer()
			}
			inputPlace.querySelector(".el-input-number__increase").onclick = function(){
				changer()
			}
			rangeSetter.onclick = function(){
				rangeSetter.onclick = null;
				authAPIcall(
					`mutation{
						SaveMediaListEntry(
							mediaId: ${seriesID},
							progress: ${parseInt(realInput.value)}
						){id}
					}`,
					{},
					data => {
						if(!data){
							rangeSetter.innerText = svgAssets.cross;
							rangeSetter.classList.add("spinnerError");
							rangeSetter.title = "Setting activity range failed"
						}
						else{
							rangeSetter.innerText = svgAssets.check;
							rangeSetter.classList.add("spinnerDone")
						}
					}
				);
				rangeSetter.innerText = "…";
				rangeSetter.style.background = "none";
				rangeSetter.style.cursor = "unset"
			}
		}
	},1000)
}
