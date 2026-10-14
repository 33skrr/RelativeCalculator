declare module 'relationship.js' {
  interface Options {
    text: string;
    sex: 0 | 1;
    reverse?: boolean;
    type?: 'default' | 'chain';
  }
  export default function relationship(options: Options): string[];
}
