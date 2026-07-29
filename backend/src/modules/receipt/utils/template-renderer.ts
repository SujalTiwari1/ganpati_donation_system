import fs from "node:fs/promises";

export const renderTemplate = async <
    T extends Record<string, unknown>
>(
    templatePath: string,
    values: T
): Promise<string> => {

    let html = await fs.readFile(
        templatePath,
        "utf-8"
    );

    for (const [key, value] of Object.entries(values)) {

        html = html.replaceAll(
            `{{${key}}}`,
            value?.toString() ?? ""
        );

    }

    return html;
};