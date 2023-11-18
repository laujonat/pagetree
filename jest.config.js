module.exports = {
    "roots": [
        "src"
    ],
    "transform": {
        "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
    },
    "setupFiles": [
        "<rootDir>/src/__mocks__/setupTests.ts"
    ],

};
