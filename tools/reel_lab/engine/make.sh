#!/bin/bash
# make.sh <episode dir relative to tools/reel_lab> <out name> [music_gain] [sfx_gain] [vo|novo]
# renders with adaptive motion blur, mixes, and writes the delivery encode beside the episode folder
cd /home/claude/omnix/tools/reel_lab
EP=$1; OUT=$2; MG=${3:-0.32}; SG=${4:-0.7}; VO=${5:-vo}
python3 engine/render.py $EP video $EP/silent.mp4 --blur 16 --workers 3 > $EP/render.log 2>&1 || exit 1
cd $EP
if [ "$VO" = vo ]; then V="'vo.wav'"; else V=None; fi
python3 -c "
import sys; sys.path.insert(0,'/home/claude/omnix/tools/reel_lab/engine')
from audio import mix
mix('silent.mp4', $V, 'music.wav', 'sfx.wav', 'mix.mp4', music_gain=$MG, sfx_gain=$SG)
" && ffmpeg -v error -y -i mix.mp4 -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart ../$OUT.mp4 && rm -f mix.mp4 && echo "DONE $OUT $(date +%T)"
