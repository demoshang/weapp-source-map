import JSZip from 'jszip';
import { defer } from '../../utils/promise';

const getFileContent = (zip: JSZip) => {
  const cache: { [key: string]: Promise<any> } = {};

  return async (v: string) => {
    const filePath = v.replace(/^\//, '');
    if (!cache[filePath]) {
      const deferred = defer<object>();
      cache[filePath] = deferred.promise;

      const zipObject = zip.file(filePath);
      if (!zipObject) {
        deferred.reject(new Error(`${filePath} does not exist`));
      } else {
        zipObject
          .async('string')
          .then((str) => {
            return deferred.resolve(JSON.parse(str));
          })
          .catch(deferred.reject);
      }
    }

    return cache[filePath];
  };
};

async function parseZip(file: File) {
  const zip = await JSZip.loadAsync(file);

  return {
    zip,
    getFileContent: getFileContent(zip),
  };
}

export { parseZip };
