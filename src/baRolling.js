import { FreeCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import SceneComponent from './SceneComponent';

let box; // 박스객체 선언 변수

const onSceneReady = (scene) => {
    // 이 코드는 자유 카메라(Free Camera)를 생성하고 위치를 설정합니다 (카메라는 메쉬가 아님).
    const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    // 카메라를 장면의 원점으로 조준합니다.
    camera.setTarget(Vector3.Zero());
    const canvas = scene.getEngine().getRenderingCanvas();
    // 카메라를 캔버스에 연결합니다.
    camera.attachControl(canvas, true);
    // 이 코드는 빛을 생성하며, 빛은 0, 1, 0 방향 (하늘 방향)으로 향합니다 (메쉬가 아님).
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    // 기본 빛의 강도는 1입니다. 여기서는 빛의 강도를 약간 낮춥니다.
    light.intensity = 0.7;
    // 내장a된 '박스' 모양을 생성합니다.
    box = MeshBuilder.CreateBox('box', { size: 1 }, scene);
    // 박스를 높이의 절반만큼 위로 이동시킵니다.
    box.position.y = 2.5;
    box.position.x = 0;
    box.position.z = -5;
    // 내장된 '지면' 모양을 생성합니다.
    MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene);
};

// 매 프레임 렌더링 시 실행됩니다. 이 코드는 박스를 Y축을 기준으로 회전시킵니다.
const onRender = (scene) => {
  if (box !== undefined) {
      const deltaTimeInMillis = scene.getEngine().getDeltaTime();
      const rpm = 10; // 매우 빠르게 회전하도록 설정
      box.rotation.x += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};
const App = () => (<div>
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender}/>
  </div>);
export default App;
