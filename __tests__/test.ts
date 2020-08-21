import copy from "../src/helpers/copy";
import fs from "fs/promises";
import { join as p } from "path";
import rm from "rimraf";

describe("Copy Test", () => {
  beforeAll(async () => {
    try {
      await fs.mkdir(p(__dirname, "../testDirectory"));
    } catch (err) {}
  });

  beforeEach((done) => {
    rm(p(__dirname, "../testDirectory/*"), (err) => {
      if (err) console.log("failed to delete");
      done();
    });
  });

  it("copies a single file", async () => {
    const testVal = "Hello World";
    await fs.mkdir(p(__dirname, "../testDirectory/from"));
    await fs.mkdir(p(__dirname, "../testDirectory/to"));
    await fs.writeFile(
      p(__dirname, "../testDirectory/from/test.file"),
      testVal,
      "utf-8"
    );
    await copy(
      p(__dirname, "../testDirectory/from/test.file"),
      p(__dirname, "../testDirectory/to")
    );
    const res = (
      await fs.readFile(p(__dirname, "../testDirectory/to/test.file"))
    ).toString("utf-8");
    expect(res).toEqual(testVal);
  });

  it("copies a folder that has files", async () => {
    const testVal = "Hello World";
    await fs.mkdir(p(__dirname, "../testDirectory/from"));
    await fs.mkdir(p(__dirname, "../testDirectory/to"));
    await fs.mkdir(p(__dirname, "../testDirectory/from/morefiles"));
    await Promise.all(
      ["a", "morefiles/b", "morefiles/c"].map(async (filePath) => {
        await fs.writeFile(
          p(__dirname, `../testDirectory/from/${filePath}`),
          testVal,
          "utf-8"
        );
      })
    );
    await copy(
      p(__dirname, "../testDirectory/from"),
      p(__dirname, "../testDirectory/to")
    );
    const res = (
      await fs.readFile(p(__dirname, "../testDirectory/to/morefiles/b"))
    ).toString("utf-8");
    expect(res).toEqual(testVal);
  });
});
