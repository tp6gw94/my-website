---
title: "React Hook"
date: 2021-05-23T12:18:52+08:00
toc: true
---

## useState

最基本常用的 hook，當 state 改變時，只有該 component 與 它的 child component 會進行重新渲染

```js
import {useState} from 'react';

const [status, setStatus] = useState(false);
```

## useEffect

基本常用的 hook，在 render 無法直接進行的行為，都會在 `useEffect` 進行，例如 request API、subscribe websocket、alert 等


```js
import {useState, useEffect} from 'react';

const [time, setTime] = useState(new Date());

useEffect(() => {
  const timer = setTimeout(() => setTime(new Date()), 1000);
  // clear timeout
  return () => clearTimeout(timer);
}, [time, setTime]);
```

當 dependance array 為空時，行為類似於 `componentDidMount` 只在第一次執行，後續不執行。

{{<note>}}
empty array 行為只是類似於 componentDidMount，並不是完全等於，詳細內容可參考 Overreacted
的 <a href="https://overreacted.io/zh-hant/a-complete-guide-to-useeffect/" target="__blank">useEffect完整指南</a>
{{</note>}}

return function 能進行清除 effect 或是 unsubscribe 的操作，行為類似於 `componentDidUnmount`。

## useContext

`useContext` 主要是用來解決 prop drilling 的問題，當一個元件有多個子元件、子孫元件、子子孫元件時，最後一件元件要獲取父元件的 data 需要經過一層一層的傳遞 props，不僅造成使用上的不便，也違反了每個元件只獲取自己所需的 data 原則。


demo
{{<codeSandbox tp6gw94-react-usecontext-hook-p7s4w>}}


首先建立 context 的 provider 與 custom hook，利用 `useReducer` 建立 user context 的 state 更新 flow

```js
// UserContext.js
import React, { createContext, useContext, useReducer } from "react";

const defaultState = { name: "Joe", mail: "joe@test.com", age: 23 };

const UserContext = createContext([defaultState, (obj) => obj]);

function userReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_MAIL":
      return { ...state, mail: action.payload };
    case "SET_AGE":
      return { ...state, age: action.payload };
    default:
      return state;
  }
}

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, defaultState);
  const value = { state, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}


function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return [context.state, context.dispatch];
}

export { UserProvider, useUser };

```

透過 provider 提供 data

```js
// App.js
// ...

export default function App() {
  return (
    <UserProvider>
      <div className="App">
        <h1>App component</h1>
        <First />
      </div>
    </UserProvider>
  );
}

```

在最底層的 component 即可直接獲取 state data，也可以透過 `dispatch` 直接進行更新

```js
import React from "react";
import { useUser } from "./UserContext";

export default function Second() {

  const [{ name, mail, age }, userDispatch] = useUser();
  return (
    <div>
      <h3>Second</h3>
      <ul>
        <li>
          update name:{" "}
          <input
            onChange={(e) =>
              userDispatch({ type: "SET_NAME", payload: e.target.value })
            }
          />
        </li>
      </ul>
      <ul>
        <li>name: {name}</li>
      </ul>
    </div>
  );
}

```

## useRef

最常用的狀況是操作 DOM 元素或是第 3 方套件為支援 react，透過原生 API 去進行操作。要特別注意的地方是在於 useRef 若更新值是**不會觸發 react 進行重新渲染**的。

更新 `current` 是直接去變更 object 的 property，object 的記憶體位置仍是相同的。

demo
{{<codeSandbox tp6gw94-react-hook-useref-5rwyk>}}

當點擊 *Update Ref Count* 時，不論如何點擊畫面都不會進行渲染，點擊 *Update State Count* 時才會進行渲染。

```js
function App() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  return (
    <div className="App">
      <h2>useRefCount: {refCount.current}</h2>
      <button onClick={() => refCount.current++}>Update Ref Count</button>
      <h2>useStateCOunt: {stateCount}</h2>
      <button onClick={() => setStateCount(stateCount + 1)}>
        Update State Count
      </button>
    </div>
  );
}
```

點擊 *Focus Input Ref* 時，可以直接對原生的 DOM 屬性進行操作。

```js
function App() {
  const inputRef = useRef(null);

  return (
    <div>
      <input ref={inputRef} style={{ display: "block", margin: "20px auto" }} />
      <button onClick={() => inputRef.current.focus()}>Focus Input Ref</button>
    </div>
  )
}
  
```

## useReducer

基本上使用方式與 redux 相同，透過 `useReducer` 回傳 default state 與 dispatch，透過 dispatch 去更新 state 的狀態。

與 `useState` 相比，`useReducer` 更新 state 的 flow 雖然較為複雜，但是可以一次設定許多值。

```js
// useReducer
const [{a, b, c}, dispatch] = useReducer(reducer, {a: 1, b: 2, c: 3});
// useState
const [a, setA] = useState(1);
const [b, setB] = useState(2);
const [c, setC] = useState(3);
```

使用 `useReducer` 可以將狀態統一管理在 `reducer` 內，提高程式的易讀與可維護，並且可以降低 bug 的產生 ( 將所有改變 state 的方法統一進行管理 )，也易於 test ( 是 pure function )。

