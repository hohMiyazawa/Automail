if(useScripts.dropdownOnHover && whoAmI){
	let addMouseover = function(){
		let navThingy = document.querySelector(".nav .user .el-dropdown-link");
		if(navThingy){
			navThingy.onmouseover = function(){
				let controls = document.getElementById(navThingy.attributes["aria-controls"].value);
				if(!controls || controls.style.display === "none"){
					navThingy.click()
				}
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover();
}
