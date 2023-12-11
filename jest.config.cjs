module.exports = {
    "roots": [
        "src"
    ],
    "transform": {
        "^.+\\.js?$": "babel-jest",
        "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.test.json" }],
        "^.+\\.tsx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.test.json" }],
    },
    "setupFilesAfterEnv": [
        "<rootDir>/src/setupTests.ts"
    ],
    "testEnvironment": 'jsdom',
    "moduleNameMapper": {
        "^@/(.*)$": "<rootDir>/src/$1"
    }
};
