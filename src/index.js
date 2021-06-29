import { loadFileStructureFromOptions } from "./helpers.js";
import { retrieveFileOptions, validate } from "./options.js";
import Parser from "./parser.js";

function getEventName(feature) {
    return feature.endsWith("s")
        ? feature.substring(0, feature.length - 1)
        : feature;
}

function convertVisibilityToLevel(visibility) {
    switch (visibility) {
        case "public":
            return 3;
        case "protected":
            return 2;
        case "private":
            return 1;
    }

    return 0;
}

function mergeItems(itemType, currentItem, newItem, ignoreLocations) {
    if (convertVisibilityToLevel(currentItem.visibility) < convertVisibilityToLevel(newItem.visibility)) {
        currentItem.visibility = newItem.visibility;
    }

    if (!currentItem.description && newItem.description) {
        currentItem.description = newItem.description;
    }

    if (!currentItem.type || currentItem.type.type === "any") {
        if (newItem.type && newItem.type.type !== "any") {
            currentItem.type = newItem.type;
        }
    }

    if (!currentItem.keywords && newItem.keywords) {
        currentItem.keywords = newItem.keywords;
    }

    if (!ignoreLocations) {
        if (newItem.locations && newItem.locations.length > 0) {
            if (currentItem.locations) {
                currentItem.locations.push(...newItem.locations);
            } else {
                currentItem.locations = [...newItem.locations];
            }
        }
    }

    if (itemType === "data") {
        if (newItem.bind && newItem.bind.length > 0) {
            if (currentItem.bind) {
                currentItem.bind.push(...newItem.bind);
            } else {
                currentItem.bind = [...newItem.bind];
            }
        }
    }

    return currentItem;
}

function subscribeOnParserEvents(parser, ignoredVisibilities, version, resolve, reject) {
    const component = {
        version,
    };

    parser.features.forEach((feature) => {
        switch (feature) {
            case "name":
            case "description":
                component[feature] = null;
                parser.on(feature, (value) => (component[feature] = value));
                break;

            case "keywords":
                component[feature] = [];
                parser.on(feature, (value) => (component[feature] = value));
                break;

            default: {
                component[feature] = [];

                const eventName = getEventName(feature);

                parser.on(eventName, (value) => {
                    const itemIndex = component[feature].findIndex((item) => item.name === value.name);

                    if (value.localName) {
                        const localItem = component[feature].find((item) => item.name === value.localName);

                        if (localItem) {
                            value = mergeItems(feature, value, localItem, true);
                        }
                    }

                    if (itemIndex < 0) {
                        component[feature].push(value);
                    } else {
                        const currentItem = component[feature][itemIndex];

                        component[feature][itemIndex] = mergeItems(feature, currentItem, value);
                    }
                });
            }
        }
    });

    parser.on("end", () => {
        parser.features.forEach((feature) => {
            if (component[feature] instanceof Array) {
                component[feature] = component[feature].filter((item) => !ignoredVisibilities.includes(item.visibility));
            }
        });

        resolve(component);
    });

    parser.on("failure", (error) => {
        reject(error);
    });
}

/**
 * Main parse function.
 * @param {SvelteParserOptions} options
 * @return {Promise<import("../typings").SvelteComponentDoc>}
 * @example
 * import { parse } from "@kwangure/svelteocs";
 *
 * const options = {
 *     filename: "./button.svelte",
 *     encoding: "ascii",
 *     features: ["data", "computed", "methods"],
 *     ignoredVisibilities: ["private"],
 *     includeSourceLocations: true,
 *     version: 3
 * };
 * const docs = await parse(options);
 *
 * console.log(docs);
 */
export default function parse(options) {
    return new Promise((resolve, reject) => {
        try {
            validate(options);

            const fileOptions = retrieveFileOptions(options);
            options.structure = loadFileStructureFromOptions(fileOptions);

            const parser = new Parser(options);
            const version = 3;

            subscribeOnParserEvents(parser, options.ignoredVisibilities, version, resolve, reject);

            parser.walk();
        } catch (error) {
            reject(error);
        }
    });
}
