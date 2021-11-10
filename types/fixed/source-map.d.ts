import sourceMap, { SourceMappings } from 'source-map';

declare module 'source-map' {
  interface SourceMapConsumerConstructor {
    initialize: (mappings: SourceMappings) => void;
  }
}
