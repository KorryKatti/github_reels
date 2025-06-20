// Audio management system
    let currentAudio = null;
    let currentBackgroundAudio = null;
    const audioElements = new Map();
    const backgroundAudioElements = new Map();
    const BACKGROUND_VOLUME = 0.3;
    const reelBackgroundMap = new Map();

    // Initialize audio context
    let audioContext;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported');
    }

    // DOM elements
    const welcomeModal = document.getElementById('welcomeModal');
    const startButton = document.getElementById('startButton');
    const audioError = document.getElementById('audioError');

    // Initialize app after user interaction
    startButton.addEventListener('click', () => {
      welcomeModal.style.display = 'none';
      loadSummaries();
    });

    function playBackgroundMusic(reelId) {
      // Stop any existing background audio
      if (currentBackgroundAudio) {
        currentBackgroundAudio.pause();
        currentBackgroundAudio.currentTime = 0;
      }
      
      // Get the assigned background track for this reel
      const bgUrl = reelBackgroundMap.get(reelId);
      if (!bgUrl) return;
      
      try {
        if (!backgroundAudioElements.has(bgUrl)) {
          const bgAudio = new Audio(bgUrl);
          bgAudio.preload = 'auto';
          bgAudio.volume = BACKGROUND_VOLUME;
          bgAudio.loop = true;
          bgAudio.addEventListener('error', (e) => {
            console.error('Background audio error:', e);
          });
          backgroundAudioElements.set(bgUrl, bgAudio);
        }
        
        currentBackgroundAudio = backgroundAudioElements.get(bgUrl);
        currentBackgroundAudio.play().catch(e => console.error('Background play failed:', e));
      } catch (e) {
        console.error('Background audio error:', e);
      }
    }

    function playAudio(url, reelId) {
      stopAudio();
      
      try {
        // Play the specific background music for this reel
        if (reelId) {
          playBackgroundMusic(reelId);
          document.getElementById('nowPlayingHUD').style.display = 'block';
document.getElementById('nowPlayingLabel').textContent = url.split('/').pop();

        }
        
        if (!audioElements.has(url)) {
          const audio = new Audio(url);
          audio.preload = 'auto';
          audio.addEventListener('error', handleAudioError);
          audioElements.set(url, audio);
        }
        
        currentAudio = audioElements.get(url);
        currentAudio.play().catch(handleAudioError);
      } catch (e) {
        handleAudioError(e);
      }
    }

    function stopAudio() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    function stopAllAudio() {
      stopAudio();
      if (currentBackgroundAudio) {
        currentBackgroundAudio.pause();
        currentBackgroundAudio.currentTime = 0;
        currentBackgroundAudio = null;
        document.getElementById('nowPlayingHUD').style.display = 'none';

      }
    }

    function handleAudioError(error) {
      console.error('Audio error:', error);
      audioError.textContent = 'Audio playback failed';
      audioError.style.display = 'block';
      setTimeout(() => audioError.style.display = 'none', 3000);
    }

    function handleReelFocus() {
      const reels = document.querySelectorAll('.reel');
      const vh = window.innerHeight;
      const threshold = vh * 0.3;
      
      for (const reel of reels) {
        const rect = reel.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= threshold) {
          const audioUrl = reel.dataset.audioUrl;
          const reelId = reel.id;
          if (audioUrl) {
            playAudio(audioUrl, reelId);
          }
          break;
        }
      }
    }

    // Scroll handling with snap
    let isScrolling;
    window.addEventListener('scroll', () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        const rem = y % vh;
        const down = rem > vh * 0.25;
        const sn = (Math.floor(y / vh) + (down ? 1 : 0)) * vh;
        window.scrollTo({ top: sn, behavior: 'smooth' });
        handleReelFocus();
      }, 50);
    });

    async function loadSummaries() {
      const reelsContainer = document.getElementById('reels');
      reelsContainer.innerHTML = '<div class="loading">loading deluxe maths... 🌀</div>';
      const accentColors = ['#58a6ff', '#f7768e', '#bb9af7', '#7dcfff', '#e0af68'];


      
      try {
        const response = await fetch('/get_summaries');
        if (!response.ok) throw new Error('Failed to load data');
        
        const data = await response.json();
        reelsContainer.innerHTML = '';
        
        if (data.summaries.length === 0) {
          reelsContainer.innerHTML = '<div class="loading">No summaries found. Add a GitHub user to begin.</div>';
          return;
        }
        
        
        data.summaries.forEach((item, index) => {
          const url = new URL(item.repo);
          const pathParts = url.pathname.split('/').filter(Boolean);
          const username = pathParts[0];
          const repoName = pathParts[1];
          
          const reel = document.createElement('div');
          if (index === 0) reel.classList.add('hero-reel');

          reel.className = 'reel';
          reel.id = `reel-${index}`;
          reel.dataset.audioUrl = item.audio_url || '';
          
          
          // Assign a unique random background track to this reel
          const randomTrack = Math.floor(Math.random() * 10) + 1;
          const bgUrl = `/static/${randomTrack}.mp3`;
          reelBackgroundMap.set(reel.id, bgUrl);
          
          const canvas = document.createElement('canvas');
          canvas.id = `reel-canvas-${index}`;
          
          const caption = document.createElement('div');
          caption.className = 'caption';
          const accent = accentColors[index % accentColors.length];
reel.style.setProperty('--accent-color', accent);
caption.style.borderLeft = `4px solid ${accent}`;
          const mockStars = Math.floor(Math.random() * 200);
const mockForks = Math.floor(Math.random() * 50);
const badgePool = ['📐 mathcore', '🧠 ai-generated', '🎶 bgm certified', '☕ low-budget', '🌐 web3-free'];
const randomBadge = badgePool[Math.floor(Math.random() * badgePool.length)];

caption.innerHTML = `
  <div class="repo-info">
    <a href="${item.repo}" target="_blank" style="color:#58a6ff;text-decoration:none">
      ${username}/${repoName}
    </a>
  </div>
  <div style="margin: 0.5rem 0;">${item.summary}</div>
  <div style="font-size: 0.85rem; color: #8b949e;">
    ⭐ ${mockStars} &nbsp;&nbsp; 🍴 ${mockForks} &nbsp;&nbsp; 🏷️ ${randomBadge}
  </div>
`;

          
          const audioControls = document.createElement('div');
          audioControls.className = 'audio-controls';
          if (item.audio_url) {
            audioControls.innerHTML = `
              <button onclick="playAudio('${item.audio_url}', '${reel.id}')" title="Play Summary">
                ▶️
              </button>
              <button onclick="stopAllAudio()" title="Stop All Audio">
                ⏹️
              </button>
            `;
          }
          
          reel.append(canvas, caption, audioControls);
          reelsContainer.appendChild(reel);
          
          const animations = getAnimations();
          const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
          randomAnimation(canvas);
        });
        
        setTimeout(handleReelFocus, 500);
      } catch (error) {
        console.error('Error loading summaries:', error);
        reelsContainer.innerHTML = `
          <div class="loading">
            Error loading data: ${error.message}<br>
            <button onclick="loadSummaries()">Retry</button>
          </div>
        `;
      }
    }

    function summarizeUser() {
      const username = document.getElementById('usernameInput').value.trim();
      if (!username) {
        alert("Please enter a GitHub username");
        return;
      }
      
      fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
      })
      .then(response => {
        if (response.ok) {
          alert(`Successfully added ${username}'s repositories`);
          loadSummaries();
        } else {
          return response.json().then(err => {
            throw new Error(err.error || 'Failed to summarize user');
          });
        }
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
      });
    }