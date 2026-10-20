"""Mix VO + music + SFX for the TrueChain briefing.

python3 mix.py [music_gain_db] [sfx_gain_db]  ->  mix.wav (48 kHz stereo, -16 LUFS integrated, -1 dBTP), stems/*.wav, loudness report
VO: high-pass, light de-ess, gentle compression, no reverb. Music ducks ~9 dB under the voice.
"""
import subprocess, sys, json, re, os
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE); os.makedirs("stems", exist_ok=True)
MG = float(sys.argv[1]) if len(sys.argv) > 1 else -17.0
SG = float(sys.argv[2]) if len(sys.argv) > 2 else -10.0
P = sys.argv[3] if len(sys.argv) > 3 else ""   # "social_" mixes the social cut

def ff(*a): subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True)

def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(r[r.rindex("{"):r.rindex("}") + 1]); return j

# stems
ff("-i", f"{P}vo.wav", "-af", "aresample=48000,highpass=f=80,deesser=i=0.35,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=1,pan=stereo|c0=c0|c1=c0", f"stems/{P}vo.wav")
ff("-i", f"{P}music.wav", "-i", f"stems/{P}vo.wav", "-filter_complex",
   f"[0:a]volume={MG}dB[m];[1:a]volume=1.0[sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=600:knee=4[md]", "-map", "[md]", f"stems/{P}music_ducked.wav")
ff("-i", f"{P}sfx.wav", "-af", f"volume={SG}dB", f"stems/{P}sfx.wav")
ff("-i", f"stems/{P}vo.wav", "-i", f"stems/{P}music_ducked.wav", "-i", f"stems/{P}sfx.wav", "-filter_complex", "amix=inputs=3:normalize=0:duration=first", f"stems/{P}sum.wav")
m = lufs(f"stems/{P}sum.wav")
gain = -16.0 - float(m["input_i"])
ff("-i", f"stems/{P}sum.wav", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.85:level=false:attack=3:release=60", "-ar", "48000", f"{P}mix.wav")
out = lufs(f"{P}mix.wav")
# music level under the voice after the same master gain
ff("-i", f"stems/{P}music_ducked.wav", "-af", f"volume={gain:.2f}dB", "stems/_mref.wav"); mu = lufs("stems/_mref.wav")
ff("-i", f"stems/{P}vo.wav", "-af", f"volume={gain:.2f}dB", "stems/_vref.wav"); vo = lufs("stems/_vref.wav")
print(json.dumps({"mix_I": out["input_i"], "mix_TP": out["input_tp"], "vo_I": vo["input_i"], "music_I": mu["input_i"], "master_gain_db": round(gain, 2)}, indent=1))
