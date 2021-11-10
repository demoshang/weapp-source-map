import sourceMap from 'source-map';

sourceMap.SourceMapConsumer.initialize({
  'lib/mappings.wasm': '//unpkg.com/source-map@0.7.3/lib/mappings.wasm',
});
