"""Mix VO + music + SFX for the TrueChain briefing.

python3 mix.py [music_gain_db] [sfx_gain_db]  ->  mix.wav (48 kHz stereo, -16 LUFS integrated, -1 dBTP), stems/*.wav, loudness report
VO: high-pass, light de-ess, gentle compression, no reverb. Music ducks ~9 dB under the voice.
"""
import subprocess, sys, json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE); os.makedirs("stems", exist_ok=True)
MG = float(sys.argv[1]) if len(sys.argv) > 1 else -17.0
SG = float(sys.argv[2]) if len(sys.argv) > 2 else -10.0

def ff(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)

def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex("{"):r.rindex("}") + 1]); return j

# stems
ff("-i", "vo.wav", "-af", "aresample=48000,highpass=f=80,deesser=i=0.35,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=1,pan=stereo|c0=c0|c1=c0", "stems/vo.wav")
ff("-i", "music.wav", "-i", "stems/vo.wav", "-filter_complex",
   f"[0:a]volume={MG}dB[m];[1:a]volume=1.0[sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600:knee=4[md]", "-map", "[md]", "stems/music_ducked.wav")
ff("-i", "sfx.wav", "-af", f"volume={SG}dB", "stems/sfx.wav")
ff("-i", "stems/vo.wav", "-i", "stems/music_ducked.wav", "-i", "stems/sfx.wav", "-filter_complex", "amix=inputs=3:normalize=0:duration=first", "stems/sum.wav")
m = lufs("stems/sum.wav")
gain = -16.0 - float(m["input_i"])
ff("-i", "stems/sum.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.85:level=false:attack=3:release=60", "-ar", "48000", "mix.wav")
out = lufs("mix.wav")
# music level under the voice after the same master gain
ff("-i", "stems/music_ducked.wav", "-af", f"volume={gain:.2f}dB", "stems/_mref.wav"); mu = lufs("stems/_mref.wav")
ff("-i", "stems/vo.wav", "-af", f"volume={gain:.2f}dB", "stems/_vref.wav"); vo = lufs("stems/_vref.wav")
print(json.dumps({"mix_I": out["input_i"], "mix_TP": out["input_tp"], "vo_I": vo["input_i"], "music_I": mu["input_i"], "master_gain_db": round(gain, 2)}, indent=1))
