---
title: "Cypress Test"
date: 2021-05-22T21:44:59+08:00
toc: true
tags: ["Web", "E2E", "Test"]
---

> cypress 是 E2E Test framework，不論前端或後端是用什麼的框架，都可以進行 E2E 的測試。

## Organizing Test

```text
cypress
├── README.md
├── fixtures                # json files, mock data
│   ├── example.json
│   └── post.js
├── integration             # test files
│   └── my_first_spec.js
├── plugins                 # cypress plugin
│   └── index.js            
└── support                 # reuseable code, utiles function
    └── index.js

```

## Commands

cypress 提供許多便利的 command，也可以透過既有的 command 自訂 command

### Parent command

> chain 中的第一個 command，不能在第二個位置出現

:heavy_check_mark:

- `cy.visit(url)` visit url
- `cy.get(dom)` get dom element use query string`
- `cy.request(url, option)` send request(post, get, delete...)

:x:

- `.get().`
- `.request(url)`

### Child command

> 連接 parent command 或是連結其他的 child command

- `.click()` click event
- `.type(text)` type text
- `.find(selector)` find dom
- `.should(chainers)` assertion

### Dual command

> both parent & child

- `cy.contains()`
- `cy.screenshot()`
- `cy.scrollTo()`
- `cy.wait()`
- `cy.get().contains()`

## Custom command

> cypress 提供自定義 command 方便操作

```javascript
// 定義
Cypress.Commands.add('postData', (data) => {
  // before 6.0
  cy.request('POST', 'https://localhost:8888/postData', {
    body: data
  });

  // new
  cy.intercept({url: 'https://localhost:8888/postData', method: 'POST'}})
});

// 使用
cy.postData()
```

## Assertion

cypress 也提供斷言的feature，對於元素的斷言通常是使用 **.should** 進行斷言，例如 
- `cy.get('form').find('input').should('not.have.class', 'disabled')` 
- `cy.get('#user-name').should('have.text', 'Joe Smith')`

cypress 也提供類似其他的 unit test 的斷言( `expect` 或 `assert`)，例如 
- `expect(name).to.not.equal('Jane')`
- `assert.equal(3, 3, 'vals equal')`

詳細的斷言使用可以參考[官網的說明文件](https://docs.cypress.io/guides/references/assertions)

## Retry

> 目前大多數網站是動態網站( react, vue, angular...)，而非靜態的網站( html, css )，這會造成在測試時可能因為非同步的關係導致某些元素尚未產生，cypress 提供了 retry 的 feature，可以等到產生元素或是 timeout。

1. 並非所有的 command 皆會 retry ，以下列舉較常用且會 retry 的 command
    - `.get`
    - `.find`
    - `.contains`

2. 只有在 assertion 前最後一個 command 會 retry

## Network request

### No stubbed response

- 向真實的 server 發送請求
- 對於 SSR 是容易使用的
- 與 stubbed response 相比是較慢的 ( 須經過 server 的每個 layer )

```javascript
// before cypress 6.0.0
cy.server();
cy.route('**/users').as('getUsers');
cy.visit('/users');
cy.wait('@getUsers');

// after cypress 6.0.0
cy.intercept('**/users').as('getUsers');
cy.wait('@getUsers');
```

### Stubbed response

- 很快
- 可以自行控制 response 的內容( body, status, header, delay...)
- 容易測試請求 API 回傳 json 的形式

```javascript
// before cypress 6.0.0
cy.server()
cy.route('https://localhost:8888/user?email=john@gmail.com', [
  {
    id: 1, name: 'john'
  }
])

