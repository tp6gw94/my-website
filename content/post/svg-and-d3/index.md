---
title: "SVG & D3"
date: 2021-11-23T14:53:20+08:00
draft: true
toc: true
tags: ["Visualization"]
---

## SVG vs Canvas

SVG
- XML syntax
- 每個呈現出的形狀都是 DOM Element
- pro
  - 簡單
  - 容易進行 Event 的互動
- con
  - 在大量資料時，效能較差

Canvas
- JS API
- 呈現的只有一個 Canvas Element
- pro
  - 對於動畫呈現非常好
  - 高效能
- con
  - 難以進行某元素的 Event 互動

## SVG

常用的 Element

- `<rect>`

  <div>
    <svg width="50" height="50">
      <rect width="50" height="50" x="0" y="0" stroke="black" stroke-width="1" fill="none" />
    </svg>
  </div>

  ```html
  <svg width="50" height="50">
    <rect width="50" height="50" x="0" y="0" stroke="black" stroke-width="1" fill="none" />
  </svg>
  ```
  
- `<circle>`

  <div>
    <svg width="50" height="50">
      <circle r="25" cx="25" cy="25" stroke="black" stroke-width="1" fill="none" />
    </svg>
  </div>
  
  ```html
  <svg width="50" height="50">
    <circle r="25" cx="25" cy="25" stroke="black" stroke-width="1" fill="none" />
  </svg>
  ```
- `<path>`

  <div>
    <svg width="50" height="50">
      <path d="M0 0 L50 50" fill="none" stroke="black" stroke-width="1"/>
    </svg>
  </div>
  
  ```html
  <svg width="50" height="50">
    <path d="M0 0 L50 50" fill="none" stroke="black" stroke-width="1"/>
  </svg>
  ```
- `<text>`

  <div>
    <svg width="50" height="50">
      <text x="25" y="25" text-anchor="middle" >Hello</text>
    </svg>
  </div>

  ```html
  <svg width="50" height="50">
    <text x="25" y="25" text-anchor="middle" >Hello</text
  </svg>
  ```