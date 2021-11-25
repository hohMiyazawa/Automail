Q: How do I add a translation?

A: You create a file named "yourlanguage.json" in this directory. Copy one of the existing translations to get the right structure. (or see "JSON field details.txt")
To get it added to Automail I prefer pull requests (https://github.com/hohMiyazawa/Automail/), but just sending me a translation file is fine.

Q: How do I activate my translation in the Automail code?

A: I will happily do this for you, but if you want to do this yourself, you must add an entry near the top of the file in "/src/localisation.js", and a settings option near the bottom of "/src/data/legacyModuleDescriptions.json".


Q: What tools do I need?

A: Just a simple text editor, that is, something without formatting. (think notepad)


Q: Do I have to translate all the keys?

A: No. Any key you leave out will have the default English text, or text from one of the fallback languages.


Q: How can I find out what keys I'm missing?

A: There's a tool called "diff_tool.html" in this directory, which you can open in your browser to compare translation files.


Q: How do fallback languages work?

A: If your translation file is missing a key, the script will go through the languages listed in the "fallback" field in order.
If one of those translations has the key, it will use that. If none of those have it, it will use the default English text.
Fallbacks are useful if an existing translation is close to your language.


Q: Do I have to be a native speaker?

A: You do not.


Q: What can I do if I only know English?

A: You can proofread the English language file ("/src/data/English.json), as I'm not a native speaker and likely made many mistakes.


Q: <x> is not a real language! It's a dialect/version of <y>!

A: That's not a problem. It's up to the individual translators if making the translation is worth their time.
