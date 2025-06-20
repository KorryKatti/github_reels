# import pyttsx3

# engine = pyttsx3.init()
# engine.setProperty('rate', 150)

# text = "there is a concept they verse , 20 million other white rappers emerge but no matter how many fish in the sea it be so empty without me"

# engine.say(text)
# engine.runAndWait()
# engine.stop()  # forcefully clear the queue, close the engine

from gtts import gTTS
from pydub import AudioSegment
import os

# === config ===
text = "The quick brown fox jumps over the lazy dog."
lang = 'ru'  # force german TTS
filename = "german_accent_test.mp3"

# === generate and save ===
tts = gTTS(text=text, lang=lang, slow=False)
tts.save(filename)

# optional: play it (requires ffplay or some player)
sound = AudioSegment.from_file(filename)
sound.export(filename, format="mp3")
print(f"done. saved as {filename}")
