all: build build/automail.js build/firefox_addon.zip

build/automail.js: build/header.js settings.js alias.js build/styles.css utilities.js purify.js graphql.js controller.js build/userModules.js
	cat build/header.js settings.js alias.js build/styles.css utilities.js purify.js graphql.js controller.js build/userModules.js > build/automail.js
	date +"%s" | sed 's_^_//Automail built at _' >> build/automail.js
	rm build/header.js build/styles.css build/userModules.js

build/header.js: userscriptBoilerplate.js scriptInfo.js licenseInfo.js
	cat userscriptBoilerplate.js scriptInfo.js licenseInfo.js > build/header.js

build/styles.css: css/globalCSS_wrapper_start.js css/global.css css/globalCSS_wrapper_end.js conditionalStyles.js
	cat css/globalCSS_wrapper_start.js css/global.css css/globalCSS_wrapper_end.js conditionalStyles.js > build/styles.css

build/userModules.js: modules
	cat modules/* HOWTO.js > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/automail.js ../icons ../manifest.json
	cd build && cp -r ../../icons/ icons/ && zip -r firefox_addon.zip automail.js icons/ ../../manifest.json && rm -fr icons
