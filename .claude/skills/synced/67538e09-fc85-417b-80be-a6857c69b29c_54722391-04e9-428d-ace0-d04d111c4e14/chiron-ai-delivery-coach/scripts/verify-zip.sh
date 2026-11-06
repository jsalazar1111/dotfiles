#!/bin/sh
# verify-zip.sh <zip> <expected-md5>: prints ZIP|ok or ZIP|mismatch|<actual-md5>. Exit 0 only on ok.
zip="$1"; want="$2"
actual=$(/sbin/md5 -q "$zip" 2>/dev/null)
[ -n "$actual" ] || actual=none
lw=$(echo "$want" | /usr/bin/tr 'A-F' 'a-f')
if [ "$actual" = "$lw" ]; then echo "ZIP|ok"; exit 0; fi
echo "ZIP|mismatch|$actual"
exit 1
