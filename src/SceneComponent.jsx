// React와 Babylon.js를 사용하여 3D 장면을 렌더링하는 컴포넌트입니다.
import { useEffect, useRef } from "react";
import { Engine, Scene } from "@babylonjs/core";

const SceneComponent = ({
  antialias, // 엔진의 앤티앨리어싱 설정
  engineOptions, // 엔진 설정 옵션
  adaptToDeviceRatio, // 디바이스 비율에 맞게 엔진 크기를 조정
  sceneOptions, // 장면 초기화 시 전달할 설정
  onRender, // 매 프레임 렌더링 시 호출되는 콜백
  onSceneReady, // 장면 초기화 완료 시 호출되는 콜백
  ...rest // 기타 속성
}) => {
  const reactCanvas = useRef(null); // 캔버스 DOM 참조

  useEffect(() => {
    const { current: canvas } = reactCanvas; // 캔버스 DOM 요소 가져오기
    if (!canvas) return;

    // Babylon.js 엔진 및 장면 초기화
    const engine = new Engine(canvas, antialias, {...engineOptions, useWebGPU: true}, adaptToDeviceRatio);
    const scene = new Scene(engine, sceneOptions);

    // 장면 준비 완료 시 콜백 호출
    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    // 엔진의 렌더 루프 설정
    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene); // 사용자 정의 렌더링 처리
      scene.render(); // 장면 렌더링
    });

    // 창 크기 변경 시 캔버스 크기 조정
    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize); // 이벤트 리스너 등록
    }

    // 컴포넌트 언마운트 시 정리 작업 수행
    return () => {
      scene.getEngine().dispose(); // 엔진 리소스 해제
      if (window) {
        window.removeEventListener("resize", resize); // 이벤트 리스너 제거
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  // 3D 장면을 렌더링할 캔버스 반환
  return (
    <canvas
      ref={reactCanvas} // 캔버스 참조 연결
      style={{
        width: "100%", // 화면 전체 너비
        height: "100%", // 화면 전체 높이
        display: "block", // 캔버스를 블록 요소로 표시
      }}
      {...rest} // 추가 속성 전달
    />
  );
};

export default SceneComponent;
