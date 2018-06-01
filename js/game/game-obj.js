//色彩
var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
    yellow:0xf4ce93
};

//大海
Sea = function() {
    //创建一个圆柱体
    // 参数为：顶面半径，底面半径，高度，半径分段，高度分段
    var geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    //旋转圆柱体
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    //合并圆柱体顶点
    geometry.mergeVertices();

    this.waves = [];

    for (var i = 0; i < geometry.vertices.length; i++){
        var vertice = geometry.vertices[i];
        this.waves.push({
            x: vertice.x,
            y: vertice.y,
            z: vertice.z,
            ang: Math.random()*Math.PI*2, //角度
            amp: 5 + Math.random()*15, //距离
            speed: 0.016 + Math.random()*0.032 //速度（0.016~0.048度/帧）
        });
    }

    //创建Phong材质
    var material = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true, //是否透明
        opacity: 0.8, //不透明度
        flatShading: true
    });
    //组合圆柱体和材质
    this.mesh = new THREE.Mesh(geometry, material);
    //设置允许接受阴影
    this.mesh.receiveShadow = true;
}

//海浪
Sea.prototype.moveWaves = function(){
    var vertices = this.mesh.geometry.vertices;
    for (var i = 0; i < vertices.length; i++){
        var vertice = vertices[i];
        var wave = this.waves[i];

        vertice.x = wave.x + Math.cos(wave.ang) * wave.amp;
        vertice.y = wave.y + Math.sin(wave.ang) * wave.amp;

        wave.ang += wave.speed;
    }

    //告诉渲染器代表大海的几何体发生改变
    this.mesh.geometry.verticesNeedUpdate = true;
    sea.mesh.rotation.z += .005;
}

//云朵
Cloud = function () {
    // 创建一个空的容器放置不同形状的云
    this.mesh = new THREE.Object3D();

    //创建正方体
    var geometry = new THREE.BoxGeometry(20, 20, 20);

    //创建材质
    var material = new THREE.MeshPhongMaterial({
        color: Colors.white,
    });

    // 随机复制正方体
    var nRandom = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nRandom; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        // 随机设置每个正方体的位置和旋转角度
        mesh.position.x = i * 15;
        mesh.position.y = Math.random() * 10;
        mesh.position.z = Math.random() * 10;
        mesh.rotation.z = Math.random() * Math.PI * 2;
        mesh.rotation.y = Math.random() * Math.PI * 2;
        // 随机设置正方体的大小
        var s = 0.1 + Math.random() * 0.9;
        mesh.scale.set(s, s, s);
        // 允许每个正方体生成投影和接收阴影
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.mesh.add(mesh);
    }
}

//天空
Sky = function () {
    // 创建一个空的容器
    this.mesh = new THREE.Object3D();

    this.nClouds = 20;

    //把云根据弧度均匀放置
    var angle = Math.PI * 2 / this.nClouds;
    for (var i = 0; i < this.nClouds; i++) {
        var cloud = new Cloud();
        // 设置每朵云的旋转角度和位置
        var anglei = angle * i;
        //这是云的最终角度
        var h = 750 + Math.random() * 200;
        // 把极坐标转换成笛卡坐标
        cloud.mesh.position.y = Math.sin(anglei) * h;
        cloud.mesh.position.x = Math.cos(anglei) * h;
        // 根据云的位置旋转它
        cloud.mesh.rotation.z = anglei + Math.PI / 2;
        //把云放置在场景中的随机深度位置
        cloud.mesh.position.z = -400 - Math.random() * 400;
        // 设置每朵云的随机大小
        var s = 1 + Math.random() * 2;
        cloud.mesh.scale.set(s, s, s);

        this.mesh.add(cloud.mesh);

    }
}

