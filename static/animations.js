function getAnimations(){
  return [
    sinSpiral, bouncingBalls, chaosGrid, jellyBlobs, rotatingStars,
    waveLines, particleFlux, circlePulse, mandalaBloom, noiseCloud,
    fractalTree, lissajousDance, voronoiCells, phyllotaxisSpiral, 
    strangeAttractor, metaballFlow, trigonometricTiles, 
    hyperbolicTiling, diffusionLimitedAggregation, quantumWalker,auroraBorealis,electricCircuit,fibonacciSphere,
    pixelRain,oceanWaves,kaleidoscope,solarFlare,crystalGrowth,neuralNetwork,magneticField
  ];
}

// New animation functions:

function fractalTree(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  function branch(x, y, len, angle, depth) {
    if (depth > 10) return;
    
    const endX = x - len * Math.sin(angle);
    const endY = y - len * Math.cos(angle);
    
    ctx.strokeStyle = `hsl(${100 + depth * 30}, 70%, ${50 - depth * 3}%)`;
    ctx.lineWidth = depth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    const newLen = len * 0.7;
    const angleVariation = Math.sin(t/100 + depth) * 0.5;
    
    branch(endX, endY, newLen, angle - 0.3 + angleVariation, depth + 1);
    branch(endX, endY, newLen, angle + 0.3 + angleVariation, depth + 1);
  }

  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    branch(w/2, h, h/4, 0, 0);
    
    t++;
    requestAnimationFrame(f);
  })();
}

function lissajousDance(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    const a = 3 + Math.sin(t/200) * 2;
    const b = 2 + Math.cos(t/300) * 2;
    const delta = Math.PI/2;
    const size = Math.min(w, h) * 0.4;
    
    ctx.strokeStyle = `hsl(${(t/2) % 360}, 80%, 60%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < 628; i++) {
      const x = w/2 + Math.sin(a * i/100 + delta) * size;
      const y = h/2 + Math.sin(b * i/100) * size;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
    t++;
    requestAnimationFrame(f);
  })();
}

function voronoiCells(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight;
  
  const points = Array.from({length: 15}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));
  
  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Update points
    points.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    
    // Draw Voronoi
    const cellSize = 10;
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        let closest = points[0];
        let minDist = distance(x, y, closest.x, closest.y);
        
        for (let i = 1; i < points.length; i++) {
          const dist = distance(x, y, points[i].x, points[i].y);
          if (dist < minDist) {
            minDist = dist;
            closest = points[i];
          }
        }
        
        ctx.fillStyle = closest.color;
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
    
    // Draw points
    points.forEach(p => {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(f);
  })();
}

function phyllotaxisSpiral(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, w, w);
    
    const angle = Math.PI * (3 - Math.sqrt(5));
    const scale = 4 + Math.sin(t/100) * 2;
    
    for (let i = 0; i < 500; i++) {
      const radius = scale * Math.sqrt(i);
      const theta = i * angle + t/50;
      const x = w/2 + radius * Math.cos(theta);
      const y = h/2 + radius * Math.sin(theta);
      const size = 3 + Math.sin(t/20 + i) * 2;
      
      ctx.fillStyle = `hsl(${(i * 2 + t) % 360}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}

function strangeAttractor(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight;
  
  // Lorenz attractor parameters
  let x = 0.1, y = 0, z = 0;
  const a = 10, b = 28, c = 8/3;
  const dt = 0.01;
  
  const points = [];
  const maxPoints = 5000;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.03)';
    ctx.fillRect(0, 0, w, h);
    
    // Calculate new points
    for (let i = 0; i < 10; i++) {
      const dx = a * (y - x) * dt;
      const dy = (x * (b - z) - y) * dt;
      const dz = (x * y - c * z) * dt;
      
      x += dx;
      y += dy;
      z += dz;
      
      points.push({
        x: x * 8 + w/2,
        y: y * 8 + h/2,
        z: z
      });
      
      if (points.length > maxPoints) points.shift();
    }
    
    // Draw points
    ctx.strokeStyle = 'hsl(200, 80%, 60%)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i-1];
      const p2 = points[i];
      
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    
    ctx.stroke();
    requestAnimationFrame(f);
  })();
}

