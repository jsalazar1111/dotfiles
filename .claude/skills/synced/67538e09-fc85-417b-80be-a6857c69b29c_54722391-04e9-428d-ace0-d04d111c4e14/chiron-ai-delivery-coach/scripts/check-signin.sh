#!/bin/sh
# Parses `claude auth status`. Prints one line: SIGNIN|ok|<email> or SIGNIN|fail|<code>.
# Codes: not-logged-in, not-subscription, wrong-org, bad-email, unexpected-fields, unreadable.
# Fields are checked in this order: loggedIn, authMethod, orgName, email. A missing field never passes.
PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"
out=$(claude auth status 2>/dev/null)

res=$(JSON_IN="$out" /usr/bin/osascript -l JavaScript -e '
ObjC.import("stdlib");
var raw = ObjC.unwrap($.getenv("JSON_IN")) || "";
var j;
try { j = JSON.parse(raw); } catch (e) { j = null; }
var r;
if (j === null || typeof j !== "object") r = "fail|unreadable";
else if (j.loggedIn === false) r = "fail|not-logged-in";
else if (j.loggedIn !== true || typeof j.authMethod !== "string" || typeof j.orgName !== "string" || typeof j.email !== "string") r = "fail|unexpected-fields";
else if (j.authMethod !== "claude.ai") r = "fail|not-subscription";
else if (j.orgName !== "Plative") r = "fail|wrong-org";
else if (!/@plative\.com$/i.test(j.email)) r = "fail|bad-email";
else r = "ok|" + j.email;
r;
' 2>/dev/null)

[ -n "$res" ] || res="fail|unreadable"
echo "SIGNIN|$res"
case "$res" in ok\|*) exit 0 ;; *) exit 1 ;; esac
