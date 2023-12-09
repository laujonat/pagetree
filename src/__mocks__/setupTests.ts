import "@testing-library/jest-dom";

/**
 * @jest-environment jsdom
 */
import { JSDOM } from "jsdom";

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
