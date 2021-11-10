#!/usr/bin/env bash
set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd ${script_dir} && cd ../../ && pwd)"

git config --global user.email "action@github.com"
git config --global user.name "action"

function command_exists() {
  command -v "$@" >/dev/null 2>&1
}

function get_user() {
  local build_repo=${GITHUB_REPOSITORY:-''}
  local user=${build_repo%/*}
  echo ${user}
}

function get_private_repo() {
  echo "https://$(get_user):${GITHUB_TOKEN:-}@github.com/${GITHUB_REPOSITORY}.git"
}

function push() {
  cd dist
  git config --global init.defaultBranch main
  git init
  git remote add action $(get_private_repo)
  git add -A
  git commit -m "更新脚本" || true
  git push action main:gh-pages -f
}

push
