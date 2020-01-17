all: build build/automail.js build/firefox_addon.zip

build/automail.js: settings.js alias.js css/global.css conditionalStyles.js utilities.js purify.js graphql.js controller.js build/userModules.js
	m4 --prefix-builtins automail.m4 > build/automail.js
	date +"%s" | sed 's_^_//Automail built at _' >> build/automail.js
	rm build/userModules.js

build/userModules.js: modules
	cat modules/* HOWTO.js > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/automail.js ../icons ../manifest.json
	cd build && cp -r ../../icons/ icons/ && zip -r firefox_addon.zip automail.js icons/ ../../manifest.json && rm -fr icons
