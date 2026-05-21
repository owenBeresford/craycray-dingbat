import type { TestDataSchema } from "./types/TestDataSchema";
import type { SaveStruct } from "./types/SaveStruct";

export function transform2SaveStruct(din: Array<TestDataSchema>): Array<SaveStruct> {
  let out: Array<SaveStruct> = [];

  for (let i = 0; i < din.length; i++) {
    out[i] = { ...din[i], created: din[i].created.getTime(), edited: din[i].edited.getTime() };
  }
  return out;
}

export function fixture1(): Array<TestDataSchema> {
  // good data
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5"],
    } as TestDataSchema,
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 2,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 3,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}

export function fixture2(): Array<TestDataSchema> {
  // bad ids
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5"],
    } as TestDataSchema,
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}

export function fixture3(): Array<TestDataSchema> {
  // long list
  return [
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 1,
      list: [
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
      ],
    } as TestDataSchema,
  ];
}

export function fixture4(): Array<TestDataSchema> {
  // very long item
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: [
        "thing 1 fgdh dhsh sfhs hsfh shsfhsfgh sghs fgh sghsfgh hsfhsf hsfh sfhsf hsfh sghsghs hdgj gkfg kjd gjdgj dj sj",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
      ],
    } as TestDataSchema,
  ];
}

export function fixture5(): Array<TestDataSchema> {
  // bad ids
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 1", "thing 3", "thing 3", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}

export function simple_fixture1(): Array<TestDataSchema> {
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
  ];
}

export function simple_fixture2(): Array<TestDataSchema> {
  return [
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 100,
      list: ["thing 1b", "thing 2b", "thing 3b"],
    } as TestDataSchema,
  ];
}
