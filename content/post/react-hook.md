---
title: "React Hook"
date: 2021-05-23T12:18:52+08:00
draft: true
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