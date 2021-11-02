/* eslint-disable max-classes-per-file */

export enum ERROR_MAP {
  OperationalError = 'OperationalError',
  SpawnError = 'spawn error',
  Timeout = 'Timeout',
  Unknown = 'Unknown',

  // 页面参数错误
  PageInValid = 'PageInValid',
  // 请求返回码不正确
  ResponseCodeInvalid = 'ResponseCodeInvalid',
}

export type ERROR_CODES = keyof typeof ERROR_MAP;

export interface ErrorJSON {
  type: 'error';
  message: string;
  code: ERROR_CODES;
  extra?: any;
  stack?: string;
}

export class OperationalError extends Error {
  private extra: any;

  private code: ERROR_CODES;

  public constructor(extra?: any, message?: string, code: ERROR_CODES = 'OperationalError') {
    super();

    this.code = code;
    this.message = message || 'OperationalError';
    this.extra = extra;
  }

  public toJSON(): ErrorJSON {
    return {
      type: 'error',
      message: this.message,
      code: this.code,
      extra: this.extra,
      stack: this.stack,
    };
  }

  public toString(): string {
    return `${this.code}
${this.extra ? JSON.stringify(this.extra) : ''}
${this.stack || ''}`;
  }
}

export type ERRORS = {
  [name in ERROR_CODES]: typeof OperationalError;
};

function buildErrors(): ERRORS {
  const keys = Object.keys(ERROR_MAP) as [ERROR_CODES];
  const o = keys.reduce((result, code) => {
    const defaultMessage = ERROR_MAP[code];

    class ChildError extends OperationalError {
      public constructor(extra?: any, message?: string) {
        super(extra, message || defaultMessage, code);
      }
    }

    // eslint-disable-next-line no-param-reassign
    result[code] = ChildError;
    return result;
  }, {} as any);

  o.OperationalError = OperationalError;
  return o;
}

const Errors = buildErrors();

function isErrorLike(obj: any): obj is ErrorJSON {
  return !!(obj?.type === 'error' && obj?.code);
}

function try2error<T>(obj: T): OperationalError | T {
  if (isErrorLike(obj)) {
    const code = obj.code;
    if (Errors[code]) {
      return new Errors[code](obj.extra, obj.message);
    }

    return new Errors.Unknown(obj, obj.message);
  }

  return obj;
}

export { Errors, try2error };
