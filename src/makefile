SHELL := /bin/bash
EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if $(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'. If you are unable to install it, there are complete builds of Automail at https://github.com/hohMiyazawa/Automail/releases")))

all: pre-build build build/automail.js build/firefox_addon.zip post-build

pre-build:
	rm -f build/userModules.js

build/automail.js: settings.js alias.js css/global.css conditionalStyles.js utilities.js purify.js graphql.js controller.js build/userModules.js HOWTO.js
	m4 --prefix-builtins automail.m4 > build/automail.js
	date +"%s" | sed 's_^_//Automail built at _' >> build/automail.js
	rm build/userModules.js

build/userModules.js: modules
	for module in modules/*; do\
	    echo "//begin $$module";\
	    cat "$$module";\
	    echo "//end $$module";\
	done > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/automail.js ../icons manifest.json
	$(info )
	$(info Creating Firefox addon)
	cd build && cp -r ../../icons/ icons/ && zip -r firefox_addon.zip automail.js icons/ ../manifest.json && rm -fr icons

post-build:
	$(info )
	$(info Automail build completed)
