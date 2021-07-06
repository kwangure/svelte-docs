export function getDocs(comment) {
    const [{ description, tags, problems }] = comment;

    if (problems.length > 0) {
        console.error(`Problem parsing documentation: ${problems[0]}`);
    }

    return {
        description,
        tags: tags.map((tag) => {
            // TODO: Ignore optional prop in tag
            const { problems, source: _, ...rest } = tag;

            if (problems.length > 0) {
                console.error(`Problem parsing tag: ${problems[0]}.`);
            }

            return rest;
        }),
    };
}
