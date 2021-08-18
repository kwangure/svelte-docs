export function error(details) {
    const { code, message } = details;
    const error = new Error(message);
    error.code = code;
    throw error;
}

export function getName(name, filename) {
    if (name) return name;

    if (filename) {
        return filename.substring(
            filename.lastIndexOf("/") + 1,
            filename.lastIndexOf(".")
        );
    }

    return "";
}
