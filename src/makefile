all: build build/automail.js build/firefox_addon.zip

build/automail.js: build/header.js settings.js alias.js build/styles.css utilities.js graphql.js build/modules.js controller.js build/userModules.js
	cat build/header.js settings.js alias.js build/styles.css utilities.js graphql.js build/modules.js controller.js build/userModules.js > build/automail.js
	rm build/header.js build/styles.css build/modules.js build/userModules.js

build/header.js: userscriptBoilerplate.js scriptInfo.js licenseInfo.js
	cat userscriptBoilerplate.js scriptInfo.js licenseInfo.js > build/header.js

build/styles.css: css/globalCSS_wrapper_start.js css/global.css css/globalCSS_wrapper_end.js conditionalStyles.js
	cat css/globalCSS_wrapper_start.js css/global.css css/globalCSS_wrapper_end.js conditionalStyles.js > build/styles.css

build/modules.js: modules.js
	cp modules.js build/modules.js

build/userModules.js: modules
	cat modules/* HOWTO.js > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/automail.js ../icons ../manifest.json
	zip build/firefox_addon.zip build/automail.js ../icons ../manifest.json
