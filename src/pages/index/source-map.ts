import { BasicSourceMapConsumer, SourceMapConsumer } from 'source-map';
import { parseZip } from './parse-zip';

function getFilePath(sourceMapFilePath: string) {
  const tmp = sourceMapFilePath.includes('/')
    ? `${sourceMapFilePath}.map`
    : `__APP__/${sourceMapFilePath}.map`;

  return tmp.startsWith('/') ? tmp : `/${tmp}`;
}

const buildConsumer = (file: File) => {
  const zipPromise = parseZip(file);

  const cache: { [key: string]: BasicSourceMapConsumer | null | undefined } = {};

  return async (sourceMapFilePath: string) => {
    if (cache[sourceMapFilePath] !== undefined) {
      return cache[sourceMapFilePath];
    }

    const { getFileContent } = await zipPromise;

    const filePath = getFilePath(sourceMapFilePath);

    const obj = await getFileContent(filePath);

    const sourceMapConsumer = await new SourceMapConsumer(obj);

    cache[sourceMapFilePath] = sourceMapConsumer;
    return sourceMapConsumer;
  };
};

export { buildConsumer };
