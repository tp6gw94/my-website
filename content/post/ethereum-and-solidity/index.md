---
title: "Ethereum & Solidity"
date: 2021-11-23T21:29:00+08:00
draft: true
toc: true
tag: ['Blockchain', 'Ethereum']
---

> 只有基礎技術相關

## Intro

關於 Blockchain 與 Ethereum 的解釋已經有許多的影片、文章解釋非常的清楚了，若什麼不清楚的話可以將下方影片看完，就會有了基礎的認識。

- [Blockchain 的運作原理](https://www.youtube.com/watch?v=bBC-nXj3Ng4&list=LL&index=4)
- [什麼是以太幣&以太坊運行超強詳解](https://www.youtube.com/watch?v=26kR2vUbbJo)
- [淺釋-區塊鏈如何運作](https://www.youtube.com/watch?v=SSo_EIwHSd4&t=14s)

其它的相關資源

- [learnblockchain](https://learnblockchain.cn/)
- [ethfans](https://ethfans.org/wikis/Home)
- [coursera](https://www.coursera.org/learn/cryptocurrency#syllabus)

## Ethereum Network

- 用來進行交易資料的儲存
- 有許多不同的 Ethereum Network
- Network 透過許多的 Node (筆電、桌電、手機執行的 Ethereum client) 形成
- 所有人都可以形成並執行 Node
- 每個 Node 都包含了完整的區塊鏈

開發者透過 web3.js 進行交易、資料儲存、部署合約等。

一般使用者可能透過 METAMASK 註冊 Ethereum 錢包，並同時建立了 Ethereum 的帳號，透過 METAMASK 也能連接到 Ethereum Network，也能透過 Test Network 進行測試(到設定中開啓)。

Ethereum Account 包含了以下資訊

- Account Address
- Public Key
- Private Key

透過 Test Network 與 Account Address 可以測試 Eth 轉賬收發進行開發，每個轉賬的記錄都會被記錄在 Ethereum Network 中所有的 Node。