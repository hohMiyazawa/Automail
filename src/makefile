SHELL := /bin/bash
EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if $(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'. If you are unable to install it, there are complete builds of Automail at https://github.com/hohMiyazawa/Automail/releases or https://greasyfork.org/en/scripts/370473-automail")))

all: pre-build build build/automail.user.js build/firefox_addon.zip post-build

pre-build:
	rm -f build/userModules.js

build/automail.user.js: automail.m4 settings.js alias.js css/global.css conditionalStyles.js utilities.js purify.js graphql.js localisation.js controller.js build/userModules.js HOWTO.js
	m4 --prefix-builtins automail.m4 > build/automail.user.js
	date +"%s" | sed 's_^_//Automail built at _' >> build/automail.user.js

# build/boneless.js: boneless.m4 settings.js alias.js css/global.css conditionalStyles.js utilities.js purify.js graphql.js localisation.js controller.js build/userModules.js HOWTO.js
#	m4 --prefix-builtins boneless.m4 > build/boneless.js
#	sed -i 's/Automail/Boneless/' build/boneless.js
#	sed -i 's/automail/boneless/' build/boneless.js
#	date +"%s" | sed 's_^_//Boneless built at _' >> build/boneless.js

build/userModules.js: modules
	for module in modules/*; do\
	    echo "//begin $$module";\
	    cat "$$module";\
	    echo "//end $$module";\
	done > build/userModules.js

build:
	mkdir build

build/firefox_addon.zip: build/automail.user.js ../icons manifest.json
	$(info )
	$(info Creating Firefox addon)
	cd build && cp -rp ../../icons/ icons/ && cp -p ../manifest.json . && cp -p automail.user.js automail.js && \
	zip -FS firefox_addon.zip -r automail.js icons/ manifest.json && rm -fr icons manifest.json automail.js

post-build:
	$(info )
	$(info Automail build completed)
	$(info The compiled script is in /src/build/)
