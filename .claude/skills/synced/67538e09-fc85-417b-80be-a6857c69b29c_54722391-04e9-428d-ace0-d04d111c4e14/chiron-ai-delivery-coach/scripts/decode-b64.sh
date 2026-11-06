#!/bin/sh
# decode-b64.sh <input-file> <output-file>: turns the Drive tool's base64 reply into the real file.
# The input may be the bare base64 text or the tool's JSON reply with a "content" field. Prints DECODE|ok|<bytes> or DECODE|failed.
in="$1"; out="$2"
[ -f "$in" ] && [ -n "$out" ] || { echo "DECODE|failed|usage"; exit 2; }
first=$(/usr/bin/head -c 1 "$in")
if [ "$first" = "{" ]; then
    /usr/bin/sed -n 's/.*"content"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$in" | /usr/bin/tr -d '\r\n \\' | /usr/bin/base64 -D > "$out" 2>/dev/null
else
    /usr/bin/tr -d '\r\n "' < "$in" | /usr/bin/base64 -D > "$out" 2>/dev/null
fi
[ -s "$out" ] || { echo "DECODE|failed|empty"; exit 1; }
echo "DECODE|ok|$(/usr/bin/wc -c < "$out" | /usr/bin/tr -d ' ')"
