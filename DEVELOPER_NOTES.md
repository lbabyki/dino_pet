# Milo — Gesture Pet

Browser-local blue-grey baby dinosaur, inspired by the supplied character reference. Static HTML, CSS and ES modules. Three.js articulated
procedural 3D dinosaur and room, with an illustrated Canvas fallback when WebGL is
unavailable. No account, backend or API keys required for gameplay.

## Run
Serve `dist/` with any static server. Webcam access requires HTTPS or localhost.
Deployment identity is tracked in `.openai/hosting.json`.

## Controls
- Mouse: hold and stroke head; drag torso to lift; release to lower.
- Food is always available at the right-hand snack station: pinch/drag to mouth, release. A fresh biscuit appears after eating.
- Buttons / keys 1–7: pet, food, fetch, sit, stand, spin, sleep.
- Camera: thumb/index pinch over body or biscuit to pick up; open to release.
- Ball is always available at the left of the rug: pinch, move and release to throw. Pet retrieves it.
- Closed fist held over bed for 1.2s triggers sleep; thumb-up for 0.7s praises the pet.
- Point and hold on empty floor for 1.1s calls the pet there.
- Open hand over head to pet. Open hand rising/falling in empty space triggers
  stand/sit. An index-finger circle in empty space triggers spin.
- Turn the camera off at any time. Processing is local; no camera frames are sent
  to a server. Only no-capture media is requested (audio:false).
- Local storage persists hunger/energy/bond; reset available in settings.

## Assets
Vendored Three.js 0.169.0 (MIT) and MediaPipe Tasks Vision
0.10.22-rc.20250304 (Apache-2.0), including paired SIMD and no-SIMD WASM files.
Hand Landmarker model: official MediaPipe float16 version 1. Runtime is served
from the same origin, avoiding CDN module/WASM version mismatches.
Fonts are optional Google Fonts; system fonts are the fallback.

## Verification (v2)
- Syntax checks: app.js, fallback.js, gestures.js.
- Replay tests: node tests/gestures.test.mjs, 17 cases including both circle directions, pose release and conflict suppression.
- Browser QA: dinosaur illustration verified; always-available biscuit dragged directly to mouth, triggering chewing and increased food/bond. Always-available ball dragged and released, triggering fetch. Gesture instructions updated for every core action.
- Cloud browser disables WebGL. Hardware 3D rendering has not been visually
  verified there; Canvas fallback was visually verified.
- Preview uses HTTP without camera availability. Live hand recognition and
  gesture thresholds need real webcam testing over deployed HTTPS.

## v3 gesture corrections
- Wired normalized projected/world hand features into the live camera path; supports 2 hands.
- Pinch contact independent of other finger poses; 45 ms acquire and 140 ms release hysteresis, continued acquisition while closed, padded food/ball targets, preserve last held point on release.
- Palm centroid drives sit/stand, with 200 ms posture dropout grace; 3 extended fingers suffice at oblique angles.
- Thumb-up triggers three celebratory hops, lifted arms, happy eyes and faster tail; available via praise button too.
- Both palms in upper half of camera for 200 ms raise the dinosaur's arms; 350 ms grace avoids flicker. Closest wrist maintains primary hand identity while dragging.
- Synthetic landmark tests cover mirrored hands and yaw/roll angles, contact/release jitter, two-hand dropouts and palm trajectories. Physical webcam and hardware WebGL verification remain outstanding.

## v4 sleep and greeting fixes
- Fist on padded bed region prioritizes sleep over incidental thumb/index contact; palm cursor and a 1.2 s hold tolerate tremor and brief target loss.
- Walk to the actual bed center before sleeping. Sleeping restores 1 percentage point of energy each second up to 100%; recovery stops immediately on wake.
- Raised arms are spread outward with bounded angles below the head, also in the Canvas fallback.
- Two-hand lateral waving drives separate bounded arm channels; stationary hands do not play a looping greeting. Camera result ordering is normalized by screen position.
- Regression checks include sleep/pinch arbitration, noisy sleep holds, wave onset/stop/order changes and frame-independent energy recovery. Live physical webcam verification remains unavailable.

## v5 index direction and continuous arm height
- Come destination extends the index PIP-to-tip segment (landmarks 6 to 8), independent of wrist movement. A dashed ray and destination ring show the commanded location; dwell tracks the smoothed destination while circles still track the fingertip.
- After initiating two-hand control, keep following through lowered positions. Each mirrored hand drives its corresponding arm through a visible 0.4–1.95 rad range, with bounded wave offsets and outward shoulder placement.
- Regression checks cover wrist-independent direction, mirroring, independent arm heights, lower-hand continuity, aimed-target dwell and existing sleep/energy interactions. Physical webcam verification remains outstanding.
