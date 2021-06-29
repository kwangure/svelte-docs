import path from "path";
import chai from "chai";
import parse from "../../../src/index.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { expect } = chai;

describe("SvelteDoc v3 - Global component", () => {
    it("Global component data should be parsed with HTML comment", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./globalComment.markup.svelte"),
            features: ["description", "keywords"],
            includeSourceLocations: true,
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.description, "Document description should be parsed").to.exist;
            expect(doc.keywords, "Document keywords should be parsed").to.exist;

            expect(doc.description, "Document description text").to.equal("The component description");
            expect(doc.keywords, "Document keywords length").to.have.length(2);
            expect(doc.keywords, "Document keywords content").to.eql([
                { name: "component", description: "ComponentName" },
                { name: "example", description: "<ComponentName identifier={identifier} />" }
            ]);
            done();
        }).catch(done);
    });

    it("Global component data should be parsed with JS comment", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./globalComment.script.svelte"),
            features: ["description", "keywords"],
            includeSourceLocations: true,
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.description, "Document description should be parsed").to.exist;
            expect(doc.keywords, "Document keywords should be parsed").to.exist;

            expect(doc.description, "Document description text").to.equal("The component description");
            expect(doc.keywords, "Document keywords length").to.have.length(2);
            expect(doc.keywords, "Document keywords content").to.eql([
                { name: "component", description: "ComponentName" },
                { name: "example", description: "<ComponentName identifier={identifier} />" }
            ]);
            done();
        }).catch(done);
    });

    it("Global component data should NOT be parsed when not top level", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./globalComment.nested.svelte"),
            features: ["description", "keywords"],
            includeSourceLocations: true,
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document").to.exist;
            expect(doc.description, "Document description").to.not.exist;
            expect(doc.keywords, "Document keywords").to.be.empty;

            done();
        }).catch(done);
    });

    it("Global component data should NOT be parsed when no comment exist", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./globalComment.noComment.svelte"),
            features: ["description", "keywords"],
            includeSourceLocations: true,
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document").to.exist;
            expect(doc.description, "Document description").to.not.exist;
            expect(doc.keywords, "Document keywords").to.be.empty;

            done();
        }).catch(done);
    });
});
