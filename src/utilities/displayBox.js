function createDisplayBox(cssProperties){
	let displayBox = create("div","hohDisplayBox",false,document.querySelector("#app"),cssProperties);
	let mousePosition;
	let offset = [0,0];
	let isDown = false;
	let isDownResize = false;
	let displayBoxClose = create("span","hohDisplayBoxClose",svgAssets.cross,displayBox);
	displayBoxClose.onclick = function(){
		displayBox.remove();
	};
	let resizePearl = create("span","hohResizePearl",false,displayBox);
	displayBox.addEventListener("mousedown",function(e){
		isDown = true;
		offset = [
			displayBox.offsetLeft - e.clientX,
			displayBox.offsetTop - e.clientY
		];
	},true);
	resizePearl.addEventListener("mousedown",function(e){
		event.stopPropagation();
		event.preventDefault();
		isDownResize = true;
		offset = [
			displayBox.offsetLeft,
			displayBox.offsetTop
		];
	},true);
	document.addEventListener("mouseup",function(){
		isDown = false;
		isDownResize = false;
	},true);
	document.addEventListener("mousemove",function(event){
		event.preventDefault();
		if(isDownResize){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.width = (mousePosition.x - offset[0]) + "px";
			displayBox.style.height = (mousePosition.y - offset[1]) + "px";
			return;
		}
		if(isDown){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.left = (mousePosition.x + offset[0]) + "px";
			displayBox.style.top  = (mousePosition.y + offset[1]) + "px";
		}
	},true);
	let innerSpace = create("div","scrollableContent",false,displayBox);
	return innerSpace;
}
