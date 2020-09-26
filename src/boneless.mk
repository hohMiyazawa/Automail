EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if $(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'. If you are unable to install it, there are complete builds of Automail at https://github.com/hohMiyazawa/Automail/releases")))

all: pre-build boneless_build boneless_build/build/automail.js post-build

pre-build:
	rm -rf boneless_build
	mkdir boneless_build
