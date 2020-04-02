#!/usr/bin/zsh
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )";

setopt nullglob -s globstar nullglob
while set -- **/*.zip; [ $# -ge 1 ] do
  for z; do
    ( cd -- "$(dirname "$z")" &&
      z=${z##*/} &&
      unzip -- "$z" &&
      rm -- "$z"
    )
  done
done

mv "${DIR}/static/images/gallery/POSTED/**/*.{jpg,png,gif}" "${DIR}/static/images/gallery/";
