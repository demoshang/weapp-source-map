const fs = require('fs');
const { parse, basename } = require('path');
const { promisify } = require('util');
const { exec: originExec } = require('child_process');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exec = promisify(originExec);
const glob = require('glob');

async function getBuildVersion() {
  const { stdout: currentBranch } = await exec(`git rev-parse --abbrev-ref HEAD`);

  const { stdout: currentHead } = await exec(`git rev-parse --short HEAD`);

  const { stdout: lastMsg } = await exec(`git log --pretty=format:"%s %ai" -3`);

  return {
    branch: currentBranch.trim(),
    head: currentHead.trim(),
    log: lastMsg.trim(),
    buildAt: new Date().toISOString(),
  };
}

function version2html({ branch, head, log, buildAt }) {
  return `
  <br>当前版本: ${branch} &nbsp;&nbsp;&nbsp;&nbsp; ${head}
  <br>构建日期: ${buildAt}
  <br>提交日志: <br> &nbsp;&nbsp;&nbsp;&nbsp;${log.replace(
    /[\r\n]+/g,
    '<br> &nbsp;&nbsp;&nbsp;&nbsp;',
  )}
  `;
}

(async () => {
  const version = await getBuildVersion();

  const htmlList = glob.sync('./src/pages/**/*.html').map((filepath) => {
    const { dir } = parse(filepath);

    return {
      dir,
      base: basename(dir),
      filepath,
    };
  });

  await Promise.all(
    htmlList.map(async ({ filepath }) => {
      const input = await readFile(filepath, { encoding: 'utf-8' });

      await writeFile(
        filepath,
        input
          .replace(/(['"])__INJECT_VERSION__\1/, JSON.stringify(version))
          .replace(/__INJECT_HTML_VERSION__/g, version2html(version)),
      );
    }),
  );
})();
