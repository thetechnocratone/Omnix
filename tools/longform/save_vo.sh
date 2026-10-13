#!/bin/sh
# Usage: save_vo.sh FILM_DIR TOOL_RESULT_FILE... (in segment order) -> FILM_DIR/vo_segs/000.wav ...
d=$1; shift; mkdir -p "$d/vo_segs"; i=0
for f in "$@"; do jq -r .audio_base64 "$f" | base64 -d > "$d/vo_segs/$(printf %03d $i).wav"; i=$((i+1)); done
echo "$i clips saved"