function metaballFlow(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  const balls = Array.from({length: 5}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 30 + Math.random() * 70,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  }));
  
  function metaball(x, y) {
    let sum = 0;
    balls.forEach(b => {
      const dx = x - b.x;
      const dy = y - b.y;
      const distSq = dx * dx + dy * dy;
      sum += (b.r * b.r) / distSq;
    });
    return sum;
  }
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,1)';
    ctx.fillRect(0, 0, w, h);
    
    // Update balls
    balls.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      
      if (b.x < 0 || b.x > w) b.vx *= -1;
      if (b.y < 0 || b.y > h) b.vy *= -1;
    });
    
    // Draw metaballs
    const cellSize = 5;
    const threshold = 1;
    
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const value = metaball(x, y);
        if (value > threshold) {
          const alpha = Math.min(0.8, (value - threshold) * 0.5);
          ctx.fillStyle = `hsla(${(x + y + t) % 360}, 80%, 60%, ${alpha})`;
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}

function trigonometricTiles(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    const tileSize = 40;
    const maxDist = Math.sqrt(w*w + h*h) / 2;
    
    for (let y = 0; y < h; y += tileSize) {
      for (let x = 0; x < w; x += tileSize) {
        const dist = Math.sqrt(Math.pow(x - w/2, 2) + Math.pow(y - h/2, 2));
        const angle = Math.atan2(y - h/2, x - w/2);
        
        const size = tileSize * (0.5 + 0.5 * Math.sin(dist/50 - t/20));
        const rotation = angle + t/100 + dist/200;
        
        const hue = (dist/10 + t/5) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        
        ctx.save();
        ctx.translate(x + tileSize/2, y + tileSize/2);
        ctx.rotate(rotation);
        
        ctx.beginPath();
        ctx.moveTo(-size/2, -size/2);
        ctx.lineTo(size/2, -size/2);
        ctx.lineTo(size/2, size/2);
        ctx.lineTo(-size/2, size/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}

function hyperbolicTiling(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  function toPoincare(x, y) {
    const scale = Math.min(w, h) * 0.4;
    return { x: (x - w/2) / scale, y: (y - h/2) / scale };
  }
  
  function toScreen(x, y) {
    const scale = Math.min(w, h) * 0.4;
    return { x: x * scale + w/2, y: y * scale + h/2 };
  }
  
  function hyperbolicDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx*dx + dy*dy);
    return Math.log((1 + d) / (1 - d));
  }
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.8)';
    ctx.fillRect(0, 0, w, h);
    
    const n = 7; // Polygon sides
    const k = 3; // Number of polygons meeting at each vertex
    
    const center = toPoincare(w/2, h/2);
    const angleStep = (2 * Math.PI) / n;
    const radius = 0.5;
    
    for (let i = 0; i < n; i++) {
      const angle1 = i * angleStep + t/200;
      const angle2 = (i + 1) * angleStep + t/200;
      
      const x1 = center.x + radius * Math.cos(angle1);
      const y1 = center.y + radius * Math.sin(angle1);
      const x2 = center.x + radius * Math.cos(angle2);
      const y2 = center.y + radius * Math.sin(angle2);
      
      const p1 = toScreen(x1, y1);
      const p2 = toScreen(x2, y2);
      
      ctx.strokeStyle = `hsl(${(i * 360/n + t/5) % 360}, 80%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w/2, h/2);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.stroke();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}

function diffusionLimitedAggregation(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight;
  
  const particles = [];
  const fixedParticles = [{x: w/2, y: h/2}];
  const particleCount = 1000;
  
  // Initialize particles around the edges
  for (let i = 0; i < particleCount; i++) {
    let x, y;
    if (Math.random() < 0.25) {
      x = 0;
      y = Math.random() * h;
    } else if (Math.random() < 0.33) {
      x = w;
      y = Math.random() * h;
    } else if (Math.random() < 0.5) {
      x = Math.random() * w;
      y = 0;
    } else {
      x = Math.random() * w;
      y = h;
    }
    particles.push({x, y});
  }
  
  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx*dx + dy*dy);
  }
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, w, h);
    
    // Draw fixed particles
    fixedParticles.forEach(p => {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Move particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      
      // Random walk
      p.x += (Math.random() - 0.5) * 2;
      p.y += (Math.random() - 0.5) * 2;
      
      // Check if particle is close to any fixed particle
      for (let j = 0; j < fixedParticles.length; j++) {
        const fp = fixedParticles[j];
        if (distance(p.x, p.y, fp.x, fp.y) < 5) {
          // Add to fixed particles
          fixedParticles.push({x: p.x, y: p.y});
          // Remove from mobile particles
          particles.splice(i, 1);
          // Add new particle at edge
          if (Math.random() < 0.25) {
            particles.push({x: 0, y: Math.random() * h});
          } else if (Math.random() < 0.33) {
            particles.push({x: w, y: Math.random() * h});
          } else if (Math.random() < 0.5) {
            particles.push({x: Math.random() * w, y: 0});
          } else {
            particles.push({x: Math.random() * w, y: h});
          }
          break;
        }
      }
    }
    
    requestAnimationFrame(f);
  })();
}

function quantumWalker(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  const walkers = Array.from({length: 20}, () => ({
    x: w/2,
    y: h/2,
    history: [],
    maxHistory: 50,
    angle: Math.random() * Math.PI * 2
  }));
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, w, h);
    
    walkers.forEach(walker => {
      // Quantum-inspired random walk
      if (Math.random() < 0.1) {
        // "Measurement" causes a jump
        walker.angle = Math.random() * Math.PI * 2;
        walker.x += Math.cos(walker.angle) * 10;
        walker.y += Math.sin(walker.angle) * 10;
      } else {
        // Continuous evolution
        walker.angle += (Math.random() - 0.5) * 0.2;
        walker.x += Math.cos(walker.angle) * 2;
        walker.y += Math.sin(walker.angle) * 2;
      }
      
      // Keep within bounds
      if (walker.x < 0) walker.x = w;
      if (walker.x > w) walker.x = 0;
      if (walker.y < 0) walker.y = h;
      if (walker.y > h) walker.y = 0;
      
      // Add to history
      walker.history.push({x: walker.x, y: walker.y});
      if (walker.history.length > walker.maxHistory) {
        walker.history.shift();
      }
      
      // Draw path
      ctx.strokeStyle = `hsla(${(t + walker.history.length * 10) % 360}, 80%, 60%, 0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      walker.history.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      
      // Draw current position
      ctx.fillStyle = `hsl(${(t + walker.history.length * 10) % 360}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(walker.x, walker.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    t++;
    requestAnimationFrame(f);
  })();
}

    // 10 fancy patterns
    function sinSpiral(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.15)'; ctx.fillRect(0,0,w,h);
        for(let i=0;i<120;i++){
          const a=i*0.2+t/30, r=i*3;
          const x=w/2+Math.cos(a)*r, y=h/2+Math.sin(a*1.2)*r;
          ctx.fillStyle=`hsl(${(a*40)%360},80%,60%)`;
          ctx.beginPath(); ctx.arc(x,y,3,0,6.28); ctx.fill();
        }
        t++; requestAnimationFrame(f);
      })();
    }

    function bouncingBalls(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight;
      const balls=Array.from({length:30},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,r:5+Math.random()*15}));
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.2)'; ctx.fillRect(0,0,w,h);
        balls.forEach(b=>{
          b.x+=b.vx; b.y+=b.vy;
          if(b.x<0||b.x>w)b.vx*=-1; if(b.y<0||b.y>h)b.vy*=-1;
          ctx.fillStyle=`hsl(${(b.x+b.y+t)%360},70%,50%)`; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,6.28); ctx.fill();
        });
        requestAnimationFrame(f);
      })();
    }

    function chaosGrid(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.15)'; ctx.fillRect(0,0,w,h);
        const size=30;
        for(let x=0;x<w;x+=size)for(let y=0;y<h;y+=size){
          const dx=Math.sin((x+t)/50)*25,dy=Math.cos((y+t)/40)*25;
          ctx.fillStyle=`hsl(${(x+y+t)%360},60%,60%)`;
          ctx.beginPath(); ctx.arc(x+dx,y+dy,4,0,6.28); ctx.fill();
        }
        t++; requestAnimationFrame(f);
      })();
    }

    function jellyBlobs(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.2)'; ctx.fillRect(0,0,w,h);
        for(let i=0;i<10;i++){
          const r=40+Math.sin(t/25+i)*30;
          const x=w/2+Math.cos(t/35+i)*250;
          const y=h/2+Math.sin(t/45+i)*250;
          ctx.fillStyle=`hsl(${(i*30+t)%360},70%,70%)`;
          ctx.beginPath(); ctx.arc(x,y,r,0,6.28); ctx.fill();
        }
        t++; requestAnimationFrame(f);
      })();
    }

    function rotatingStars(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.12)'; ctx.fillRect(0,0,w,h);
        for(let i=0;i<40;i++){
          const ang=t/50+i, rad=120+Math.sin(t/80+i)*60;
          const x=w/2+Math.cos(ang)*rad, y=h/2+Math.sin(ang)*rad;
          ctx.fillStyle=`hsl(${(t+i*15)%360},85%,65%)`;
          ctx.beginPath(); ctx.moveTo(x,y);
          for(let p=0;p<5;p++){
            const dx=Math.cos(p*2*3.14/5+ang)*8;
            const dy=Math.sin(p*2*3.14/5+ang)*8;
            ctx.lineTo(x+dx,y+dy);
          }
          ctx.fill();
        }
        t++; requestAnimationFrame(f);
      })();
    }

    function waveLines(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.1)'; ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='hsl('+((t*2)%360)+',70%,60%)'; ctx.lineWidth=2;
        ctx.beginPath();
        for(let x=0;x<w;x+=10){
          const y = h/2 + Math.sin((x+t)/50)*100;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        t++; requestAnimationFrame(f);
      })();
    }

    function particleFlux(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight;
      const pts = Array.from({length:150},()=>({x:Math.random()*w,y:Math.random()*h,dx:(Math.random()-0.5)*2,dy:(Math.random()-0.5)*2}));
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.2)'; ctx.fillRect(0,0,w,h);
        pts.forEach(p=>{
          p.x+=p.dx; p.y+=p.dy;
          if(p.x<0||p.x>w)p.dx*=-1; if(p.y<0||p.y>h)p.dy*=-1;
          ctx.fillStyle='white'; ctx.fillRect(p.x,p.y,2,2);
        });
        requestAnimationFrame(f);
      })();
    }

    function circlePulse(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.3)'; ctx.fillRect(0,0,w,h);
        ctx.beginPath(); ctx.arc(w/2,h/2,50+Math.sin(t/20)*45,0,6.28);
        ctx.strokeStyle='hsl('+(t%360)+',80%,70%)'; ctx.lineWidth=5; ctx.stroke();
        t++; requestAnimationFrame(f);
      })();
    }

    function mandalaBloom(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight,t=0;
      (function f(){
        ctx.fillStyle='rgba(13,17,23,0.2)'; ctx.fillRect(0,0,w,h);
        ctx.save(); ctx.translate(w/2,h/2);
        for(let i=0;i<20;i++){
          ctx.rotate(Math.PI/10 + t/500);
          ctx.beginPath();
          ctx.moveTo(0,0);
          ctx.lineTo(100,0);
          ctx.arc(0,0,100,0,Math.PI/6);
          ctx.fillStyle=`hsla(${(i*18+t)%360},70%,60%,0.6)`;
          ctx.fill();
        }
        ctx.restore(); t++; requestAnimationFrame(f);
      })();
    }

    function noiseCloud(cv){ const ctx=cv.getContext('2d'); let w=cv.width=innerWidth,h=cv.height=innerHeight;
      const image = ctx.createImageData(w,h);
      (function f(){
        for(let i=0;i<w*h*4;i+=4){
          const v = Math.random()*255;
          image.data[i]=v; image.data[i+1]=v; image.data[i+2]=v; image.data[i+3]=50;
        }
        ctx.putImageData(image,0,0);
        requestAnimationFrame(f);
      })();
    }

    // added afer
    function auroraBorealis(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, w, h);
    
    for (let i = 0; i < 5; i++) {
      const y = h * 0.2 + i * 50 + Math.sin(t/50 + i) * 20;
      const width = w * 0.8 + Math.sin(t/70 + i) * w * 0.2;
      
      const gradient = ctx.createLinearGradient(0, y, 0, y + 100);
      gradient.addColorStop(0, `hsla(${(t + i * 50) % 360}, 80%, 60%, 0.3)`);
      gradient.addColorStop(1, `hsla(${(t + i * 50 + 30) % 360}, 80%, 60%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(w/2 - width/2, y);
      ctx.bezierCurveTo(
        w/2 - width/4, y + 50,
        w/2 + width/4, y + 50,
        w/2 + width/2, y
      );
      ctx.bezierCurveTo(
        w/2 + width/4, y + 150,
        w/2 - width/4, y + 150,
        w/2 - width/2, y
      );
      ctx.closePath();
      ctx.fill();
    }
    
    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.5;
      const size = Math.random() * 2;
      const alpha = 0.5 + Math.random() * 0.5;
      ctx.fillStyle = `hsla(60, 100%, 90%, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}

function electricCircuit(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  const nodes = Array.from({length: 10}, (_, i) => ({
    x: w/2 + Math.cos(i * Math.PI * 2/10) * 150,
    y: h/2 + Math.sin(i * Math.PI * 2/10) * 150,
    connections: [(i + 1) % 10, (i + 3) % 10]
  }));
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.2)';
    ctx.fillRect(0, 0, w, h);
    
    // Draw connections
    nodes.forEach((node, i) => {
      node.connections.forEach(conn => {
        const target = nodes[conn];
        const pulse = Math.sin(t/10 + i + conn) * 5;
        
        ctx.strokeStyle = `hsl(${(t * 2 + i * 30) % 360}, 80%, 60%)`;
        ctx.lineWidth = 2 + pulse;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });
    
    // Draw nodes
    nodes.forEach((node, i) => {
      ctx.fillStyle = `hsl(${(t * 2 + i * 30) % 360}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    
    t++;
    requestAnimationFrame(f);
  })();
}

function fibonacciSphere(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    const points = 200;
    const radius = Math.min(w, h) * 0.4;
    
    for (let i = 0; i < points; i++) {
      const y = 1 - (i / (points - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y) * radius;
      const theta = Math.PI * (3 - Math.sqrt(5)) * i + t/100;
      
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      
      // Project 3D to 2D
      const scale = 1 / (2 + z / radius);
      const px = w/2 + x * scale;
      const py = h/2 + y * radius * scale;
      
      const size = 3 + Math.sin(t/20 + i) * 2;
      ctx.fillStyle = `hsl(${(i * 360/points + t) % 360}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}
function pixelRain(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight;
  
  const pixels = Array.from({length: 1000}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    speed: 1 + Math.random() * 5,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    size: 1 + Math.random() * 3
  }));
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.2)';
    ctx.fillRect(0, 0, w, h);
    
    pixels.forEach(p => {
      p.y += p.speed;
      if (p.y > h) {
        p.y = 0;
        p.x = Math.random() * w;
      }
      
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    
    requestAnimationFrame(f);
  })();
}
function oceanWaves(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    ctx.strokeStyle = `hsl(${(t + 200) % 360}, 80%, 60%)`;
    ctx.lineWidth = 2;
    
    for (let y = h/2; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      
      for (let x = 0; x < w; x += 10) {
        const waveHeight = Math.sin((x + t) / 100 + y/50) * 15 * (1 - (y - h/2)/(h/2));
        ctx.lineTo(x, y + waveHeight);
      }
      
      ctx.stroke();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}
function kaleidoscope(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  const segments = 12;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, w);
    
    const centerX = w/2;
    const centerY = h/2;
    const radius = Math.min(w, h) * 0.4;
    
    for (let i = 0; i < segments; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * (2 * Math.PI / segments) + t/200);
      
      // Draw mirrored pattern
      for (let j = 0; j < 50; j++) {
        const x = Math.random() * radius * 0.8;
        const y = Math.random() * radius * 0.1;
        const size = 2 + Math.random() * 5;
        
        ctx.fillStyle = `hsla(${(t + i * 30 + j * 5) % 360}, 80%, 60%, 0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Mirror
        ctx.beginPath();
        ctx.arc(x, -y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}
function solarFlare(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    const centerX = w/2;
    const centerY = h/2;
    const radius = 50 + Math.sin(t/30) * 20;
    
    // Draw sun
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `hsl(${t % 360}, 100%, 80%)`);
    gradient.addColorStop(1, `hsl(${(t + 40) % 360}, 100%, 50%)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw flares
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6 + t/100;
      const flareLength = 100 + Math.sin(t/20 + i) * 50;
      const flareWidth = 10 + Math.sin(t/15 + i) * 5;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      
      const flareGradient = ctx.createLinearGradient(0, 0, flareLength, 0);
      flareGradient.addColorStop(0, `hsla(${(t + i * 30) % 360}, 100%, 70%, 0.8)`);
      flareGradient.addColorStop(1, `hsla(${(t + i * 30) % 360}, 100%, 70%, 0)`);
      ctx.fillStyle = flareGradient;
      
      ctx.beginPath();
      ctx.moveTo(0, -flareWidth/2);
      ctx.lineTo(flareLength, -flareWidth/4);
      ctx.lineTo(flareLength, flareWidth/4);
      ctx.lineTo(0, flareWidth/2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}
function crystalGrowth(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  const branches = [];
  const maxBranches = 100;
  const center = { x: w/2, y: h/2 };
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.05)';
    ctx.fillRect(0, 0, w, h);
    
    if (branches.length < maxBranches && Math.random() < 0.3) {
      branches.push({
        x: center.x,
        y: center.y,
        angle: Math.random() * Math.PI * 2,
        length: 5,
        speed: 1 + Math.random() * 2
      });
    }
    
    branches.forEach(b => {
      b.length += b.speed;
      const endX = b.x + Math.cos(b.angle) * b.length;
      const endY = b.y + Math.sin(b.angle) * b.length;
      
      ctx.strokeStyle = `hsl(${(t + b.length) % 360}, 80%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      if (Math.random() < 0.01 && branches.length < maxBranches) {
        branches.push({
          x: endX,
          y: endY,
          angle: b.angle + (Math.random() - 0.5) * 0.5,
          length: 5,
          speed: b.speed * 0.9
        });
      }
    });
    
    t++;
    requestAnimationFrame(f);
  })();
}
function neuralNetwork(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  const nodes = Array.from({length: 20}, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  }));
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      if (node.x < 0 || node.x > w) node.vx *= -1;
      if (node.y < 0 || node.y > h) node.vy *= -1;
      
      ctx.fillStyle = `hsl(${(t + node.x) % 360}, 80%, 60%)`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
          ctx.strokeStyle = `hsla(${(t + i + j) % 360}, 80%, 60%, ${1 - dist/150})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}
function magneticField(cv) {
  const ctx = cv.getContext('2d');
  let w = cv.width = innerWidth, h = cv.height = innerHeight, t = 0;
  
  (function f() {
    ctx.fillStyle = 'rgba(13,17,23,0.1)';
    ctx.fillRect(0, 0, w, h);
    
    const poles = [
      { x: w/3, y: h/2, charge: 1 },
      { x: 2*w/3, y: h/2, charge: -1 }
    ];
    
    for (let y = 0; y < h; y += 20) {
      for (let x = 0; x < w; x += 20) {
        let vx = 0, vy = 0;
        poles.forEach(p => {
          const dx = x - p.x;
          const dy = y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const force = p.charge * 1000 / (dist * dist);
          vx += dx / dist * force;
          vy += dy / dist * force;
        });
        
        const angle = Math.atan2(vy, vx);
        ctx.strokeStyle = `hsl(${(t + x + y) % 360}, 80%, 60%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15);
        ctx.stroke();
      }
    }
    
    t++;
    requestAnimationFrame(f);
  })();
}