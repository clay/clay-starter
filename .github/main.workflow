workflow "Test" {
  on = "push"
  resolves = ["Lint"]
}

action "Lint" {
  uses = "./.github/lint/"
}
