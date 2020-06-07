import 'three';
import { TweenLite } from 'gsap/TweenMax';

import InteractiveControls from './controls/InteractiveControls';
import Particles from './particles/Particles';
import samples from './../data/samples';

const glslify = require('glslify');

export default class WebGLView {
  constructor(app) {
    this.app = app;

    this.samples = samples;

    this.nameSelector = document.querySelector('[js-view="name"]');
    this.ageSelector = document.querySelector('[js-view="age"]');
    this.stateSelector = document.querySelector('[js-view="state"]');
    this.dateSelector = document.querySelector('[js-view="date"]');
    this.causeOfDeathSelector = document.querySelector(
      '[js-view="cause-of-death"]',
    );

    this.initThree();
    this.initParticles();
    this.initControls();

    const rnd = ~~(Math.random() * this.samples.length);
    this.goto(rnd);
  }

  initThree() {
    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    this.camera.position.z = 300;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    // clock
    this.clock = new THREE.Clock(true);
  }

  initControls() {
    this.interactive = new InteractiveControls(
      this.camera,
      this.renderer.domElement,
    );
  }

  initParticles() {
    this.particles = new Particles(this);
    this.scene.add(this.particles.container);
  }

  // ---------------------------------------------------------------------------------------------
  // PUBLIC
  // ---------------------------------------------------------------------------------------------

  update() {
    const delta = this.clock.getDelta();

    if (this.particles) this.particles.update(delta);
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }

  goto(index) {
    if (this.currentSample == null) {
      this.particles.init(this.samples[index].src);
      this.updateContent(index);
    } else {
      this.particles.hide(true).then(() => {
        this.particles.init(this.samples[index].src);
        this.updateContent(index);
      });
    }

    this.currentSample = index;
  }

  updateContent(index) {
    this.nameSelector.innerText = this.samples[index].body.name;
    this.ageSelector.innerText = this.samples[index].body.age;
    this.dateSelector.innerText = this.samples[index].body.date;
    this.stateSelector.innerText = this.samples[index].body.state;
    this.causeOfDeathSelector.innerText = this.samples[index].body.causeOfDeath;
  }

  next() {
    if (this.currentSample < this.samples.length - 1)
      this.goto(this.currentSample + 1);
    else this.goto(0);
  }

  // ---------------------------------------------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------------------------------------------

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight =
      2 *
      Math.tan((this.camera.fov * Math.PI) / 180 / 2) *
      this.camera.position.z;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.interactive) this.interactive.resize();
    if (this.particles) this.particles.resize();
  }
}
