---
title: "Cypress Test"
date: 2021-05-22T21:44:59+08:00
toc: true
tags: ["Web", "E2E", "Test"]
---

> cypress 是 e2e test framework，不論前端或後端是用什麼的框架，都可以進行 e2e 的測試。

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

> begin chain of cypress command, can't use a second command

- `cy.visit(url)` visit url
- `cy.get(dom)` get dom element use query string
- `cy.request(url, option)` send request(post, get, delete...)

### Child command

> chain parent command or other child command

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

## Custom command

> cypress 提供自定義 command 方便操作

```javascript
// 定義
Cypress.Commands.add('postData', (data) => {
  cy.request('POST', 'https://localhost:8888/postData', {
    body: data
  })
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
])
```

{{<note>}}
  大多數的時候 test 會使用 sutbbed response 進行測試，但 stubbed reponse 並不適用於 SSR 的架構上，且在核心的系統上 (例如登入) 也較不合適
{{</note>}}

## Screenshots

> cypress 提供截圖功能，可以供使用者瀏覽

```javascript
cy.screenshot('') // 若未給參數會自動儲存在 screenshots 的資料夾內
```

當測試 fail 時，cypress 也會自動截圖

## 實作的小紀錄

### 建立 Vue component test

安裝相關 plugin
```
yarn add -D @cypress/vue @cypress/webpack-dev-server
```

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

run ui
```
cypress open-ct
```

run command
```
cypress run-ct
```

### 建立 code coverage

安裝 plugin
```
yarn add babel-plugin-istanbul @cypress/code-coverage
```

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
```
yarn add -D start-server-and-test
```

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

設定 `package.json`

```json
{
   "cy:run-ct": "NODE_ENV=test cypress run-ct",
   "test": "cypress run",
   "cy:run-e2e": "start-server-and-test serve http://localhost:8080 test"
}
```