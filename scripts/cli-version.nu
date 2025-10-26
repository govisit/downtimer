def install-dependencies [] {
  cd cli

  print "Installing dependencies..."
  deno install
}

def run-checks [] {
  cd cli

  print "Checking formatting..."
  deno fmt --check

  print "Checking for lint issues..."
  deno lint

  print "Type checking..."
  deno check
}

def get-major [version: string] {
  $version | split row "." | first | into int
}

def get-minor [version: string] {
  $version | split row "." | get 1 | into int
}

def get-patch [version: string] {
  $version | split row "." | last | into int
}

def get-bumped-version [semver: string, version: string] {
  match $semver {
    "major" => {
      let major = (get-major $version)

      $"($major + 1).0.0"
    },
    "minor" => {
      let major = (get-major $version)
      let minor = (get-minor $version)

      $"($major).($minor + 1).0"
    },
    "patch" => {
      let major = (get-major $version)
      let minor = (get-minor $version)
      let patch = (get-patch $version)

      $"($major).($minor).($patch + 1)"
    },
    _ => $version
  }
}

def update-version-in-deno-json [semver: string] {
  let deno_json = open cli/deno.json

  let current_version: string = $deno_json | get version

  let updated_version = get-bumped-version $semver $current_version

  $deno_json | update version $updated_version | save cli/deno.json -f

  $"Updated deno.json to version: ($updated_version)"

  $updated_version
}

def create-commit-and-tag [updated_version: string] {
  let release_tag = $"v($updated_version)-cli"

  jj commit -m $"release: ($release_tag)"

  jj b s main -r @-

  git checkout main

  git tag -a $release_tag -m $"($release_tag) release"
}

# This script runs checks on the cli package, and if they all pass
# bumps version in deno.json, creates a new commit, and creates a
# tag.
# WARN: It moves main bookmark to to newly created commit, which can
# add commits in between.
def main [
  semver: string # Values: major, minor, patch
] {
  match (["major" "minor" "patch"] | any {|elt| $elt == $semver}) {
    true => {
      install-dependencies 

      run-checks 

      let updated_version = update-version-in-deno-json $semver

      create-commit-and-tag $updated_version
    },
    false => {
      "Must choose version: major, minor, patch"
    } 
  }
}
