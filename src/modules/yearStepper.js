exportModule({
	id: "yearStepper",
	description: "$yearStepper_description",
	isDefault: true,
	importance: 0,
	categories: ["Lists"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/\/user\/.*\/(anime|manga)list/)
	},
	code: function(){
		let yearStepper = function(){
			if(!location.pathname.match(/\/user\/.*\/(anime|manga)list/)){
				return
			}
			let slider = document.querySelector(".el-slider");
			if(!slider){
				setTimeout(yearStepper,200);
				return
			}
			const maxYear = parseInt(slider.getAttribute("aria-valuemax"));
			const minYear = parseInt(slider.getAttribute("aria-valuemin"));
			const yearRange = maxYear - minYear;
			let clickSlider = function(year){//thanks, mator!
				let runway = slider.children[0];
				let r = runway.getBoundingClientRect();
				const x = r.left + r.width * ((year - minYear) / yearRange);
				const y = r.top + r.height / 2;
				runway.dispatchEvent(new MouseEvent("click",{
					clientX: x,
					clientY: y
				}))
			};
			let adjuster = function(delta){
				let heading = slider.previousElementSibling;
				if(heading.children.length === 0){
					if(delta === -1){
						clickSlider(maxYear)
					}
					else{
						clickSlider(minYear + 1)
					}
				}
				else{
					let current = parseInt(heading.children[0].innerText);
					clickSlider(current + delta)
				}
			};
			if(document.querySelector(".hohStepper")){
				return
			}
			slider.style.position = "relative";
			let decButton = create("span",["hohStepper","noselect"],"<",slider,"left:-27px;font-size:200%;top:0px;");
			let incButton = create("span",["hohStepper","noselect"],">",slider,"right:-27px;font-size:200%;top:0px;");
			decButton.onclick = function(){
				adjuster(-1)
			};
			incButton.onclick = function(){
				adjuster(1)
			}
		};yearStepper()
	},
	css: `
.hohStepper{
	cursor: pointer;
	position: absolute;
	opacity: 0.5;
}
.el-slider:hover .hohStepper{
	opacity: 1;
}`
})
