# FIXME-CD: Make a new release based on the content of these variables
NAME = Autopod
DESCRIPTION = Various utilities for gitpod's website made while kreyren is waiting for code review/brainstorm due to his impatience and laziness to write a code from scratch.. So he took the code from Hoh
VERSION = 1
PATCHLEVEL = 0
SUBLEVEL = 0

# Dependency check
EXECUTABLES = sed rm mkdir date zip m4 cp cat
K := $(foreach exec,$(EXECUTABLES),\
	$(if \
		$(shell which $(exec)),some string,$(error "Could not find the dependency '$(exec)'")\
	)\
)

all:
	$(info The 'make' is configured to not work without arguments in $(NAME) project)
	@ exit 2

# FIXME-QA: Sanitize
build: build-firefox-extension
	$(info Building autopod targets.. )
	@ mkdir build || true 
	@ m4 --prefix-builtins src/autopod.m4 > build/automail.js
	@ date +"%s" | sed 's_^_//Automail built at _' >> build/automail.js
	@ rm build/userModules.js
	$(info Autopod has been sucessfully built)

build-firefox-extension:
	$(info Creating Firefox addon)
	@ cp -r icons/ build/icons
	@ zip -r $(NAME)_firefox_extension_$(VERSION).$(PATCHLEVEL).$(SUBLEVEL).zip autopod.js icons/ src/manifest.json
	@ mv $(NAME)_firefox_extension_$(VERSION).$(PATCHLEVEL).$(SUBLEVEL).zip $(NAME)_firefox_extension_$(VERSION).$(PATCHLEVEL).$(SUBLEVEL).xpi

clean:
	@ rm -r build || true
	$(info Build target has been cleared successfully)