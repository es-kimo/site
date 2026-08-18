import { useState, useRef, useEffect, useReducer } from "react";

/* ═══════════════════════════════════════════════════════════════
   미니 react-hook-form (스켈레톤)

   ▸ 지금 실행하면 입력은 되는데 화면 값이 안 바뀐다. 버그 아님.
     그게 RHF의 기본 상태다 — 리렌더 0회.
   ▸ 목표: 리렌더를 "구독한 컴포넌트에만" 되돌려주기.
   ▸ 규칙: 폼 값을 useState에 넣고 싶어지면 틀린 길이다.
   ═══════════════════════════════════════════════════════════════ */

type FieldValues = Record<string, any>;

/** 값이 바뀌었을 때 구독자에게 전달되는 알림.
 *  "무엇이 바뀌었는지"만 담는다. 값 자체는 담지 않는 게 포인트 —
 *  구독자가 알아서 store에서 최신값을 꺼내가면 되니까. */
type Payload = { name: string };

type Observer = (payload: Payload) => void;
type Unsubscribe = () => void;

type Control<T extends FieldValues = FieldValues> = {
  register: (name: keyof T & string) => {
    name: string;
    defaultValue: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  subscribe: (cb: Observer) => Unsubscribe;
  next: (payload: Payload) => void;
  isWatched: (name: string) => boolean;
  _names: { watch: Set<string> };
  _formValues: T;
};

/* ───────────────────────────────────────────────────────────────
   LEVEL 1 — 리액트 밖의 store
   대응: src/logic/createFormControl.ts + src/utils/createSubject.ts
   ─────────────────────────────────────────────────────────────── */

/**
 * 폼의 실제 상태를 들고 있는 객체를 만든다.
 *
 * 왜 필요한가: 값을 useState에 넣으면 한 글자 칠 때마다 폼 전체가 리렌더된다.
 * 그래서 RHF는 값을 React 바깥의 평범한 객체에 둔다. React는 이게 있는지도 모르고,
 * 따라서 값이 바뀌어도 아무 일도 안 일어난다. 리렌더를 "기본 0"으로 만드는 것,
 * 이게 RHF 성능의 전부다. 대신 화면 갱신은 아래 pub/sub으로 직접 배달한다.
 */
function createFormControl<T extends FieldValues>(defaultValues: T) {
  const _formValues: T = { ...defaultValues };

  // watch()로 등록된 이름들. useWatch는 여기 안 들어온다 (LEVEL 3에서 사용)
  const _names = { watch: new Set<string>() };

  // TODO 1-1. 구독자 배열.
  //   왜 필요한가: store는 누가 자기를 보고 있는지 알아야 알림을 보낼 수 있다.
  //   힌트: const 말고 let. unsubscribe에서 filter로 갈아끼울 거라서.
  let _observers: Observer[] = [];

  /** 등록된 구독자 전부에게 "이거 바뀌었다"고 알린다.
   *  왜 필요한가: 값을 그냥 대입만 하면 화면은 영원히 안 바뀐다.
   *  React가 눈치 못 채니까 우리가 직접 알려주는 것. */
  const next = (payload: Payload): void => {
    // TODO 1-2
    _observers.forEach((observer) => observer(payload));
  };

  /** 구독자를 등록하고 "구독 해제 함수"를 돌려준다.
   *  왜 해제 함수를 리턴하나: 컴포넌트가 언마운트돼도 배열에 콜백이 남아있으면
   *  죽은 컴포넌트에 setState를 계속 쏘게 된다(메모리 누수). 그래서
   *  useEffect의 cleanup으로 그대로 넘길 수 있게 함수 하나로 리턴한다. */
  const subscribe = (cb: Observer): Unsubscribe => {
    // TODO 1-3
    _observers.push(cb);
    return () => {
      _observers = _observers.filter((observer) => observer !== cb);
    };
  };

  /** <input>에 스프레드할 props를 만든다.
   *  왜 필요한가: RHF가 input을 "제어"하지 않고 이벤트만 가로채는 지점.
   *  onChange 안은 딱 두 줄이면 된다.
   *    ① _formValues[name] = e.target.value   ← 대입. setState 아님
   *    ② next({ name })                        ← 구독자에게만 통보
   *  이 두 줄의 순서가 중요하다. store를 먼저 갱신해야 구독자가 최신값을 읽는다. */
  const register = (name: keyof T & string) => ({
    name,
    defaultValue: _formValues[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // TODO 1-4
      (_formValues as FieldValues)[name] = e.target.value;
      next({ name });
    },
  });

  /** watch()로 등록된 이름인지 판정 (LEVEL 3에서 사용) */
  const isWatched = (name: string): boolean => _names.watch.has(name);

  return { register, subscribe, next, isWatched, _names, _formValues };
}

/**
 * useForm — 학습 포인트가 아니라 미리 완성해뒀다.
 *
 * useRef에 담는 이유만 짚고 가자: control이 매 렌더마다 새로 만들어지면
 * 지금까지 쌓인 값도, 구독자 목록도 전부 날아간다. store는 컴포넌트 생애 동안
 * 딱 하나여야 하고, 그래서 리렌더에 영향받지 않는 ref에 넣는다.
 */
function useForm<T extends FieldValues>(options: { defaultValues: T }) {
  const controlRef = useRef<ReturnType<typeof createFormControl<T>> | null>(null);
  if (!controlRef.current) {
    controlRef.current = createFormControl(options.defaultValues);
  }
  const control = controlRef.current;

  // LEVEL 3에서 쓸 강제 리렌더 장치
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  // TODO 3-2. 루트도 store를 구독하게 만들어라.
  //   조건: 통보된 name이 control.isWatched(name)일 때만 forceRender().
  //   왜 조건이 필요한가: 조건 없이 매번 forceRender하면
  //   아무도 안 보는 필드를 쳐도 폼 전체가 리렌더된다. 그건 RHF가 아니다.
  useEffect(() => {
    const unsubscribe = control.subscribe((payload) => {
      if (control.isWatched(payload.name)) {
        forceRender();
      }
    });
    return unsubscribe;
  }, []);

  /** LEVEL 3. watch()의 정체.
   *  왜 useWatch와 다른가: 여기서 이름을 _names.watch에 "전역 등록"하면,
   *  그 필드가 바뀔 때 루트(useForm을 호출한 컴포넌트)가 통째로 리렌더된다.
   *  useWatch는 그 등록을 안 하고 자기 자신만 구독한다. 이 차이가 전부다. */
  const watch = (name: keyof T & string): T[typeof name] => {
    // TODO 3-1. control._names.watch.add(name) 를 추가하라
    control._names.watch.add(name);
    return control._formValues[name];
  };

  return { control, register: control.register, watch };
}

/* ───────────────────────────────────────────────────────────────
   LEVEL 2 — useWatch
   대응: src/useWatch.ts
   ─────────────────────────────────────────────────────────────── */

/**
 * 특정 필드를 구독해서, 그 필드가 바뀔 때 "이 컴포넌트만" 리렌더한다.
 *
 * 왜 이 구조인가: 리렌더를 일으키는 유일한 방법은 setState다.
 * 그렇다면 리렌더 범위를 좁히려면? setState를 부르는 주체를 좁히면 된다.
 * useWatch는 자기 안에 useState를 하나 두고, store가 알림을 보낼 때
 * "자기" setState를 부른다. 그래서 리렌더가 이 컴포넌트에 갇힌다.
 * 훅 하나가 곧 구독 단위이자 리렌더 단위인 셈.
 */
function useWatch<T extends FieldValues, K extends keyof T & string>({
  control,
  name,
}: {
  control: Control<T>;
  name: K;
}): T[K] {
  // 초기값은 store에서 한 번 읽어온다 (여긴 완성)
  const [value, setValue] = useState<T[K]>(control._formValues[name]);

  // TODO 2-1. 마운트 시 구독, 언마운트 시 해제.
  //   콜백 안에서: payload.name === name 일 때만 setValue(control._formValues[name])
  //   왜 이름 비교가 필요한가: 알림은 모든 구독자에게 브로드캐스트된다.
  //   내가 안 보는 필드가 바뀌었을 때 리렌더하면 useWatch를 쓴 의미가 없다.
  //   힌트: subscribe가 해제 함수를 리턴하니까 아래 한 줄로 끝난다.
  //     useEffect(() => control.subscribe((payload) => { ... }), [control, name]);

  useEffect(() => {
    const unsubscribe = control.subscribe((payload) => {
      if (payload.name === name) {
        setValue(control._formValues[name]);
      }
    });

    return unsubscribe;
  }, [name]);

  return value;
}

/* ═══════════════ 데모 하네스 — 건드릴 필요 없음 ═══════════════ */

type FormShape = { firstName: string; lastName: string };

function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function Badge({ label, count }: { label: string; count: number }) {
  return (
    <span className="text-xs font-mono text-gray-500">
      {label} 렌더 <span className="font-bold text-gray-900">{count}</span>회
    </span>
  );
}

function WatchedField({ control }: { control: Control<FormShape> }) {
  const renders = useRenderCount();
  const firstName = useWatch({ control, name: "firstName" });

  return (
    <div className="border border-blue-300 rounded p-3 bg-blue-50">
      <Badge label="자식(useWatch)" count={renders} />
      <p className="mt-1 font-mono text-sm">
        Watch: <span className="text-blue-700">{firstName || "(빈 값)"}</span>
      </p>
    </div>
  );
}

export default function App() {
  const { control, register, watch } = useForm<FormShape>({
    defaultValues: { firstName: "", lastName: "" },
  });
  const rootRenders = useRenderCount();
  const watched = watch("firstName");

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-lg font-bold">미니 RHF 실습</h1>

      <div className="border border-gray-300 rounded p-3 space-y-2">
        <Badge label="루트(useForm)" count={rootRenders} />
        <p className="font-mono text-sm">
          watch(): <span className="text-gray-700">{watched || "(빈 값)"}</span>
        </p>
      </div>

      <div className="space-y-2">
        <input
          {...register("firstName")}
          placeholder="firstName"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        <input
          {...register("lastName")}
          placeholder="lastName (이건 아무도 안 본다)"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <WatchedField control={control} />

      <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-200">
        <p className="font-bold">확인 체크리스트</p>
        <p>L1+L2 → firstName 칠 때 자식만 증가, 루트는 1 고정</p>
        <p>L2 확인 → lastName 칠 때는 아무것도 안 늘어남</p>
        <p>L3 → firstName 칠 때 루트도 증가 (이게 watch의 비용)</p>
      </div>
    </div>
  );
}
