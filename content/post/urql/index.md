---
title: "GraphQL Client - urql"
date: 2021-07-21T22:28:58+08:00
toc: true
---

> 目前大多數想到 GraphQL 都會想到 Apollo，但 Apollo 對於初次使用的使用者卻並不是那麼的友好，在使用前需要進行較多的設定。
> 
> urql 相比 Apollo 或 Relay 非常簡單，不需要進行太多的設定就可以馬上使用，是款小而靈巧的 GraphQL Client library。

## GraphQL

GraphQL 透過前端與後端的處理，能減少對於後端發送 request 的請求次數、約束資料的型別，並且前端獲得的資料是接近完美的資料形態，讓前端獲得資料時可以專注在元件的設計上。

像是使用 redux 一樣，在以往的模式透過 RESTful API 獲取數據，並在前端處理好這些 Data 然後去 mapping 到 redux store 上，在使用單項數據流的方式處理這些資料。

有了 GraphQL 後，獲取的資料已經是我們需要的資料格式，並且透過 cache 也能自動的達成更新資料。

## Basic

要建立 GraphQL Client 非常的容易

```javascript
import { createClient } from 'content/post/urql/index';

const client = createClient({
  url: 'http://localhost:3000/graphql',
});
```

這樣就已經建立好 GraphQL 的 Client 了，在 React 中直接透過 HOC 就可以使用。

```jsx
import { createClient, Provider } from 'content/post/urql/index';

const client = createClient({
  url: 'http://localhost:3000/graphql',
});

const App = () => (
  <Provider value={client}>
    <YourRoutes/>
  </Provider>
);
```

在元件內直接使用 `useQuery`

```jsx
import { useQuery } from 'content/post/urql/index';

const TodosQuery = `
  query {
    todos {
      id
      title
    }
  }
`;

const Todos = () => {
  const [{ data }] = useQuery({ query: TodosQuery });

  // ...
}

```

`useQuery` 也可以帶參數進去

```jsx
const Todo = `
query Todo($id: Int!) {
  todos(id: $id) {
    id
    title
  }
}
`;

const Todo = (id) => {
  const [ { data } ] = useQuery({query: Todo, variables: [id]});
  // ...
}
```

## GraphQL Code Generator

這並非 urql 專屬的套件，它 support 許多 GraphQL client 與不同的語言，透過它能使用後端 server 的 schema 自動建立好 query 的 type 與使用的 hook，讓前端使用上更快速且簡單，不需要在前端再建立一次 schema，client side 只需要考慮如何使用 query 與 mutation。

建立的方式也很簡單，透過 `@graphql-codegen/cli` 就可以將需要的套件與與環境設立好。

首先安裝 graphql 與 codegen cli

{{<cmd>}}
yarn add graphql
yarn add -D @graphql-codegen/cli
{{</cmd>}}

之後就透過 `yarn graphql-codegen init`，選擇去建立相關的環境。

{{<figure src="./code-gen-init.png" title="設定時的選項">}}

只需要照著選，就能將基本配置建立好，之後下 `yarn` 安裝完相關的套件，就完成了。

## Cache

urql 預設提供了 document caching，也提供了 Normalized caching 可供選擇。

簡單比較 2 者的不同

| Document Cache           | Normalized Cache                              |
| ---------------------------------- | :------------------------------------------------- |
| cache 的儲存就像是瀏覽器     | cache 的儲存行為像是資料庫                         |
| 每個 query 的執行結果就像 document | query 會依照 key 與 type 分別儲存到不同的 entities |

- Document Cache

    就像瀏覽器的 cache，依照 request 的 query 與 variable 當做 key 進行 cache 的資料儲存。
    
    透過 hash query 與 variable 的方式產生 unique key，然後透過 mutation 裡的 `__typename` 去判斷這個 request 的 cache 是否作廢，重新獲取 `__typename` 的值。

- Normalized Cache

    在 urql 中，使用 [Graphcache exchange](https://formidable.com/open-source/urql/docs/graphcache/) 就可以使用 Normalized cache。
    
    參考 urql 的開發者 [kitten blog 的例子](https://kitten.sh/graphql-normalized-caching) ，它的原理大概是遍歷 query 的 document，將 field 欄位中不同的 type 進行關聯(urql 稱爲 link)。



Cache 的概念在 GraphQL 中非常的重要，透過 Cache 不僅能減少 request 的數量與 size，在資料的狀態管理上也不需要擔心太多，當每次資料進行變更時，回傳的資料會自動更新 Cache 無需人爲去操控(在大部分的情況是這樣)，所以它還能取代像是 vuex, redux 等狀態的管理套件。


### Document Cache

在上文有提到使用 Document Cache 必須有回傳值的 `__typename` 才會重新進行 request 更新 cache 值，意思就是若在刪除的 mutation 中沒有回傳相關的資訊，cache 將不會進行更新(重新發送 request)，看以下的示例。


假設有個 post，再將 post 刪除時若後端的 resolver 未從新回拋刪除的 post，urql 將不會得到 `__typename`，此時就不會更新 Cache 重新發送 request。


後端的部分 code
```javascript
let posts = [
  {
    id: "1",
    title: 'First post',
    userId: "1",
  },
  {
    id: "2",
    title: 'Second post',
    userId: "1"
  },
  {
    id: "3",
    title: 'First post',
    userId: "2"
  }
];

const resolver = {
  Mutation: {
    deletePost(_, {id}) {
      posts = posts.filter(post => post.id !== id);
    }
  }
}
```

前端的 mutation

```graphql
mutation DeletePostMutation($deletePostId: ID!) {
    deletePost(id: $deletePostId) {
        title
    }
}
```

此時當前端觸發事件，進行刪除的動作，UI 並不會更新，原因是因爲 cache 沒有更新，沒更新的原因就是沒有回傳相關的資訊，所以沒有 `__typename`，導致將不會重新進行 request。

{{<figure src="./cache-not-update.gif" title="若未回傳，cache 將不會更新" width="100%">}}

但若是在 delete 的 mutation，回傳刪除的 post (或是任何一個 post，回傳什麼資料不重要，重點是要有相關的`__typename`)，document cache 就會偵測到 `__typename`，就會進行重新 request 更新 cache。

後端的 mutation
```javascript
const resolver = {
  Mutation: {
    deletePost(_, {id}) {
      posts = posts.filter(post => post.id !== id);
      // 非常不建議這樣做，最好還是在刪除前獲取要刪除的 post
      return posts[0];
    }
  }
}
```

因爲回傳的 data 帶有 `__typename`，就會觸發更新，也可以發現在 urql devtool，會有 2 個 event 發生，1 個是刪除，另一個就是重新獲取 posts 的資料。

最後一個未刪除的原因就是 `post[0]` 是 `undefined`，未回傳帶 `__typename`。


{{<figure src="./cache-update.gif" title="Cache 更新，連動 UI 一起更新" width="100%">}}

### Normalized Cache

Normalized Cache 更新 Cache 是使用另一種類似訂閱的方式進行更新。


未完...待更新...