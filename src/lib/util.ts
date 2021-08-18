interface CodedError extends Error {
    code?: number;
}

export function error(details) {
    const { code, message } = details;
    const error: CodedError = new Error(message);
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

export function capitalize(str) {
    if (typeof str != 'string') {
      throw Error('just-capitalize expects a string argument');
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

