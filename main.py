import os, json, requests, time, random, sqlite3, io, base64
from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
# import pyttsx3  # Changed from gTTS to pyttsx3
from gtts import gTTS  
from pydub import AudioSegment
import hashlib
# from pyupload.uploader import CatboxUploader  # For Catbox uploads
from flask import send_from_directory
from dotenv import load_dotenv
load_dotenv()

TTS_CACHE_DIR = "tts_cache"
os.makedirs(TTS_CACHE_DIR, exist_ok=True)

app = Flask(__name__)

DB_PATH = "summaries.db"
HEADERS = {"Accept": "application/vnd.github+json"}

PERSONAS = [
    "MrBeast explaining to Gen Z",
    "Lex Fridman in deep thought",
    "Elon Musk being vague and ambitious",
    "A TED Talk speaker hyped on coffee",
    "An edgy tech YouTuber",
    "A chill indie hacker on Twitter",
    "Mark Zuckerberg pretending to be human",
    "An overenthusiastic coding bootcamp instructor",
    "An AI influencer trying to go viral",
    "A hacker at DEFCON with 3 energy drinks in"
]

import re

def clean_for_tts(text):
    # remove stuff in brackets like (laughs), [shrugs], etc
    text = re.sub(r'\([^)]*\)', '', text)
    text = re.sub(r'\[[^]]*\]', '', text)
    
    # remove emojis and symbols that gTTS will choke on
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "]+", flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)

    # remove stray asterisks, musical notes, stars, etc
    text = re.sub(r'[*•♪★☆→←⇒…—–]', '', text)

    # condense multiple spaces and keep punctuation
    text = re.sub(r'\s+', ' ', text).strip()

    return text


# def load_settings():
#     try:
#         return json.load(open("settings.json"))
#     except:
#         raise RuntimeError("❌ missing `settings.json` or it's broken")

# def configure_genai(settings):
#     key = settings.get("gemini_api_key")
#     if not key:
#         raise RuntimeError("❌ missing `gemini_api_key` in settings.json")
#     genai.configure(api_key=key)
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key)

