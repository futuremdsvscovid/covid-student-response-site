# shopt -s globstar
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DIR=$(dirname "$DIR")
DIR="$DIR/static/images/gallery"
echo $DIR
# find "$DIR/POSTED" -name "*.jpg" -or "*.png" -or ".gif" -exec mv "{}" "$DIR/" \;

mv $DIR/**/*.png $DIR