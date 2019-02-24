workflow "Test" {
  on = "push"
  resolves = ["Lint"]
}

# Filter for master branch
action "Lint" {
  uses = "./.github/lint/"
}
