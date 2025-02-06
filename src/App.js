import React, { useState, useCallback, useEffect } from "react";
import "./reset.css";
import {
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color3,
  StandardMaterial,
  PointerEventTypes,
  Path3D,
  CreatePolygon,
  Vector2,
  PolygonMeshBuilder,
} from "@babylonjs/core";
import SceneComponent from "./SceneComponent"; // 사용자 정의 컴포넌트
import Modal from "./Modal"; // 모달 컴포넌트

let cars = []; // 자동차 배열
const groundSize = 300; // ground의 크기 (width, height)
const boundaryBuffer = 10; // 벽에 가까워지기 전 방향 변경 버퍼
const directionChangeInterval = 100; // 방향 변경 간격 (프레임 단위)
const CantDrivePathPoints = [
  new Vector3(50, 0, 50),
  new Vector3(-50, 0, 50),
  new Vector3(-50, 0, -50),
  new Vector3(50, 0, -50),
  new Vector3(50, 0, 50),
]; // 금지구역 포인트
let path; // 금지구역 합 경로

// 랜덤한 방향 생성 (속도 감소)
const randomDirection = (speedFactor = 0.05) => {
  const direction = new Vector3(
    (Math.random() - 0.5) * 2,
    0,
    (Math.random() - 0.5) * 2
  ).normalize(); // 정규화된 방향 벡터

  return direction.scale(speedFactor); // 매우 느리게 이동
};

