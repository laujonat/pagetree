module.exports = {
  branches: ["main"],
  repositoryUrl: "git@github.com:laujonat/pagetree.git",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git",
  ],
};
