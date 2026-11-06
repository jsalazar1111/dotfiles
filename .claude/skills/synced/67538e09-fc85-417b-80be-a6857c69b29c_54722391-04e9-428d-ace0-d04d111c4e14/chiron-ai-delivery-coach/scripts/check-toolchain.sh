#!/bin/sh
# Runs every tool's version command from tools.json (Mac entries). Prints TOOL|<id>|ok|<version> or
# TOOL|<id>|missing| per tool, then TOOLCHAIN|ok or TOOLCHAIN|missing|<count>. Exits 0 only when nothing is missing.
# TUTOR_EXTRA_PATH replaces the usual install folders (tests set it empty so stubs win).
here=$(cd "$(/usr/bin/dirname "$0")" && pwd)
extra="${TUTOR_EXTRA_PATH-/usr/local/bin:/usr/local/plative/bin:/opt/homebrew/bin:$HOME/.local/bin:/Applications/Visual Studio Code.app/Contents/Resources/app/bin}"
PATH="$extra:$PATH"
tmp=$(/usr/bin/mktemp -t tutor-tool) || exit 1
trap '/bin/rm -f "$tmp"' EXIT

# One "id command args" line per Mac tool. The JSON is read with osascript, as elsewhere in this repo.
list=$(TOOLS_FILE="$here/../tools.json" /usr/bin/osascript -l JavaScript -e '
ObjC.import("stdlib"); ObjC.import("Foundation");
var p = ObjC.unwrap($.getenv("TOOLS_FILE"));
var t = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null)));
t.filter(function (x) { return x.mac; }).map(function (x) { return x.id + " " + x.mac.join(" "); }).join("\n");
' 2>/dev/null)
[ -n "$list" ] || { echo "TOOLCHAIN|missing|unreadable-tools-json"; exit 1; }

# Runs a command with a 10-second limit; output goes to $tmp.
run_limited() {
    "$@" >"$tmp" 2>&1 &
    pid=$!
    ( /bin/sleep 10; kill "$pid" 2>/dev/null ) &
    watcher=$!
    wait "$pid"
    rc=$?
    /usr/bin/pkill -P "$watcher" 2>/dev/null
    kill "$watcher" 2>/dev/null
    wait "$watcher" 2>/dev/null
    return $rc
}

missing=0
while read -r id cmd args; do
    [ -n "$id" ] || continue
    path=$(command -v "$cmd" 2>/dev/null)
    # Apple's git and python3 placeholders open an install dialog when the Command Line Tools are missing.
    case "$path:$id" in
        /usr/bin/git:git | /usr/bin/python3:python)
            [ -x /Library/Developer/CommandLineTools/usr/bin/git ] || path='' ;;
    esac
    ver=''
    if [ -n "$path" ]; then
        run_limited "$path" $args
        rc=$?
        if [ "$rc" -eq 0 ]; then
            ver=$(/usr/bin/sed -n '/[^[:space:]]/{p;q;}' "$tmp" | /usr/bin/tr '|' ' ')
        elif [ "$rc" -ge 128 ]; then
            # Found but killed at the time limit: a freshly installed tool can take over 10 seconds on its first run.
            ver='installed (first run is slow)'
        fi
    fi
    if [ -n "$ver" ]; then
        echo "TOOL|$id|ok|$ver"
    else
        echo "TOOL|$id|missing|"
        missing=$((missing + 1))
    fi
done <<LIST
$list
LIST

if [ "$missing" -eq 0 ]; then echo "TOOLCHAIN|ok"; exit 0; fi
echo "TOOLCHAIN|missing|$missing"
exit 1