//驾驶员
Pilot = function(){
    this.mesh = new THREE.Object3D();
    this.angleHairs=0;

    //身体
    var geometryBody = new THREE.BoxGeometry(15,15,15);
    var materialBody = new THREE.MeshPhongMaterial({
        color:Colors.brown,
        shading:THREE.FlatShading
    });
    var body = new THREE.Mesh(geometryBody, materialBody);
    body.position.set(2,-12,0);
    this.mesh.add(body);

    //脸
    var geometryFace = new THREE.BoxGeometry(10,10,10);
    var materialFace = new THREE.MeshLambertMaterial({
        color:Colors.pink
    });
    var face = new THREE.Mesh(geometryFace, materialFace);
    this.mesh.add(face);

    //头发
    var hairs = new THREE.Object3D();

    var geometryHair = new THREE.BoxGeometry(4,4,4);
    var materialHair = new THREE.MeshLambertMaterial({
        color:Colors.brown
    });
    var hair = new THREE.Mesh(geometryHair, materialHair);
    hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));
    //顶部头发
    this.hairsTop = new THREE.Object3D();
    for (var i=0; i<12; i++){
        var h = hair.clone();
        var col = i%3;
        var row = Math.floor(i/3);
        var startPosZ = -4;
        var startPosX = -4;
        h.position.set(startPosX + row*4, 0, startPosZ + col*4);
        this.hairsTop.add(h);
    }
    hairs.add(this.hairsTop);

    //左右两侧头发
    var geometryHairSide = new THREE.BoxGeometry(12,4,2);
    geometryHairSide.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
    var hairSideRight = new THREE.Mesh(geometryHairSide, materialHair);
    hairSideRight.position.set(8,-2,6);
    hairs.add(hairSideRight);
    var hairSideLeft = hairSideRight.clone();
    hairSideLeft.position.set(8,-2,-6);
    hairs.add(hairSideLeft);

    //后侧头发
    var geometryHairBack = new THREE.BoxGeometry(2,8,10);
    var hairBack = new THREE.Mesh(geometryHairBack, materialHair);
    hairBack.position.set(-1,-4,0)
    hairs.add(hairBack);
    hairs.position.set(-5,5,0);
    this.mesh.add(hairs);

    //眼镜镜面
    var geometryGlass = new THREE.BoxGeometry(5,5,5);
    var materialGlass = new THREE.MeshLambertMaterial({color:Colors.brown});
    var glassRight = new THREE.Mesh(geometryGlass,materialGlass);
    glassRight.position.set(6,0,3);
    this.mesh.add(glassRight);
    var glassLeft = glassRight.clone();
    glassLeft.position.z = -glassRight.position.z
    this.mesh.add(glassLeft);

    //眼镜腿
    var geometryGlassLeg = new THREE.BoxGeometry(11,1,11);
    var glassLeg = new THREE.Mesh(geometryGlassLeg, materialGlass);
    this.mesh.add(glassLeg);

    //耳朵
    var geometryEar = new THREE.BoxGeometry(2,3,2);
    var earRight = new THREE.Mesh(geometryEar,materialFace);
    earRight.position.set(0,0,-6);
    this.mesh.add(earRight);
    var earLeft = earRight.clone();
    earLeft.position.set(0,0,6);
    this.mesh.add(earLeft);
}

//头发顶部的飘动
Pilot.prototype.updateHairs = function(){
    var hairs = this.hairsTop.children;
    for (var i=0; i<hairs.length; i++){
        var h = hairs[i];
        h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25;
    }
    this.angleHairs += 0.16;
}

