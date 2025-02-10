import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color3,
  StandardMaterial,
  Path3D,
} from "@babylonjs/core";
import SceneComponent from "./SceneComponent"; // Babylon.js 캔버스를 렌더링하는 사용자 정의 컴포넌트

let car;
let car2;
let path;
const pathIndex = 0;

const onSceneReady = (scene) => {
  const groundSize = 300;

  // 카메라 생성
  const camera = new FreeCamera("camera1", new Vector3(0, 10, -20), scene);
  camera.setTarget(Vector3.Zero());
  const canvas = scene.getEngine().getRenderingCanvas();
  camera.attachControl(canvas, true);

  // WASD 키 설정
  camera.keysUp.push(87);
  camera.keysDown.push(83);
  camera.keysLeft.push(65);
  camera.keysRight.push(68);

  // 조명 추가
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // 바닥 생성
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: groundSize, height: groundSize },
    scene
  );
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.5, 0.8, 0.5);
  groundMaterial.specularColor = new Color3(0, 0, 0);
  groundMaterial.reflectivity = 0;
  groundMaterial.backFaceCulling = false;
  ground.material = groundMaterial;

  // 자동차 생성
  const createCar = (name, position, scene, color) => {
    const carBody = MeshBuilder.CreateBox(
      `${name}_Body`,
      { width: 4, height: 1, depth: 6 },
      scene
    );
    carBody.position.y = 1;
    const carMaterial = new StandardMaterial(`${name}_Material`, scene);
    carMaterial.diffuseColor = new Color3(...color);
    carBody.material = carMaterial;

    const carRoof = MeshBuilder.CreateBox(
      `${name}_Roof`,
      { width: 2.5, height: 1, depth: 3 },
      scene
    );
    carRoof.position.y = 2;
    carRoof.material = carMaterial;

    const car = MeshBuilder.CreateBox(
      name,
      { width: 1, height: 1, depth: 1 },
      scene
    );
    car.isVisible = false;
    carBody.parent = car;
    carRoof.parent = car;
    car.position = position;

    return car;
  };

  car = createCar("car1", new Vector3(100, 1, 100), scene, [0.8, 0, 0]);
  car2 = createCar("car2", new Vector3(100, 0, 100), scene, [0, 0, 0.8]);

  // 경로 생성
  const pathPoints = [
    new Vector3(100, 1, 100),
    new Vector3(-100, 5, 100),
    new Vector3(-100, 0, -100),
    new Vector3(100, 100, -100),
    new Vector3(100, 1, 100),
  ];
  path = new Path3D(pathPoints);
  const track = MeshBuilder.CreateLines(
    "path",
    { points: path.getPoints() },
    scene
  );
  track.color = new Color3(0, 0, 1);

  // 자동차 회전 애니메이션
  scene.onBeforeRenderObservable.add(() => {
    if (car) {
      car.rotation.y += 0.01;
    }
    if (car2) {
      car2.rotation.y -= 0.01; // 반대 방향 회전
    }
  });
};

const ThreeDUI = () => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const pathIndexRef = useRef(0); // pathIndex를 useRef로 관리

  // FPS 계산 함수
  const calculateFps = useCallback(() => {
    const currentTime = performance.now();
    frameCountRef.current++;

    if (currentTime - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }

    requestAnimationFrame(calculateFps);
  }, []);

  // 자동차 이동 에니메이션 담당
  const onRender = useCallback(() => {
    if (car && car2 && path) {
      // pathIndex 증가
      pathIndexRef.current += 0.001; // 작은 값으로 부드럽게 이동

      // 자동차1 이동
      const point1 = path.getPointAt(pathIndexRef.current % 1);
      const nextPoint1 = path.getPointAt((pathIndexRef.current + 0.01) % 1);
      car.position.copyFrom(point1);
      car.lookAt(nextPoint1);

      // 자동차2 이동 (반대 방향이므로 -0.5 추가)
      let reverseIndex = (pathIndexRef.current - 0.5) % 1;
      if (reverseIndex < 0) reverseIndex += 1; // 음수 방지

      const point2 = path.getPointAt(reverseIndex);
      const nextPoint2 = path.getPointAt((reverseIndex - 0.01) % 1);
      car2.position.copyFrom(point2);
      car2.lookAt(nextPoint2);
    }
  }, []);

  useEffect(() => {
    requestAnimationFrame(calculateFps);
  }, [calculateFps]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <SceneComponent
        antialias
        onSceneReady={onSceneReady}
        onRender={onRender}
      />
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        프레임: {fps}
      </div>
    </div>
  );
};

export default ThreeDUI;
