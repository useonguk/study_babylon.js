import React from "react";
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

let car; // 첫 번째 자동차 객체
let car2; // 두 번째 자동차 객체
let path; // 자동차 경로를 저장
let pathIndex = 0; // 자동차가 경로를 따라 이동할 위치의 인덱스

// Babylon.js 장면 초기화 함수
const onSceneReady = (scene) => {
  // 카메라 생성
  const camera = new FreeCamera("camera1", new Vector3(0, 10, -20), scene);
  camera.setTarget(Vector3.Zero()); // 카메라가 원점을 바라보도록 설정
  const canvas = scene.getEngine().getRenderingCanvas();
  camera.attachControl(canvas, true); // 캔버스를 통해 사용자 입력 제어 활성화

  // WASD 키로 카메라 이동 설정
  camera.keysUp.push(87); // W 키로 앞으로 이동
  camera.keysDown.push(83); // S 키로 뒤로 이동
  camera.keysLeft.push(65); // A 키로 왼쪽으로 이동
  camera.keysRight.push(68); // D 키로 오른쪽으로 이동

  // 조명 추가
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7; // 조명 밝기 설정

  // 바닥 생성
  const ground = MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize }, scene);
  const groundMaterial = new StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.5, 0.8, 0.5);
  groundMaterial.specularColor = new Color3(0, 0, 0);
  groundMaterial.reflectivity = 0;
  groundMaterial.backFaceCulling = false;

  ground.material = groundMaterial

  // 자동차 생성 함수
  const createCar = (name, position, scene, color) => {
    // 자동차 본체 생성
    const carBody = MeshBuilder.CreateBox(`${name}_Body`, { width: 4, height: 1, depth: 6 }, scene);
    carBody.position.y = 1; // 지면 위로 약간 띄우기
    const carMaterial = new StandardMaterial(`${name}_Material`, scene);
    carMaterial.diffuseColor = new Color3(...color); // 자동차 색상 설정
    carBody.material = carMaterial;

    // 자동차 지붕 생성
    const carRoof = MeshBuilder.CreateBox(`${name}_Roof`, { width: 2.5, height: 1, depth: 3 }, scene);
    carRoof.position.y = 2; // 본체 위에 위치
    carRoof.material = carMaterial;

    // 바퀴 생성
    const wheels = [];
    const wheelPositions = [
      [-1.5, 0.5, 2.5], // 앞 왼쪽
      [1.5, 0.5, 2.5],  // 앞 오른쪽
      [-1.5, 0.5, -2.5], // 뒤 왼쪽
      [1.5, 0.5, -2.5],  // 뒤 오른쪽
    ];

    wheelPositions.forEach((pos, index) => {
      const wheel = MeshBuilder.CreateCylinder(`${name}_Wheel${index}`, { diameter: 1, height: 0.5 }, scene);
      wheel.rotation.z = Math.PI / 2; // 바퀴를 눕힘
      wheel.position = new Vector3(...pos);
      const wheelMaterial = new StandardMaterial(`${name}_WheelMaterial`, scene);
      wheelMaterial.diffuseColor = new Color3(0, 0, 0); // 검은색
      wheel.material = wheelMaterial;
      wheels.push(wheel);
    });

    // 자동차 객체를 구성하고 반환
    const car = MeshBuilder.CreateBox(name, { width: 1, height: 1, depth: 1 }, scene);
    car.isVisible = false; // 자동차는 보이지 않도록 설정
    carBody.parent = car;
    carRoof.parent = car;
    wheels.forEach((wheel) => (wheel.parent = car));
    car.position = position;

    return car;
  };

  // 자동차 생성
  car = createCar("car1", new Vector3(0, 0, 0), scene, [0.8, 0, 0]);
  car2 = createCar("car2", new Vector3(100, 0, 100), scene, [0, 0, 0.8]);

  // 경로 생성
  const pathPoints = [
    new Vector3(100, 1, 100),
    new Vector3(-100, 5, 100),
    new Vector3(-100, 0, -100),
    new Vector3(100, 100, -100),
    new Vector3(100, 1, 100),
  ];
  path = new Path3D(pathPoints); // 경로 객체 생성
  const track = MeshBuilder.CreateLines("path", { points: path.getPoints() }, scene);
  track.color = new Color3(0, 0, 1); // 경로 색상 설정

  // 자동차 애니메이션
  scene.onBeforeRenderObservable.add(() => {
    if (car) {
      car.rotation.y += 0.01; // 자동차 Y축 회전
    }
    if (car2) {
      car2.rotation.y -= 0.01; // 반대 방향 회전
    }
  });
};

// 매 프레임 호출되는 함수
const onRender = () => {
  if (car && car2 && path) {
    // 첫 번째 자동차 경로 이동
    pathIndex += 0.001;
    if (pathIndex >= 1) pathIndex = 0;

    const point1 = path.getPointAt(pathIndex);
    const nextPoint1 = path.getPointAt(pathIndex + 0.01);
    car.position = point1;
    car.lookAt(nextPoint1);

    // 두 번째 자동차 경로 이동 (반대 방향)
    const reversePathIndex = 1 - pathIndex;
    const point2 = path.getPointAt(reversePathIndex);
    const nextPoint2 = path.getPointAt(reversePathIndex - 0.01);
    car2.position = point2;
    car2.lookAt(nextPoint2);
  }
};

// React 컴포넌트
const App = () => {
  return (
    <SceneComponent
      antialias
      onSceneReady={onSceneReady}
      onRender={onRender}
    />
  );
};

export default App;
