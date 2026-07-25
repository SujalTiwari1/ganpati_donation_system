import {z} from "zod"
export const createNameSchema = (
    field: string,
    min: number,
    max: number
) =>
        z.string()
        .trim()
        .min(min, `${field} must be at least ${min} characters.`)
        .max(max, `${field} cannot exceed ${max} characters.`);