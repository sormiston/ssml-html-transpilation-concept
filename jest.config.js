module.exports = {
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "jsdom",
  testRegex: "/src/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  resolver: "jest-ts-webcompat-resolver",
};
