#!/bin/sh
# silent_s12.mp4 + mix.wav (0-60.5 s) -> animatic_s1-2.mp4 (1080p master) + storyboard/animatic_s1-2.mp4 (720p web)
cd "$(dirname "$0")"
ffmpeg -v error -y -i silent_s12.mp4 -ss 0 -t 60.5 -i mix.wav -map 0:v -map 1:a -af "afade=t=out:st=59.3:d=1.2" -vf "fade=t=out:st=59.9:d=0.6:color=0xFBF9F4" -c:v libx264 -preset slow -b:v 18M -minrate 16M -maxrate 20M -bufsize 36M -x264-params nal-hrd=vbr -pix_fmt yuv420p -c:a aac -b:a 320k -ar 48000 -movflags +faststart animatic_s1-2.mp4
ffmpeg -v error -y -i animatic_s1-2.mp4 -vf scale=1280:-2 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 160k -movflags +faststart storyboard/animatic_s1-2.mp4
ls -la animatic_s1-2.mp4 storyboard/animatic_s1-2.mp4
