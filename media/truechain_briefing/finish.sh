#!/bin/sh
# Delivery encodes. master: silent_master.mp4 + mix.wav ; social: silent_social.mp4 + social_mix.wav
cd "$(dirname "$0")"; mkdir -p deliver
V="-c:v libx264 -preset slow -pix_fmt yuv420p -profile:v high -r 30 -b:v 18M -minrate 16M -maxrate 20M -bufsize 20M -x264-params nal-hrd=vbr:force-cfr=1"
A="-c:a aac -b:a 320k -ar 48000 -ac 2"
[ -f silent_master.mp4 ] && ffmpeg -v error -y -i silent_master.mp4 -i mix.wav -map 0:v -map 1:a $V $A -shortest -movflags +faststart deliver/TrueChain_Briefing_Master_1080p.mp4
[ -f silent_social.mp4 ] && ffmpeg -v error -y -i silent_social.mp4 -i social_mix.wav -map 0:v -map 1:a $V $A -shortest -movflags +faststart deliver/TrueChain_Briefing_Social_1x1.mp4
cp captions.srt deliver/TrueChain_Briefing_Master.srt; cp social_captions.srt deliver/TrueChain_Briefing_Social_1x1.srt; cp TrueChain_briefing_thumbnail.png deliver/TrueChain_Briefing_Thumbnail_1080p.png
ls -la deliver
