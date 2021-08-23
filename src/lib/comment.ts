import type { Block } from "comment-parser/es6";

export interface Doc {
    description: string;
    tags: Array<{
        description: string;
        name: string,
        tag: string,
        type: string,
    }>
}

export function getDocs(comment: Block[]): Doc {
    const [{ description, tags, problems }] = comment;

    // TODO: Throw with location/stack-trace info
    if (problems.length > 0) {
        console.error(`Problem parsing documentation: ${problems[0]}`);
    }

    return {
        description,
        tags: tags.map((rawTag) => {
            const { problems, description, name, tag, type } = rawTag;

            // TODO: Throw with location/stack-trace info
            if (problems.length > 0) {
                console.error(`Problem parsing tag: ${problems[0]}.`);
            }

            return { description, name, tag, type };
        }),
    };
}
