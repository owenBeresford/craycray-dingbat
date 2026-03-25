import { SUPPORTED_LANGUAGE } from '../Constants';
import type { UItext } from '../types/Localisation';

/**
 * useUIText
 * Access util.   Will read browser settings or user choice when languages are added

 * @public
 * @returns {UItext}
 */
export function useUIText(): UItext {
  return UITextFactory(SUPPORTED_LANGUAGE);
}

/**
 * UI_EN_GB
 * A class to supply PO structures.
 * Dynamic value mapping features not included as JS already has that on the language level.
   If I add more languages, pull out the data definition sections
   into defineItems() and defineArrays()
   have map lookup in a base class

 * @public
 */
export class UI_EN_GB implements UItext {
  protected dat: Map<string, string>;
  protected datA: Map<string, Array<string>>;
  public lang: string;

  /**
   * constructor
   * A normal con'tor

   * @param {string} l ~ maybe should add a smarter type for the language selection
   * @public
   * @returns {UI_EN_GB}
   */
  public constructor(l: string) {
    this.dat = new Map<string, string>();
    this.datA = new Map<string, Array<string>>();
    this.lang = l;
  }

  /**
   * add
   * Add a new value to this map.  Uniqueness on keys is enforced.

   * @param {string} key
   * @param {string} val
   * @public
   * @returns {void}
   */
  public add(key: string, val: string): void {
    if (this.dat.has(key)) {
      throw new TypeError(`Key ${key} already exists!`);
    } else {
      this.dat.set(key, val);
    }
  }

  /**
   * addArray
   * Add an array as a value.  Uniqueness on keys is enforced.

   * @param {string}
   * @param {Array<string>} val
   * @public
   * @returns {void}
   */
  public addArray(key: string, val: Array<string>): void {
    if (this.datA.has(key)) {
      throw new TypeError(`Key ${key} already exists!`);
    } else {
      this.datA.set(key, val);
    }
  }

  /**
   * get
   * Return a value

   * @param {string} key
   * @public
   * @returns {string}
   */
  public get(key: string): string {
    if (this.dat.has(key)) {
      return (this.dat.get(key) ?? this.errorStr(key));
    }
    return this.errorStr(key);
  }

  /**
   * getTemplate
   * Return a value / an array of strings

   * @param {string} key
   * @public
   * @returns {Array<string>}
   */
  public getTemplate(key: string): Array<string> {
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

  /**
   * errorStr
   * a util to supply error messages

   * @param {string} key
   * @public
   * @returns {string}
   */
  public errorStr(key: string): string {
    return `FAIL to find ${key}`;
  }
}

let hiddenReference: UI_EN_GB;
/**
 * UITextFactory
 * A static inline config of data.  Factory Impl to be changed if more languages are added
 *
 * @param {string} lang
 * @public
 * @returns {UItext}
 */
function UITextFactory(lang: string): UItext {
  if (!hiddenReference) {
    hiddenReference = new UI_EN_GB(lang);
    // if lang===en-GB...
    // if the text is changed, change the storybook tests.
    // Localisation MUST NOT include instanceId
    hiddenReference.add("intro", "Hello. My name is...");
    hiddenReference.add("cross", "❌");
    hiddenReference.add("menu", "☰");

    hiddenReference.add("unknown.crossLabel", "Broken route.");
    hiddenReference.add("unknown.text1", "Unknown URL, did you manually type it?");
    hiddenReference.add("unknown.text2", "Return to a valid URL.");

    hiddenReference.add("enter.label1",  "Enter your new value: ");
    hiddenReference.add("enter.placeholder1",  "Enter value");
    hiddenReference.add("enter.title1",  "Enter your new value..");
    hiddenReference.add("enter.title2",  "Input here to close this small form.");
    hiddenReference.add("enter.value1",  "Set");

    hiddenReference.add('interstitial.close1', 'Close this interstitial.');
    hiddenReference.add('interstitial.label1', 'X');

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


