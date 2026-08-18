import { useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   미니 react-hook-form 만들기 (스켈레톤)

   ▸ 지금 실행하면: 입력은 되는데 화면의 "Watch:" 값이 안 바뀐다.
     그게 버그가 아니라 RHF의 기본 상태다. 리렌더가 0회니까.
   ▸ 목표: 리렌더를 "구독한 컴포넌트에만" 되돌려주기.
   ▸ 규칙 하나 — 폼 값을 useState에 넣고 싶어지면 그건 틀린 길이다.
     값은 _formValues 객체를 직접 수정한다.
   ═══════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────
   LEVEL 1 — 리액트 밖의 store 만들기
   대응: src/logic/createFormControl.ts + src/utils/createSubject.ts
   ─────────────────────────────────────────────────────────────── */

function createFormControl(defaultValues = {}) {
  // 이 객체가 폼의 진짜 상태. React는 이게 있는지도 모른다.
  const _formValues = { ...defaultValues };

  // TODO 1-1. 구독자(콜백)들을 담을 배열을 만들어라.
  //   let _observers = [];
  //   힌트: const가 아니라 let. unsubscribe에서 filter로 갈아끼울 거라.

  // TODO 1-2. next(payload): 등록된 구독자 전부를 payload로 호출.
  //   payload는 { name: '바뀐 필드 이름' } 형태로 쓸 예정.
  const next = (payload) => {
    // 여기 채우기
  };

  // TODO 1-3. subscribe(cb): 구독자를 등록하고, "구독 해제 함수"를 리턴.
  //   왜 해제 함수를 리턴하냐면 → useEffect의 cleanup으로 그대로 넘기려고.
  const subscribe = (cb) => {
    // 여기 채우기
    return () => {}; // ← 해제 함수 자리
  };

  // TODO 1-4. register(name): <input>에 스프레드할 props를 만든다.
  //   onChange 안에서 딱 두 줄이면 된다.
  //     ① _formValues[name] = e.target.value;   // setState 아님. 그냥 대입.
  //     ② next({ name });                        // 구독자에게만 통보
  const register = (name) => ({
    name,
    defaultValue: _formValues[name],
    onChange: (e) => {
      // 여기 채우기
    },
  });

  return { register, subscribe, next, _formValues };
}

/* useForm은 학습 포인트가 아니라 미리 완성해뒀다.
   단, useRef에 담는 이유는 한 번 생각해볼 것:
   리렌더가 일어나도 store가 새로 만들어지면 안 되니까. */
function useForm(options = {}) {
  const controlRef = useRef(null);
  if (!controlRef.current) {
    controlRef.current = createFormControl(options.defaultValues);
  }
  const control = controlRef.current;

  return { control, register: control.register };
}

/* ───────────────────────────────────────────────────────────────
   LEVEL 2 — useWatch
   대응: src/useWatch.ts
   ─────────────────────────────────────────────────────────────── */

function useWatch({ control, name }) {
  // 초기값은 store에서 한 번 읽어온다. (여긴 완성)
  const [value, setValue] = useState(control._formValues[name]);

  // TODO 2-1. 마운트될 때 control을 구독하고, 언마운트될 때 해제하라.
  //   구독 콜백 안에서:
  //     - payload.name이 내가 보는 name과 같을 때만
  //     - setValue(control._formValues[name])
  //   힌트: subscribe가 해제 함수를 리턴하니까
  //         useEffect(() => control.subscribe(...), [deps]) 한 줄로 끝난다.
  //   deps에는 control과 name.

  return value;
}

/* ───────────────────────────────────────────────────────────────
   LEVEL 3 (도전) — watch()는 왜 폼 전체를 리렌더시키는가
   대응: createFormControl의 _names.watch, src/logic/isWatched.ts,
        src/useForm.ts 59~120행

   useWatch가 "구독자가 자기 setState를 부른다"였다면,
   watch는 "루트가 자기 setState를 부른다"이다. 주체가 다를 뿐 구조는 같다.
   ─────────────────────────────────────────────────────────────── */

// TODO 3-1. createFormControl 안에 _names = { watch: new Set() } 를 추가하고,
//           아래 watch()가 호출될 때 이름을 그 Set에 등록하라.
// TODO 3-2. useForm 안에서 control을 구독하고,
//           통보된 name이 _names.watch에 들어있으면 루트를 강제 리렌더하라.
//           (forceRender는 useReducer((x) => x + 1, 0) 로 만들면 편하다)
// TODO 3-3. 그리고 나서 아래 데모의 렌더 카운터를 비교해봐라.
//           같은 한 글자를 쳤을 때 무엇이 몇 번 리렌더되는지가
//           네 글의 핵심 근거가 된다.

function watch(control, name) {
  // 지금은 그냥 읽기만 함 → 화면이 안 바뀐다
  return control._formValues[name];
}

/* ═══════════════════════════════════════════════════════════════
   여기부터는 데모 하네스. 건드릴 필요 없음.
   ═══════════════════════════════════════════════════════════════ */

function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function Badge({ label, count }) {
  return (
    <span className="font-mono text-xs text-gray-500">
      {label} 렌더 <span className="font-bold text-gray-900 dark:text-gray-100">{count}</span>회
    </span>
  );
}

function WatchedField({ control }) {
  const renders = useRenderCount();
  const firstName = useWatch({ control, name: "firstName" });

  return (
    <div className="rounded border border-blue-300 bg-blue-50 p-3 dark:bg-blue-950/40">
      <Badge label="자식(useWatch)" count={renders} />
      <p className="mt-1 font-mono text-sm">
        Watch: <span className="text-blue-700 dark:text-blue-300">{firstName || "(빈 값)"}</span>
      </p>
    </div>
  );
}

export default function Demo() {
  const { control, register } = useForm({
    defaultValues: { firstName: "", lastName: "" },
  });
  const rootRenders = useRenderCount();
  const watched = watch(control, "firstName");

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-lg font-bold">미니 RHF 실습</h1>

      <div className="space-y-2 rounded border border-gray-300 p-3 dark:border-gray-600">
        <Badge label="루트(useForm)" count={rootRenders} />
        <p className="font-mono text-sm">
          watch(): <span className="opacity-70">{watched || "(빈 값)"}</span>
        </p>
      </div>

      <div className="space-y-2">
        <input {...register("firstName")} placeholder="firstName" className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600" />
        <input {...register("lastName")} placeholder="lastName (이건 아무도 안 본다)" className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600" />
      </div>

      <WatchedField control={control} />

      <div className="space-y-1 border-t border-gray-200 pt-2 text-xs opacity-70 dark:border-gray-700">
        <p className="font-bold">확인 체크리스트</p>
        <p>L1+L2 완료 → firstName 칠 때 자식만 렌더 증가, 루트는 1 고정</p>
        <p>L2 확인 → lastName 칠 때는 아무것도 안 늘어남</p>
        <p>L3 완료 → firstName 칠 때 루트도 같이 증가 (이게 watch의 비용)</p>
      </div>
    </div>
  );
}
