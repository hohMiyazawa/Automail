FROM debian:latest

# FIXME: Requires novnc configuration
# FIXME: Get Firefox and chromium to test this

USER root

# Get core packages
RUN true "" \
	&& apt-get update \
	&& apt-get install -y debconf

# Get misc packages
RUN true "" \
	&& apt-get update \
	&& apt-get install -y \
		yarn \
		wget \
		npm \
		shellcheck \
		dlocate

# Add custom functions
RUN if ! grep -qF 'ix()' /etc/bash.bashrc; then printf '%s\n' \
	'# Custom' \
	"ix() { curl -F 'f:1=<-' ix.io 2>/dev/null ;}" \
	>> /etc/bash.bashrc; fi