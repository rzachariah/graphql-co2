import fetchCore from 'node-fetch';

const HEADERS_TO_PROPAGATE=[
  // Zipkin headers
  'x-request-id',
  'x-b3-traceid',
  'x-b3-spanid',
  'x-b3-parentspanid',
  'x-b3-sampled',
  'x-b3-flags',
  'x-ot-span-context',

  // Jaeger header (for native client)
  'uber-trace-id'
];

export default function fetch(url, options, req) {
  if (!options) {
    options = {};
  }
  if (!options.headers) {
    options.headers = {};
  }
  if (req) {
    {
      HEADERS_TO_PROPAGATE.forEach(header => {
        if (header in req.headers) {
          options.headers[header] = req.headers[header];
        }
      });
    }
  }
  return fetchCore(url, options);
}