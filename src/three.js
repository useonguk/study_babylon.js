import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // 장면, 카메라 및 렌더러 생성
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, -20);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // 조명 추가
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    light.position.set(0, 20, 0);
    scene.add(light);

    // 바닥 생성
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // 바닥을 수평으로 회전
    scene.add(ground);

    // 자동차 본체 생성
    const carGroup = new THREE.Group();
    const carBodyGeometry = new THREE.BoxGeometry(4, 1, 6);
    const carBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const carBody = new THREE.Mesh(carBodyGeometry, carBodyMaterial);
    carBody.position.y = 1;
    carGroup.add(carBody);

    const carRoofGeometry = new THREE.BoxGeometry(2.5, 1, 3);
    const carRoof = new THREE.Mesh(carRoofGeometry, carBodyMaterial);
    carRoof.position.set(0, 1.5, 0);
    carGroup.add(carRoof);

    // 바퀴 생성
    const wheelPositions = [
      [-1.5, 0.5, 2.5],
      [1.5, 0.5, 2.5],
      [-1.5, 0.5, -2.5],
      [1.5, 0.5, -2.5],
    ];
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    // 경로 생성
    const pathPoints = [
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(-10, 0, 10),
      new THREE.Vector3(-10, 0, -10),
      new THREE.Vector3(10, 0, -10),
      new THREE.Vector3(10, 0, 10),
    ];
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(
      pathCurve.getPoints(100)
    );
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);

    // 자동차가 경로를 따라 움직이게 설정
    let pathIndex = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // 자동차가 경로를 따라 이동
      pathIndex += 0.001;
      if (pathIndex > 1) pathIndex = 0;
      const point = pathCurve.getPointAt(pathIndex);
      const nextPoint = pathCurve.getPointAt((pathIndex + 0.01) % 1);

      carGroup.position.copy(point);
      carGroup.lookAt(nextPoint);

      renderer.render(scene, camera);
    };

    animate();

    // 리소스 정리
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default App;
