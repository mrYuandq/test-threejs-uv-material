(function() {

	'use strict';

	function init() {
		var stats = initStats();
		var scene = new THREE.Scene();
		var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = -1;

		var renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
		renderer.setSize(window.innerWidth, window.innerHeight);
		// create the ground plane

		addAxisHelper(scene);
		addLight(scene);
		addSphereBufferGeometry(scene);

		// add the output of the renderer to the html element
		document.getElementById("WebGL-output").appendChild(renderer.domElement);
		// call the render function
		var controls = new function() {
			this.perspective = "Perspective";
			this.switchCamera = function() {
				if (camera instanceof THREE.PerspectiveCamera) {
					camera = new THREE.OrthographicCamera(window.innerWidth / -16, window.innerWidth / 16, window.innerHeight / 16, window.innerHeight / -16, -200, 500);
					camera.position.x = 0;
					camera.position.y = 0;
					camera.position.z = 0;
					camera.lookAt(scene.position);
					this.perspective = "Orthographic";
				} else {
					camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
					camera.position.x = 0;
					camera.position.y = 0;
					camera.position.z = 0;
					camera.lookAt(scene.position);
					this.perspective = "Perspective";
				}
			};
		};
		var gui = new dat.GUI();
		gui.add(controls, 'switchCamera');
		gui.add(controls, 'perspective').listen();
		// make sure that for the first time, the
		// camera is looking at the scene
		//   camera.lookAt(scene.position);
		render();
		var step = 0;

		function render() {
			stats.update();
			// render using requestAnimationFrame
			step += 0.005;
			if (camera instanceof THREE.Camera) {
				let x = 100 * Math.sin(step);
				let z = 100 * Math.cos(step);
				let y = 100 * Math.sin(step); 
				camera.lookAt(new THREE.Vector3(x, y, z));
				// camera.lookAt(new THREE.Vector3(0,0,0));
			}
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		}

		function initStats() {
			var stats = new Stats();
			stats.setMode(0); // 0: fps, 1: ms
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.left = '0px';
			stats.domElement.style.top = '0px';
			document.getElementById("Stats-output").appendChild(stats.domElement);
			return stats;
		}

		function addLight(){
			var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
			directionalLight.position.set(-20, 40, 60);
			scene.add(directionalLight);
			// add subtle ambient lighting
			var ambientLight = new THREE.AmbientLight(0xffffff);
			scene.add(ambientLight);
		}

		// ��Ӹ�����
		function addAxisHelper(scene) {
			var axisHelper = new THREE.AxesHelper(500);
			scene.add(axisHelper);
		}

		// �������
		function addSphereBufferGeometry(scene) {
			var textureLocation = THREE.ImageUtils.loadTexture('./assets/img/location_0_li.jpg');
			var materialLocation = new THREE.MeshBasicMaterial({ map: textureLocation, side: THREE.DoubleSide });

			var geometry = new THREE.SphereBufferGeometry(500, 64, 64);
			var sphere = new THREE.Mesh(geometry, materialLocation);
			scene.add(sphere);

			var geometryBox = new THREE.SphereBufferGeometry( 1, 12, 12 );
			var materialBox = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
			var cubeBox = new THREE.Mesh( geometryBox, materialBox );
			cubeBox.position.set(-5, 0, 10);
			scene.add( cubeBox );

			console.log(cubeBox);

			calcUvs(geometry);
		}
		
		// ����UV����
		function calcUvs(geometry) {
			let _g = geometry;

			console.log(_g);

			let _position = geometry.getAttribute("position");
			let uvArray = new Float32Array(2 * _position.count);

			console.log(_position);

			let _uvI = 0;
			let uvP = {};
			for (let i = 0; i < _position.array.length; i += 3) {
				let _x = _position.array[i];
				let _y = _position.array[i + 1];
				let _z = _position.array[i + 2];

				let _r = getRadius(0,0,0,_x,_y,_z);

				let angleXY = getAngleXY(Math.round(_r), _x, _y, _z);
				// console.log(angleXY);
				uvP = getUVPosition(angleXY.angleX||0, angleXY.angleY||0);

				if ( uvP.u == 0 ) {
					console.log("u=0:", i/3, uvP, _x, _y, _z);
				}
				if ( (i / 3) % (_g.parameters.widthSegments + 1) == 0 ) {
					console.log("uvP:", i/3, uvP, _x, _y, _z);
					uvP.u = 1;
				}

				uvArray[_uvI] = uvP.u;
				_uvI += 1;
				uvArray[_uvI] = uvP.v;
				_uvI += 1;
			}
			// v.material = material;
			let _uv = _g.getAttribute("uv");
			_uv.needsUpdate = false;
			_uv.setArray(uvArray);
			console.log(_uv);
			_uv.needsUpdate = true;
		};

		// 获取模型点到可视点的半径
		function getRadius(x,y,z,x1,y1,z1) {
			return Math.pow(
				Math.pow(x-x1, 2) + Math.pow(y-y1, 2) + Math.pow(z-z1, 2), 
				1/2
			);
		};

		// 根据半径和坐标获取角度
		function getAngleXY(r, x, y, z) {
			return {
				angleX: Math.atan2(z, x) + Math.PI,
				angleY: Math.asin(y / r)
			};
		};

		// 角度转化为 UV 坐标 UV 范围 0 ~ 1
		function getUVPosition(angleX, angleY) {
			return {
				u: (angleX / (2 * Math.PI)) % 1,
				v: 1 / 2 + angleY / Math.PI
			}
		};
	}
	window.onload = init;
})();