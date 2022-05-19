// SPDX-FileCopyrightText: 2021 Reina
// SPDX-License-Identifier: MIT
/*
Copyright (c) 2021 Reina

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//updated code here: https://github.com/Reinachan/AniList-High-Contrast-Dark-Theme
exportModule({
	id: "hollowHearts",
	description: "Make unliked hearts hollow [by Reina]",
	isDefault: true,
	importance: 0,
	categories: ["Feeds"],
	visible: true,
	css: `
/* Like heart */
.action.likes .button,
.like-wrap.thread_comment .button{
	color: rgb(var(--color-blue-dim));
}
.action.likes .button:hover,
.like-wrap.thread_comment .button:hover{
	color: rgb(var(--color-blue));
}
.action.likes .button .fa-heart,
.like-wrap.thread_comment .button .fa-heart{
	color: #0000;
	stroke: rgb(var(--color-blue-dim));
	stroke-width: 70;
	stroke-alignment: inner;
	font-size: 0.870em;
	padding-bottom: 0.08em;
	padding-top: 0.05em;
}
.action.likes .button .fa-heart:hover,
.like-wrap.thread_comment .button .fa-heart:hover{
	stroke: rgb(var(--color-blue));
}
.action.likes .button.liked,
.like-wrap.thread_comment .button.liked{
	color: rgb(var(--color-red));
}
.action.likes .button.liked:hover,
.like-wrap.thread_comment .button.liked:hover{
	color: rgb(var(--color-blue-dim));
}
.action.likes .button.liked:hover .fa-heart,
.like-wrap.thread_comment .button.liked:hover .fa-heart{
	color: rgb(var(--color-blue-dim));
}
.action.likes .button.liked .fa-heart,
.like-wrap.thread_comment .button.liked .fa-heart{
	color: var(--color-red);
	stroke: rgba(0, 0, 0, 0);
	stroke-width: 0;
	font-size: 0.875em;
	padding-bottom: 0;
	padding-top: 0;
}
.action.likes .button.liked .fa-heart:hover,
.like-wrap.thread_comment .button.liked .fa-heart:hover{
	color: rgb(var(--color-blue-dim));
}
/* forum thread, favourite like heart */
.like-wrap.thread .button .fa-heart,
.actions .favourite .fa-heart{
	color: #0000;
	stroke: rgb(var(--color-white));
	stroke-width: 70;
}
.like-wrap.thread .button.liked .fa-heart,
.actions .favourite.liked .fa-heart,
.like-wrap.thread .button.isFavourite .fa-heart,
.actions .favourite.isFavourite .fa-heart{
	color: rgb(var(--color-white)) !important;
	stroke: rgba(0, 0, 0, 0) !important;
}
`
})