// after cypress 6.0.0
cy.intercept('https://localhost:8888/user?email=john@gmail.com', [
  {
    id: 1, name: 'john'
  }
]);
```

也可以從 fixture 資料中定義，並回傳

```javascript
cy.intercept('https://localhost:8888/user?email=john@gmail.com', {
  fixture: 'filename.json'
});
```

{{<note>}}
  大多數的時候 test 會使用 sutbbed response 進行測試，但 stubbed reponse 並不適用於 SSR 的架構上，且在核心的系統上 (例如登入) 也較不合適
{{</note>}}

## 網頁的狀態 (Cookie & Local Storage)

> cypress 原生的 command 就支援 Cookie，Local Storage 則需要透過 plugin

可以開啟 Cookie 的 debug mode，在每次當 Cookie 有更新時，都會將 Cookie 印在 console 上。

`Cypress.Cookies.debug(true)`

Cookie 的 command
- cy.setCookie(key, value)
- cy.clearCookie(key)

Local Storage 需要透過 plugin

安裝 Local Storage 的 plugin
{{<cmd>}}
yarn add cypress-localstorage-commands 
{{</cmd>}}

Local Storage 的 command

- cy.setLocalStorage(item, value)
- cy.removeLocalStorage(item)
- cy.getLocalStorage(item)
- cy.restoreLocalStorage()

## 檔案

> 可以透過 plugin 實現上傳與下載檔案，在透過 assertion 去判斷檔案的內容或是否存在

安裝 plugin
{{<cmd>}}
yarn add cypress-downlaodfile cypress-file-upload
{{</cmd>}}

個人處理經驗上 download file 的 plugin 較少機會使用到，通常還是使用 E2E 模擬使用者操作的方式去下載檔案，upload plugin 較常使用。

下載的檔案會儲存至 cypress/downloads 中，可以在 config 中設定每次執行前先清理檔案。

upload file 的套件可以選取 input 後將檔案放進 input 中
```js
cy.get('input').attachFile(filename)
```

之後可以透過 `trigger` command 去 trigger event 的產生。

詳細套件使用可[參考](https://www.npmjs.com/package/cypress-file-upload)

## Screenshots & Video

> cypress 提供截圖功能，可以供使用者瀏覽

可以使用 command 手動的在執行中截圖
```javascript
cy.screenshot('') // 若未給參數會自動儲存在 screenshots 的資料夾內
```

當測試 fail 時，cypress 會自動截圖

cypress 在每次執行 E2E Test 時會進行錄影，若要取消可在 config 中進行設定
```json
{
  "video": false
}
```

## 實作的小紀錄

### 建立 Vue with cypress test

> sample link [這裡](https://github.com/tp6gw94/vue-with-cypress-setup)

安裝相關 plugin
{{<cmd>}}
yarn add -D @cypress/vue @cypress/webpack-dev-server
{{</cmd>}}

設定 plugin
```javascript
// cypress/plugins/index.js

const { startDevServer } = require('@cypress/webpack-dev-server')
const webpackConfig = require('@vue/cli-service/webpack.config.js')

module.exports = (on, config) => {
   on('dev-server:start', options => 
     startDevServer({
      options,
      webpackConfig
     })
   );

   return config;
}
```

設定 cypress
```json
{
   "component": {
      "componentFolder": "src",
      "testFiles": "**/*.spec.js"
   }
}
```

component test 範例
```javascript
import { mount } from '@cypress/vue';
import HelloWorld from './HelloWorld';

describe('HelloWorld', () => {
  it('render message', () => {
    const msg = 'test component test';
    mount(HelloWorld, {
      propsData: {
        msg,
      },
    });

    cy.get('h1').should('have.text', msg);
  });
});
```

開啟 E2E Test 的 ui
{{<cmd>}}
cypress open-ct
{{</cmd>}}

使用 command 的方式執行 E2E Test
{{<cmd>}}
cypress run-ct
{{</cmd>}}

### 建立 code coverage

安裝 plugin
{{<cmd>}}
yarn add babel-plugin-istanbul @cypress/code-coverage
{{</cmd>}}

設定 instrument 使用 babel
```javascript
// babel.config.js

const plugins = [];

if (process.env.NODE_ENV === 'test') {
   plugins.push(['babel-plugin-istanbul', { extension: ['.js', '.vue'] }]);
}

module.exports = {
   presets: ['@vue/cli-plugin-babel/preset'],
   plugins,
};
```

此時在 run server 時，在 `NODE_ENV=test` 下可以 list 出 coverage `window.__coverage__`

在`coverage/`可看到 test 的覆蓋率

### CI

安裝套件
{{<cmd>}}
yarn add -D start-server-and-test
{{</cmd>}}

設定 cypress
```json
{
   "reporter": "junit",
   "reporterOptions": {
      "mochaFile": "tests/TEST-output-[hash].xml",
      "toConsole": true,
      "attachments": true
   },
   "video": false
}
```

設定 package.json

```json
{
   "cy:run-ct": "NODE_ENV=test cypress run-ct",
   "test": "cypress run",
   "cy:run-E2E": "start-server-and-test serve http://localhost:8080 test"
}
```

設定 config

```json
{
  "baseUrl": "http://localhost:8080",
  "trashAssetsBeforeRuns": true,
  "viewportWidth": 1280,
  "component": {
    "componentFolder": "src",
    "testFiles": "**/*spec.{js,jsx,ts,tsx}"
  },
  "reporter": "junit",
  "reporterOptions": {
    "mochaFile": "tests/TEST-output-[hash].xml",
    "toConsole": true,
    "attachments": true
  },
  "video": false
}
```
測試結果的檔案會儲存在 test 中

git lab ci
```yml
test:
  image: cypress/base:14.16.0
  stage: test
  before_script:
    - cd client
  script:
    # install dependencies
    - yarn install
    # start the server in the background
    - npm run cy:run-e2e
```