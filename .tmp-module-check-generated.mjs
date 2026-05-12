
      import * as THREE from 'three';
      import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
      import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
      import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
      import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
      import { pinyin } from 'pinyin-pro';

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

      const LETTER_TO_MOUTH = {
        a: 'aa',
        o: 'oh',
        e: 'ee',
        i: 'ih',
        u: 'ou',
        v: 'ee',
      };

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

      const MOOD_SPEECH_STYLE = {
        neutral: { mouthScale: 0.82, durationScale: 1, releaseScale: 1 },
        happy: { mouthScale: 0.9, durationScale: 0.92, releaseScale: 0.88 },
        relaxed: { mouthScale: 0.72, durationScale: 1.08, releaseScale: 1.12 },
        sad: { mouthScale: 0.62, durationScale: 1.12, releaseScale: 1.15 },
        angry: { mouthScale: 0.95, durationScale: 0.86, releaseScale: 0.82 },
        surprised: { mouthScale: 1.0, durationScale: 0.9, releaseScale: 0.9 },
      };

      const MOOD_MOTION_STYLE = {
        neutral: { nodAmp: 0.018, swayAmp: 0.012, blinkChance: 0.004 },
        happy: { nodAmp: 0.026, swayAmp: 0.016, blinkChance: 0.006 },
        relaxed: { nodAmp: 0.014, swayAmp: 0.01, blinkChance: 0.007 },
        sad: { nodAmp: 0.01, swayAmp: 0.006, blinkChance: 0.005 },
        angry: { nodAmp: 0.022, swayAmp: 0.008, blinkChance: 0.003 },
        surprised: { nodAmp: 0.02, swayAmp: 0.014, blinkChance: 0.0025 },
      };

      const clock = new THREE.Timer();
      clock.connect(document);
      const canvas = document.getElementById('canvas');
      const searchInput = document.getElementById('searchInput');
      const searchAutocomplete = searchInput.parentElement;
      const searchSuggest = document.getElementById('searchSuggest');
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
        isSpeaking: false,
        blinkTimer: 0,
        blinkActive: false,
        blinkProgress: 0,
        headBone: null,
        neckBone: null,
        speakingMotionTime: 0,
        synth: null,
        voices: [],
        selectedVoiceName: '',
        searchSuggestions: [],
        searchSuggestionIndex: -1,
      };

      const MAX_SEARCH_SUGGESTIONS = 8;

      function setStatus(kind, text) {
        statusText.textContent = text;
        statusDot.className = `dot ${kind}`;
      }

      function getMotionStyleByMood(moodKey = 'neutral') {
        return MOOD_MOTION_STYLE[moodKey] || MOOD_MOTION_STYLE.neutral;
      }

      function detectSpeechSynthesis() {
        if (!('speechSynthesis' in window)) return null;
        return window.speechSynthesis;
      }

      function pickPreferredVoice(voices) {
        if (!voices?.length) return null;

        const zhVoices = voices.filter((voice) => /zh|chinese|mandarin|yue|cn/i.test(`${voice.lang} ${voice.name}`));
        const femaleZhVoice =
          zhVoices.find((voice) => /female|xiaoxiao|xiaoyi|xiaomei|tingting|huihui|jiaojiao|yaoyao|hanna/i.test(voice.name)) ||
          zhVoices.find((voice) => /zh-CN|cmn/i.test(voice.lang)) ||
          zhVoices[0];

        return femaleZhVoice || voices[0] || null;
      }

      function initVoices() {
        state.synth = detectSpeechSynthesis();
        if (!state.synth) return;

        const updateVoices = () => {
          state.voices = state.synth.getVoices() || [];
          const preferred = pickPreferredVoice(state.voices);
          state.selectedVoiceName = preferred?.name || '';
        };

        updateVoices();
        if ('onvoiceschanged' in state.synth) {
          state.synth.onvoiceschanged = updateVoices;
        }
      }

      function speakWithBrowserVoice(text) {
        if (!state.synth || !text?.trim()) return false;

        try {
          state.synth.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          const preferred = pickPreferredVoice(state.voices);

          if (preferred) {
            utterance.voice = preferred;
            utterance.lang = preferred.lang || 'zh-CN';
          } else {
            utterance.lang = 'zh-CN';
          }

          const mood = state.activeMood || 'neutral';
          utterance.rate = mood === 'angry' ? 1.06 : mood === 'sad' ? 0.9 : mood === 'relaxed' ? 0.94 : 1;
          utterance.pitch = mood === 'happy' ? 1.14 : mood === 'surprised' ? 1.2 : mood === 'sad' ? 0.95 : 1.05;
          utterance.volume = 1;

          utterance.onstart = () => {
            speechMeta.textContent = `??????? ? ????????${preferred ? ` ? ${preferred.name}` : ''}`;
          };

          utterance.onerror = () => {
            speechMeta.textContent = '??????? ? ???????????????????';
          };

          utterance.onend = () => {
            if (!state.isSpeaking) {
              speechMeta.textContent = `??????? ? ???${preferred ? ` ? ${preferred.name}` : ''}`;
            }
          };

          state.synth.speak(utterance);
          return true;
        } catch (_error) {
          return false;
        }
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
          throw new Error('没有成功映射到 VRM humanoid 骨骼，这条 FBX 可能不是标准 humanoid 动作。');
        }

        const remappedClip = new THREE.AnimationClip(`${clip.name || 'motion'}_vrm`, clip.duration, tracks);
        return bakeGroundingToClip(vrm, remappedClip);
      }

      function buildExpressionMaps(vrm) {
        const manager = vrm?.expressionManager;
        const expressionMap = manager?.expressionMap || {};
        const hasExpression = (name) => Boolean(expressionMap[name]);
        const mouthMap = {
          aa: hasExpression('aa') ? 'aa' : hasExpression('a') ? 'a' : null,
          ih: hasExpression('ih') ? 'ih' : hasExpression('i') ? 'i' : null,
          ou: hasExpression('ou') ? 'ou' : hasExpression('u') ? 'u' : null,
          ee: hasExpression('ee') ? 'ee' : hasExpression('e') ? 'e' : null,
          oh: hasExpression('oh') ? 'oh' : hasExpression('o') ? 'o' : null,
        };

        const emotionMap = {};
        for (const preset of EMOTION_PRESETS) {
          const found = preset.aliases.find((alias) => hasExpression(alias));
          emotionMap[preset.key] = found || null;
        }

        return { expressionMap, mouthMap, emotionMap };
      }

      function cacheSpeechBones(vrm) {
        state.headBone = findVRMBone(vrm, 'head');
        state.neckBone = findVRMBone(vrm, 'neck');
      }

      function clearAllExpressions() {
        const manager = state.vrm?.expressionManager;
        if (!manager) return;
        manager.resetValues();
        manager.update();
      }

      function getAvailableMouthSummary() {
        return ['aa', 'ih', 'ou', 'ee', 'oh']
          .map((key) => `${key}:${state.mouthMap[key] || '-'}`)
          .join(' | ');
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

      function resetSpeechMotion() {
        state.isSpeaking = false;
        state.blinkTimer = 0;
        state.blinkActive = false;
        state.blinkProgress = 0;
        state.speakingMotionTime = 0;

        if (state.headBone) {
          state.headBone.rotation.x = 0;
          state.headBone.rotation.y = 0;
          state.headBone.rotation.z = 0;
        }

        if (state.neckBone) {
          state.neckBone.rotation.x = 0;
          state.neckBone.rotation.y = 0;
          state.neckBone.rotation.z = 0;
        }
      }

      function getSpeechStyleByMood(moodKey = 'neutral') {
        return MOOD_SPEECH_STYLE[moodKey] || MOOD_SPEECH_STYLE.neutral;
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
        resetSpeechMotion();
        if (state.synth) {
          state.synth.cancel();
        }

        if (!options.keepPanel) {
          speechPanel.classList.add('hidden');
          speechText.textContent = '';
          speechMeta.textContent = '';
        }
      }

      function resolveFallbackMouthKeyFromChar(char) {
        if (!char) return null;
        const code = char.codePointAt(0) || 0;
        return ['aa', 'ih', 'ou', 'ee', 'oh'][code % 5];
      }

      function normalizePinyinSyllable(raw) {
        return String(raw || '')
          .toLowerCase()
          .replace(/[^a-züv]/g, '')
          .replace(/ü/g, 'v');
      }

      function pinyinToMouthSequence(py) {
        const syllable = normalizePinyinSyllable(py);
        if (!syllable) return [];

        const specials = [
          ['iang', ['ih', 'aa']],
          ['iong', ['ih', 'oh']],
          ['uang', ['ou', 'aa']],
          ['ueng', ['ou', 'ee']],
          ['iao', ['ih', 'aa', 'oh']],
          ['ian', ['ih', 'ee']],
          ['ing', ['ih', 'ee']],
          ['ong', ['oh', 'ou']],
          ['ang', ['aa']],
          ['eng', ['ee']],
          ['uan', ['ou', 'aa']],
          ['uai', ['ou', 'aa', 'ih']],
          ['iao', ['ih', 'aa', 'oh']],
          ['ai', ['aa', 'ih']],
          ['ei', ['ee', 'ih']],
          ['ao', ['aa', 'oh']],
          ['ou', ['oh', 'ou']],
          ['ia', ['ih', 'aa']],
          ['ie', ['ih', 'ee']],
          ['iu', ['ih', 'ou']],
          ['io', ['ih', 'oh']],
          ['ua', ['ou', 'aa']],
          ['uo', ['oh', 'ou']],
          ['ui', ['ou', 'ih']],
          ['ve', ['ee']],
          ['an', ['aa']],
          ['en', ['ee']],
          ['in', ['ih']],
          ['un', ['ou']],
          ['er', ['ee']],
        ];

        for (const [ending, sequence] of specials) {
          if (syllable.endsWith(ending)) return sequence;
        }

        const fallback = [];
        for (const ch of syllable) {
          if (LETTER_TO_MOUTH[ch]) fallback.push(LETTER_TO_MOUTH[ch]);
        }
        return fallback.length ? fallback : ['aa'];
      }

      function buildSpeechPlan(text) {
        const plan = [];
        const style = getSpeechStyleByMood(state.activeMood || 'neutral');
        for (const char of text) {
          if (PUNCTUATION_PAUSE[char]) {
            const pauseDuration = Math.round(PUNCTUATION_PAUSE[char] * style.durationScale);
            plan.push({
              char,
              mouths: [],
              duration: pauseDuration,
              label: 'pause',
              ending: char,
            });
            continue;
          }
          if (!char.trim()) {
            plan.push({
              char,
              mouths: [],
              duration: Math.round(90 * style.durationScale),
              label: 'space',
              ending: '',
            });
            continue;
          }

          let py = '';
          try {
            py = pinyin(char, { toneType: 'none', type: 'array' })?.[0] || '';
          } catch (_error) {
            py = '';
          }

          const sequence = py ? pinyinToMouthSequence(py) : [resolveFallbackMouthKeyFromChar(char)];
          const cleanSequence = sequence.filter(Boolean);
          const totalDuration = Math.round((130 + Math.floor(Math.random() * 35)) * style.durationScale);

          plan.push({
            char,
            pinyin: py,
            mouths: cleanSequence,
            duration: totalDuration,
            label: cleanSequence.join(' -> ') || 'fallback',
            ending: '',
          });
        }
        return plan;
      }

      function animateMouthTo(targetKey, duration = 90, token) {
        const start = performance.now();
        const style = getSpeechStyleByMood(state.activeMood || 'neutral');
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
          const jitter = 0.92 + Math.random() * 0.14;
          target[targetKey] = Math.min(1, style.mouthScale * jitter);
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
        state.isSpeaking = true;
        state.speakingMotionTime = 0;

        speechText.textContent = trimmed;
        speechMeta.textContent = `纯前端口型测试 · 共 ${plan.length} 个字/停顿单元`;
        speechPanel.classList.remove('hidden');
        speakWithBrowserVoice(trimmed);

        for (let i = 0; i < plan.length; i += 1) {
          if (token !== state.lipSyncToken) return;
          const item = plan[i];
          const currentLabel = item.mouths.length
            ? `第 ${i + 1} 步：${item.char}${item.pinyin ? `(${item.pinyin})` : ''} -> ${item.label}`
            : `第 ${i + 1} 步：${item.char} -> 停顿`;
          speechMeta.textContent = `纯前端口型测试 · ${currentLabel}`;

          if (item.mouths.length) {
            const segmentDuration = Math.max(50, Math.floor(item.duration / item.mouths.length));
            for (const mouth of item.mouths) {
              await animateMouthTo(mouth, segmentDuration, token);
              if (token !== state.lipSyncToken) return;
            }
          } else {
            await animateMouthTo(null, 60, token);
          }

          if (token !== state.lipSyncToken) return;

          await new Promise((resolve) => {
            state.lipSyncTimeout = window.setTimeout(() => {
              state.lipSyncTimeout = 0;
              resolve();
            }, item.mouths.length ? Math.max(24, Math.floor(item.duration * 0.32)) : item.duration);
          });
        }

        if (token !== state.lipSyncToken) return;
        const style = getSpeechStyleByMood(state.activeMood || 'neutral');
        const lastItem = plan[plan.length - 1];
        let releaseDuration = Math.round(110 * style.releaseScale);
        if (lastItem?.ending === '\uFF1F' || lastItem?.ending === '?') {
          releaseDuration = Math.round(140 * style.releaseScale);
        } else if (lastItem?.ending === '\uFF01' || lastItem?.ending === '!') {
          releaseDuration = Math.round(125 * style.releaseScale);
        } else if (lastItem?.ending === '\u3002' || lastItem?.ending === '.') {
          releaseDuration = Math.round(150 * style.releaseScale);
        }

        await animateMouthTo(null, releaseDuration, token);
        state.isSpeaking = false;
        speechMeta.textContent = '纯前端口型测试 · 已完成';
      }

      function updateSpeechMotion(delta) {
        if (!state.vrm) return;
        const manager = state.vrm.expressionManager;
        if (!manager) return;

        if (state.isSpeaking) {
          state.speakingMotionTime += delta;
          const style = getMotionStyleByMood(state.activeMood || 'neutral');

          if (state.headBone) {
            state.headBone.rotation.x = Math.sin(state.speakingMotionTime * 5.6) * style.nodAmp;
            state.headBone.rotation.y = Math.sin(state.speakingMotionTime * 2.7) * style.swayAmp;
            state.headBone.rotation.z = Math.sin(state.speakingMotionTime * 3.1) * (style.swayAmp * 0.25);
          }

          if (state.neckBone) {
            state.neckBone.rotation.x = Math.sin(state.speakingMotionTime * 4.2) * (style.nodAmp * 0.35);
            state.neckBone.rotation.y = Math.sin(state.speakingMotionTime * 2.2) * (style.swayAmp * 0.4);
          }

          state.blinkTimer += delta;
          if (!state.blinkActive && state.blinkTimer > 0.9) {
            const chanceBase = style.blinkChance;
            const chance = chanceBase + Math.min(0.01, state.blinkTimer * 0.0008);
            if (Math.random() < chance) {
              state.blinkActive = true;
              state.blinkProgress = 0;
              state.blinkTimer = 0;
            }
          }
        } else {
          if (state.headBone) {
            state.headBone.rotation.x *= 0.85;
            state.headBone.rotation.y *= 0.85;
            state.headBone.rotation.z *= 0.85;
          }
          if (state.neckBone) {
            state.neckBone.rotation.x *= 0.85;
            state.neckBone.rotation.y *= 0.85;
            state.neckBone.rotation.z *= 0.85;
          }
        }

        if (state.blinkActive) {
          state.blinkProgress += delta / 0.16;
          const t = state.blinkProgress;
          const blinkWeight = t < 0.5 ? t * 2 : (1 - t) * 2;
          const blinkName =
            state.expressionMap.blink ||
            state.expressionMap.blinkLeft ||
            state.expressionMap.blinkRight ||
            null;

          if (blinkName) {
            const value = Math.max(0, Math.min(1, blinkWeight));
            manager.setValue(blinkName.expressionName || blinkName, value);
            manager.update();
          }

          if (t >= 1) {
            const blinkKey = state.expressionMap.blink ? 'blink' : null;
            if (blinkKey) {
              manager.setValue('blink', 0);
              manager.update();
            } else {
              if (state.expressionMap.blinkLeft) manager.setValue('blinkLeft', 0);
              if (state.expressionMap.blinkRight) manager.setValue('blinkRight', 0);
              manager.update();
            }
            state.blinkActive = false;
            state.blinkProgress = 0;
          }
        }
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
          : '未选中';
      }

      function updateLoopButton() {
        loopBtn.textContent = state.loop ? '循环开' : '循环关';
        loopBtn.classList.toggle('accent', state.loop);
        loopBtn.classList.toggle('secondary', !state.loop);
      }

      function updatePlayPauseButton() {
        playPauseBtn.textContent = state.paused ? '继续' : '暂停';
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
              <span>分组 ${motion.group}</span>
              <span>${motion.fileName}</span>
            </div>
          `;
          button.addEventListener('click', () => playMotionByIndex(index));
          motionListEl.appendChild(button);
        }

        countText.textContent = `${state.filteredList.length} / ${state.motionList.length} 个动作`;
        updateSelectionMeta();
      }

      function scoreMotionSuggestion(motion, keyword) {
        if (!keyword) return Number.POSITIVE_INFINITY;

        const name = motion.name.toLowerCase();
        const fileName = motion.fileName.toLowerCase();
        if (name === keyword) return 0;
        if (fileName === keyword || fileName === `${keyword}.fbx`) return 1;
        if (name.startsWith(keyword)) return 2;
        if (fileName.startsWith(keyword)) return 3;

        const nameIndex = name.indexOf(keyword);
        if (nameIndex >= 0) return 10 + nameIndex;

        const fileNameIndex = fileName.indexOf(keyword);
        if (fileNameIndex >= 0) return 20 + fileNameIndex;

        return Number.POSITIVE_INFINITY;
      }

      function buildSearchSuggestions() {
        const keyword = searchInput.value.trim().toLowerCase();
        const group = groupSelect.value;

        if (!keyword) return [];

        return state.motionList
          .filter((motion) => group === 'all' || motion.group === group)
          .map((motion) => ({ motion, score: scoreMotionSuggestion(motion, keyword) }))
          .filter(({ score }) => Number.isFinite(score))
          .sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.motion.fileName.localeCompare(b.motion.fileName, 'en', { numeric: true, sensitivity: 'base' });
          })
          .slice(0, MAX_SEARCH_SUGGESTIONS)
          .map(({ motion }) => motion);
      }

      function setSearchSuggestionIndex(index) {
        state.searchSuggestionIndex = index;
        for (const item of searchSuggest.querySelectorAll('.search-suggest-item')) {
          item.classList.toggle('active', Number(item.dataset.index) === index);
        }
      }

      function hideSearchSuggestions() {
        state.searchSuggestions = [];
        state.searchSuggestionIndex = -1;
        searchSuggest.classList.add('hidden');
        searchSuggest.innerHTML = '';
      }

      function renderSearchSuggestions() {
        if (document.activeElement !== searchInput) {
          hideSearchSuggestions();
          return;
        }

        state.searchSuggestions = buildSearchSuggestions();
        searchSuggest.innerHTML = '';

        if (!state.searchSuggestions.length) {
          hideSearchSuggestions();
          return;
        }

        for (const [index, motion] of state.searchSuggestions.entries()) {
          const item = document.createElement('button');
          item.type = 'button';
          item.tabIndex = -1;
          item.className = 'search-suggest-item';
          item.dataset.index = String(index);
          item.innerHTML = `
            <div class="search-suggest-name">${motion.name}</div>
            <div class="search-suggest-meta">分组 ${motion.group} · ${motion.fileName}</div>
          `;
          item.addEventListener('mouseenter', () => {
            setSearchSuggestionIndex(index);
          });
          item.addEventListener('mousedown', (event) => {
            event.preventDefault();
            applySearchSuggestion(index);
          });
          searchSuggest.appendChild(item);
        }

        const nextIndex =
          state.searchSuggestionIndex >= 0 && state.searchSuggestionIndex < state.searchSuggestions.length
            ? state.searchSuggestionIndex
            : 0;
        setSearchSuggestionIndex(nextIndex);
        searchSuggest.classList.remove('hidden');
      }

      async function applySearchSuggestion(index) {
        const motion = state.searchSuggestions[index];
        if (!motion) return;

        searchInput.value = motion.name;
        filterMotions();
        hideSearchSuggestions();
        await playMotionByPath(motion.path);
        searchInput.focus();
      }

      function moveSearchSuggestion(step) {
        if (!state.searchSuggestions.length) {
          renderSearchSuggestions();
        }
        if (!state.searchSuggestions.length) return;

        const total = state.searchSuggestions.length;
        const baseIndex = state.searchSuggestionIndex >= 0 ? state.searchSuggestionIndex : step > 0 ? -1 : 0;
        const nextIndex = (baseIndex + step + total) % total;
        setSearchSuggestionIndex(nextIndex);
        searchSuggest.classList.remove('hidden');
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
        renderSearchSuggestions();
      }

      async function playMotionByIndex(index) {
        if (!state.vrm || !state.filteredList[index]) return;
        state.currentIndex = index;
        renderMotionList();

        const motion = state.filteredList[index];
        setStatus('', `正在加载动作: ${motion.fileName}`);
        currentTitle.textContent = motion.name;
        currentMeta.textContent = `分组 ${motion.group} · ${motion.fileName}`;

        try {
          const fbx = await loadFBX(motion.path);
          const clip = fbx.animations?.[0];
          if (!clip) {
            throw new Error('这个 FBX 里没有动画轨道。');
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

          setStatus('ok', `当前动作: ${motion.fileName}`);
          currentTitle.textContent = motion.name;
          currentMeta.textContent = `分组 ${motion.group} · 时长 ${clip.duration.toFixed(2)}s · ${motion.fileName}`;
        } catch (error) {
          console.error(error);
          setStatus('bad', `动作加载失败: ${motion.fileName}`);
          currentTitle.textContent = motion.name;
          currentMeta.textContent = `分组 ${motion.group} · ${motion.fileName}`;
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
        actionSelect.innerHTML = '<option value="">跟随左侧当前动作</option>';
        for (const motion of state.motionList) {
          const option = document.createElement('option');
          option.value = motion.path;
          option.textContent = `组 ${motion.group} · ${motion.fileName}`;
          actionSelect.appendChild(option);
        }
      }

      async function init() {
        resizeRenderer();
        setStatus('', '正在读取动作列表');

        const response = await fetch('/api/motions');
        const payload = await response.json();
        state.motionList = payload.motions;
        state.vrmUrl = payload.vrm;

        const groups = [...new Set(state.motionList.map((item) => item.group))];
        for (const group of groups) {
          const option = document.createElement('option');
          option.value = group;
          option.textContent = `分组 ${group}`;
          groupSelect.appendChild(option);
        }

        populateActionSelect();
        filterMotions();

        setStatus('', '正在加载 VRM 模型');
        const loadedAvatar = await loadVRM(state.vrmUrl);
        state.vrm = loadedAvatar.vrm;
        state.avatarRoot = loadedAvatar.avatarRoot;

        const maps = buildExpressionMaps(state.vrm);
        state.expressionMap = maps.expressionMap;
        state.mouthMap = maps.mouthMap;
        state.emotionMap = maps.emotionMap;
        cacheSpeechBones(state.vrm);
        initVoices();
        clearAllExpressions();
        applyMood('neutral');

        currentTitle.textContent = 'VRM 已加载';
        currentMeta.textContent = `动作总数 ${state.motionList.length}，可以直接测试动作、表情和前端口型。`;
        setStatus('ok', `VRM 已加载，共 ${state.motionList.length} 个动作`);
        speechText.textContent = '';
        speechMeta.textContent = `已识别口型通道：${getAvailableMouthSummary()}${state.selectedVoiceName ? ` · 语音：${state.selectedVoiceName}` : ' · 语音：浏览器未就绪或不可用'}`;
        speechPanel.classList.remove('hidden');

        if (state.filteredList.length) {
          await playMotionByIndex(0);
        }
      }

      searchInput.addEventListener('input', filterMotions);
      searchInput.addEventListener('focus', () => {
        renderSearchSuggestions();
      });
      searchInput.addEventListener('blur', () => {
        window.setTimeout(() => {
          if (!searchAutocomplete.contains(document.activeElement)) {
            hideSearchSuggestions();
          }
        }, 0);
      });
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          moveSearchSuggestion(1);
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          moveSearchSuggestion(-1);
          return;
        }

        if (event.key === 'Enter' && !searchSuggest.classList.contains('hidden') && state.searchSuggestionIndex >= 0) {
          event.preventDefault();
          applySearchSuggestion(state.searchSuggestionIndex);
          return;
        }

        if (event.key === 'Escape') {
          hideSearchSuggestions();
        }
      });
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
      document.addEventListener('click', (event) => {
        if (!searchAutocomplete.contains(event.target)) {
          hideSearchSuggestions();
        }
      });

      applyMoodBtn.addEventListener('click', () => {
        stopSpeaking();
        applyMood(moodSelect.value);
        speechText.textContent = '';
        speechMeta.textContent = `当前表情：${moodSelect.value}`;
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
          speechMeta.textContent = '请输入测试文本。';
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
        clock.update();
        const delta = clock.getDelta();
        controls.update();
        state.mixer?.update(delta);
        updateSpeechMotion(delta);
        state.vrm?.update(delta);
        renderer.render(scene, camera);
      });

      init().catch((error) => {
        console.error(error);
        currentTitle.textContent = '加载失败';
        currentMeta.textContent = error?.message || String(error);
        setStatus('bad', '初始化失败');
        speechText.textContent = '';
        speechMeta.textContent = error?.stack || error?.message || String(error);
        speechPanel.classList.remove('hidden');
      });
    