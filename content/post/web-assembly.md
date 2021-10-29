---
title: "Web Assembly"
date: 2021-10-07T23:00:28+08:00
draft: true
---

## Intro

Web Assembly 是透過高階語言編譯成低階的語言，透過建立環境的 sandbox 可以運行在大多數的環境上，Web Assembly 有著接近原生的速度，比 JavaScript
快，但其目的並非用來取代 JavaScript。

Web Assembly 有著 cached 的機制，可以從 server 直接 fetch 到 wasm 的檔案。

Web Assembly 有 2 種 file type

1. wasm
    - binary
    - machine-readable
    - 可執行
2. wat
   - text
   - human-readable
   - compile to wasm