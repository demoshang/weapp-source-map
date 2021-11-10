import { uniqBy } from 'lodash';
import { MappedError } from '../parse-error';

function buildList(list: MappedError[]) {
  const html = uniqBy(list, 'file')
    .map((item) => {
      const { file, name, origin } = item;
      return `
<tr>
  <td>${origin}</td>
  <td>${name ?? ''}</td>
  <td>${file}  <button style="display: ${
        file ? 'inline' : 'none'
      }" class="copy btn btn-sm btn-primary" data-clipboard-text="${file}">复制</button></td>
</tr>
`;
    })
    .join('');

  return `
<table class="table">
  <thead>
    <tr>
      <th scope="col">源路径</th>
      <th scope="col">变量名</th>
      <th scope="col">真实路径</th>
    </tr>
  </thead>
    ${html}
</table>
    `;
}

export { buildList };
