export function getDocs(comment) {
    const [{ description, tags, problems }] = comment;

    // TODO: Throw with location/stack-trace info
    if (problems.length > 0) {
        console.error(`Problem parsing documentation: ${problems[0]}`);
    }

    return {
        description,
        tags: tags.map((tag) => {
            const { problems, description, name } = tag;

            // TODO: Throw with location/stack-trace info
            if (problems.length > 0) {
                console.error(`Problem parsing tag: ${problems[0]}.`);
            }

            return { description, name };
        }),
    };
}