```js
function reducer(state, action) {
  switch(action.type) {
    case 'INCREMENT_A':
      return {...sate, a: state.a + 1}
    case 'DECREMENT_A':
      return {...sate, a: state.a - 1}
    case 'INCREMENT_B':
      return {...sate, b: state.b + 1}
    case 'DECREMENT_B':
      return {...sate, b: state.b - 1}
    // ...
    default:
      return state
  }
}
```

{{<note>}}
在使用 <code>useReducer</code> 後，仍可以將 redux 加入專案，2 個仍然是不同的。可以想像成 <code>useReducer</code> 是將 state 管理在 component 中，就像 <code>useState</code>。並不會希望 component 的 state 跑到 global state 中。
{{</note>}}

demo
{{<codeSandbox tp6gw94-react-hook-usereducer-2ki6n>}}

## useMemo

`useMemo` 的使用時機在於提升 web 的效能，`useMemo` 依據 dependency 去決定是否重新計算或渲染畫面。

未使用 `useMemo` 的 demo
{{<codeSandbox tp6gw94-react-hook-no-usememo-mf87k>}}

在範例中因為每次更新 state，都會重新計算 `fib` 需要耗費較大的資源，儘管更新 `status` 的話 `fib` 的值都未進行更新，但都必須重新渲染，導致每次的渲染都會進行非常長的時間。

對於昂貴的計算採用 `useMemo` 避免效能的問題產生。

使用後
{{<codeSandbox tp6gw94-react-hook-usememo-mrjjr>}}

可以看到每次更新 `status` 時，都會非常的迅速，因為 `fib` 並未偵測到 `count` 的改變。

## useCallback

`useCallback` 顧名思義就是回傳 callback 的 function 與 `useMemo` 2 者皆是為了提生效能的 hook，皆是在 dependency 發生改變時，才會進行重新的計算。

`useCallback` 通常會與 `memo` 一起使用，`memo` 會將 component 的 props 進行淺比較，若不相同才會進行更新。

demo
{{<codeSandbox react-hook-usecallback-qhvrb>}}

當父元素進行更新時，`memo` 確認 props 是否有變更，決定是否進行刷新元件。

`useCallback` 依據 dependency 決定是否回傳新的 function。

{{<note>}}
useMemo 與 useCallback 都是提升效能的 hook，但是否需要用到它需要思考一下，若計算不昂貴仍使用的話，反而會造成效能的降低與可讀性變差，
{{</note>}}

## useLayoutEffect

`useLayoutEffect` 常用在製作 animation 或一些 DOM 元素上面，它與 `useEffect` 用法相同，大多數時候其實只需要用到 `useEffect` 即可。

`useLayoutEffect` 可以保證在內部的資料**同步**的進行更新，所以可能會造成畫面的阻塞，它等價於 `componentDidMount`。

demo
{{<codeSandbox tp6gw94-react-hook-uselayouteffect-f30e3>}}

demo 中在 `useLayoutEffect` 中使用了昂貴的計算，畫面會呈現空白等待計算完畢才會顯示出 hi

```javascript
function lib(n) {
  if (n <= 1) {
    return 1;
  }
  return lib(n - 1) + lib(n - 2);
}

export default function App() {
  const [text, setText] = useState("ih");

  useLayoutEffect(() => {
    lib(40);
    setText("hi");
  }, []);

  return (
    <div className="App">
      <h1>{text} </h1>
    </div>
  );
}
```

若是使用 `useEffect` 的話，畫面會先顯示出 ih，等待適當的時刻才會重新渲染畫面為 hi。

```javascript
function lib(n) {
  if (n <= 1) {
    return 1;
  }
  return lib(n - 1) + lib(n - 2);
}

export default function App() {
  const [text, setText] = useState("ih");

  useEffect(() => {
    lib(40);
    setText("hi");
  }, []);

  return (
    <div className="App">
      <h1>{text} </h1>
    </div>
  );
}
```

## useImperativeHandle

`useImperativeHandle` 主要是用在建立 library 或者 sdk，在一般的場景中幾乎不會用到這個 hook。

`useRef` 會將 instance 的值回傳，所以我們可以直接控制 DOM 元素，而 `useImperativeHandle` 會回傳你定義它要回傳的屬性或是取代屬性。

因為這個特性，它常用於若不想直接將元素的 properties 暴露出來給其他人使用或想要取代原生的行為時，才會使用這個 hook。

{{<codeSandbox tp6gw94-react-hook-useimperativehandler-es0mu>}}

當 blur input 時，可以看到 console 出現的 ref 只有 expose 出 blur 的 properties。

## useDebugValue

`useDebugValue` 與 `useImperativeHandle` 一樣比較常使用在 library 或 sdk，對於一般的應用場景較少使用。

它的使用是告知 user 這個 custom hook 是在做什麼。

{{<codeSandbox tp6gw94-react-hook-useimperativehandler-es0mu>}}

打開 React DevTools 可以看見 App component 內有 `customHook` 的訊息。