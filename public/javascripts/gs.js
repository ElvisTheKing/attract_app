(function() {
  var checkTime = function() {
    var h = new Date().getHours();
    return h >= 8.0 && h < 24.0;
  }
  var init = function() {
    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    var $renderer = $(renderer.domElement);
    renderer.setSize(window.innerWidth , window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // var gui = new dat.GUI({
    //     height : 5 * 32 - 1
    // });
    var params = {
      killInfluence: 0.0,
      feedInfluence: 0.02
    };
    // gui.add(params, 'killInfluence', 0.0, 0.0);
    // gui.add(params, 'feedInfluence', 0.0, 0.02);


    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000); 
    camera.position.z = 5;
    scene.add(camera);

    var mouseX, mouseY;
    var mouseDown = false;
    var canvasWidth, canvasHeight;
    var lastTime = 0;
    var toggled = false;
    clicked = false;
    var invert = false;
    var invertPrev = false;
    var customInvert = false;
    var clickFrame = 0;
    var minusOnes = new THREE.Vector2(-1, -1);

    var MODE = {
      KILL: {},
      FEED: {},
      INIT: {}
    };
    var mode = MODE.INIT;

    var presets = [
      { // Default
          //feed: 0.018,
          //kill: 0.051
          feed: 0.037,
          kill: 0.06
      },
      { // Solitons
          feed: 0.03,
          kill: 0.062
      },
      { // Pulsating solitons
          feed: 0.025,
          kill: 0.06
      },
      { // Worms.
          feed: 0.078,
          kill: 0.061
      },
      { // Mazes
          feed: 0.029,
          kill: 0.057
      },
      { // Holes
          feed: 0.039,
          kill: 0.058
      },
      { // Chaos
          feed: 0.026,
          kill: 0.051
      },
      { // Chaos and holes (by clem)
          feed: 0.034,
          kill: 0.056
      },
      { // Moving spots.
          feed: 0.014,
          kill: 0.054
      },
      { // Spots and loops.
          feed: 0.018,
          kill: 0.051
      },
      { // Waves
          feed: 0.014,
          kill: 0.045
      },
      { // The U-Skate World
          feed: 0.062,
          kill: 0.06093
      }
    ];

    var feed = presets[4].feed;
    var kill = presets[4].kill;

    var uniforms = {
        screenWidth: {type: "f", value: null},
        screenHeight: {type: "f", value: null},
        tSource: {type: "t", value: null},
        delta: {type: "f", value: 1.0},
        frame: {type: "f", value: 0.0},
        feed: {type: "f", value: feed},
        kill: {type: "f", value: kill},
        brush: {type: "v2", value: new THREE.Vector2(-10, -10)},
        killTex: {type: "t", value: null},
        feedTex: {type: "t", value: null},
        killInfluence: {type: "f", value: params.killInfluence},
        feedInfluence: {type: "f", value: params.feedInfluence}
    };
    var uniforms2 = {
        screenWidth: uniforms.screenWidth,
        screenHeight: uniforms.screenHeight,
        tSource: {type: "t", value: null}
    };

    var gsMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('passThroughVertexShader').textContent,
        fragmentShader: document.getElementById('gsFragmentShader').textContent
    });
    var screenMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms2,
        vertexShader: document.getElementById('passThroughVertexShader').textContent,
        fragmentShader: document.getElementById('screenFragmentShader').textContent
    });
    var screenMaterialInvert = new THREE.ShaderMaterial({
        uniforms: uniforms2,
        vertexShader: document.getElementById('passThroughVertexShader').textContent,
        fragmentShader: document.getElementById('screenFragmentShaderInvert').textContent
    });


    var tex1, tex2, tex3;

    var planeGeometry = new THREE.PlaneGeometry(1.0, 1.0);
    var plane = new THREE.Mesh(planeGeometry, screenMaterial);
    scene.add(plane);

    var initTex = new THREE.ImageUtils.loadTexture( '/images/one.png' );
    initTex.wrapS = THREE.RepeatWrapping;
    initTex.wrapT = THREE.RepeatWrapping;

    var grayTex = new THREE.ImageUtils.loadTexture( '/images/grey.png' );
    grayTex.wrapS = THREE.RepeatWrapping;
    grayTex.wrapT = THREE.RepeatWrapping;

    var feedTex = new THREE.ImageUtils.loadTexture( '/images/grey.png' );
    feedTex.wrapS = THREE.RepeatWrapping;
    feedTex.wrapT = THREE.RepeatWrapping;

    var killTex = new THREE.ImageUtils.loadTexture( '/images/grey.png' );
    killTex.wrapS = THREE.RepeatWrapping;
    killTex.wrapT = THREE.RepeatWrapping;


    var reset = false;
    var frame = 0;

        var size = 1120.0;
        var w = size;
        var h = size / 2.5;

    var adjustView = function() {

        // $renderer.width(w);
        // $renderer.height(h);
        $renderer.css({
          'left': (window.innerWidth - w) / 2.0 + 'px',
          'top': (window.innerHeight - h) / 2.0 + 'px'
        });
    };

    var resize = function() {

        adjustView();

        canvasWidth = w;
        canvasHeight = h;
        if (window.devicePixelRatio && window.devicePixelRatio > 1.0) {
          var sc = 1.0;
        } else {
          var sc = 2.0;
          $renderer.css({
            '-webkit-transform': 'scale(0.5)',
            'transform': 'scale(0.5)',
            'transform-origin':  '0 0'
          });
        }

        renderer.setSize(canvasWidth * sc, canvasHeight * sc);

        var s = 1.0;        // TODO: Possible memory leak?
        tex1 = new THREE.WebGLRenderTarget(canvasWidth * s, canvasHeight * s,
                            {minFilter: THREE.LinearFilter,
                             magFilter: THREE.LinearFilter,
                             format: THREE.RGBFormat,
                             type: THREE.FloatType});
        tex2 = new THREE.WebGLRenderTarget(canvasWidth * s, canvasHeight * s,
                            {minFilter: THREE.LinearFilter,
                             magFilter: THREE.LinearFilter,
                             format: THREE.RGBFormat,
                             type: THREE.FloatType});
        tex3 = new THREE.WebGLRenderTarget(canvasWidth * s, canvasHeight * s,
                            {minFilter: THREE.LinearFilter,
                             magFilter: THREE.LinearFilter,
                             format: THREE.RGBFormat,
                             type: THREE.FloatType});
        tex1.wrapS = THREE.RepeatWrapping;
        tex1.wrapT = THREE.RepeatWrapping;
        tex2.wrapS = THREE.RepeatWrapping;
        tex2.wrapT = THREE.RepeatWrapping;
        tex3.wrapS = THREE.RepeatWrapping;
        tex3.wrapT = THREE.RepeatWrapping;
        uniforms.screenWidth.value = canvasWidth * 1.21;
        uniforms.screenHeight.value = canvasHeight* 1.21;
        uniforms.killTex.value = killTex;
        uniforms.feedTex.value = feedTex;
    };
    resize();
    $(window).resize(function() {
      adjustView();
    });


    var onMouseMove = function(e) {
        var ev = e ? e : window.event;
        
        mouseX = ev.pageX - $renderer.offset().left; // these offsets work with
        mouseY = ev.pageY - $renderer.offset().top; //  scrolled documents too
        
        if(mouseDown) {
            uniforms.brush.value = new THREE.Vector2(mouseX/canvasWidth, 1-mouseY/canvasHeight);
        }
    }

    var onMouseDown = function(e) {
        var ev = e ? e : window.event;
        mouseDown = true;
        
        uniforms.brush.value = new THREE.Vector2(mouseX/canvasWidth, 1-mouseY/canvasHeight);

        clicked = true;
        clickFrame = frame;
    }

    var onMouseUp = function(e) {
        mouseDown = false;
    }

    var onKeyUp = function(e) {
      switch (e.keyCode) {
        case 49 :
          feed = presets[0].feed;
          kill = presets[0].kill;
          break;
        case 50 :
          feed = presets[1].feed;
          kill = presets[1].kill;
          break;
        case 51 :
          feed = presets[2].feed;
          kill = presets[2].kill;
          break;
        case 52 :
          feed = presets[3].feed;
          kill = presets[3].kill;
          break;
        case 53 :
          feed = presets[4].feed;
          kill = presets[4].kill;
          break;
        case 54 :
          feed = presets[5].feed;
          kill = presets[5].kill;
          break;
        case 55 :
          feed = presets[6].feed;
          kill = presets[6].kill;
          break;
        case 56 :
          feed = presets[7].feed;
          kill = presets[7].kill;
          break;
        case 57 :
          feed = presets[8].feed;
          kill = presets[8].kill;
          break;
        case 48 :
          feed = presets[9].feed;
          kill = presets[9].kill;
          break;
        case 82 :
          reset = true;
          break;
        case 75:
          mode = MODE.KILL;
          // $('#flag').html('K');
          break;
        case 70:
          mode = MODE.FEED;
          // $('#flag').html('F');
          break;
        case 85:
          mode = MODE.INIT;
          // $('#flag').html('I');
          break;
        case 73:
          invert = !invert;
          customInvert = true;
          break;
        case 67:
          if (mode === MODE.KILL) {
            killTex = grayTex;
          } else if (mode === MODE.FEED) {
            feedTex = grayTex;
          } else if (mode === MODE.INIT) {
            initTex = grayTex;
          }
      }
    }

    renderer.domElement.onmousedown = onMouseDown;
    renderer.domElement.onmouseup = onMouseUp;
    renderer.domElement.onmousemove = onMouseMove;
    window.onkeyup = onKeyUp;

    invert = invertPrev = checkTime();

    var adjustBg = function() {
      if (invert) {
        $('body').addClass('invert');
        $('#attractor_w').hide();
        $('#attractor_w_inv').show();
      } else {
        $('body').removeClass('invert');
        $('#attractor_w').show();
        $('#attractor_w_inv').hide();
      }
    };
    adjustBg();

    var render = function () {
      frame++;

      if (!customInvert) {
        invert = checkTime();
      }

      if (clicked) {
        if (frame > clickFrame + 1) {
          clicked = false;
        }
        feed = presets[0].feed;
        kill = presets[0].kill;
      } else {
        feed = presets[4].feed;
        kill = presets[4].kill;
      }

      plane.material = gsMaterial;
      uniforms.feed.value = feed;
      uniforms.kill.value = kill;
      uniforms.killInfluence.value = params.killInfluence;
      uniforms.feedInfluence.value = params.feedInfluence;
      uniforms.frame.value = frame;

      uniforms.killTex.value = killTex;
      uniforms.feedTex.value = feedTex;

      if (reset) {
        reset = false;
        plane.material = gsMaterial;
        uniforms.tSource.value = initTex;
        renderer.render(scene, camera, tex1, true);
        uniforms.tSource.value = tex1;
        renderer.render(scene, camera, tex2, true);
      }

      for(var i=0; i<5; ++i) {
          if (!toggled) {
              uniforms.tSource.value = tex1;
              renderer.render(scene, camera, tex2, true);
              uniforms.tSource.value = tex2;
          } else {
              uniforms.tSource.value = tex2;
              renderer.render(scene, camera, tex1, true);
              uniforms.tSource.value = tex1;
          }
          
          toggled = !toggled;
          uniforms.brush.value = minusOnes;
      }

      if (invert) {
        plane.material = screenMaterialInvert;  
      } else {
        plane.material = screenMaterial;
      }
      if (invertPrev != invert) {
        adjustBg();
      }
      invertPrev = invert;
      
      uniforms2.tSource.value = tex1;
      renderer.render(scene, camera);

      requestAnimationFrame(render);
    };


    var initImg = new Image();
    initImg.onload = function() {
      reset = true;
      window.setTimeout(function() {
        render();
      }, 50);
    };
    initImg.src = 'images/one.png';

    $renderer.on('dragenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $renderer.on('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $renderer.on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      $(e.originalEvent.dataTransfer.files).each(function(){
          var reader = new FileReader();
          reader.readAsDataURL(this);
          reader.onload = function(readEvent) {
              if (mode === MODE.FEED) {
                feedTex = new THREE.ImageUtils.loadTexture( readEvent.target.result );
              } else if (mode == MODE.KILL) {
                killTex = new THREE.ImageUtils.loadTexture( readEvent.target.result );
              } else {
                initTex = new THREE.ImageUtils.loadTexture( readEvent.target.result );
              }
          }
      });
    });
  };

  function webgl_support() { 
    try{
      var canvas = document.createElement( 'canvas' ); 
      return !! window.WebGLRenderingContext && ( 
           canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
    }catch( e ) { return false; } 
  };

  window.onload = function() {
    if (webgl_support()) {
      init();
      $('#attractor_w, #attractor_w_inv, canvas').bind('mousedown', function(e) {
        e.preventDefault();
      });
      window.setTimeout(function() {
        $('#black').fadeOut(2000);
      }, 1000);
    } else {
      $('#attractor_w, #attractor_w_inv').remove();
      var pic = new Image();
      if (checkTime()) {
        pic.src = '/images/a_nogl.png';
        $('body').css('background-color', '#fff');
      } else {
        pic.src = '/images/a_black_nogl.png';
        $('body').css('background-color', '#000');
      }
      var $pic = $(pic).attr('id', 'nogl').bind('mousedown', function(e) {
        e.preventDefault();
      });
      pic.onload = function() {
        $('body').append( $pic );
        $('#black').fadeOut(2000);
      };
    }
    $('#text_right').bind('click', function (e) {
      selectText('text_right');
    });
  };

  function selectText(containerid) {
      if (document.selection) {
          var range = document.body.createTextRange();
          range.moveToElementText(document.getElementById(containerid));
          range.select();
      } else if (window.getSelection) {
          var range = document.createRange();
          range.selectNode(document.getElementById(containerid));
          window.getSelection().addRange(range);
      }
  }


})();
