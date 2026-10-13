#!/bin/sh
# Usage: mix.sh SILENT_VIDEO VOICE_AUDIO MUSIC_WAV OUT.mp4
ffmpeg -v error -y -i "$1" -i "$2" -i "$3" -filter_complex "[1:a]aresample=44100,highpass=f=70,acompressor=threshold=-18dB:ratio=3,volume=1.6,asplit=2[vo1][vo2];[2:a]volume=0.13[m];[m][vo1]sidechaincompress=threshold=0.05:ratio=4:release=400[md];[md][vo2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k "$4"
