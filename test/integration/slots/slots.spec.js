import chai from "chai";
import parse from "../../../src/index.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import path from "path";
import { readFileSync } from "fs";

const packageJSONPath = path.resolve(__dirname, "../../../package.json");
const packageConfig = JSON
    .parse(readFileSync(packageJSONPath, { encoding: "utf-8" }));
const { expect } = chai;

describe("SvelteDoc v3 - Slots", () => {
    it("Default slot should be found", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./slot.default.svelte"),
            features: ["slots"],
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.slots, "Document slots should be parsed").to.exist;

            expect(doc.slots.length).to.equal(1);
            const slot = doc.slots[0];

            expect(slot, "Slot should be a valid entity").to.exist;
            expect(slot.name).to.equal("default");
            expect(slot.visibility).to.equal("public");

            done();
        }).catch(e => {
            done(e);
        });
    });

    it("Slot parameters should be exposed", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./slot.parameters.svelte"),
            features: ["slots"],
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.slots, "Document slots should be parsed").to.exist;

            expect(doc.slots.length).to.equal(1);
            const slot = doc.slots[0];

            expect(slot, "Slot should be a valid entity").to.exist;
            expect(slot.name).to.equal("item");
            expect(slot.visibility).to.equal("public");

            const parameters = slot.params;

            expect(parameters).to.exist;
            expect(parameters.length).to.equal(1);

            const parameter = parameters[0];

            expect(parameter).to.exist;
            expect(parameter.name).to.equal("item");
            expect(parameter.description).to.equal("The slot parameter description.");
            expect(parameter.type).to.deep.eq({
                kind: "type",
                type: "string",
                text: "string"
            });

            // TODO: 5.* | Backward compatibility test
            if (packageConfig.version.startsWith("5.")) {
                expect(slot.parameters, "parameters field should be removed").undefined;
            } else {
                expect(slot.parameters, "Should be backward compatable until 5.* version").to.deep.eq(slot.params);
            }

            done();
        }).catch(e => {
            done(e);
        });
    });

    it("Named slots should be found", (done) => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./slot.named.svelte"),
            features: ["slots"],
            ignoredVisibilities: []
        }).then((doc) => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.slots, "Document slots should be parsed").to.exist;

            expect(doc.slots.length).to.equal(2);

            expect(doc.slots[0], "Slot should be a valid entity").to.exist;
            expect(doc.slots[0].name).to.equal("title");
            expect(doc.slots[0].visibility).to.equal("public");

            expect(doc.slots[1], "Slot should be a valid entity").to.exist;
            expect(doc.slots[1].name).to.equal("body");
            expect(doc.slots[1].visibility).to.equal("public");

            done();
        }).catch(e => {
            done(e);
        });
    });

    it("Slot comments should be correctly parsed", done => {
        parse({
            version: 3,
            filename: path.resolve(__dirname, "./slot.comments.svelte"),
            features: ["slots", "events"],
            ignoredVisibilities: []
        }).then(doc => {
            expect(doc, "Document should be provided").to.exist;
            expect(doc.slots, "Document slots should be parsed").to.exist;

            expect(doc.slots).to.have.length(3);

            const firstSlot = doc.slots.find(slot => slot.name === "first");
            const defaultSlot = doc.slots.find(slot => slot.name === "default");
            const secondSlot = doc.slots.find(slot => slot.name === "second");

            expect(firstSlot.description).to.equal("The first slot description.");
            expect(defaultSlot.description).to.empty;
            expect(secondSlot.description).to.equal("The second slot description.");

            expect(doc.events).to.have.length(1);

            const event = doc.events[0];

            expect(event.description).to.be.empty;

            done();
        }).catch(e => {
            done(e);
        });
    });
});
