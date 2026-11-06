#!/bin/sh
# unpack-installer.sh <zip> <destDir>: unzips, then prints RUNNER|<path to run-all.sh>|<one-line command>.
# Never runs the runner: the person types their own password.
zip="$1"; dest="$2"
fail() { echo "UNPACK|fail|$1"; exit 1; }
[ -f "$zip" ] || fail "no such zip"
/bin/mkdir -p "$dest" || fail "cannot create folder"
/usr/bin/unzip -q -o "$zip" -d "$dest" || fail "unzip failed"
dest=$(cd "$dest" && pwd) || fail "cannot read folder"
runner=$(/usr/bin/find "$dest" -name run-all.sh -type f 2>/dev/null | /usr/bin/head -1)
[ -n "$runner" ] || fail "run-all.sh not found"
echo "RUNNER|$runner|sudo sh \"$runner\""
