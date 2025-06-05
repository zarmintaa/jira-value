<script lang="ts" setup>
import { onMounted, ref } from "vue";

const audio = ref<HTMLAudioElement | null>(null);

onMounted(() => {
  audio.value?.play().catch((err) => {
    console.warn("Audio failed to autoplay:", err);
  });
});
</script>

<template>
  <div class="notfound-container">
    <audio
      ref="audio"
      autoplay
      src="https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.wav"
    />
    <div class="code" data-text="404">404</div>
    <h1 class="message">YNTKS 😡</h1>
    <p class="subtext">Halaman yang kamu cari tidak ditemukan.</p>
    <router-link class="btn" to="/">Balik ke Beranda</router-link>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=VT323&display=swap");

.notfound-container {
  background:
    linear-gradient(rgba(10, 10, 10, 0.85), rgba(0, 0, 0, 0.85)),
    url("https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif") center/cover
      no-repeat;
  color: #eee;
  font-family: "VT323", monospace;
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  backdrop-filter: blur(2px);
}

.message {
  font-size: 2.3rem;
  margin: 1rem 0 0.3rem;
}

.subtext {
  font-size: 1.4rem;
  margin-bottom: 2rem;
  color: #ccc;
}

.btn {
  background-color: #fff;
  color: #000;
  padding: 0.6rem 1.4rem;
  font-weight: bold;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s;
}

.btn:hover {
  background: #000;
  color: #fff;
  border: 1px solid white;
}

/* Glitch Animasi Halus */
@keyframes glitchSoft {
  0% {
    transform: none;
  }
  33% {
    transform: skewX(-1deg);
  }
  66% {
    transform: skewX(1deg);
  }
  100% {
    transform: none;
  }
}

@keyframes glitchTop {
  0% {
    clip: rect(0, 9999px, 0, 0);
  }
  10% {
    clip: rect(0, 9999px, 10px, 0);
  }
  20% {
    clip: rect(0, 9999px, 0, 0);
  }
  30% {
    clip: rect(5px, 9999px, 15px, 0);
  }
  100% {
    clip: rect(0, 9999px, 0, 0);
  }
}

@keyframes glitchBottom {
  0% {
    clip: rect(0, 9999px, 0, 0);
  }
  10% {
    clip: rect(15px, 9999px, 25px, 0);
  }
  20% {
    clip: rect(0, 9999px, 0, 0);
  }
  30% {
    clip: rect(20px, 9999px, 30px, 0);
  }
  100% {
    clip: rect(0, 9999px, 0, 0);
  }
}

.message {
  font-size: 2.3rem;
  margin: 1rem 0 0.3rem;
  color: #ff4c4c;
  text-shadow: 1px 1px 2px #000;
  animation: pulseRed 1.5s infinite;
}

@keyframes pulseRed {
  0% {
    text-shadow: 1px 1px 2px #000;
    color: #ff4c4c;
  }
  50% {
    text-shadow: 0 0 10px #ff0000aa;
    color: #ff1a1a;
  }
  100% {
    text-shadow: 1px 1px 2px #000;
    color: #ff4c4c;
  }
}

.code {
  font-size: 6rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: #ff1a1a;
  text-shadow:
    0 0 5px #ff1a1a,
    0 0 10px #ff0000aa,
    0 0 20px #ff0000aa;
  position: relative;
  animation: glitch404 1.5s infinite;
}

@keyframes glitch404 {
  0% {
    text-shadow:
      0 0 5px #ff1a1a,
      0 0 10px #ff0000aa,
      0 0 20px #ff0000aa;
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(2px, -1px);
  }
  60% {
    transform: translate(-1px, 2px);
  }
  80% {
    transform: translate(1px, -2px);
  }
  100% {
    transform: translate(0);
  }
}
</style>
