import { mkdir, readdir, stat, readFile, writeFile } from "fs/promises";
import { join as p, parse } from "path";
/**
 *
 * @param scrPath File or Directory to copy from. Only the contents of the directory are copied not the directory itself. When a directory is copied, its child directories and all files contanied withen them are copied recursively.
 * @param dstPath Root to copy the file into if the source is a file or the contents of the source directory.
 * @param processTemplate Optional transform function that is run on the contents of each file that is copied. Recieves the old contents and file name. Return the new contents for the file.
 */
export default async function copyTemplates(
  scrPath: string,
  dstPath: string,
  processTemplate: (filename: string, fileText: Buffer) => Buffer | string = (
    _: string,
    t: Buffer
  ) => t
) {
  if ((await stat(scrPath)).isDirectory()) {
    const files = await readdir(scrPath);
    await Promise.all(
      files.map(async (file) => {
        const status = await stat(p(scrPath, file));
        if (status.isDirectory()) {
          try {
            await mkdir(p(dstPath, file));
          } catch (e) {
          } finally {
            await copyTemplates(
              p(scrPath, file),
              p(dstPath, file),
              processTemplate
            );
          }
        } else {
          const contents = await readFile(p(scrPath, file));
          await writeFile(
            p(dstPath, file.replace(/_T/, "")),
            processTemplate(file, contents)
          );
        }
      })
    );
  } else {
    const contents = await readFile(scrPath);
    const file = parse(scrPath).base;
    await writeFile(
      p(dstPath, file.replace(/_T/, "")),
      processTemplate(file, contents)
    );
  }
}