const App = () => {
  const [carName, setCarName] = useState(null); // 클릭된 차량 번호 상태
  const [sceneReady, setSceneReady] = useState(false); // 씬 준비 여부 체크
  const [camera, setCamera] = useState(null); // 카메라 참조 상태 저장
  const [fps, setFps] = useState(0); // FPS 상태

  let lastTime = 0;
  let frameCount = 0;

  // 카메라를 앞뒤로 이동시키는 함수
  const moveCamera = (direction) => {
    if (!camera) return;
    const moveSpeed = 20; // 이동 속도
    const forward = camera.getTarget().subtract(camera.position).normalize(); // 카메라가 바라보는 방향 계산
    camera.position.addInPlace(forward.scale(moveSpeed * direction)); // 이동
  };

  // FPS 계산 함수
  const calculateFps = (time) => {
    frameCount++;
    if (time - lastTime >= 1000) {
      setFps(frameCount);
      frameCount = 0;
      lastTime = time;
    }
  };

  // Babylon.js 장면 초기화 함수
  const onSceneReady = useCallback((scene) => {
    // 카메라 생성
    const cameraInstance = new FreeCamera(
      "camera1",
      new Vector3(100, 500, -0),
      scene
    );
    cameraInstance.setTarget(Vector3.Zero());
    const canvas = scene.getEngine().getRenderingCanvas();
    cameraInstance.attachControl(canvas, false); // 마우스 입력 비활성화
    setCamera(cameraInstance); // 카메라 참조 저장

    // 조명 추가
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

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
    groundMaterial.freeze();
    ground.isPickable = false;

    ground.material = groundMaterial;

    // 자동차 생성 함수
    const createCar = (name, position, color) => {
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

      const wheels = [];
      const wheelPositions = [
        [-1.5, 0.5, 2.5],
        [1.5, 0.5, 2.5],
        [-1.5, 0.5, -2.5],
        [1.5, 0.5, -2.5],
      ];

      wheelPositions.forEach((pos, index) => {
        const wheel = MeshBuilder.CreateCylinder(
          `${name}_Wheel${index}`,
          { diameter: 1, height: 0.5 },
          scene
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position = new Vector3(...pos);
        const wheelMaterial = new StandardMaterial(
          `${name}_WheelMaterial`,
          scene
        );
        wheelMaterial.diffuseColor = new Color3(0, 0, 0);
        wheel.material = wheelMaterial;
        wheels.push(wheel);
      });

      const car = MeshBuilder.CreateBox(
        name,
        { width: 1, height: 1, depth: 1 },
        scene
      );
      car.isVisible = false;
      carBody.isPickable = true;
      carRoof.isPickable = true;
      wheels.forEach((wheel) => (wheel.isPickable = true));
      carBody.parent = car;
      carRoof.parent = car;
      wheels.forEach((wheel) => (wheel.parent = car));
      car.position = position;

      // 초기 속도 및 방향 설정
      car.velocity = randomDirection();
      car.framesUntilChange = directionChangeInterval;

      car.battery = Math.floor(Math.random() * 100) + 1;

      return car;
    };

    // // 금지구역 설정(선)
    // path = new Path3D(CantDrivePathPoints);
    // const area = MeshBuilder.CreateLines(
    //   "path",
    //   { points: path.getPoints() },
    //   scene
    // );
    // area.color = new Color3(0, 0, 1);
    // // createNoDriveZone(scene);

    // const dontArea = MeshBuilder.CreateBox(
    //   "dontArea",
    //   { size: 100, height: 1 },
    //   scene
    // );
    // dontArea.position.x = 0;
    // dontArea.position.y = 1;
    // dontArea.position.z = 0;
    // dontArea.doNotSyncBoundingInfo = true;

    // 자동차 생성
    cars = [];
    for (let i = 0; i < 10; i++) {
      const position = new Vector3(
        100, // 0~1까지 나오는 랜덤갑에서 -0.5를 해서 -값을 추가한 뒤 *2를 해서 -1 ~ 1사이 값을 추출
        0,
        100
      );
      const color = [Math.random(), Math.random(), Math.random()]; // 랜덤 색상
      cars.push(createCar(`car${i + 1}`, position, color));
    }

    // 자동차를 클릭했을 때 이벤트 처리
    scene.onPointerObservable.add((pointerInfo) => {
      // scene.freezeActiveMeshes();
      if (pointerInfo.type === PointerEventTypes.POINTERPICK) {
        const pickInfo = pointerInfo.pickInfo;
        if (pickInfo && pickInfo.pickedMesh) {
          const pickedMesh = pickInfo.pickedMesh;
          const car = cars.find((c) =>
            c.getChildMeshes().some((child) => child === pickedMesh)
          );
          if (car) {
            setCarName(`${car.name} + ${car.battery}%`); // 클릭된 차량 번호를 상태에 저장
          }
        }
      }
    });

    // scene.setRenderingAutoClearDepthStencil(
    //   renderingGroupIdx,
    //   autoClear,
    //   depth,
    //   stencil
    // );

    setSceneReady(true); // 씬 준비 완료
    // scene.unfreezeActiveMeshes();
  }, []);

  // // 자동차가 금지 구역 내부에 있는지 확인하는 함수
  // const isInsideNoDriveZone = (point, zonePoints) => {
  //   let inside = false;
  //   for (let i = 0, j = zonePoints.length - 1; i < zonePoints.length; j = i++) {
  //     const xi = zonePoints[i].x,
  //       zi = zonePoints[i].z;
  //     const xj = zonePoints[j].x,
  //       zj = zonePoints[j].z;

  //     const intersect =
  //       zi > point.z !== zj > point.z &&
  //       point.x < ((xj - xi) * (point.z - zi)) / (zj - zi) + xi;
  //     if (intersect) inside = !inside;
  //   }
  //   return inside;
  // };

  // 매 프레임 호출되는 함수
  const onRender = useCallback(() => {
    cars.forEach((car) => {
      // 위치 업데이트
      car.position.addInPlace(car.velocity);

      // 다음위치 계산
      if (car.position && car.velocity) {
        const nextPosition = car.position.add(car.velocity);

        // // 금지구역 위치인지 검사
        // if (isInsideNoDriveZone(nextPosition, CantDrivePathPoints)) {
        //   car.velocity = randomDirection();
        // }
        car.position.addInPlace(car.velocity);
      }

      // 경계에 가까워지면 방향 변경
      if (
        car.position.x > groundSize / 2 - boundaryBuffer ||
        car.position.x < -groundSize / 2 + boundaryBuffer
      ) {
        car.velocity.x *= -1; // X축 방향 반전
      }
      if (
        car.position.z > groundSize / 2 - boundaryBuffer ||
        car.position.z < -groundSize / 2 + boundaryBuffer
      ) {
        car.velocity.z *= -1; // Z축 방향 반전
      }

      // 일정 시간마다 무작위로 방향 변경
      car.framesUntilChange -= 1;
      if (car.framesUntilChange <= 0) {
        car.velocity = randomDirection(); // 새로운 방향 설정
        car.framesUntilChange = directionChangeInterval;
      }

      // 속도 벡터 크기 제한 (정규화 후 재스케일링)
      const speedFactor = 0.01; // 속도 크기 유지
      car.velocity = car.velocity.normalize().scale(speedFactor);

      // 이동 방향으로 자동차 회전
      const forward = car.velocity.normalize();
      car.lookAt(car.position.add(forward));
    });

    // FPS 계산
    requestAnimationFrame(calculateFps);
  }, []);

  useEffect(() => {
    if (sceneReady) {
      const interval = setInterval(onRender, 1000 / 60); // 60 FPS로 호출
      return () => clearInterval(interval); // 컴포넌트 언마운트 시 클린업
    }
  }, [sceneReady, onRender]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SceneComponent antialias onSceneReady={onSceneReady} />
      {/* 카메라 이동 버튼 */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          left: "50%",
          transform: "translateX(-60px)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            cursor: "pointer",
            padding: "10px 15px",
            background: "lightgray",
            borderRadius: "5px",
            textAlign: "center",
          }}
          onClick={() => moveCamera(-5)} // 뒤로 이동
        >
          {"<"}
        </div>
        <div
          style={{
            cursor: "pointer",
            padding: "10px 15px",
            background: "lightgray",
            borderRadius: "5px",
            textAlign: "center",
          }}
          onClick={() => moveCamera(5)} // 앞으로 이동
        >
          {">"}
        </div>
      </div>
      {carName && (
        <Modal
          carName={carName.split(" + ")[0].trim()} // 자동차 이름
          carBattery={carName.split(" + ")[1]?.trim()} // 배터리 정보
          onClose={() => setCarName(null)}
        />
      )}
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

export default App;
