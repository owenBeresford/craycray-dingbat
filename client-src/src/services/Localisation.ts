/*
   IOIO If I add more languges, pull out the data definition sections
   into defineItems() and defineArrays()
   have map lookup in a base class
*/
export interface UItext {
  get(key: string): string;
  getTemplate(key: string): Array<string>;
  lang: string;
}

export const SUPPORTED_LANGUAGE = "en-GB";

export class UI_EN_GB implements UItext {
  protected dat: Map<string, string>;

  protected datA: Map<string, Array<string>>;

  public lang: string;

  constructor(l: string) {
    this.dat = new Map<string, string>();
    this.datA = new Map<string, Array<string>>();
    this.lang = l;
  }

  add(key: string, val: string): void {
    if (this.dat.has(key)) {
      throw new TypeError(`Key ${key} already exists!`);
    } else {
      this.dat.set(key, val);
    }
  }

  addArray(key: string, val: Array<string>): void {
    if (this.datA.has(key)) {
      throw new TypeError(`Key ${key} already exists!`);
    } else {
      this.datA.set(key, val);
    }
  }

  get(key: string): string {
    if (this.dat.has(key)) {
      return this.dat.get(key) ?? this.errorStr(key);
    }
    return this.errorStr(key);
  }

  getTemplate(key: string): Array<string> {
    if (this.datA.has(key)) {
      const tt = this.datA.get(key);
      if (Array.isArray(tt)) {
        return tt;
      }
      return [this.errorStr(key)];
    }
    if (key === "") {
      return [""];
    }
    return [this.errorStr(key)];
  }

  errorStr(key: string): string {
    return `FAIL ${key}`;
  }
}

let hiddenReference: UI_EN_GB;
function UITextFactory(lang: string): UItext {
  if (!hiddenReference) {
    hiddenReference = new UI_EN_GB(lang);
    // if lang===en-GB...
    hiddenReference.add("intro", "Hello. My name is...");
    hiddenReference.add("cross", "❌");
    hiddenReference.add("menu", "☰");

    hiddenReference.addArray("firstUse", [
      "&nbsp; ",
      "Hello, this is a shopping list hack, hosted locally on your phone.",
      "&nbsp; ",
      "This message will clear in a few seconds.",
      "&nbsp; ",
      "NB: Help can be reloaded via the menu, 'show help'.",
    ]);
    hiddenReference.addArray("list-all", [
      "&nbsp; ",
      "This screen lists the shopping lists that you have locally.",
      "Tap a list to access it; or create a new one via 'New'.",
      "lists can be modified via the menu.",
      "&nbsp; ",
      "TODO: list sorting",
    ]);
    hiddenReference.addArray("list-id", [
      "&nbsp; ",
      "This screen lists the items in a list.",
      "&nbsp; ",
      "Long tap to edit an item.",
      "Swipe an item left to remove it when you physically have it.",
      "Use 'add item' option to extend the list.",
      "",
    ]);
    hiddenReference.addArray("menu", [
      "The menu in the top right supplies:",
      "",
      "Install will copy the app to your phone.",
      "Show help will load these messages,",
      "Rename list changes the name of the current list.",
      "Duplicate list makes a new list with same items.",
      "Make unique removes identical items; will be useful after merge function.",
      "Save all writes the data to storage, so you can close the app without loss of data.",
      "Revert all drops changes to match the saved version.",
    ]);
    // end if
  }
  return hiddenReference;
}

export function useUIText(): UItext {
  return UITextFactory(SUPPORTED_LANGUAGE);
}
