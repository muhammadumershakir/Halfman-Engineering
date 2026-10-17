/**
 * HALFMAN ENGINEERING - 3D Tool & Die Assembly Showcase
 * Renders the EXACT CAD geometry extracted from OP-20-TR_1__ASM.STP (Creo Assembly)
 * Vertical Y-Axis Orientation:
 * - Upper Plate & Punch: Top (+Y)
 * - Lower Plate & Cavity: Bottom (-Y)
 * Multi-Material Industrial Shading:
 * - Upper & Lower Bolster Plates: IDENTICAL Industrial Bolster Blue (#1e3a5f)
 * - Punch & Cavity Profiles: IDENTICAL Gleaming Polished D2 Chrome Steel (#f8fafc)
 * - Guide Pillars: Hard Chrome Mirror Steel (#ffffff)
 * - Stamped Part: Automotive Galvanized Amber/Gold (#f59e0b) for high-contrast visibility
 * - Hardware: Black-Oxide Fasteners (#0f172a)
 * Full Part-by-Part 3D Exploded View
 * True Hydraulic Press Cycle (Punch plunges DOWN into cavity, seals at BDC, then retracts)
 * Powered by Three.js & GSAP ScrollTrigger
 */

(function () {
  'use strict';

  var container, canvasMount;
  var scene, camera, renderer;
  var rootGroup, lowerGroup, upperGroup, partGroup;
  var meshes = {
    upperPlate: null,
    punch: null,
    upperHw: null,
    lowerPlate: null,
    cavity: null,
    lowerHw: null,
    pillars: null,
    part: null,
  };

  var isDragging = false;
  var prevPointerX = 0, prevPointerY = 0;
  // Isometric view showing front, side, and vertical Y-separation
  var targetRotY = 0.58, targetRotX = 0.22;
  var currentRotY = 0.58, currentRotX = 0.22;
  var autoRotate = true;
  var autoRotateSpeed = 0.0016;
  var userInteractedTimeout = null;
  var isCycling = false;
  var isExplodedManual = false;

  // Stamping Stroke Dimensions (CAD Units scaled to Three.js)
  // Raw CAD gap is ~310mm + 50mm pocket penetration depth = ~360mm stroke travel
  var SCALE = 40 / 1270;
  var STROKE_CLOSED_Y = -11.3; // Punch completely enters and mates inside cavity!
  var STROKE_OPEN_Y = 0.0;     // Open Top Dead Center (TDC)
  var currentStrokeY = STROKE_OPEN_Y;
  var explodeProgress = 0.0;

  var strokeReadout, scrubBar, btnExplode, btnPress, btnReset;

  function init() {
    container = document.getElementById('heroDieStage');
    canvasMount = document.getElementById('dieCanvasMount');
    if (!container || !canvasMount || typeof THREE === 'undefined') {
      return;
    }

    strokeReadout = document.getElementById('dieStrokeReadout');
    scrubBar = document.getElementById('dieScrubBar');
    btnExplode = document.getElementById('btnDieExplode');
    btnPress = document.getElementById('btnDiePress');
    btnReset = document.getElementById('btnDieReset');

    setupScene();
    setupLighting();
    setupInteraction();
    setupScrollScrub();
    setupControls();

    window.addEventListener('resize', onWindowResize);
    requestAnimationFrame(animate);

    function scheduleCADBuild() {
      loadCADGeometry(function () {
        buildCADModel();
      });
    }

    if (window.HALFMAN_CAD_PARTS) {
      buildCADModel();
    } else {
      scheduleCADBuild();
    }
  }

  function setupScene() {
    var width = canvasMount.clientWidth || 640;
    var height = canvasMount.clientHeight || 560;

    scene = new THREE.Scene();

    // Sized comfortably so the entire assembly fits with generous padding
    camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(46, 40, 96);
    camera.lookAt(0, -1, 0);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    if (renderer.outputEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    canvasMount.appendChild(renderer.domElement);

    // Root Group for interactive 360° rotation
    rootGroup = new THREE.Group();
    rootGroup.position.set(0, -1, 0);
    scene.add(rootGroup);

    // CAD Holographic Datum Floor
    buildCadDatumFloor();
  }

  function setupLighting() {
    // Balanced lighting so colors remain rich, saturated, and distinct
    var ambientLight = new THREE.AmbientLight(0x94a3b8, 0.7);
    scene.add(ambientLight);

    // Key Light (Top-right crisp studio light for metallic specular shine)
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(65, 95, 75);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    scene.add(keyLight);

    // Soft Cyan Industrial Rim Light from back-left
    var cyanRim = new THREE.DirectionalLight(0x00d4ff, 0.8);
    cyanRim.position.set(-75, 45, -65);
    scene.add(cyanRim);

    // Cavity Interior Spotlight: Illuminates inside holes, cavity pockets & trimming profiles
    var cavitySpot = new THREE.DirectionalLight(0xffffff, 1.1);
    cavitySpot.position.set(0, 35, 45);
    scene.add(cavitySpot);

    // Lower fill light for bottom plate details
    var fillLight = new THREE.PointLight(0x38bdf8, 0.6, 180);
    fillLight.position.set(0, -20, 60);
    scene.add(fillLight);
  }

  function buildCadDatumFloor() {
    var floorGroup = new THREE.Group();
    floorGroup.position.y = -22;



    // Shadow catcher plane
    var shadowPlaneGeo = new THREE.PlaneGeometry(140, 140);
    var shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    var shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    floorGroup.add(shadowPlane);

    scene.add(floorGroup);
  }

  function decodeBase64ToArray(base64, ArrayType) {
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new ArrayType(bytes.buffer);
  }

  function createCADGeometry(data) {
    if (!data || !data.positions) return new THREE.BufferGeometry();
    var positions = decodeBase64ToArray(data.positions, Float32Array);
    var indices = data.indexType === 'uint32'
      ? decodeBase64ToArray(data.indices, Uint32Array)
      : decodeBase64ToArray(data.indices, Uint16Array);

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();
    return geo;
  }

  function createMirroredRightPin(p) {
    if (!p || !p.positions) return null;
    var positions = decodeBase64ToArray(p.positions, Float32Array);
    var indices = p.indexType === 'uint32'
      ? decodeBase64ToArray(p.indices, Uint32Array)
      : decodeBase64ToArray(p.indices, Uint16Array);

    var used = new Map();
    var newPos = [];
    var newIdx = [];

    for (var i = 0; i < indices.length; i += 3) {
      var i0 = indices[i], i1 = indices[i + 1], i2 = indices[i + 2];
      var x0 = positions[i0 * 3], y0 = positions[i0 * 3 + 1], z0 = positions[i0 * 3 + 2];
      var x1 = positions[i1 * 3], y1 = positions[i1 * 3 + 1], z1 = positions[i1 * 3 + 2];
      var x2 = positions[i2 * 3], y2 = positions[i2 * 3 + 1], z2 = positions[i2 * 3 + 2];

      // Extract left hoist/stop pin triangles (x < -400, z > 330, y > 400)
      if (z0 > 330 && z1 > 330 && z2 > 330 && x0 < -400 && x1 < -400 && x2 < -400 && y0 > 400 && y1 > 400 && y2 > 400) {
        // Mirrored across X=0 with reversed triangle winding to preserve outward face normals
        var tri = [i0, i2, i1];
        for (var t = 0; t < 3; t++) {
          var oldIdx = tri[t];
          if (!used.has(oldIdx)) {
            var n = newPos.length / 3;
            used.set(oldIdx, n);
            newPos.push(-positions[oldIdx * 3], positions[oldIdx * 3 + 1], positions[oldIdx * 3 + 2]);
          }
          newIdx.push(used.get(oldIdx));
        }
      }
    }

    if (newPos.length === 0) return null;

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(newIdx), 1));
    geo.computeVertexNormals();
    return geo;
  }

  var isScriptLoading = false;
  function loadCADGeometry(callback) {
    if (window.HALFMAN_CAD_PARTS) {
      if (callback) callback();
      return;
    }
    if (isScriptLoading) {
      setTimeout(function () {
        loadCADGeometry(callback);
      }, 50);
      return;
    }
    isScriptLoading = true;

    var s = document.createElement('script');
    s.src = 'js/models/op20_die_geometry.js';
    s.async = true;
    s.onload = function () {
      isScriptLoading = false;
      if (callback) callback();
    };
    s.onerror = function () {
      isScriptLoading = false;
      console.warn('Could not load CAD geometry script');
    };
    document.body.appendChild(s);
  }

  function buildCADModel() {
    var cadParts = window.HALFMAN_CAD_PARTS;
    if (!cadParts) {
      loadCADGeometry(function () {
        buildCADModel();
      });
      return;
    }

    console.log('Rendering Multi-Material Exact Creo CAD Die Assembly on Y-Axis...');

    // ================= COLOR PALETTE SPECIFIED BY USER =================
    // 1. Upper Plate & Lower Plate: EXACT SAME COLOR (Industrial Bolster Blue Steel)
    var matPlates = new THREE.MeshStandardMaterial({
      color: 0x1b3c65, // Rich Industrial Machinery Bolster Blue
      metalness: 0.65,
      roughness: 0.38,
    });

    // 2. Punch Profile & Cavity Profile: EXACT SAME COLOR (Brilliant Mirror Polished D2 Chrome Steel)
    var matProfiles = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Gleaming polished D2 tool steel
      metalness: 0.96,
      roughness: 0.12,
    });

    // 3. Guide Pillars: Hard Chrome Polished Mirror Finish
    var matPillars = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.04,
    });

    // 4. Stamped Sheet Metal Part: Completely distinct from all die components!
    // High-visibility Vivid Safety Copper / Automotive Stamping Orange with DoubleSide rendering
    var matPart = new THREE.MeshStandardMaterial({
      color: 0xff5500, // Vivid Electric Copper Orange (instantly recognizable as the stamped sheet metal)
      metalness: 0.70,
      roughness: 0.18,
      side: THREE.DoubleSide, // Ensure solid rendering from every angle
    });

    // 5. Hardware & Fasteners: Black-Oxide Tooling Screws & Dowels
    var matHardware = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Black-Oxide high tensile steel
      metalness: 0.90,
      roughness: 0.32,
    });

    // ================= CAD TECHNICAL EDGE WIREFRAME MATERIALS =================
    var matProfileEdges = new THREE.LineBasicMaterial({
      color: 0x64748b, // Crisp silver-gray edge lines for punch & cavity holes
      transparent: true,
      opacity: 0.50,
    });

    var matPlateEdges = new THREE.LineBasicMaterial({
      color: 0x0f2942, // Deep navy edge lines for plates
      transparent: true,
      opacity: 0.40,
    });

    var matPartEdges = new THREE.LineBasicMaterial({
      color: 0xffbb00, // Bright warm gold edge line for workpiece
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });

    // ----------------- LOWER DIE ASSEMBLY (GROUNDED AT BOTTOM) -----------------
    lowerGroup = new THREE.Group();

    // 1. Lower Bolster Plate (SAME COLOR AS UPPER PLATE: Bolster Blue)
    var lowerPlateGeo = createCADGeometry(cadParts.lower_plate);
    var lowerPlateMesh = new THREE.Mesh(lowerPlateGeo, matPlates);
    lowerPlateMesh.castShadow = true;
    lowerPlateMesh.receiveShadow = true;
    lowerGroup.add(lowerPlateMesh);
    meshes.lowerPlate = lowerPlateMesh;

    // 2. Lower Cavity Profile (SAME COLOR AS UPPER PUNCH: Mirror D2 Steel)
    var cavityGeo = createCADGeometry(cadParts.cavity_profile);
    var cavityMesh = new THREE.Mesh(cavityGeo, matProfiles);
    cavityMesh.castShadow = true;
    cavityMesh.receiveShadow = true;
    lowerGroup.add(cavityMesh);
    meshes.cavity = cavityMesh;

    // 3. Guide Pillars: Hard Chrome
    var pillarsGeo = createCADGeometry(cadParts.guide_pillars);
    var pillarsMesh = new THREE.Mesh(pillarsGeo, matPillars);
    pillarsMesh.castShadow = true;
    lowerGroup.add(pillarsMesh);
    meshes.pillars = pillarsMesh;

    // 4. Lower Hardware: Black-Oxide Fasteners
    var lowerHwGeo = createCADGeometry(cadParts.hardware_lower);
    var lowerHwMesh = new THREE.Mesh(lowerHwGeo, matHardware);
    lowerGroup.add(lowerHwMesh);
    meshes.lowerHw = lowerHwMesh;

    lowerGroup.scale.set(SCALE, SCALE, SCALE);
    rootGroup.add(lowerGroup);

    // ----------------- UPPER DIE ASSEMBLY (VERTICAL AT TOP) -----------------
    upperGroup = new THREE.Group();

    // 5. Upper Die Shoe Plate (SAME COLOR AS LOWER PLATE: Bolster Blue)
    var upperPlateGeo = createCADGeometry(cadParts.upper_plate);
    var upperPlateMesh = new THREE.Mesh(upperPlateGeo, matPlates);
    upperPlateMesh.castShadow = true;
    upperGroup.add(upperPlateMesh);
    meshes.upperPlate = upperPlateMesh;

    // 6. Upper Punch Profile (SAME COLOR AS LOWER CAVITY: Mirror D2 Steel)
    var punchGeo = createCADGeometry(cadParts.punch_profile);
    var punchMesh = new THREE.Mesh(punchGeo, matProfiles);
    punchMesh.castShadow = true;

    // Symmetrical Right Pin (Matching the lower gray pins and left upper pin)
    var rightPinGeo = createMirroredRightPin(cadParts.punch_profile);
    if (rightPinGeo) {
      var rightPinMesh = new THREE.Mesh(rightPinGeo, matProfiles);
      rightPinMesh.castShadow = true;
      punchMesh.add(rightPinMesh);
    }

    upperGroup.add(punchMesh);
    meshes.punch = punchMesh;

    // 7. Upper Hardware: Black-Oxide Fasteners
    var upperHwGeo = createCADGeometry(cadParts.hardware_upper);
    var upperHwMesh = new THREE.Mesh(upperHwGeo, matHardware);
    upperGroup.add(upperHwMesh);
    meshes.upperHw = upperHwMesh;

    upperGroup.scale.set(SCALE, SCALE, SCALE);
    rootGroup.add(upperGroup);

    // ----------------- WORKPIECE (AUTOMOTIVE 53R PART) -----------------
    // High-contrast gold stamped part seated in the cavity nest
    partGroup = new THREE.Group();
    var partGeo = createCADGeometry(cadParts.workpiece);
    var partMesh = new THREE.Mesh(partGeo, matPart);
    partMesh.castShadow = true;
    partGroup.add(partMesh);
    meshes.part = partMesh;

    partGroup.scale.set(SCALE, SCALE, SCALE);
    partGroup.position.y = STROKE_CLOSED_Y;
    rootGroup.add(partGroup);

    // Initial State: Open Top Dead Center (TDC)
    setDieStroke(STROKE_OPEN_Y);
    var loader = document.getElementById('dieLoader');
    if (loader) loader.classList.add('loaded');
    console.log('Y-Axis CAD Die Assembly loaded successfully with clean multi-material contrast.');
  }

  /**
   * Sets the hydraulic ram stroke position along the Y-axis.
   * strokeY = STROKE_OPEN_Y (0.0): Open at Top Dead Center (clearance ~310mm)
   * strokeY = STROKE_CLOSED_Y (-11.3): Punch plunged DOWN completely inside Cavity!
   */
  function setDieStroke(y) {
    currentStrokeY = y;
    if (upperGroup) {
      upperGroup.position.y = y;
    }

    // Workpiece sits in cavity, floats up slightly during open stroke
    if (partGroup && !isExplodedManual) {
      partGroup.position.y = STROKE_CLOSED_Y + (y - STROKE_CLOSED_Y) * 0.12;
    }

    // Normalized progress for UI: 0% = Closed, 100% = Open
    var openRatio = (y - STROKE_CLOSED_Y) / (STROKE_OPEN_Y - STROKE_CLOSED_Y);
    openRatio = Math.max(0, Math.min(1, openRatio));

    if (strokeReadout) {
      if (openRatio <= 0.05) {
        strokeReadout.textContent = 'STROKE: 0.0 mm (BDC - CLOSED)';
      } else if (openRatio >= 0.95) {
        strokeReadout.textContent = 'STROKE: 310.0 mm (TDC - OPEN)';
      } else {
        var mm = (openRatio * 310).toFixed(1);
        strokeReadout.textContent = 'STROKE: ' + mm + ' mm';
      }
    }

    if (scrubBar) {
      scrubBar.style.width = Math.round(openRatio * 100) + '%';
    }
  }

  /**
   * Part-by-part 3D Explosion Animation:
   * Moves every component outward along its respective vector.
   */
  function applyPartExplosion(factor) {
    explodeProgress = factor;

    // Upper Assembly Layers
    if (meshes.upperHw) meshes.upperHw.position.y = factor * 420;
    if (meshes.upperPlate) meshes.upperPlate.position.y = factor * 260;
    if (meshes.punch) meshes.punch.position.y = factor * 110;

    // Guide Pillars: Explode outward and upward
    if (meshes.pillars) {
      meshes.pillars.position.y = factor * 150;
      meshes.pillars.scale.set(1 + factor * 0.18, 1, 1 + factor * 0.18);
    }

    // Workpiece: Floats right in the center clearance gap
    if (partGroup) {
      partGroup.position.y = STROKE_CLOSED_Y + factor * 5.0;
    }

    // Lower Assembly Layers
    if (meshes.cavity) meshes.cavity.position.y = factor * -30;
    if (meshes.lowerPlate) meshes.lowerPlate.position.y = factor * -220;
    if (meshes.lowerHw) meshes.lowerHw.position.y = factor * -380;

    if (strokeReadout && factor > 0.05) {
      strokeReadout.textContent = 'EXPLODED VIEW (' + Math.round(factor * 100) + '%)';
    }
  }

  function setupScrollScrub() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      window.addEventListener('scroll', function () {
        var hero = document.querySelector('.hero');
        if (!hero) return;
        var rect = hero.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, -rect.top / (rect.height || 600)));
        if (!isCycling && !isExplodedManual) {
          var targetY = STROKE_OPEN_Y + (STROKE_CLOSED_Y - STROKE_OPEN_Y) * p;
          setDieStroke(targetY);
        }
      }, { passive: true });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom+=150 top',
      scrub: 1.2,
      onUpdate: function (self) {
        if (!isCycling && !isExplodedManual) {
          var targetY = STROKE_OPEN_Y + (STROKE_CLOSED_Y - STROKE_OPEN_Y) * self.progress;
          setDieStroke(targetY);
        }
      },
    });
  }

  function setupInteraction() {
    var isTouching = false;

    function onPointerDown(clientX, clientY) {
      isDragging = true;
      prevPointerX = clientX;
      prevPointerY = clientY;
      autoRotate = false;
      if (userInteractedTimeout) clearTimeout(userInteractedTimeout);
    }

    function onPointerMove(clientX, clientY) {
      if (!isDragging) return;
      var dx = clientX - prevPointerX;
      var dy = clientY - prevPointerY;
      prevPointerX = clientX;
      prevPointerY = clientY;

      targetRotY += dx * 0.007;
      targetRotX += dy * 0.007;
      targetRotX = Math.max(-0.35, Math.min(0.85, targetRotX));
    }

    window.__setDieRotation = function (y, x) {
      autoRotate = false;
      currentRotY = targetRotY = y;
      currentRotX = targetRotX = x;
      if (rootGroup) {
        rootGroup.rotation.y = y;
        rootGroup.rotation.x = x;
      }
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    function onPointerUp() {
      isDragging = false;
      if (userInteractedTimeout) clearTimeout(userInteractedTimeout);
      userInteractedTimeout = setTimeout(function () {
        autoRotate = true;
      }, 4000);
    }

    canvasMount.addEventListener('mousedown', function (e) {
      onPointerDown(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('mousemove', function (e) {
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });

    canvasMount.addEventListener(
      'touchstart',
      function (e) {
        if (e.touches.length === 1) {
          isTouching = true;
          onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );
    window.addEventListener(
      'touchmove',
      function (e) {
        if (isTouching && e.touches.length === 1) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: true }
    );
    window.addEventListener('touchend', function () {
      isTouching = false;
      onPointerUp();
    }, { passive: true });
  }

  function setupControls() {
    // 1. Full Part-by-Part Exploded View
    if (btnExplode) {
      btnExplode.addEventListener('click', function () {
        if (isCycling) return;
        isExplodedManual = !isExplodedManual;
        var targetVal = isExplodedManual ? 1.0 : 0.0;
        btnExplode.classList.toggle('active', isExplodedManual);

        if (isExplodedManual && currentStrokeY !== STROKE_OPEN_Y) {
          setDieStroke(STROKE_OPEN_Y);
        }

        if (typeof gsap !== 'undefined') {
          var expObj = { factor: explodeProgress };
          gsap.to(expObj, {
            factor: targetVal,
            duration: 1.0,
            ease: 'power3.out',
            onUpdate: function () {
              applyPartExplosion(expObj.factor);
            },
          });
        } else {
          applyPartExplosion(targetVal);
        }
      });
    }

    // 2. Real Hydraulic Stamping Press Cycle
    if (btnPress) {
      btnPress.addEventListener('click', function () {
        if (isCycling) return;
        isCycling = true;

        if (isExplodedManual) {
          isExplodedManual = false;
          if (btnExplode) btnExplode.classList.remove('active');
          applyPartExplosion(0.0);
        }

        btnPress.classList.add('active');

        var strokeProxy = { y: currentStrokeY };
        var tl = gsap.timeline({
          onUpdate: function () {
            setDieStroke(strokeProxy.y);
          },
          onComplete: function () {
            isCycling = false;
            btnPress.classList.remove('active');
          },
        });

        // Step 1: Ensure ram starts at Open Top Dead Center (TDC)
        tl.to(strokeProxy, {
          y: STROKE_OPEN_Y,
          duration: 0.25,
          ease: 'power2.out',
        })
          // Step 2: RAPID DOWNWARD STAMPING STROKE
          .to(strokeProxy, {
            y: STROKE_CLOSED_Y, // Punch plunges DOWN into cavity!
            duration: 0.45,
            ease: 'power4.in',
            onStart: function () {
              if (strokeReadout) strokeReadout.textContent = 'STROKE: RAM ADVANCING DOWN...';
            },
          })
          // Step 3: TONNAGE DWELL AT BOTTOM DEAD CENTER (BDC)
          .to(strokeProxy, {
            duration: 0.45,
            onStart: function () {
              if (strokeReadout) strokeReadout.textContent = 'STROKE: 0.0 mm (BDC - 500T STAMP)';
              if (rootGroup) rootGroup.position.y = -1.3;
            },
            onComplete: function () {
              if (rootGroup) rootGroup.position.y = -1.0;
            },
          })
          // Step 4: RETURN STROKE BACK UP TO TOP DEAD CENTER
          .to(strokeProxy, {
            y: STROKE_OPEN_Y,
            duration: 0.75,
            ease: 'power2.out',
            onStart: function () {
              if (strokeReadout) strokeReadout.textContent = 'STROKE: RETRACTING TO TDC...';
            },
            onComplete: function () {
              if (strokeReadout) strokeReadout.textContent = 'STROKE: 310.0 mm (TDC - READY)';
            },
          });
      });
    }

    // 3. Reset Camera & View
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        isExplodedManual = false;
        if (btnExplode) btnExplode.classList.remove('active');
        applyPartExplosion(0.0);

        if (typeof gsap !== 'undefined') {
          gsap.to(
            { y: currentRotY, x: currentRotX, strokeY: currentStrokeY },
            {
              y: 0.58,
              x: 0.22,
              strokeY: STROKE_OPEN_Y,
              duration: 0.85,
              ease: 'power2.out',
              onUpdate: function () {
                targetRotY = this.targets()[0].y;
                targetRotX = this.targets()[0].x;
                setDieStroke(this.targets()[0].strokeY);
              },
            }
          );
        } else {
          targetRotY = 0.58;
          targetRotX = 0.22;
          setDieStroke(STROKE_OPEN_Y);
        }
      });
    }
  }

  function onWindowResize() {
    if (!canvasMount || !camera || !renderer) return;
    var width = canvasMount.clientWidth || 640;
    var height = canvasMount.clientHeight || 560;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  }

  var isHeroVisible = true;
  var rafId = null;

  function setupVisibilityObserver() {
    if ('IntersectionObserver' in window && canvasMount) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isHeroVisible = entry.isIntersecting;
            if (isHeroVisible && !rafId) {
              animate();
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(canvasMount);
    }
  }

  var lastAnimTime = 0;
  function animate(timestamp) {
    if (!isHeroVisible) {
      rafId = null;
      lastAnimTime = 0;
      return;
    }
    rafId = requestAnimationFrame(animate);

    if (!timestamp) timestamp = performance.now();
    var delta = lastAnimTime ? Math.min((timestamp - lastAnimTime) / 1000, 0.08) : 0.016;
    lastAnimTime = timestamp;

    if (autoRotate && !isDragging) {
      // 0.52 rad/sec completes a smooth, lively 360 showcase in ~12 seconds
      currentRotY += 0.52 * delta;
      targetRotY = currentRotY;
    } else {
      currentRotY += (targetRotY - currentRotY) * 0.15;
    }

    currentRotX += (targetRotX - currentRotX) * 0.15;

    if (rootGroup) {
      rootGroup.rotation.y = currentRotY;
      rootGroup.rotation.x = currentRotX;
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init();
      setupVisibilityObserver();
    });
  } else {
    init();
    setupVisibilityObserver();
  }
})();
