---
title: "Storybook"
date: 2021-06-26T20:06:02+08:00
draft: true
toc: true
---

> Storybook 是一個 open source 的工具，支援 Vue, React, Angular 等框架，它可以替 Component 建立清晰的文件與看見 UI 的樣式，在每個 component 中也能清楚地看到當下的 state, action，還能以 component 進行測試。
> 
> 目前前端主流都是基於 component 去進行開發，當有許多的元件的時候，若沒有清楚的文檔或是說明，在維護或接手開發都會耗費許多的時間成本在熟悉專案元件上面，若能將每個 component 進行獨立說明與查看當 state 發生變化 UI 是如何進行響應的、使用的 flow 會是如何，就可以省下更多的時間，也易於溝通和測試。

## Install

本篇以 [mdn/todo-react](https://github.com/mdn/todo-react) 為示範，使用 storybook。

首先進行安裝

{{<cmd>}}
npx sb init
{{</cmd>}}

storybook 會自動偵測 project type (react or vue or ....)，自動安裝好相對應的 library，安裝完後會在 `src` 的資料夾下看到 `stories` 的資料夾，在最外層也有 `.storybook` 的資料夾。

在 `/.storybook/main.js` 中可以編輯要偵測的 story 檔案與 addon (plugin)，在一開始 storybook 就已經偵測到是使用 react，所以已經自動加入對應的 addon，若之後要使用其他的 addon，需要進來編輯新增。

```javascript
// /.storybook/main.js
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ]
}
```

## Doc

撰寫 story 有 2 種方式，一是使用 mdx 另外是使用 js 或是 ts 等，也可以 2 個都用。

