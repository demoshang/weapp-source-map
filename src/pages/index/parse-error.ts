import { BasicSourceMapConsumer } from 'source-map';
import { filterNil } from '../../utils/filter';
import { ErrorRegex } from './constants';

interface MappedError {
  name: string | null;
  origin: string;
  file: string;

  input: number[];
  source?: string | null;
  line?: number | null;
  column?: number | null;
}

async function parseErrors(
  getConsumer: (sourceMapFilePath: string) => Promise<BasicSourceMapConsumer | null | undefined>,
  errorLog: string,
): Promise<MappedError[]> {
  const matches = [...errorLog.matchAll(ErrorRegex)].map(([full, file, line, column]) => {
    return {
      full,
      file,
      line,
      column,
    };
  });

  const list = await Promise.all(
    matches
      .map((o) => {
        const { line, column } = o;

        return {
          ...o,
          line: parseInt(line, 10),
          column: parseInt(column, 10),
        };
      })
      .map(async ({ full, file, line, column }) => {
        const sourceMapConsumer = await getConsumer(file);

        if (!sourceMapConsumer) {
          return null;
        }

        const v = sourceMapConsumer.originalPositionFor({
          line,
          column,
        });

        return {
          ...v,
          origin: full,
          input: [line, column],

          file: !v.source
            ? ''
            : v.source.replace('webpack:///', '') + ':' + v.line + ':' + v.column,
        };
      }),
  );

  return list.filter(filterNil);
}

export { parseErrors, MappedError };