//飞机
AirPlane = function () {
    this.mesh = new THREE.Object3D();

    //创建机舱
    var geometryCockpit = new THREE.BoxGeometry(80, 40, 40);
    // 移动长方形顶点的 x, y, z 属性
    geometryCockpit.vertices[4].y-=10;
    geometryCockpit.vertices[4].z+=20;
    geometryCockpit.vertices[5].y-=10;
    geometryCockpit.vertices[5].z-=20;
    geometryCockpit.vertices[6].y+=30;
    geometryCockpit.vertices[6].z+=20;
    geometryCockpit.vertices[7].y+=30;
    geometryCockpit.vertices[7].z-=20;

    var materialCockpit = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
    });

    var cockpet = new THREE.Mesh(geometryCockpit, materialCockpit);
    cockpet.castShadow = true;
    cockpet.receiveShadow = true;
    this.mesh.add(cockpet);

    //创建引擎
    var geometryEngine = new THREE.BoxGeometry(20, 40, 40);
    var materialEngine = new THREE.MeshPhongMaterial({
        color: Colors.white,
        flatShading: true
    });
    var engine = new THREE.Mesh(geometryEngine, materialEngine);
    engine.castShadow = true;
    engine.receiveShadow = true;
    engine.position.x = 50;
    this.mesh.add(engine);

    //创建机尾
    var geometryTailPlane = new THREE.BoxGeometry(15, 20, 5);
    var materialTailPlane = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
    });
    var tailPlane = new THREE.Mesh(geometryTailPlane, materialTailPlane);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    tailPlane.position.set(-40, 20, -5);
    this.mesh.add(tailPlane);

    //创建机翼
    var geometrySideWing = new THREE.BoxGeometry(30, 5, 120);
    var materialSideWing = new THREE.MeshPhongMaterial({
        color: Colors.red,
        flatShading: true
    });
    var sideWing = new THREE.Mesh(geometrySideWing, materialSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    //创建挡风玻璃
    var geometryWindshield = new THREE.BoxGeometry(3,15,20);
    var materialWindshield = new THREE.MeshPhongMaterial({
        color:Colors.white,
        transparent:true,
        opacity:.3,
        flatShading: true
    });
    var windshield = new THREE.Mesh(geometryWindshield, materialWindshield);
    windshield.position.set(5,27,0);
    windshield.castShadow = true;
    windshield.receiveShadow = true;
    this.mesh.add(windshield);

    //创建螺旋桨
    var geometryPropeller = new THREE.BoxGeometry(20, 10, 10);
    geometryPropeller.vertices[4].y-=5;
    geometryPropeller.vertices[4].z+=5;
    geometryPropeller.vertices[5].y-=5;
    geometryPropeller.vertices[5].z-=5;
    geometryPropeller.vertices[6].y+=5;
    geometryPropeller.vertices[6].z+=5;
    geometryPropeller.vertices[7].y+=5;
    geometryPropeller.vertices[7].z-=5;
    var materialPropeller = new THREE.MeshPhongMaterial({
        color: Colors.brown,
        flatShading: true
    });
    this.propeller = new THREE.Mesh(geometryPropeller, materialPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    //创建螺旋桨桨叶
    var geometryBlade = new THREE.BoxGeometry(1, 80, 10);
    var materialBlade = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        flatShading: true
    });
    var bladeRight = new THREE.Mesh(geometryBlade, materialBlade);
    bladeRight.castShadow = true;
    bladeRight.receiveShadow = true;
    bladeRight.position.set(8, 0, 0);

    var bladeLeft = bladeRight.clone();
    bladeLeft.castShadow = true;
    bladeLeft.receiveShadow = true;
    bladeLeft.rotation.x = Math.PI/2;

    //组合螺旋桨和桨叶
    this.propeller.add(bladeRight);
    this.propeller.add(bladeLeft);
    this.propeller.position.set(60, 0, 0);
    this.mesh.add(this.propeller);

    //创建轮子
    //防护罩
    var geometryWheelShield = new THREE.BoxGeometry(30,15,10);
    var materialWheelShield = new THREE.MeshPhongMaterial({
        color:Colors.red,
        flatShading: true
    });
    var wheeleelShieldRight = new THREE.Mesh(geometryWheelShield,materialWheelShield);
    wheeleelShieldRight.position.set(25,-18,25);
    this.mesh.add(wheeleelShieldRight);

    //轮胎
    var geometryWheelTire = new THREE.CylinderGeometry(12, 12, 4, 40);
    geometryWheelTire.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var materialWheelTire = new THREE.MeshPhongMaterial({
        color:Colors.brownDark,
        flatShading: true
    });
    var wheelTireRight = new THREE.Mesh(geometryWheelTire,materialWheelTire);
    wheelTireRight.position.set(25,-28,25);

    //轮轴
    var geometryWheelAxis = new THREE.CylinderGeometry(5, 5, 6, 40);
    geometryWheelAxis.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var materialWheelAxis = new THREE.MeshPhongMaterial({
        color:Colors.brown,
        flatShading: true
    });
    var wheelAxis = new THREE.Mesh(geometryWheelAxis,materialWheelAxis);
    wheelTireRight.add(wheelAxis);

    this.mesh.add(wheelTireRight);

    var wheeleelShieldLeft = wheeleelShieldRight.clone();
    wheeleelShieldLeft.position.z = -wheeleelShieldRight.position.z ;
    this.mesh.add(wheeleelShieldLeft);

    var wheelTireLeft = wheelTireRight.clone();
    wheelTireLeft.position.z = -wheelTireRight.position.z;
    this.mesh.add(wheelTireLeft);

    var wheelTireRear = wheelTireRight.clone();
    wheelTireRear.scale.set(0.5,0.5,0.5);
    wheelTireRear.position.set(-35,-5,0);
    this.mesh.add(wheelTireRear);

    //后轮悬架
    var geometryRearWheelSuspension = new THREE.BoxGeometry(4,20,4);
    //旋转
    geometryRearWheelSuspension.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
    var materialRearWheelSuspension = new THREE.MeshPhongMaterial({
        color:Colors.red,
        flatShading: true
    });
    var rearWheelSuspension = new THREE.Mesh(geometryRearWheelSuspension,materialRearWheelSuspension);
    rearWheelSuspension.position.set(-35,-5,0);
    rearWheelSuspension.rotation.z = -.3;
    this.mesh.add(rearWheelSuspension);

    //驾驶员入座
    this.pilot = new Pilot();
    this.pilot.mesh.position.set(-10,27,0);
    this.mesh.add(this.pilot.mesh);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
}