def init_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS summaries (
            id TEXT PRIMARY KEY,
            repo_url TEXT UNIQUE,
            summary TEXT,
            audio_url TEXT,
            stars INTEGER
        )
    """)
    conn.commit()
    return conn

def get_user_repos(username, max_repos=10):
    url = f"https://api.github.com/users/{username}/repos"
    res = requests.get(url, params={"per_page": max_repos, "sort": "stars"}, headers=HEADERS)
    if res.status_code != 200:
        raise Exception(f"GitHub API error: {res.status_code}")
    
    # Return repos with star count, sorted by stars (descending)
    repos = sorted(res.json(), key=lambda x: x['stargazers_count'], reverse=True)
    return [(repo["html_url"], repo["stargazers_count"]) for repo in repos[:max_repos]]

def get_user_followers(username, max_followers=3):
    url = f"https://api.github.com/users/{username}/followers"
    res = requests.get(url, params={"per_page": max_followers}, headers=HEADERS)
    if res.status_code != 200:
        print(f"Warning: Couldn't fetch followers for {username}. Error: {res.status_code}")
        return []
    
    followers = res.json()
    random.shuffle(followers)  # Randomize follower selection
    return [follower['login'] for follower in followers[:max_followers]]

def fetch_readme(repo_url):
    owner_repo = repo_url.strip("/").split("github.com/")[-1]
    for branch in ["main", "master"]:
        for name in ["README.md", "Readme.md", "readme.md"]:
            raw_url = f"https://raw.githubusercontent.com/{owner_repo}/{branch}/{name}"
            r = requests.get(raw_url)
            if r.status_code == 200:
                return r.text
    return None

def summarize_text(text, repo_url):
    model = genai.GenerativeModel("gemini-1.5-flash")
    persona = random.choice(PERSONAS)
    prompt = f"You're acting as: {persona}.\nSummarize this GitHub project's README in under 700 charactes and talk about the purpose not the code in that voice:\n\n{text[:5000]}"
    try:
        resp = model.generate_content(prompt)
        summary = resp.text.strip()
        
        # Generate speech version with repo info included
        speech_text = clean_for_tts(f"Repository {repo_url.split('/')[-1]}. {summary}")
        audio_url = generate_tts_audio(speech_text, repo_url)
        
        return {
            "text": summary,
            "audio_url": audio_url
        }
    except Exception as e:
        return {
            "text": f"[error] {e}",
            "audio_url": None
        }
    
def generate_id(conn):
    c = conn.cursor()
    while True:
        _id = str(random.randint(10000, 99999))
        c.execute("SELECT 1 FROM summaries WHERE id=?", (_id,))
        if not c.fetchone():
            return _id

def save_to_db(conn, repo_url, summary_data, stars):
    c = conn.cursor()
    c.execute("SELECT summary, audio_url FROM summaries WHERE repo_url = ?", (repo_url,))
    existing = c.fetchone()
    if existing:
        return existing  # return old summary if exists
    
    _id = generate_id(conn)
    c.execute("INSERT INTO summaries (id, repo_url, summary, audio_url, stars) VALUES (?, ?, ?, ?, ?)", 
              (_id, repo_url, summary_data['text'], summary_data['audio_url'], stars))
    conn.commit()
    return (summary_data['text'], summary_data['audio_url'])
import random

def generate_tts_audio(text, repo_url):
    """Generate TTS audio using gTTS and store locally"""

    # unique hash for caching
    hash_str = hashlib.md5((text + repo_url).encode()).hexdigest()
    mp3_path = os.path.join(TTS_CACHE_DIR, f"{hash_str}.mp3")
    web_path = f"/audio/{hash_str}.mp3"

    if os.path.exists(mp3_path):
        return web_path

    # accent = either english dialect or foreign lang reading english
    accent_pool = [
        ('en', 'com'),       # default US
        ('en', 'co.uk'),     # british
        ('en', 'com.au'),    # aussie
        ('en', 'co.in'),     # indian
        ('de', 'com'),       # german accent
        ('fr', 'com'),       # french accent
        ('it', 'com'),       # italian accent
        ('es', 'com'),       # spanish accent
        ('ru', 'com'),       # russian accent
        ('nl', 'com'),       # dutch accent
    ]
    lang, tld = random.choice(accent_pool)

    try:
        tts = gTTS(text=text, lang=lang, tld=tld, slow=False)
        tts.save(mp3_path)

        # optional: speed tweak
        sound = AudioSegment.from_file(mp3_path)
        faster = sound.speedup(playback_speed=1.26)
        faster.export(mp3_path, format="mp3")

        return web_path

    except Exception as e:
        print(f"TTS generation failed: {e}")
        return None


# Add this route to serve audio files
@app.route('/audio/<filename>')
def serve_audio(filename):
    try:
        return send_from_directory(TTS_CACHE_DIR, filename)
    except FileNotFoundError:
        return "Audio file not found", 404

@app.route("/summarize", methods=["POST"])
def summarize_top_repos():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"error": "missing username"}), 400

    try:
        # Get user's top repos (sorted by stars)
        user_repos = get_user_repos(username, max_repos=5)  # Get fewer from main user
        
        # Get 3 random followers and their top repos
        followers = get_user_followers(username)
        follower_repos = []
        for follower in followers:
            try:
                follower_repos.extend(get_user_repos(follower, max_repos=1))  # Get 1 top repo per follower
            except Exception as e:
                print(f"Couldn't get repos for follower {follower}: {e}")
        
        # Combine all repos and sort by stars (descending)
        all_repos = user_repos + follower_repos
        all_repos.sort(key=lambda x: x[1], reverse=True)  # Sort by star count
        
        results = []
        for repo_url, stars in all_repos[:10]:  # Limit to top 10 by stars
            readme = fetch_readme(repo_url)
            if readme:
                print(">> summarizing:", repo_url)
                summary_data = summarize_text(readme, repo_url)
                print(">> summary response:", summary_data['text'][:100])

                saved_text, saved_audio = save_to_db(conn, repo_url, summary_data, stars)
                results.append({
                    "repo": repo_url, 
                    "summary": saved_text,
                    "audio_url": saved_audio,
                    "stars": stars
                })
                time.sleep(1)  # respect API & rate limits
        
        return jsonify({"username": username, "summaries": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_summaries", methods=["GET"])
def get_all_summaries():
    c = conn.cursor()
    c.execute("SELECT id, repo_url, summary, audio_url, stars FROM summaries ORDER BY stars DESC LIMIT 10")
    all_rows = c.fetchall()

    if not all_rows:
        return jsonify({"summaries": []}), 200

    data = [{
        "repo": row[1], 
        "summary": row[2],
        "audio_url": row[3],
        "stars": row[4]
    } for row in all_rows]
    return jsonify({"summaries": data}), 200

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    conn = init_db()
    app.run(debug=True, port=5050)