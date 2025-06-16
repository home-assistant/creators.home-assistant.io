import { resolve } from "path";
import { statSync, existsSync } from "fs";

export function cacheBuster(eleventyConfig) {
    eleventyConfig.addTransform("cache-buster", function (content, outputPath) {
        const cssInputDir = resolve(eleventyConfig.dir.input, "css");
        const jsInputDir = resolve(eleventyConfig.dir.input, "js");
        const cssOutputDir = resolve(eleventyConfig.dir.output, "css");
        const jsOutputDir = resolve(eleventyConfig.dir.output, "js");
        if (outputPath.endsWith(".html")) {
            return content.replace(
                /(["'])\/(css|js)\/([\w\-./]+\.(?:css|js))/g,
                function (_, quote, type, matcher) {
                    const filepath = matcher.split("?")[0];
                    let timestamp;
                    let inputDir, outputDir;
                    if (type === "css") {
                        inputDir = cssInputDir;
                        outputDir = cssOutputDir;
                    } else {
                        inputDir = jsInputDir;
                        outputDir = jsOutputDir;
                    }
                    if (existsSync(resolve(inputDir, filepath))) {
                        timestamp = statSync(resolve(inputDir, filepath)).mtime.getTime();
                    } else if (existsSync(resolve(outputDir, filepath))) {
                        timestamp = statSync(resolve(outputDir, filepath)).mtime.getTime();
                    } else {
                        throw new Error(`File not found: /${type}/${filepath}`);
                    }
                    return `${quote}/${type}/${filepath}?v=${timestamp}`;
                }
            );
        }
        return content;
    });
};