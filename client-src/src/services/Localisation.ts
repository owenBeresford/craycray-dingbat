import { SUPPORTED_LANGUAGE } from "../Constants";
import type { UItext } from "../types/Localisation";

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
   * Add a new value to this map.  Uniqueness on clés is enforced.

   * @param {string} clé
   * @param {string} valeur
   * @public
   * @returns {void}
   */
  public add(clé: string, valeur: string): void {
    if (this.dat.has(clé)) {
      throw new TypeError(`Key ${clé} already exists!`);
    } else {
      this.dat.set(clé, valeur);
    }
  }

  /**
   * addArray
   * Add an array as a value.  Uniqueness on clés is enforced.

   * @param {string} clé
   * @param {Array<string>} valeur
   * @public
   * @returns {void}
   */
  public addArray(clé: string, valeur: Array<string>): void {
    if (this.datA.has(clé)) {
      throw new TypeError(`Key ${clé} already exists!`);
    } else {
      this.datA.set(clé, valeur);
    }
  }

  /**
   * get
   * Return a value

   * @param {string} clé
   * @public
   * @returns {string}
   */
  public get(clé: string): string {
    if (this.dat.has(clé)) {
      return this.dat.get(clé) ?? this.errorStr(clé);
    }
    return this.errorStr(clé);
  }

  /**
   * getTemplate
   * Return a value / an array of strings

   * @param {string} clé
   * @public
   * @returns {Array<string>}
   */
  public getTemplate(clé: string): Array<string> {
    if (this.datA.has(clé)) {
      const liste = this.datA.get(clé);
      if (Array.isArray(liste)) {
        return liste;
      }
      return [this.errorStr(clé)];
    }
    if (clé === "") {
      return [""];
    }
    return [this.errorStr(clé)];
  }

  /**
   * errorStr
   * a util to supply error messages

   * @param {string} clé
   * @public
   * @returns {string}
   */
  public errorStr(clé: string): string {
    return `FAIL to find ${clé}`;
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

    hiddenReference.add("unknown.crossLabel", "Broken route.");
    hiddenReference.add("unknown.text1", "Unknown URL, did you manually type it?");
    hiddenReference.add("unknown.text2", "Return to a valid URL.");

    hiddenReference.add("enter.label1", "Enter your new value: ");
    hiddenReference.add("enter.placeholder1", "Enter value");
    hiddenReference.add("enter.title1", "Enter your new value..");
    hiddenReference.add("enter.title2", "Input here to close this small form.");
    hiddenReference.add("enter.value1", "Set");

    hiddenReference.add("interstitial.close1", "Close this interstitial.");
    hiddenReference.add("interstitial.label1", "X");

    hiddenReference.add("menu.header1", "Shopping list");
    hiddenReference.add("menu.symbol", "☰");
    hiddenReference.add("menu.listAllTitle", "Render a list of current shopping lists");
    hiddenReference.add("menu.listAllName", "List All");
    hiddenReference.add("menu.newTitle", "Start a new shopping list");
    hiddenReference.add("menu.newName", "New List");
    hiddenReference.add("menu.actualMenuTitle", "Show or hide the extra features.");
    hiddenReference.add("menu.findItem", "Find 🔍");
    hiddenReference.add("menu.findTitle", "Search across items on this device.");

    hiddenReference.add(
      "menu.installTitle",
      "Copy app to your phone, for offline usage. Needed once. Requires HTTPS to run"
    );
    hiddenReference.add("menu.installName", "Install");
    hiddenReference.add("menu.helpTitle", "Show a help overlay...");
    hiddenReference.add("menu.helpName", "Show help");
    hiddenReference.add("menu.renameTitle", "Give the current list a name");
    hiddenReference.add("menu.renameName", "Rename list");
    hiddenReference.add("menu.dupeTitle", "Duplicate current list");
    hiddenReference.add("menu.dupeName", "Duplicate list");
    hiddenReference.add("menu.uniqTitle", "Feature to allow copying items from one list to another");
    hiddenReference.add("menu.uniqName", "Make unique");
    hiddenReference.add("menu.saveTitle", "Save current lists");
    hiddenReference.add("menu.saveName", "Save all");
    hiddenReference.add("menu.revertTitle", "Change the list back to its initial state");
    hiddenReference.add("menu.revertName", "Revert all");
    hiddenReference.add("menu.outro", "Add more as needed");
    hiddenReference.add("menu.renameSupport", "pls retype");

    hiddenReference.add("list.additemTitle", "Add a new item to current list.");
    hiddenReference.add("list.curListsTitle", "Current lists.  Desktop: long touch to edit, swipe left to delete.");
    hiddenReference.add("list.addItemName", "Add item");
    hiddenReference.add("list.imgAlt", "The app logo - Improve text here");

    hiddenReference.add(
      "serps.intro",
      "The local matches to your recent search are below.   the SERPS are presented as a list, and may be saved as a new list if this is useful."
    );
    hiddenReference.add("serps.imgAlt", "The app logo - Improve text here");
    hiddenReference.add(
      "serps.nout",
      "Did you enter a previous search query? This is the search *results* screen.  The input is at the top in the tabBar"
    );
    hiddenReference.add("serps.itemTitle", "A match"),
      hiddenReference.add("serps.listLink", "This links to the original list, to be able to edit it"),
      hiddenReference.add(
        "serps.itemDTTitle",
        "Big screen interactions are: swipe/ discard item from this search results."
      ),
      hiddenReference.add(
        "serps.itemMBTitle",
        "Mobile interactionas are: swipe/ discard item from this search results."
      ),
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
