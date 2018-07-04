$(function () {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    initListener();
    initStats();
    initGUI();
    animate();
});

var controls = new function () {
    this.飞机螺旋桨速度 = 0.25;
    this.背景云朵速度 = 0.01;
    this.光源强度 = 0.9;
    //......
};

//渲染器
var renderer;
var width, height;
function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
        // 在 css 中设置背景色透明显示渐变色
        alpha: true,
        // 开启抗锯齿，但这样会降低性能。
        antialias: true
    });
    // 打开渲染器的阴影地图
    renderer.shadowMap.enabled = true;
    //设置像素比例
    renderer.setPixelRatio(window.devicePixelRatio);
    // 定义渲染器的尺寸；在这里它会填满整个屏幕
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

//相机
var camera;
function initCamera() {
    aspectRatio = width / height;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;

    /**
     * PerspectiveCamera 透视相机
     * @param fieldOfView 视角
     * @param aspectRatio 纵横比
     * @param nearPlane 近平面
     * @param farPlane 远平面
     */
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 200;
}

//场景
var scene;
function initScene() {
    scene = new THREE.Scene();
    // 在场景中添加雾的效果；样式上使用和背景一样的颜色
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
}

//光照
var hemisphereLight, directionalLight, ambientLight;
function initLight() {
    // 渐变的半球光；
    // 第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, controls.光源强度);
    scene.add(hemisphereLight);

    // 从一个特定的方向的照射的平行光
    // 第一个参数是关系颜色，第二个参数是光源强度
    directionalLight = new THREE.DirectionalLight(0xffffff, controls.光源强度);
    //设置光源方向
    directionalLight.position.set(150, 350, 350);
    //开启光源阴影
    directionalLight.castShadow = true;
    //定义可见区域的投射阴影
    directionalLight.shadow.camera.left = -400;
    directionalLight.shadow.camera.right = 400;
    directionalLight.shadow.camera.top = 400;
    directionalLight.shadow.camera.bottom = -400;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 1000;
    //定义阴影分辨率
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    //添加环境光，设置颜色、光源强度
    ambientLight = new THREE.AmbientLight(0xdc8874, controls.光源强度*0.6);
    scene.add(ambientLight);
}

//自定义物体
var sea;
var sky;
var airPlane;
function initObject() {
    //建造大海
    sea = new Sea();
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);

    //建造天空
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);

    //建造飞机
    airPlane = new AirPlane();
    airPlane.mesh.scale.set(0.25, 0.25, 0.25);
    airPlane.mesh.position.y = 100;
    scene.add(airPlane.mesh);

}

//动画
function animate() {
    render();
    requestAnimationFrame(animate);

    stats.update();
}

//渲染
function render() {
    updateLight();
    updateAirPlane();
    airPlane.pilot.updateHairs();
    updateCameraFov();
    sea.moveWaves();
    sky.mesh.rotation.z += controls.背景云朵速度;
    renderer.render(scene, camera);
}

function updateLight(){
    hemisphereLight.intensity = controls.光源强度;
    directionalLight.intensity = controls.光源强度;
    ambientLight.intensity = controls.光源强度*0.6;
}

function updateAirPlane(){
    var x = normalize(mouseX, -0.75, 0.75, -100, 100);
    var y = normalize(mouseY, -0.75, 0.75, 25, 175);

    airPlane.mesh.position.y += (y - airPlane.mesh.position.y)*0.1;
    airPlane.mesh.rotation.z = (y - airPlane.mesh.position.y)*0.0128;
    airPlane.mesh.rotation.x = (airPlane.mesh.position.y - y)*0.0064;
    airPlane.propeller.rotation.x += controls.飞机螺旋桨速度;
}

function updateCameraFov(){
    camera.fov = normalize(mouseX,-1,1,50, 70);
    camera.updateProjectionMatrix();
}

function normalize(v,vmin,vmax,tmin, tmax){
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax-vmin;
    var pc = (nv-vmin)/dv;
    var dt = tmax-tmin;
    var tv = tmin + (pc*dt);
    return tv; }

//性能监听器
var stats;
function initStats() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
}

//参数调节工具
function initGUI() {
    var gui = new dat.GUI();
    gui.add(controls, '飞机螺旋桨速度', 0, 0.5);
    gui.add(controls, '背景云朵速度', 0, 0.1);
    gui.add(controls, '光源强度', 0, 1.0);
}

//监听器
function initListener() {
    // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
    window.addEventListener('resize', handleWindowResize, false);
    //监听鼠标移动
    document.addEventListener('mousemove', handleMouseMove, false);
}

function handleWindowResize() {
    // 更新渲染器的宽度和高度以及相机的纵横比
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

var mouseX = 0, mouseY = 0;
function handleMouseMove(event) {
    var clientX = -1 + (event.clientX / width) * 2;
    var clientY = 1 - (event.clientY / height) * 2;
    mouseX = clientX;
    mouseY = clientY;
}
