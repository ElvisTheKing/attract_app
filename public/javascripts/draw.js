$(function() {
  
  // W.Serenity.onLoaded( function() {

    var self = this;

    // var config = self.config = {
    //   timeScale: 4.0, // days per unit length
    //   pathNum: 2,
    //   path: {
    //     subN: 20,
    //     tailN: 20,
    //     tailDays: 600
    //   },
    //   fog: {
    //     color: new THREE.Color( 0x000000 ),
    //     p: 0.015
    //   }
    // };

    var now = {
      frame: 0,
    //   activePath: 'one',
    //   camera: {
    //     target: new THREE.Vector3(0,0,0)
    //   },
    //   timeControl: {
    //     width: null,
    //     sliderPos: 0,
    //     dragging: false
    //   }
    };

    // var stats = new Stats();
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.top = '0px';
    // stats.domElement.style.zIndex = 100;
    // document.body.appendChild( stats.domElement );

    // var scene = self.scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2( config.fog.color, config.fog.p );
    // var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    // var controls = new THREE.OrbitControls( camera );
    // camera.position = new THREE.Vector3(0, 0, 5);
    // now.camera.target = new THREE.Vector3(0, 0, 0);
    // controls.update(now.camera.target);


    // var mainTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
    //                     {minFilter: THREE.LinearFilter,
    //                      magFilter: THREE.LinearFilter,
    //                      format: THREE.RGBFormat,
    //                      type: THREE.FloatType});
    // mainTarget.wrapS = THREE.RepeatWrapping;
    // mainTarget.wrapT = THREE.RepeatWrapping;
    var backTex = new THREE.ImageUtils.loadTexture( '/images/att2.png' );
    // backTex.wrapS = THREE.RepeatWrapping;
    // backTex.wrapT = THREE.RepeatWrapping;
    var uniformsBack = {
        screenWidth: {type: "f", value: null},
        screenHeight: {type: "f", value: null},
        time: {type: "f", value: null},
        tex: {type: "t", value: backTex},
        // sceneTex: {type: "t", value: mainTarget}
    };
    var sceneBack = new THREE.Scene();
    var cameraBack = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000); 
    cameraBack.position.z = 5;
    sceneBack.add(cameraBack);
    var planeGeometry = new THREE.PlaneGeometry(1.0, 1.0);
    var planeQMaterial = new THREE.ShaderMaterial({
        uniforms: uniformsBack,
        vertexShader: document.getElementById('passThroughVertexShader').textContent,
        fragmentShader: document.getElementById('quasiFragmentShader').textContent
    });
    var plane = new THREE.Mesh(planeGeometry, planeQMaterial);
    sceneBack.add(plane);



    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new THREE.Color( 0xffffff ));
    document.body.appendChild( renderer.domElement );

    // var spheres = [];
    // var spheres2 = [];
    // var spheres3 = [];
    // for (var i = 0; i < 10; i++) {
    //   var sph = new self.Sphere({
    //     color: new THREE.Color(0x00ff00),
    //     date: new Date( 2014, i, 1 + Math.floor(Math.random() * 30))
    //   });
    //   spheres.push( sph );
    // }
    // for (var i = 0; i < 10; i++) {
    //   var sph = new self.Sphere({
    //     color: new THREE.Color(0x00ff00),
    //     date: new Date( 2014, i, 1 + Math.floor(Math.random() * 30))
    //   });
    //   spheres2.push( sph );
    // }
    // for (var i = 0; i < 10; i++) {
    //   var sph = new self.Sphere({
    //     color: new THREE.Color(0x00ff00),
    //     date: new Date( 2014, i, 1 + Math.floor(Math.random() * 30))
    //   });
    //   spheres3.push( sph );
    // }

    // var paths = {};
    // paths['one'] = new self.Path({
    //   color: new THREE.Color(0x00ff00),
    //   direction: new THREE.Vector3(1,1,1),
    //   subN: config.path.subN,
    //   spheres: spheres
    // });
    // paths['two'] = new self.Path({
    //   color: new THREE.Color(0x0000ff),
    //   direction: new THREE.Vector3(1,1,1),
    //   subN: config.path.subN,
    //   spheres: spheres2
    // });
    // paths['three'] = new self.Path({
    //   color: new THREE.Color(0xff0000),
    //   direction: new THREE.Vector3(1,1,1),
    //   subN: config.path.subN,
    //   spheres: spheres3
    // });


    // (function() {

    //   var geometry = new THREE.SphereGeometry( 0.1, 10, 10 );
    //   var material = new THREE.MeshBasicMaterial( { color: new THREE.Color( 0xff0000 ) } );
    //   var sphere = new THREE.Mesh( geometry, material );
    //   sceneBack.add( sphere );

    // })();




    function render() {

      requestAnimationFrame(render);

      // renderer.render(scene, camera, mainTarget, true);

      // uniformsBack.sceneTex.value = mainTarget;
      uniformsBack.screenWidth.value = window.innerWidth;
      uniformsBack.screenHeight.value = window.innerHeight;
      uniformsBack.time.value = now.frame;
      renderer.render(sceneBack, cameraBack);

      
      // stats.update();

      // camera.lookAt(now.camera.targetPos);

      // paths['one'].update();
      // paths['two'].update();
      // paths['three'].update();

      // controls.update();

      now.frame++;

    }



    // var $timeControl = $('#timeControl');
    // var $timeTimeline = $('#timeTimeline');
    // var $canvas = $('canvas');
    // var $slider = $('#slider');
    // $timeControl.bind('mousedown', function(e) {
    //   e.preventDefault();
    //   e.stopPropagation();
    // })
    // $slider.addClass('grab');
    // $slider.bind('mousedown', function(e) {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     $timeControl.addClass('grabbing');
    //     $slider.addClass('grabbing');
    //     $slider.addClass('active');
    //     $canvas.addClass('grabbing');
    //     $slider.removeClass('grab');
    //     now.timeControl.dragging = true;
    // });
    // $('#timeControl, canvas').bind('mouseup', function(e) {
    //     e.preventDefault();
    //     // e.stopPropagation();
    //     $timeControl.removeClass('grabbing');
    //     $slider.removeClass('grabbing');
    //     $slider.removeClass('active');
    //     $canvas.removeClass('grabbing');
    //     $slider.addClass('grab');
    //     now.timeControl.dragging = false;
    // });
    // $('#timeControl, canvas').bind('mousemove', function(e) {
    //   if (now.timeControl.dragging) {
    //     var val = (e.pageX - (window.innerWidth - now.timeControl.width) / 2 ) / now.timeControl.width;
    //     if (val >= 0 && val <= 1) {
    //       $slider.css({
    //         'left': 100 * val + '%'
    //       });
          
    //       now.camera.target = new THREE.Vector3(val * 12, 0, 0);
    //       var path = paths[now.activePath];
    //       var sphereNum = Math.floor(val * path.spheres.length);
    //       now.camera.target = path.spheres[sphereNum].sphere.position;
    //       // console.log( now.camera.target );
    //       controls.theTarget = now.camera.target;
    //       controls.update();
    //     }
    //   }
    // });


    // window.addEventListener( 'resize', onWindowResize, false );

    // function onWindowResize() {

    //   camera.aspect = window.innerWidth / window.innerHeight;
    //   camera.updateProjectionMatrix();

    //   renderer.setSize( window.innerWidth, window.innerHeight );

    //   now.timeControl.width = $timeTimeline.width();

    // };
    // onWindowResize();





    render();

  // } );

});
