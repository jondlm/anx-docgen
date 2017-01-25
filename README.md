# anx-docgen

This is a small utility, powered by [react-docgen][dg], library that we use to
power our React component library documentation. It's highly opinionated so
your mileage may vary.

## Usage

```
  const anxDocgen = require('anx-docgen');

  anxDocgen.fromPaths([
    './components/MyComponent.jsx',
    './components/FooComponent.jsx',
  ]).then((docgenMap) => {
    // `docgenMap` is a data structure that describes your components, see 'test/fixtures/01/docgenMap.json' for an example of what it looks like
    console.log(docgenMap);
  });
```

[dg]: https://github.com/reactjs/react-docgen
