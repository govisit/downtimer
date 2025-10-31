def install-dependencies [package: string] {
  cd $package

  print "Installing dependencies..."
  deno install
}

def run-checks [package: string] {
  cd $package

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

def update-version-in-deno-json [semver: string package: string] {
  let deno_json = open $"($package)/deno.json"

  let current_version: string = $deno_json | get version

  let updated_version = get-bumped-version $semver $current_version

  $deno_json | update version $updated_version | save $"($package)/deno.json" -f

  $"Updated deno.json to version: ($updated_version)"

  $updated_version
}

def create-commit-and-tag [updated_version: string, package: string] {
  let release_tag = $"v($updated_version)-($package)"

  jj commit -m $"release: ($release_tag)"

  jj b s main -r @-

  git checkout main

  git tag -a $release_tag -m $"($release_tag) release"
}

let supported_semver = ["major" "minor" "patch"]
let supported_package = ["web" "cli" "shared"]

# This script runs checks on the desired package, and if they all pass
# bumps version in deno.json, creates a new commit, and creates a
# tag.
# WARN: It moves main bookmark to to newly created commit, which can
# add commits in between.
def main [
  package: string # Values: web, cli, shared
  semver: string # Values: major, minor, patch
] {
  if (not ($supported_package | any {|elt| $elt == $package})) {
    return $"Valid packages: ($supported_package | str join ', ')"
  }

  match ($supported_semver | any {|elt| $elt == $semver}) {
    true => {
      install-dependencies $package 

      run-checks $package

      let updated_version = update-version-in-deno-json $semver $package

      create-commit-and-tag $updated_version $package
    },
    false => {
      $"Must choose version: ($supported_semver | str join ', ')"
    } 
  }
}
