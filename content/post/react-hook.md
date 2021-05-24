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
{{<codeSandbox tp6gw94-react-usestate-hook-p7s4w>}}

```js
import {createContext} from 'react';

const UserContext = createContext([{}])

```