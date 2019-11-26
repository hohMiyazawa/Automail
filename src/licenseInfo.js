/*
	A collection of enhancements for Anilist.co
*/
/*
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	<https://www.gnu.org/licenses/>.
*/
/*
"useScripts" contains the defaults for the various modules. This is stored in the user's localStorage.
Many of the modules are closely tied to the Anilist API
Other than that, some data loaded from MyAnimelist is the only external resource

Optionally, a user may give the script privileges through the Anilist grant system, enabling some additional modules
*/

/* GENERAL STRUCTURE:
 1. Settings
 2. CSS
 3. tools and helper functions
 4. The modules, as individual callable functions
 5. The URL matcher, for making the modules run at the right sites
 6. Module descriptions
*/

