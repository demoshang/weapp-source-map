import ClipboardJS from 'clipboard';
import { distinctUntilChanged, ReplaySubject, share } from 'rxjs';
import { delay } from '../../../utils/promise';

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

const getClipboardChange = (ele: HTMLTextAreaElement) => {
  let subject = new ReplaySubject<{ type: string; value: string }>(1);

  const emitText = (type: string) => {
    (async () => {
      const isFocused = document.hasFocus();
      if (isFocused) {
        await delay(500);
      }

      const text = await navigator.clipboard.readText();
      subject.next({
        type,
        value: text,
      });
    })().catch((e) => {
      console.warn(e);
    });
  };

  // 页面点击
  document.addEventListener('click', (e) => {
    emitText('document click');
  });

  // 输入框聚焦
  ele.addEventListener('focus', () => {
    emitText('textarea focus');
  });

  // 页面从隐藏切换到显示
  document.addEventListener('webkitvisibilitychange', () => {
    if (!document.webkitHidden) {
      emitText('webkitvisibilitychange');
    }
  });

  // 页面聚焦
  window.addEventListener('focus', () => {
    emitText('window focus');
  });

  // 页面加载完成
  window.addEventListener(
    'load',
    () => {
      emitText('window load');
    },
    { once: true },
  );

  return subject.pipe(distinctUntilChanged(), share());
};

export { addCopy, getClipboardChange };
