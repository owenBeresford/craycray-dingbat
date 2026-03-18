
export interface UItext {
  get(key: string): string;
  getTemplate(key: string): Array<string>;
  lang: string;
}
