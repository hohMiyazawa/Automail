exportModule({
	id: "CSSoldDarkTheme",
	description: "Use the old dark theme colours",
	isDefault: false,
	categories: [],
	visible: true,
	css: `
.site-theme-dark{
	--color-background:39,44,56;
	--color-foreground:31,35,45;
	--color-foreground-grey:25,29,38;
	--color-foreground-grey-dark:16,20,25;
	--color-foreground-blue:25,29,38;
	--color-foreground-blue-dark:19,23,29;
	--color-background-blue-dark:31,35,45;
	--color-overlay:34,28,22;
	--color-shadow:49,54,68;
	--color-shadow-dark:6,13,34;
	--color-shadow-blue:103,132,187;
	--color-text:159,173,189;
	--color-text-light:129,140,153;
	--color-text-lighter:133,150,165;
	--color-text-bright:237,241,245;
}
.site-theme-dark .nav-unscoped.transparent{
	background: rgba(31, 38, 49, .5);
	color: rgb(var(--color-text));
}

.site-theme-dark .nav-unscoped,
.site-theme-dark .nav-unscoped.transparent:hover{
	background: rgb(var(--color-foreground));
}`
})
