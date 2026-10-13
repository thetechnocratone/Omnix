#!/bin/sh
# Usage: finish.sh FILM_DIR SEED OUT.mp4  -> music + mix
d=$1; seed=$2; out=$3
T=$(python3 -c "import json;print(json.load(open('$d/episode.json'))['endStart']+8.5)")
python3 tools/brief_reel/music.py $d/music.wav $T $seed
ffmpeg -v error -y -i $d/silent.mp4 -i $d/vo.wav -i $d/music.wav -filter_complex "[1:a]aresample=48000,highpass=f=70,acompressor=threshold=-18dB:ratio=3,volume=1.6,apad,asplit=2[vo1][vo2];[2:a]aresample=48000,volume=0.12[m];[m][vo1]sidechaincompress=threshold=0.05:ratio=4:release=500[md];[md][vo2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5,aresample=48000[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest $out
echo done $out
