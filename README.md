# Import NPM Modules into Deno

Deno NPM Import helps easily import npm modules and cache them. Very useful for people coming from node and often want to use a familiar package, without needing to context switch to import.

## Features

- Provides options for which available versions to import (taken from NPMs public API)
- Writes and alias using the `import_map.json` if available. Otherwise, inlines the import into your active file

## Requirements

This extension assumes you are working in [Deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno). 