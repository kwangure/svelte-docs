interface CodedError extends Error {
    code?: string;
}

export interface Details {
    code: string;
    message: string;
}

export function error(details: Details): never {
    const { code, message } = details;
    const error: CodedError = new Error(message);
    error.code = code;
    throw error;
}

export function getName(name:string, filename: string): string {
    if (name) return name;

    if (filename) {
        return filename.substring(
            filename.lastIndexOf("/") + 1,
            filename.lastIndexOf("."),
        );
    }

    return "";
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function findReverse<T>(
    array: Array<T>,
    predicate: (value: T) => boolean,
): T {
    for (let i = array.length -1; i >= 0; i--) {
        if (predicate(array[i])) return array[i];
    }
}

