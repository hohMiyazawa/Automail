# not yet complete!
# is not able to build a valid version of Boneless yet!

EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if $(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'. If you are unable to install it, there are complete builds of Automail at https://github.com/hohMiyazawa/Automail/releases")))

all: pre-build build/boneless.js

pre-build:
	make makefile
	rm build/boneless.js

build/boneless.js:
	cp build/automail.js build/boneless.js
	sed -i 's/http:\/\/tampermonkey.net\//Boneless/' build/boneless.js
	sed -i 's/2751 = automail, //' build/boneless.js
	sed -i 's/client_id=2751/client_id=1933/' build/boneless.js
	sed -i 's/370473-automail/411621-boneless/' build/boneless.js
	sed -i 's/https:\/\/github\.com\/hohMiyazawa\/Automail//' build/boneless.js
	sed -i 's/https:\/\/addons\.mozilla\.org\/en-US\/firefox\/addon\/automail\//NO KNOWN BUILDS/' build/boneless.js
	sed -i 's/Automail/Boneless/g' build/boneless.js
	sed -i 's/automail/boneless/g' build/boneless.js
