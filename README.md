# PageTree Inspector Chrome Extension

![build](https://github.com/laujonat/pagetree/actions/workflows/build/badge.svg)

This is a Chrome extension that allows you to visualize the distribution of DOM nodes in the document tree.

![extension sample screenshot](https://cdn8.nyc3.digitaloceanspaces.com/pagetree-ss-1.png)

## Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

## Option

- [Visual Studio Code](https://code.visualstudio.com/)

## Features

- TypeScript
- Webpack
- React
- Jest
- Stylelint
- Prettier
- react-d3-tree

## Project Structure

- src/typescript: TypeScript source files
- src/assets: static files
- dist: Chrome Extension directory
- dist/js: Generated JavaScript files

## Setup

To set up the project, run the following command:

```bash
npm install
```

## Import as Visual Studio Code project

...

## Build

To build the project, run the following command:

```bash
npm run build
```

## Build in watch mode

To build the project in watch mode, you have two options:

### Terminal

```bash
npm run watch
```

### Visual Studio Code

- Run watch mode by pressing `Ctrl + Shift + B` in Visual Studio Code.

## Load extension to Chrome

Load the `dist` directory as the Chrome extension.

## Test

To run the tests, use the following command:

```bash
npx jest
```

Alternatively, you can use `npm run test`.

## License

This project is licensed under the MIT License.

Please update the Readme with any additional information you feel is relevant to the project.
