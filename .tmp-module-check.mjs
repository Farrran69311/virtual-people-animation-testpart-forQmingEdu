
      import * as THREE from 'three';
      import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
      import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
      import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
      import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

      const MIXAMO_VRM_BONE_MAP = {
        Hips: 'hips',
        Spine: 'spine',
        Spine1: 'chest',
        Spine2: 'upperChest',
        Neck: 'neck',
        Head: 'head',
        LeftShoulder: 'leftShoulder',
        LeftArm: 'leftUpperArm',
        LeftForeArm: 'leftLowerArm',
        LeftHand: 'leftHand',
        LeftUpLeg: 'leftUpperLeg',
        LeftLeg: 'leftLowerLeg',
        LeftFoot: 'leftFoot',
        LeftToeBase: 'leftToes',
        RightShoulder: 'rightShoulder',
        RightArm: 'rightUpperArm',
        RightForeArm: 'rightLowerArm',
        RightHand: 'rightHand',
        RightUpLeg: 'rightUpperLeg',
        RightLeg: 'rightLowerLeg',
        RightFoot: 'rightFoot',
        RightToeBase: 'rightToes',
        LeftHandThumb1: 'leftThumbMetacarpal',
        LeftHandThumb2: 'leftThumbProximal',
        LeftHandThumb3: 'leftThumbDistal',
        LeftHandIndex1: 'leftIndexProximal',
        LeftHandIndex2: 'leftIndexIntermediate',
        LeftHandIndex3: 'leftIndexDistal',
        LeftHandMiddle1: 'leftMiddleProximal',
        LeftHandMiddle2: 'leftMiddleIntermediate',
        LeftHandMiddle3: 'leftMiddleDistal',
        LeftHandRing1: 'leftRingProximal',
        LeftHandRing2: 'leftRingIntermediate',
        LeftHandRing3: 'leftRingDistal',
        LeftHandPinky1: 'leftLittleProximal',
        LeftHandPinky2: 'leftLittleIntermediate',
        LeftHandPinky3: 'leftLittleDistal',
        RightHandThumb1: 'rightThumbMetacarpal',
        RightHandThumb2: 'rightThumbProximal',
        RightHandThumb3: 'rightThumbDistal',
        RightHandIndex1: 'rightIndexProximal',
        RightHandIndex2: 'rightIndexIntermediate',
        RightHandIndex3: 'rightIndexDistal',
        RightHandMiddle1: 'rightMiddleProximal',
        RightHandMiddle2: 'rightMiddleIntermediate',
        RightHandMiddle3: 'rightMiddleDistal',
        RightHandRing1: 'rightRingProximal',
        RightHandRing2: 'rightRingIntermediate',
        RightHandRing3: 'rightRingDistal',
        RightHandPinky1: 'rightLittleProximal',
        RightHandPinky2: 'rightLittleIntermediate',
        RightHandPinky3: 'rightLittleDistal',
      };

      const EMOTION_PRESETS = [
        { key: 'neutral', aliases: ['neutral'] },
        { key: 'happy', aliases: ['happy', 'joy'] },
        { key: 'relaxed', aliases: ['relaxed', 'fun'] },
        { key: 'sad', aliases: ['sad', 'sorrow'] },
        { key: 'angry', aliases: ['angry'] },
        { key: 'surprised', aliases: ['surprised'] },
      ];

      const PUNCTUATION_PAUSE = {
        '\uFF0C': 160,
        ',': 160,
        '\u3002': 280,
        '.': 280,
        '\uFF01': 280,
        '!': 280,
        '\uFF1F': 280,
        '?': 280,
        '\uFF1B': 220,
        ';': 220,
        '\uFF1A': 180,
        ':': 180,
      };

      const clock = new THREE.Clock();
      const canvas = document.getElementById('canvas');
      const searchInput = document.getElementById('searchInput');
      const groupSelect = document.getElementById('groupSelect');
      const speedSelect = document.getElementById('speedSelect');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const playPauseBtn = document.getElementById('playPauseBtn');
      const loopBtn = document.getElementById('loopBtn');
      const motionListEl = document.getElementById('motionList');
      const countText = document.getElementById('countText');
      const selectionText = document.getElementById('selectionText');
      const statusDot = document.getElementById('statusDot');
      const statusText = document.getElementById('statusText');
      const currentTitle = document.getElementById('currentTitle');
      const currentMeta = document.getElementById('currentMeta');
      const actionSelect = document.getElementById('actionSelect');
      const moodSelect = document.getElementById('moodSelect');
      const speechInput = document.getElementById('speechInput');
      const speakBtn = document.getElementById('speakBtn');
      const stopSpeakBtn = document.getElementById('stopSpeakBtn');
      const applyMoodBtn = document.getElementById('applyMoodBtn');
      const resetFaceBtn = document.getElementById('resetFaceBtn');
      const speechPanel = document.getElementById('speechPanel');
      const speechText = document.getElementById('speechText');
      const speechMeta = document.getElementById('speechMeta');

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#edf3f6');

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0.0, 1.45, 2.75);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 1.15, 0);
      controls.enableDamping = true;
      controls.minDistance = 1.1;
      controls.maxDistance = 6;
      controls.maxPolarAngle = Math.PI * 0.55;

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xa4b1bf, 1.8);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(1.8, 3.2, 2.4);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xd8efff, 0.45);
      fillLight.position.set(-2.0, 1.8, -1.4);
      scene.add(fillLight);

      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(4.5, 72),
        new THREE.MeshStandardMaterial({
          color: '#dbe7ee',
          roughness: 0.9,
          metalness: 0.0,
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.001;
      scene.add(floor);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.72, 0.78, 72),
        new THREE.MeshBasicMaterial({ color: '#9db9b1', transparent: true, opacity: 0.66 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.002;
      scene.add(ring);

      const grid = new THREE.GridHelper(8, 16, '#b8c7d5', '#d5dfe7');
      grid.position.y = 0.0005;
      grid.material.opacity = 0.25;
      grid.material.transparent = true;
      scene.add(grid);

      const gltfLoader = new GLTFLoader();
      gltfLoader.register((parser) => new VRMLoaderPlugin(parser));

      const fbxLoader = new FBXLoader();
      const loaderCache = new Map();
      const tempVectorA = new THREE.Vector3();
      const tempVectorB = new THREE.Vector3();
      const tempVectorC = new THREE.Vector3();
      const tempVectorD = new THREE.Vector3();

      const state = {
        vrmUrl: '',
        vrm: null,
        avatarRoot: null,
        mixer: null,
        currentAction: null,
        currentActionKey: '',
        motionList: [],
        filteredList: [],
        currentIndex: -1,
        loop: true,
        paused: false,
        speed: 1,
        expressionMap: {},
        mouthMap: {},
        emotionMap: {},
        lipSyncHandle: 0,
        lipSyncTimeout: 0,
        lipSyncToken: 0,
        activeMood: 'neutral',
      };

      function setStatus(kind, text) {
        statusText.textContent = text;
        statusDot.className = `dot ${kind}`;
      }

      function resizeRenderer() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = Math.max(320, Math.floor(rect.width));
        const height = Math.max(420, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      function normalizeMixamoNodeName(name) {
        return name
          .replace(/^mixamorig[:_]?/i, '')
          .replace(/^Armature[|:_]?/i, '')
          .replace(/^Beta[:_]?/i, '');
      }

      function findMotionBone(root, name) {
        const candidates = [name, `mixamorig${name}`, `mixamorig:${name}`, `mixamorig_${name}`];
        for (const candidate of candidates) {
          const node = root.getObjectByName(candidate);
          if (node) return node;
        }
        return null;
      }

      function findVRMBone(vrm, name) {
        return vrm.humanoid?.getRawBoneNode(name) || vrm.humanoid?.getNormalizedBoneNode(name) || null;
      }

      function anchorAvatarToFeetCenter(vrm, avatarRoot) {
        const leftFoot = findVRMBone(vrm, 'leftFoot');
        const rightFoot = findVRMBone(vrm, 'rightFoot');
        if (!leftFoot || !rightFoot) return;

        const leftFootPos = leftFoot.getWorldPosition(tempVectorA);
        const rightFootPos = rightFoot.getWorldPosition(tempVectorB);
        const leftToes = findVRMBone(vrm, 'leftToes');
        const rightToes = findVRMBone(vrm, 'rightToes');
        const leftToesY = leftToes?.getWorldPosition(tempVectorC).y ?? leftFootPos.y;
        const rightToesY = rightToes?.getWorldPosition(tempVectorD).y ?? rightFootPos.y;

        const centerX = (leftFootPos.x + rightFootPos.x) * 0.5;
        const centerZ = (leftFootPos.z + rightFootPos.z) * 0.5;
        const groundY = Math.min(leftFootPos.y, rightFootPos.y, leftToesY, rightToesY);

        avatarRoot.position.x -= centerX;
        avatarRoot.position.y -= groundY;
        avatarRoot.position.z -= centerZ;
        avatarRoot.updateMatrixWorld(true);
      }

      function getGroundReferenceBones(vrm) {
        return [
          findVRMBone(vrm, 'leftFoot'),
          findVRMBone(vrm, 'rightFoot'),
          findVRMBone(vrm, 'leftToes'),
          findVRMBone(vrm, 'rightToes'),
        ].filter(Boolean);
      }

      function sampleClipGrounding(vrm, clip) {
        const groundBones = getGroundReferenceBones(vrm);
        if (!groundBones.length) return { minY: 0, centerX: 0, centerZ: 0 };

        vrm.humanoid?.resetNormalizedPose();
        vrm.humanoid?.update();
        vrm.update(0);
        vrm.scene.updateMatrixWorld(true);

        const tempMixer = new THREE.AnimationMixer(vrm.scene);
        const tempAction = tempMixer.clipAction(clip);
        tempAction.reset();
        tempAction.setLoop(THREE.LoopOnce, 1);
        tempAction.clampWhenFinished = true;
        tempAction.play();

        const duration = Math.max(clip.duration, 0);
        const sampleCount = Math.max(12, Math.min(72, Math.ceil(duration * 24)));
        let minY = Number.POSITIVE_INFINITY;
        let centerX = 0;
        let centerZ = 0;

        for (let sampleIndex = 0; sampleIndex <= sampleCount; sampleIndex += 1) {
          const t = duration === 0 ? 0 : (duration * sampleIndex) / sampleCount;
          tempMixer.setTime(t);
          vrm.update(0);
          vrm.scene.updateMatrixWorld(true);

          let sumX = 0;
          let sumZ = 0;
          let count = 0;
          for (const bone of groundBones) {
            const pos = bone.getWorldPosition(tempVectorA);
            minY = Math.min(minY, pos.y);
            sumX += pos.x;
            sumZ += pos.z;
            count += 1;
          }

          if (sampleIndex === 0 && count > 0) {
            centerX = sumX / count;
            centerZ = sumZ / count;
          }
        }

        tempAction.stop();
        tempMixer.stopAllAction();
        vrm.humanoid?.resetNormalizedPose();
        vrm.humanoid?.update();
        vrm.update(0);
        vrm.scene.updateMatrixWorld(true);

        return {
          minY: Number.isFinite(minY) ? minY : 0,
          centerX,
          centerZ,
        };
      }

      function bakeGroundingToClip(vrm, clip) {
        const hipsNode = vrm.humanoid?.getNormalizedBoneNode('hips');
        if (!hipsNode) return clip;

        const hipsTrackName = `${hipsNode.name}.position`;
        const hipsTrack = clip.tracks.find(
          (track) => track instanceof THREE.VectorKeyframeTrack && track.name === hipsTrackName
        );
        if (!hipsTrack) return clip;

        const grounding = sampleClipGrounding(vrm, clip);
        const values = hipsTrack.values.slice();

        for (let i = 0; i < values.length; i += 3) {
          values[i] -= grounding.centerX;
          values[i + 1] -= grounding.minY;
          values[i + 2] -= grounding.centerZ;
        }

        const groundedHipsTrack = new THREE.VectorKeyframeTrack(
          hipsTrack.name,
          hipsTrack.times.slice(),
          values
        );

        const tracks = clip.tracks.map((track) => (track === hipsTrack ? groundedHipsTrack : track));
        return new THREE.AnimationClip(`${clip.name}_grounded`, clip.duration, tracks);
      }

      function buildMixamoToVRMClip(clip, fbx, vrm) {
        const tracks = [];
        const restRotationInverse = new THREE.Quaternion();
        const parentRestWorldRotation = new THREE.Quaternion();
        const quaternion = new THREE.Quaternion();
        const motionHips = findMotionBone(fbx, 'Hips');
        const vrmHips = vrm.humanoid?.getNormalizedBoneNode('hips');
        const motionHipsHeight = motionHips ? Math.abs(motionHips.position.y) : 1;
        const vrmRootY = vrm.scene.getWorldPosition(tempVectorA).y;
        const vrmHipsY = vrmHips?.getWorldPosition(tempVectorB).y ?? 1;
        const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
        const hipsPositionScale = motionHipsHeight > 1e-5 ? vrmHipsHeight / motionHipsHeight : 1;

        for (const track of clip.tracks) {
          const trackParts = track.name.split('.');
          const mixamoBoneName = normalizeMixamoNodeName(trackParts[0]);
          const propertyName = trackParts[1];
          const vrmBoneName = MIXAMO_VRM_BONE_MAP[mixamoBoneName];
          const motionNode = findMotionBone(fbx, mixamoBoneName);

          if (!vrmBoneName || !motionNode) continue;

          const normalizedNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);
          if (!normalizedNode) continue;

          motionNode.getWorldQuaternion(restRotationInverse).invert();
          if (motionNode.parent) {
            motionNode.parent.getWorldQuaternion(parentRestWorldRotation);
          } else {
            parentRestWorldRotation.identity();
          }

          if (track instanceof THREE.QuaternionKeyframeTrack && propertyName === 'quaternion') {
            const values = track.values.slice();
            for (let i = 0; i < values.length; i += 4) {
              quaternion.fromArray(values, i);
              quaternion.premultiply(parentRestWorldRotation);
              quaternion.multiply(restRotationInverse);
              quaternion.toArray(values, i);
            }

            tracks.push(
              new THREE.QuaternionKeyframeTrack(
                `${normalizedNode.name}.quaternion`,
                track.times.slice(),
                values
              )
            );
          } else if (
            mixamoBoneName === 'Hips' &&
            track instanceof THREE.VectorKeyframeTrack &&
            propertyName === 'position'
          ) {
            const values = track.values.slice();
            const initialX = values[0] ?? 0;
            const initialY = values[1] ?? motionHipsHeight;
            const initialZ = values[2] ?? 0;

            for (let i = 0; i < values.length; i += 3) {
              values[i] = (values[i] - initialX) * hipsPositionScale;
              values[i + 1] = (values[i + 1] - initialY) * hipsPositionScale + vrmHipsHeight;
              values[i + 2] = (values[i + 2] - initialZ) * hipsPositionScale;
            }

            tracks.push(
              new THREE.VectorKeyframeTrack(
                `${normalizedNode.name}.position`,
                track.times.slice(),
                values
              )
            );
          }
        }

        if (!tracks.length) {
          throw new Error('娌℃湁鎴愬姛鏄犲皠鍒?VRM humanoid 楠ㄩ锛岃繖鏉?FBX 鍙兘涓嶆槸鏍囧噯 humanoid 鍔ㄤ綔銆?);
        }

        const remappedClip = new THREE.AnimationClip(`${clip.name || 'motion'}_vrm`, clip.duration, tracks);
        return bakeGroundingToClip(vrm, remappedClip);
      }

      function buildExpressionMaps(vrm) {
        const manager = vrm?.expressionManager;
        const expressionMap = manager?.expressionMap || {};
        const mouthMap = {
          aa: expressionMap.aa || expressionMap.a || null,
          ih: expressionMap.ih || expressionMap.i || null,
          ou: expressionMap.ou || expressionMap.u || null,
          ee: expressionMap.ee || expressionMap.e || null,
          oh: expressionMap.oh || expressionMap.o || null,
        };

        const emotionMap = {};
        for (const preset of EMOTION_PRESETS) {
          const found = preset.aliases.find((alias) => expressionMap[alias]);
          emotionMap[preset.key] = found || null;
        }

        return { expressionMap, mouthMap, emotionMap };
      }

      function clearAllExpressions() {
        const manager = state.vrm?.expressionManager;
        if (!manager) return;
        manager.resetValues();
        manager.update();
      }

      function applyMood(moodKey = 'neutral', strength = 0.8) {
        const manager = state.vrm?.expressionManager;
        if (!manager) return;
        const moodName = state.emotionMap[moodKey];
        for (const preset of EMOTION_PRESETS) {
          const exprName = state.emotionMap[preset.key];
          if (exprName) {
            manager.setValue(exprName, 0);
          }
        }
        if (moodName) {
          manager.setValue(moodName, moodKey === 'neutral' ? 0 : strength);
        }
        state.activeMood = moodKey;
        manager.update();
      }

      function setMouthWeights(weights = {}) {
        const manager = state.vrm?.expressionManager;
        if (!manager) return;
        for (const key of ['aa', 'ih', 'ou', 'ee', 'oh']) {
          const exprName = state.mouthMap[key];
          if (exprName) manager.setValue(exprName, weights[key] || 0);
        }
        manager.update();
      }

      function resetMouth() {
        setMouthWeights({ aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 });
      }

      function stopSpeaking(options = {}) {
        state.lipSyncToken += 1;
        if (state.lipSyncHandle) {
          cancelAnimationFrame(state.lipSyncHandle);
          state.lipSyncHandle = 0;
        }
        if (state.lipSyncTimeout) {
          clearTimeout(state.lipSyncTimeout);
          state.lipSyncTimeout = 0;
        }
        resetMouth();
        applyMood(state.activeMood || 'neutral');

        if (!options.keepPanel) {
          speechPanel.classList.add('hidden');
          speechText.textContent = '';
          speechMeta.textContent = '';
        }
      }

      function resolveMouthKeyFromChar(char) {
        if (!char) return null;
        if (/\s/.test(char)) return null;
        if (PUNCTUATION_PAUSE[char]) return null;

        const code = char.codePointAt(0) || 0;
        if (char >= 'a' && char <= 'z') {
          if ('a'.includes(char)) return 'aa';
          if ('i'.includes(char)) return 'ih';
          if ('u'.includes(char)) return 'ou';
          if ('e'.includes(char)) return 'ee';
          if ('o'.includes(char)) return 'oh';
        }

        const mapIndex = code % 5;
        return ['aa', 'ih', 'ou', 'ee', 'oh'][mapIndex];
      }

      function buildSpeechPlan(text) {
        const plan = [];
        for (const char of text) {
          if (PUNCTUATION_PAUSE[char]) {
            plan.push({
              char,
              mouth: null,
              duration: PUNCTUATION_PAUSE[char],
            });
            continue;
          }
          if (!char.trim()) {
            plan.push({
              char,
              mouth: null,
              duration: 90,
            });
            continue;
          }
          plan.push({
            char,
            mouth: resolveMouthKeyFromChar(char),
            duration: 145,
          });
        }
        return plan;
      }

      function animateMouthTo(targetKey, duration = 90, token) {
        const start = performance.now();
        const initial = {
          aa: 0,
          ih: 0,
          ou: 0,
          ee: 0,
          oh: 0,
        };

        const manager = state.vrm?.expressionManager;
        if (manager) {
          for (const key of Object.keys(initial)) {
            const exprName = state.mouthMap[key];
            if (exprName) initial[key] = manager.getValue(exprName) || 0;
          }
        }

        const target = {
          aa: 0,
          ih: 0,
          ou: 0,
          ee: 0,
          oh: 0,
        };

        if (targetKey && target[targetKey] !== undefined) {
          target[targetKey] = 0.82;
        }

        return new Promise((resolve) => {
          function frame(now) {
            if (token !== state.lipSyncToken) {
              resolve(false);
              return;
            }
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const weights = {};
            for (const key of Object.keys(target)) {
              weights[key] = initial[key] + (target[key] - initial[key]) * eased;
            }
            setMouthWeights(weights);
            if (t < 1) {
              state.lipSyncHandle = requestAnimationFrame(frame);
            } else {
              state.lipSyncHandle = 0;
              resolve(true);
            }
          }

          state.lipSyncHandle = requestAnimationFrame(frame);
        });
      }

      async function speakText(text) {
        const trimmed = text.trim();
        if (!trimmed || !state.vrm) return;

        stopSpeaking({ keepPanel: true });
        state.lipSyncToken += 1;
        const token = state.lipSyncToken;
        const plan = buildSpeechPlan(trimmed);

        speechText.textContent = trimmed;
        speechMeta.textContent = `绾墠绔彛鍨嬫祴璇?路 鍏?${plan.length} 涓瓧/鍋滈】鍗曞厓`;
        speechPanel.classList.remove('hidden');

        for (let i = 0; i < plan.length; i += 1) {
          if (token !== state.lipSyncToken) return;
          const item = plan[i];
          const currentLabel = item.mouth ? `绗?${i + 1} 姝ワ細${item.char} -> ${item.mouth}` : `绗?${i + 1} 姝ワ細${item.char} -> 鍋滈】`;
          speechMeta.textContent = `绾墠绔彛鍨嬫祴璇?路 ${currentLabel}`;

          if (item.mouth) {
            await animateMouthTo(item.mouth, 70, token);
          } else {
            await animateMouthTo(null, 60, token);
          }

          if (token !== state.lipSyncToken) return;

          await new Promise((resolve) => {
            state.lipSyncTimeout = window.setTimeout(() => {
              state.lipSyncTimeout = 0;
              resolve();
            }, item.duration);
          });
        }

        if (token !== state.lipSyncToken) return;
        await animateMouthTo(null, 110, token);
        speechMeta.textContent = '绾墠绔彛鍨嬫祴璇?路 宸插畬鎴?;
      }

      async function loadVRM(vrmUrl) {
        const gltf = await gltfLoader.loadAsync(vrmUrl);
        const vrm = gltf.userData.vrm;
        VRMUtils.rotateVRM0(vrm);
        vrm.scene.rotation.y = Math.PI;

        const avatarRoot = new THREE.Group();
        avatarRoot.name = 'AvatarRoot';
        avatarRoot.add(vrm.scene);
        scene.add(avatarRoot);
        avatarRoot.updateMatrixWorld(true);
        anchorAvatarToFeetCenter(vrm, avatarRoot);

        return { vrm, avatarRoot };
      }

      async function loadFBX(url) {
        if (!loaderCache.has(url)) {
          loaderCache.set(url, fbxLoader.loadAsync(url));
        }
        return loaderCache.get(url);
      }

      function stopCurrentAction() {
        if (state.currentAction) {
          state.currentAction.stop();
          state.currentAction = null;
        }
        if (state.vrm?.humanoid) {
          state.vrm.humanoid.resetNormalizedPose();
          state.vrm.humanoid.update();
        }
      }

      function updateSelectionMeta() {
        const current = state.filteredList[state.currentIndex];
        selectionText.textContent = current
          ? `${state.currentIndex + 1} / ${state.filteredList.length}`
          : '鏈€変腑';
      }

      function updateLoopButton() {
        loopBtn.textContent = state.loop ? '寰幆寮€' : '寰幆鍏?;
        loopBtn.classList.toggle('accent', state.loop);
        loopBtn.classList.toggle('secondary', !state.loop);
      }

      function updatePlayPauseButton() {
        playPauseBtn.textContent = state.paused ? '缁х画' : '鏆傚仠';
      }

      function applyPlaybackState() {
        if (state.currentAction) {
          state.currentAction.paused = state.paused;
          state.currentAction.setLoop(state.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
        }
        if (state.mixer) {
          state.mixer.timeScale = state.speed;
        }
        updateLoopButton();
        updatePlayPauseButton();
      }

      function renderMotionList() {
        motionListEl.innerHTML = '';

        for (const [index, motion] of state.filteredList.entries()) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'motion-item';
          if (index === state.currentIndex) button.classList.add('active');
          button.dataset.index = String(index);
          button.innerHTML = `
            <div class="motion-title">${motion.name}</div>
            <div class="motion-sub">
              <span>鍒嗙粍 ${motion.group}</span>
              <span>${motion.fileName}</span>
            </div>
          `;
          button.addEventListener('click', () => playMotionByIndex(index));
          motionListEl.appendChild(button);
        }

        countText.textContent = `${state.filteredList.length} / ${state.motionList.length} 涓姩浣渀;
        updateSelectionMeta();
      }

      function filterMotions() {
        const keyword = searchInput.value.trim().toLowerCase();
        const group = groupSelect.value;

        state.filteredList = state.motionList.filter((motion) => {
          const matchesGroup = group === 'all' || motion.group === group;
          const haystack = `${motion.name} ${motion.fileName}`.toLowerCase();
          const matchesKeyword = !keyword || haystack.includes(keyword);
          return matchesGroup && matchesKeyword;
        });

        if (!state.filteredList.length) {
          state.currentIndex = -1;
        } else if (state.currentIndex >= state.filteredList.length || state.currentIndex < 0) {
          state.currentIndex = 0;
        }

        renderMotionList();
      }

      async function playMotionByIndex(index) {
        if (!state.vrm || !state.filteredList[index]) return;
        state.currentIndex = index;
        renderMotionList();

        const motion = state.filteredList[index];
        setStatus('', `姝ｅ湪鍔犺浇鍔ㄤ綔: ${motion.fileName}`);
        currentTitle.textContent = motion.name;
        currentMeta.textContent = `鍒嗙粍 ${motion.group} 路 ${motion.fileName}`;

        try {
          const fbx = await loadFBX(motion.path);
          const clip = fbx.animations?.[0];
          if (!clip) {
            throw new Error('杩欎釜 FBX 閲屾病鏈夊姩鐢昏建閬撱€?);
          }

          stopCurrentAction();
          const remappedClip = buildMixamoToVRMClip(clip, fbx, state.vrm);

          if (!state.mixer) {
            state.mixer = new THREE.AnimationMixer(state.vrm.scene);
          }

          const action = state.mixer.clipAction(remappedClip);
          action.reset();
          action.clampWhenFinished = true;
          state.currentAction = action;
          state.currentActionKey = motion.path;
          applyPlaybackState();
          action.play();

          setStatus('ok', `褰撳墠鍔ㄤ綔: ${motion.fileName}`);
          currentTitle.textContent = motion.name;
          currentMeta.textContent = `鍒嗙粍 ${motion.group} 路 鏃堕暱 ${clip.duration.toFixed(2)}s 路 ${motion.fileName}`;
        } catch (error) {
          console.error(error);
          setStatus('bad', `鍔ㄤ綔鍔犺浇澶辫触: ${motion.fileName}`);
          currentTitle.textContent = motion.name;
          currentMeta.textContent = `鍒嗙粍 ${motion.group} 路 ${motion.fileName}`;
          speechMeta.textContent = error?.message || String(error);
          speechPanel.classList.remove('hidden');
        }
      }

      async function playMotionByPath(motionPath) {
        if (!motionPath) return;
        const index = state.filteredList.findIndex((item) => item.path === motionPath);
        if (index >= 0) {
          await playMotionByIndex(index);
          return;
        }
        const allIndex = state.motionList.findIndex((item) => item.path === motionPath);
        if (allIndex < 0) return;

        const motion = state.motionList[allIndex];
        const currentGroupValue = groupSelect.value;
        if (currentGroupValue !== 'all' && currentGroupValue !== motion.group) {
          groupSelect.value = 'all';
          filterMotions();
        }
        const nextIndex = state.filteredList.findIndex((item) => item.path === motionPath);
        if (nextIndex >= 0) {
          await playMotionByIndex(nextIndex);
        }
      }

      function moveSelection(step) {
        if (!state.filteredList.length) return;
        let nextIndex = state.currentIndex + step;
        if (nextIndex < 0) nextIndex = state.filteredList.length - 1;
        if (nextIndex >= state.filteredList.length) nextIndex = 0;
        playMotionByIndex(nextIndex);
      }

      function populateActionSelect() {
        actionSelect.innerHTML = '<option value="">璺熼殢宸︿晶褰撳墠鍔ㄤ綔</option>';
        for (const motion of state.motionList) {
          const option = document.createElement('option');
          option.value = motion.path;
          option.textContent = `缁?${motion.group} 路 ${motion.fileName}`;
          actionSelect.appendChild(option);
        }
      }

      async function init() {
        resizeRenderer();
        setStatus('', '姝ｅ湪璇诲彇鍔ㄤ綔鍒楄〃');

        const response = await fetch('/api/motions');
        const payload = await response.json();
        state.motionList = payload.motions;
        state.vrmUrl = payload.vrm;

        const groups = [...new Set(state.motionList.map((item) => item.group))];
        for (const group of groups) {
          const option = document.createElement('option');
          option.value = group;
          option.textContent = `鍒嗙粍 ${group}`;
          groupSelect.appendChild(option);
        }

        populateActionSelect();
        filterMotions();

        setStatus('', '姝ｅ湪鍔犺浇 VRM 妯″瀷');
        const loadedAvatar = await loadVRM(state.vrmUrl);
        state.vrm = loadedAvatar.vrm;
        state.avatarRoot = loadedAvatar.avatarRoot;

        const maps = buildExpressionMaps(state.vrm);
        state.expressionMap = maps.expressionMap;
        state.mouthMap = maps.mouthMap;
        state.emotionMap = maps.emotionMap;
        clearAllExpressions();
        applyMood('neutral');

        currentTitle.textContent = 'VRM 宸插姞杞?;
        currentMeta.textContent = `鍔ㄤ綔鎬绘暟 ${state.motionList.length}锛屽彲浠ョ洿鎺ユ祴璇曞姩浣溿€佽〃鎯呭拰鍓嶇鍙ｅ瀷銆俙;
        setStatus('ok', `VRM 宸插姞杞斤紝鍏?${state.motionList.length} 涓姩浣渀);

        if (state.filteredList.length) {
          await playMotionByIndex(0);
        }
      }

      searchInput.addEventListener('input', filterMotions);
      groupSelect.addEventListener('change', filterMotions);
      speedSelect.addEventListener('change', () => {
        state.speed = Number(speedSelect.value);
        applyPlaybackState();
      });
      loopBtn.addEventListener('click', () => {
        state.loop = !state.loop;
        applyPlaybackState();
      });
      playPauseBtn.addEventListener('click', () => {
        state.paused = !state.paused;
        applyPlaybackState();
      });
      prevBtn.addEventListener('click', () => moveSelection(-1));
      nextBtn.addEventListener('click', () => moveSelection(1));

      applyMoodBtn.addEventListener('click', () => {
        stopSpeaking();
        applyMood(moodSelect.value);
        speechText.textContent = '';
        speechMeta.textContent = `褰撳墠琛ㄦ儏锛?{moodSelect.value}`;
        speechPanel.classList.remove('hidden');
      });

      resetFaceBtn.addEventListener('click', () => {
        stopSpeaking();
        clearAllExpressions();
        applyMood('neutral');
      });

      stopSpeakBtn.addEventListener('click', () => {
        stopSpeaking();
      });

      speakBtn.addEventListener('click', async () => {
        const motionPath = actionSelect.value;
        const text = speechInput.value;
        const mood = moodSelect.value;

        if (!text.trim()) {
          speechText.textContent = '';
          speechMeta.textContent = '璇疯緭鍏ユ祴璇曟枃鏈€?;
          speechPanel.classList.remove('hidden');
          return;
        }

        if (motionPath) {
          await playMotionByPath(motionPath);
        }

        applyMood(mood);
        await speakText(text);
      });

      window.addEventListener('keydown', (event) => {
        const active = document.activeElement;
        if (
          active instanceof HTMLInputElement ||
          active instanceof HTMLSelectElement ||
          active instanceof HTMLTextAreaElement
        ) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          moveSelection(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          moveSelection(1);
        } else if (event.key === ' ') {
          event.preventDefault();
          state.paused = !state.paused;
          applyPlaybackState();
        } else if (event.key.toLowerCase() === 'l') {
          event.preventDefault();
          state.loop = !state.loop;
          applyPlaybackState();
        }
      });

      window.addEventListener('resize', resizeRenderer);

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        controls.update();
        state.mixer?.update(delta);
        state.vrm?.update(delta);
        renderer.render(scene, camera);
      });

      init().catch((error) => {
        console.error(error);
        currentTitle.textContent = '鍔犺浇澶辫触';
        currentMeta.textContent = error?.message || String(error);
        setStatus('bad', '鍒濆鍖栧け璐?);
        speechText.textContent = '';
        speechMeta.textContent = error?.stack || error?.message || String(error);
        speechPanel.classList.remove('hidden');
      });
    
