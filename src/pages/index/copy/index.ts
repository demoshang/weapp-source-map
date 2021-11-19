import { delay } from '@/utils/promise';
import { ExcludeObjectUndefined } from '@/utils/type';
import ClipboardJS from 'clipboard';
import {
  distinctUntilKeyChanged,
  filter,
  from,
  fromEvent,
  map,
  merge,
  OperatorFunction,
  share,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';

const addCopy = (() => {
  let cache: ClipboardJS;

  return () => {
    if (cache) {
      cache.destroy();
    }

    cache = new ClipboardJS('.copy');

    cache.on('success', function (e) {
      console.info('Action:', e.action);
      console.info('Text:', e.text);
      console.info('Trigger:', e.trigger);
    });

    cache.on('error', function (e) {
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
  };
})();

interface ClipBoardEmitResult {
  value: string | undefined;
  event: Event;
  type: string;
}

type ClipBoardChangeResult = ExcludeObjectUndefined<ClipBoardEmitResult, 'value'>;

const getClipboardChange = (ele: HTMLTextAreaElement) => {
  const emitText = async (o: { event: Event; type: string }) => {
    const isFocused = document.hasFocus();
    if (isFocused) {
      await delay(500);
    }

    const text = await navigator.clipboard.readText().catch((e) => {
      return e;
    });

    if (text instanceof Error) {
      return {
        ...o,
        value: undefined,
        error: text,
      };
    }

    return {
      ...o,
      value: text,
    };
  };

  return merge(
    fromEvent(document, 'click').pipe(
      map((event) => {
        return {
          event,
          type: 'document click',
        };
      }),
    ),
    fromEvent(ele, 'focus').pipe(
      map((event) => {
        return {
          event,
          type: 'textarea focus',
        };
      }),
    ),
    fromEvent(document, 'webkitvisibilitychange').pipe(
      filter(() => {
        return !document.webkitHidden;
      }),
      map((event) => {
        return {
          event,
          type: 'webkit visibility change',
        };
      }),
    ),
    fromEvent(window, 'focus').pipe(
      map((event) => {
        return {
          event,
          type: 'window focus',
        };
      }),
    ),
    fromEvent(window, 'load', { once: true }).pipe(
      map((event) => {
        return {
          event,
          type: 'window load',
        };
      }),
    ),
  ).pipe(
    throttleTime(100),
    switchMap((o) => {
      return from(emitText(o));
    }),
    tap(console.info),
    filter(({ value }) => {
      return !!value;
    }) as OperatorFunction<ClipBoardEmitResult, ClipBoardChangeResult>,
    distinctUntilKeyChanged('value'),
    share(),
  );
};

export { addCopy, getClipboardChange, ClipBoardChangeResult };
