# Omnix website films (Oct 2026)

Five long-form 16:9 films for theomnix.org, replacing the NotebookLM versions.

| File | Length | Page |
| --- | --- | --- |
| Omnix_OmniChain_and_Nishq.mp4 | 6:22 | OmniChain |
| Omnix_ALKI.mp4 | 5:10 | A.L.K.I. |
| Omnix_OmniBot.mp4 | 4:33 | OmniBot |
| Omnix_Full_Stack.mp4 | 4:59 | Homepage |
| Omnix_Beyond_Imagination.mp4 | 4:37 | About Us |

Masters: 1920x1080, 30 fps, H.264, AAC 48 kHz, -16 LUFS. `share/` holds smaller copies.

Each `fN_*/draft.json` is the script (scene, highlighted words, narration lines).
Pipeline: Speko voice per segment (voice "Alok Paul", en-IN, spoken "A.L.K.I." as "Alki") ->
`tools/longform/save_vo.sh` -> `assemble_long.py` -> `drive.py FILM sheet 6` (check) ->
`drive.py FILM video silent.mp4` -> `finish.sh FILM SEED out.mp4` (tanpura bed + mix).
Scenes live in `tools/longform/render.html`.
