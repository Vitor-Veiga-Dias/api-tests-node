export function stringify (value: object): string {
    return JSON.stringify(value);
}

export function jsonParser (value: string): any {
    JSON.parse(value);
}