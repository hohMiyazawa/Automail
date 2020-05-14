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

build: build-userstyle build-firefox-extension

# FIXME-QA: Sanitize
build-userstyle:
	$(info Building autopod targets )
	@ mkdir build || true 
	$(info Generating javascript file )
	@ m4 --prefix-builtins src/autopod.m4 > build/autopod.js
	$(info Appending time built )
	@ date +"%s" | sed 's_^_//Autopod built at _' >> build/autopod.js
	$(info Autopod's userstyle has been sucessfully built)

build-firefox-extension:
	$(info Creating Firefox extension)
	@ cp -r icons/ build/icons
	$(info Packaging Firefox extension)
	@ rm Autopod_firefox_extension* || true
	@ cp src/manifest.json build/
	@ cd build && zip -r ../$(NAME)_firefox_extension_$(VERSION).$(PATCHLEVEL).$(SUBLEVEL).zip .
	$(info Firefox extension has been successfully packaged in the root of the repository)

# FIXME-QA: Sanitize the Autopod_firefox_Extension removal
clean:
	@ rm -r build || true
	@ rm Autopod_firefox_extension* || true
	$(info Build target has been cleared successfully)