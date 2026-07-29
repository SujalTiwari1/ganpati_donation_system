declare module 'to-words' {
  export interface ToWordsOptions {
    localeCode?: string;
    converterOptions?: {
      currency?: boolean;
      ignoreDecimal?: boolean;
      ignoreZeroCurrency?: boolean;
      doNotAddOnly?: boolean;
    };
  }

  export class ToWords {
    constructor(options?: ToWordsOptions);
    convert(value: number): string;
  }
}
