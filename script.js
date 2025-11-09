class App {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100000);

    this.scene;
    this.renderer;

    this.spheres = [];

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.init();
    this.animate();
  }
  init() {
    this.camera.position.z = 10;
    this.camera.position.x = -10;

    const path =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1147877/winter-hdri_";
    const format = ".png";
    const order = ["px", "nx", "py", "ny", "pz", "nz"];
    const urls = [];
    order.forEach(side => {
      urls.push(`${path}${side}${format}`);
    });
    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;

    this.scene = new THREE.Scene();
    this.scene.background = textureCube;

    const sphereGeometry = new THREE.SphereBufferGeometry(5, 16, 16);
    const icosaGeometry = new THREE.IcosahedronBufferGeometry(7);
    const shader = {
      uniforms: {
        mRefractionRatio: { value: 1.02 },
        mFresnelBias: { value: 0.1 },
        mFresnelPower: { value: 2.0 },
        mFresnelScale: { value: 1.0 },
        tCube: { value: null } },

      vertexShader: document.querySelector("#shader-vertex").textContent,
      fragmentShader: document.querySelector("#shader-fragment").textContent };

    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms["tCube"].value = textureCube;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader });


    const bigMesh = new THREE.Mesh(sphereGeometry, material);

    this.scene.add(bigMesh);
    this.spheres.push(bigMesh);

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(icosaGeometry, material);
      mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.1;
      this.scene.add(mesh);
      this.spheres.push(mesh);
    }

    this.scene.matrixAutoUpdate = false;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.onWindowResize, false);
  }
  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.render();
  }
  render() {
    const timer = 0.001 * Date.now();
    this.camera.lookAt(this.scene.position);
    this.camera.position.x = Math.sin(timer / 3) * -20;
    this.camera.position.z = Math.cos(timer / 3) * 20;
    let angle = 0;
    const step = 2 * Math.PI / 10;
    for (let i = 0; i < this.spheres.length; i++) {
      const sphere = this.spheres[i];
      if (i > 0) {
        sphere.position.y = Math.sin(timer + angle) * Math.cos(timer);
        sphere.position.x = Math.cos(timer + angle) * 10;
        sphere.position.z = Math.sin(timer + angle) * 10;
      } else {
        sphere.rotation.x = Math.cos(timer * -1);
        sphere.rotation.y = Math.sin(timer * -1);
      }
      angle += step;
    }
    this.renderer.render(this.scene, this.camera);
  }}

new App();