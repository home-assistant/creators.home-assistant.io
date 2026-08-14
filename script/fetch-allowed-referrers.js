// Downloads the referrer allow list once per build (see `prebuild`/`prestart`) so
// templates can read it as Eleventy global data instead of fetching per page.
//
// Visitors arriving from their own Home Assistant instance send that private URL as
// the HTTP referrer, so anything not on this list is replaced before Plausible ever
// records it. See _includes/partials/plausible.njk.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SOURCE_URL = "https://www.openhomefoundation.org/allowed-referrers.json";
const OUTPUT = fileURLToPath(
	new URL("../_data/allowed_referrers.json", import.meta.url)
);

async function fetchReferrers() {
	const response = await fetch(SOURCE_URL, {
		headers: { "User-Agent": "creators.home-assistant.io-build" },
	});

	if (!response.ok) {
		throw new Error(`${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	if (
		!Array.isArray(data) ||
		!data.every((entry) => typeof entry === "string")
	) {
		throw new Error("payload is not an array of strings");
	}

	return data
		.map((entry) => entry.trim().toLowerCase().replace(/\.$/, ""))
		.filter((entry) => entry.length > 0);
}

// A failed fetch must never break the build, so fall back to whatever is already on
// disk. With no file at all we write an empty list: every referrer then gets
// replaced, which loses referrer reporting but never leaks a private URL.
async function keepExistingFile() {
	try {
		await readFile(OUTPUT);
		console.warn("[allowed-referrers] keeping the existing data file");
	} catch {
		await writeFile(OUTPUT, "[]\n");
		console.warn("[allowed-referrers] no data file found, wrote an empty list");
	}
}

async function main() {
	try {
		const referrers = await fetchReferrers();
		await writeFile(OUTPUT, JSON.stringify(referrers, null, 2) + "\n");
		console.log(`[allowed-referrers] wrote ${referrers.length} domains`);
	} catch (error) {
		console.warn(`[allowed-referrers] fetch failed. ${error}`);
		await keepExistingFile();
	}
}

main();
