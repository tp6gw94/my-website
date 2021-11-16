---
title: "Asynchronous JavaScript"
date: 2021-11-05T19:57:48+08:00
draft: true
---

## Intro

**Parallel** vs **Async** 

這是 2 種不同的意思，Parallel 指的是同時進行，假設有 2 個 thread，任務在這 2 條 thread 上進行排隊處理，CPU 可以同時處理 2 條 thread 的任務，稱爲 Parallel。

Async 只會執行在單一個 thread 上面，不管背後有多少隻 JavaScript 程式，都會在相同的 thread 上面執行。就算同時啓動了多個 JavaScript 的引擎，看起來同時有多個 JS thread 正在運行，但他們相互之間仍然是獨立的無法進行溝通。

儘管 Web Worker 看起來是多建一個 thread 在背後進行執行，但 Web Worker 是透過 Browser 而非 JS，與 Web Worker 溝通的方式仍然是使用 Event Loop。

## Callback

簡單的 Callback 例子

```javascript
setTimeout(function() {
  console.log('callback')
}, 1000)
```

在 JS 時常使用 Callback 作爲連續進行的方式。當某件事發生後接下來執行什麼。

這是 Callback hell 的例子

```javascript
setTimeout(function() {
  console.log('a')
  setTimeout(function() {
    console.log('b')
    setTimeout(function() {
      console.log('c')
    }, 1000)
  }, 1000)
}, 1000)
```
這也是 callback hell，只是可能較不明顯。

```javascript
function a(cb) {
  console.log('a')
  setTimeout(cb, 1000)
}
function b(cb) {
  console.log('b')
  setTimeout(cb, 1000)
}
function c() {
  console.log('c')
}

a(function() {
  b(c)
})
```

看以下例子，若希望能依照 id 的順序依序印出各個 Post，是非常困難的事情。

```javascript
function getPost(postId, cb) {
  const oReq = new XMLHttpRequest();
  oReq.responseType = "json";
  const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";
  oReq.addEventListener("load", (e) => cb(e.target.response));
  oReq.open("GET", `${POSTS_URL}/${postId}`);
  oReq.send();
}

getPost(1, function (res) {
  console.log(res);
});

getPost(2, function (res) {
  console.log(res);
});

getPost(3, function (res) {
  console.log(res);
});
```
[sandbox](https://codesandbox.io/s/youthful-snow-gu6vu?file=/src/index.js)

需要透過某個 variable 更改 state，依照順序的列印出資料。

```javascript
const responses = {};

function getPost(postId) {
  const oReq = new XMLHttpRequest();
  oReq.responseType = "json";
  const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";
  oReq.addEventListener("load", (e) =>
    recisiveRespons(postId, e.target.response)
  );
  oReq.open("GET", `${POSTS_URL}/${postId}`);
  oReq.send();
}

function recisiveRespons(id, response) {
  if (!(id in responses)) {
    responses[id] = response;
  }
  const posts = [1, 2, 3];
  for (const idx of posts) {
    if (idx in responses) {
      if (responses[idx]) {
        console.log(responses[idx]);
        responses[idx] = false;
      }
    } else {
      return;
    }
  }
  console.log("comeplete");
}

getPost(1);
getPost(2);
getPost(3);
```
[sandbox](https://codesandbox.io/s/shy-https-2g7os?file=/src/index.js)

{{<note>}}
以上的例子並不代表 post 2 會在 post 1 之後去獲取，獲取的時間點不是有序的，只是透過儲存資料的方式依序列出而已，並且是用很醜的方式達成。若要達成有序的獲取資料，就會變成巢狀的當獲取完 post 1 時，透過 callback 獲取 post 2，post 2 獲取完後...
{{</note>}}

使用 Callback 容易造成的 callback hell，並且使程式邏輯複雜且維護痛苦。

在 JS 中有個常用的 Callback 設計模式**error first**

```javascript
doSomething(function(err, res) {
  if (err) {
    console.error(err)
  } else {
    // do something...
  }
})
```