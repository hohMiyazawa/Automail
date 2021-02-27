if(useScripts.colourPicker && (!useScripts.mobileFriendly)){
	let colourStyle = create("style");
	colourStyle.id = "colour-picker-styles";
	colourStyle.type = "text/css";
	documentHead.appendChild(colourStyle);
	const basicStyles = `
.footer .links{
	margin-left: calc(0px + 1%);
	transform: translate(0px,10px);
}
.hohColourPicker .hohCheckbox{
	margin-left: 10px;
}
`;
	if(Array.isArray(useScripts.colourSettings)){//legacy styles
		let newObjectStyle = {};
		useScripts.colourSettings.forEach(
			colour => newObjectStyle[colour.colour] = {
				initial: colour.initial,
				dark: colour.dark,
				contrast: colour.contrast
			}
		);
		useScripts.colourSettings = newObjectStyle;
		useScripts.save()
	}
	let applyColourStyles = function(){
		colourStyle.textContent = basicStyles;//eh, fix later.
		Object.keys(useScripts.colourSettings).forEach(key => {
			let colour = useScripts.colourSettings[key];
			let hexToRgb = function(hex){
				let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? [
					parseInt(result[1],16),
					parseInt(result[2],16),
					parseInt(result[3],16)
				] : null;
			}
			if(colour.initial){
				colourStyle.textContent += `:root{${key}:${hexToRgb(colour.initial).join(",")};}`
			};
			if(colour.dark){
				colourStyle.textContent += `.site-theme-dark{${key}:${hexToRgb(colour.dark).join(",")};}`
			};
			if(colour.contrast){
				colourStyle.textContent += `.site-theme-contrast{${key}:${hexToRgb(colour.contrast).join(",")};}`
			}
		})
	};applyColourStyles();
	let colourPickerLocation = document.querySelector("#app > .wrap > .footer > .container");
	let adder = function(){
		if(colourPickerLocation){
			const supportedColours = [
				"--color-background",
				"--color-foreground",
				"--color-foreground-grey",
				"--color-foreground-grey-dark",
				"--color-foreground-blue",
				"--color-foreground-blue-dark",
				"--color-background-blue-dark",
				"--color-overlay",
				"--color-shadow",
				"--color-shadow-dark",
				"--color-text",
				"--color-text-light",
				"--color-text-lighter",
				"--color-text-bright",
				"--color-blue",
				"--color-blue-dim",
				"--color-white",
				"--color-black",
				"--color-red",
				"--color-peach",
				"--color-orange",
				"--color-yellow",
				"--color-green"
			];
			let colourChanger = function(){
				useScripts.colourSettings[cpSelector.value] = {
					"initial" :  (cpInitialBox.checked  ? cpInput.value : false),
					"dark" :     (cpDarkBox.checked     ? cpInput.value : false),
					"contrast" : (cpContrastBox.checked ? cpInput.value : false)
				}
				applyColourStyles();
				useScripts.save()
			};
			let cpContainer = create("div","hohColourPicker",false,colourPickerLocation);
			let cpTitle = create("h2",false,"Adjust Colours",cpContainer);
			let cpInput = create("input",false,false,cpContainer);
			cpInput.type = "color";
			let cpSelector = create("select",false,false,cpContainer);
			supportedColours.forEach(colour => {
				let option = create("option",false,colour,cpSelector);
				option.value = colour;
			});
			let cpDomain = create("p",false,false,cpContainer);
			let cpInitialBox = createCheckbox(cpDomain);
			create("span",false,"default",cpDomain);
			let cpDarkBox = createCheckbox(cpDomain);
			create("span",false,"dark",cpDomain);
			let cpContrastBox = createCheckbox(cpDomain);
			create("span",false,"contrast",cpDomain);
			let cpSelectorChanger = function(){
				if(useScripts.colourSettings[cpSelector.value]){
					cpInitialBox.checked  = !!useScripts.colourSettings[cpSelector.value].initial;
					cpDarkBox.checked     = !!useScripts.colourSettings[cpSelector.value].dark;
					cpContrastBox.checked = !!useScripts.colourSettings[cpSelector.value].contrast;
					cpInput.value = useScripts.colourSettings[cpSelector.value].initial
				}
				cpInitialBox.checked = false;
				cpDarkBox.checked = false;
				cpContrastBox.checked = false;
			};
			cpSelector.onchange = cpSelectorChanger;
			cpInput.onchange = colourChanger;
			cpInitialBox.onchange = colourChanger;
			cpDarkBox.onchange = colourChanger;
			cpContrastBox.onchange = colourChanger;
			cpSelectorChanger()
		}
		else{
			setTimeout(adder,1000)
		}
	};
	adder();
}

