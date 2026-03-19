// The small number of URLs and components that use them. 
const URLs: Record<string, string> = {
  aList: "/list/[1]",
  allList: "/list-all",
  install: "/install",
};

/**
 * mapURL
 * Function to generate URN for App, mapping any replacement values.
 * My requirements are better met by the code I wrote here.
// optional TODO: This would be more elegant with a variodic function (below)
 
 * @param {string} nom
 * @param {number | null} id
 * @public
 * @returns {string}
 */
export function mapURL(nom: string, id: number | null): string {
  if (!(nom in URLs)) {
    console.error(`Loading an unknown URL name: ${nom}`);
    return "";
  }
  if (typeof id === "number") {
    return URLs[nom].replace("[1]", `${id}`);
  }
  return URLs[nom];
}

/**
 * mapURL_variodic
 * Function to generate URN for App, mapping any replacement values, AS VARIODIC
 
 * @see [https://www.damirscorner.com/blog/posts/20180216-VariableNumberOfArgumentsInTypescript.html]
 * @param {Array<string>} ...args: 
 * @public
 * @returns {string}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mapURL_variodic(...args: Array<string>): string {
  const nom = args[0];
  if (!(nom in URLs)) {
    console.error(`Loading an unknown URL name: ${nom}`);
    return "";
  }
  let tmp = URLs[nom];

  if (args.length > 0) {
    for (let i = 1; i < args.length; i++) {
      tmp = tmp.replace("[" + i + "]", args[i]);
    }
  }
  return tmp;
}

