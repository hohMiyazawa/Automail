# Automail
Extra parts for anilist.co

When installed, a list of options in https://anilist.co/settings/apps can be used to configure the behaviour of the website

Automail primarily deals with:
- Notifications
- Statistics
- Styling
- Navigation

## Available releases

As a userscript: https://greasyfork.org/en/scripts/370473-automail  
As a Firefox addon: https://addons.mozilla.org/en-US/firefox/addon/automail/

Which one should you use? The userscript is rolling release, so you get new features immediately. There might be some bugs here and there, as they haven't been tested much. The Firefox addon is updated every couple of months. It's intended to be more stable, and tries to meet the minimum security standards of Mozilla. It is however often slightly outdated.

## Build from source

"src/" contains a makefile, run "make" there.
Requires make, m4 and basic shell utilities

Will build the userscript and the Firefox addon in src/build/

If you have an archived version of this repo, updated code can be found at
https://github.com/hohMiyazawa/Automail

## Copyright

Copyright (C) 2019-2021 hoh and the Automail contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
