import path from "path";
import chai from "chai";
import parse from "../../../src/index.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { expect } = chai;

describe("SvelteDoc v3 - Basic", () => {
    it("If name is not provided for component, name should be read from file name", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./basic.name.svelte"),
            features: ["name"],
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.name, "Document should have proper name").to.equal("BasicName");

            done();
        }).catch(e => {
            done(e);
        });
    });

    it("should read name from options-tag when compiling as a custom element", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./basic.name.wc.svelte"),
            features: ["name"],
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.name, "Document should have proper name").to.equal("tag-name");

            done();
        }).catch(e => {
            done(e);
        });
    });
});
