import { filter, fromEvent, map, merge, share, tap } from 'rxjs';
import { filterUndefined } from '../../../utils/filter';

type DragUploadEvent =
  | {
      type: 'click';
      event: Event;
    }
  | {
      type: 'dragover';
      event: Event;
    }
  | {
      type: 'dragleave';
      event: Event;
    };

interface DragUploadFile {
  type: 'file';
  file: File;
}

type DragFileResult = DragUploadFile | DragUploadEvent;

function getDragUploadShare(uploadEle: Element, fileEle: HTMLInputElement) {
  const click$ = fromEvent(uploadEle, 'click').pipe(
    tap(() => {
      fileEle.click();
    }),
    map((event) => {
      return { type: 'click' as const, event };
    }),
  );

  const dragover$ = fromEvent(uploadEle, 'dragover').pipe(
    tap((event) => {
      event.preventDefault();
    }),
    map((event) => {
      return { type: 'dragover' as const, event };
    }),
  );

  const dragleave$ = fromEvent(uploadEle, 'dragleave').pipe(
    map((event) => {
      return { type: 'dragleave' as const, event };
    }),
  );

  const clickFile$ = fromEvent(fileEle, 'change').pipe(
    map((event) => {
      const target = event.target as HTMLInputElement;

      const file = target?.files?.[0];

      return file;
    }),
    filter(filterUndefined),
  );

  const dragFile$ = fromEvent(uploadEle, 'drop').pipe(
    tap((event) => {
      event.preventDefault();
    }),
    map((event) => {
      const file = (event as DragEvent).dataTransfer?.files?.[0];

      return file;
    }),
    filter(filterUndefined),
  );

  const file$ = merge(clickFile$, dragFile$).pipe(
    map((file) => {
      return { type: 'file' as const, file };
    }),
  );

  return merge(click$, dragover$, dragleave$, file$).pipe(share());
}

export { getDragUploadShare, DragUploadEvent, DragUploadFile, DragFileResult };
