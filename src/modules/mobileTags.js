exportModule({
	id: "CSSmobileTags",
	description: "$setting_CSSmobileTags",
	isDefault: true,
	importance: 0,
	categories: ["Media"],
	visible: true,
	css: `
@media(max-width: 760px){
	.media .sidebar .tags{
		display: inline;
	}
	.media .sidebar .tags .tag{
		display: inline-block;
		margin-right: 2px;
	}
	.media .sidebar .tags .tag .rank{
		display: inline;
	}
	.media .sidebar .tags .tag .vote-dropdown .el-dropdown-link{
		display: inline;
	}
	.media .sidebar .tags .add-icon{
		opacity: 1;
	}
	.media-page-unscoped .review.button{
		display: inline-block;
		width: 48%;
	}
	.media-page-unscoped .sidebar + .overview{
		margin-top: 20px;
	}
}`
})
