import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginFilters from "./_config/filters.js";
import { SVG } from "./_config/svg.js";
import { cacheBuster } from "./_config/cache-buster.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	eleventyConfig
		.addPassthroughCopy({
			"public": "/",
			"src/img": "img",
			"src/js": "js",
			"src/video": "video",
		});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("src/scss/**/*.scss");
	eleventyConfig.addWatchTarget("src/js/**/*.js");
	eleventyConfig.addWatchTarget("src/img/**/*");

	// Plugins
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginFilters);
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
	eleventyConfig.addPlugin(syntaxHighlight);
	eleventyConfig.addPlugin(cacheBuster);

	eleventyConfig.addFilter("sitemapExclude", function (collection) {
		return collection.filter(item => item.data.sitemap !== false);
	});

	eleventyConfig.addFilter("stringify", function (value) {
		return JSON.stringify(value);
	});

	eleventyConfig.addShortcode("svg", function (svg) {
		if (!svg) return "";
		if (!SVG[svg.toUpperCase()]) return "";

		return `<div class="svg svg-${svg.toLowerCase()}">${SVG[svg.toUpperCase()]}</div>`;
	});
};

export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: [
		"md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
	],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "content",          // default: "."
		includes: "../_includes",  // default: "_includes" (`input` relative)
		layouts: "../_includes/layouts",    // default: "_layouts" (`input` relative)
		data: "../_data",          // default: "_data" (`input` relative)
		output: "_site"
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
