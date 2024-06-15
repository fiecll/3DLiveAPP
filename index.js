import { Player } from "textalive-app-api";
import * as THREE from 'three';

// TextAlive Playerオブジェクトを作成
const player = new Player({
  app: {
    token: "rR1JoTmnx0KeK0Wn",
  },
  mediaElement: document.createElement("audio"),
});

const playButton = document.getElementById("playButton");
const lyricsContainer = document.getElementById("lyrics");

let currentChar = null;

// Three.jsのセットアップ
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const canvasContainer = document.getElementById("canvas-container");
renderer.setSize(window.innerWidth, window.innerHeight / 2);
canvasContainer.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const animate = function () {
  requestAnimationFrame(animate);

  if (player.isPlaying) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
};

animate();

// 楽曲が読み込まれたら、ボタンを有効にする
player.addListener({
  onAppReady: (app) => {
    if (!app.managed) {
      player.createFromSongUrl("https://piapro.jp/t/YW_d/20210206123357");
    }
  },
  onVideoReady: (v) => {
    playButton.disabled = false;
  },
  onTimeUpdate: (position) => {
    if (player.video) {
      const now = player.timer.position;
      const char = player.video.findChar(now);
      if (char && char !== currentChar) {
        currentChar = char;
        const text = char.parent.text;
        const ruby = char.parent.parent.ruby;
        lyricsContainer.innerHTML = ruby ? ruby.text : text;
      }
    }
  }
});

// ボタンをクリックしたときに音楽を再生
playButton.addEventListener("click", () => {
  if (player) {
    if (player.isPlaying) {
      player.requestPause();
      playButton.textContent = "再生";
    } else {
      player.requestPlay();
      playButton.textContent = "一時停止";
    }
  }
});

// ウィンドウリサイズ時にレンダラーとカメラの調整
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight / 2;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
