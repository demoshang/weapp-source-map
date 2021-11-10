import localForage from 'localforage';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  map,
  merge,
  of,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { filterNil, filterUndefined } from '../../utils/filter';
import { ErrorRegex } from './constants';
import { addCopy, getClipboardChange } from './copy';
import { DragUploadFile, getDragUploadShare } from './drag-upload';
import './index.scss';
import { parseErrors } from './parse-error';
import { buildList } from './show-result';
import { buildConsumer } from './source-map';
import './source-map/init';

const uploadEle = document.querySelector('#drop-area')!;
const fileEle = document.querySelector<HTMLInputElement>('#file')!;
const logEle = document.querySelector<HTMLTextAreaElement>('#log')!;
const noticeEle = document.querySelector<HTMLDivElement>('#notice')!;
const loadingEle = document.querySelector<HTMLDivElement>('#loading')!;
const resultEle = document.querySelector<HTMLDivElement>('#result')!;

const clipboardLog$ = getClipboardChange(logEle).pipe(
  throttleTime(500),
  map(({ value }) => {
    const inputValue = value.replace(/[\r\n]+/g, '\n').trim();

    if (!inputValue) {
      return undefined;
    }

    if (!ErrorRegex.test(inputValue)) {
      return undefined;
    }

    const old = logEle.value;

    if (old.includes(inputValue)) {
      return undefined;
    }

    const newStr = `${inputValue} \n\n==== from clipboard end ====\n\n ${old}`;
    logEle.value = newStr;
    return newStr;
  }),
  filter(filterUndefined),
);

const errorLog$ = merge(
  clipboardLog$,
  merge(fromEvent(logEle, 'change'), fromEvent(logEle, 'input')).pipe(
    map((evt) => {
      const target = evt.target as HTMLInputElement;

      return target.value ?? '';
    }),
  ),
).pipe(distinctUntilChanged());

const lastSavedFile$ = from(localForage.getItem<File>('file')).pipe(
  filter(filterNil),
  map((file) => {
    return { type: 'file', file };
  }),
);

const dragUpload$$ = getDragUploadShare(uploadEle, fileEle);
const file$ = merge(
  lastSavedFile$,
  dragUpload$$.pipe(
    filter((obj): obj is DragUploadFile => {
      return obj.type === 'file';
    }),
  ),
);

const consumer$ = file$.pipe(
  tap(({ file }) => {
    localForage.setItem('file', file);
  }),
  map(({ file }) => {
    return buildConsumer(file);
  }),
);

const parseResultRender$ = combineLatest([consumer$, errorLog$]).pipe(
  tap(() => {
    loadingEle.style.display = 'block';
    resultEle.innerHTML = '';
  }),
  switchMap((values) => {
    return from(parseErrors(...values));
  }),
  map((list) => {
    return { error: null, data: list };
  }),
  tap(() => {
    loadingEle.style.display = 'none';
  }),
  catchError((e: Error) => {
    console.warn(e);
    return of({ error: e, data: [] });
  }),

  map(({ error, data }) => {
    if (error) {
      return '出错啦';
    }

    console.log('==================', data);

    return buildList(data);
  }),
  tap((str) => {
    resultEle.innerHTML = str;

    addCopy();
  }),
);

const parseEventRender$ = merge(lastSavedFile$, dragUpload$$).pipe(
  tap((obj) => {
    switch (obj.type) {
      case 'file':
        noticeEle.innerHTML = obj.file.name;
        break;
      case 'dragover':
        noticeEle.innerHTML = `松开后上传文件`;
        break;
      case 'click':
      case 'dragleave':
        noticeEle.innerHTML = `拖拽或点击选择 sourcemap.zip 文件`;
        break;
      default:
        break;
    }
  }),
);

merge(parseResultRender$, parseEventRender$).subscribe({
  next: () => {},
  error: console.warn,
});
