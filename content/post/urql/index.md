---
title: "GraphQL Client - urql"
date: 2021-07-21T22:28:58+08:00
toc: true
---

> 目前大多數想到 GraphQL 都會想到 Apollo，但 Apollo 對於初次使用的使用者卻並不是那麼的友好，在使用前需要進行較多的設定。
> 
> urql 相比 Apollo 或 Relay 非常簡單，不需要進行太多的設定就可以馬上使用，是款小而靈巧的 GraphQL Client library。

## GraphQL

GraphQL 透過前端與後端的處理，能減少對於後端發送 request 的請求次數、約束資料的型別，並且前端獲得的資料是接近完美的資料形態，讓前端獲得資料時可以專注在元件的設計上。

像是使用 redux 一樣，在以往的模式透過 RESTful API 獲取數據，並在前端處理好這些 Data 然後去 mapping 到 redux store 上，在使用單項數據流的方式處理這些資料。

有了 GraphQL 後，獲取的資料已經是我們需要的資料格式，並且透過 cache 也能自動的達成更新資料，也不必擔心資料 state 的更新問題，GraphQL 解決了每次更新資料、刪除等操作時，需要手動的進行 state 的狀態更動或是進行重新要求數據。

在正常的專案中，GraphQL 是可以取代 Redux、Vuex 這種狀態管理 library。

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

`useQuery` 也可以帶 GraphQL 變數進去

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

| Document Cache                     | Normalized Cache                                   |
| ---------------------------------- | :------------------------------------------------- |
| cache 的儲存就像是瀏覽器           | cache 的儲存行為像是資料庫                         |
| 每個 query 的執行結果就像 document | query 會依照 key 與 type 分別儲存到不同的 entities |

- Document Cache

    就像瀏覽器的 cache，依照 request 的 query 與 variable 當做 key 進行 cache 的資料儲存。
    
    透過 hash query 與 variable 的方式產生 unique key，然後透過 mutation 裡的 `__typename` 去判斷這個 request 的 cache 是否作廢，重新 request 獲取 `__typename` 的值。

- Normalized Cache

    在 urql 中，使用 [Graphcache exchange](https://formidable.com/open-source/urql/docs/graphcache/) 就可以使用 Normalized cache。
    
    參考 urql 的開發者 [kitten blog 的例子](https://kitten.sh/graphql-normalized-caching) ，它的原理大概是遍歷 query 的 document，將 field 欄位中不同的 type 進行關聯(urql 稱爲 link)。

  若使用過 Apollo GraphQL 的話，Normalized Cache 就類似於 Apollo 使用的 Cache，只是在 urql 中，重新更新 Cache 的方式會與 Apollo 中較爲不同。

Cache 的概念在 GraphQL 中非常的重要，透過 Cache 不僅能減少 request 的數量與 size，在資料的狀態管理上也不需要擔心太多，當每次資料進行變更時，回傳的資料會自動更新 Cache 無需人爲去操控(在大部分的情況是這樣)，所以能取代像是 vuex, redux 等狀態的管理套件。


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

此時當前端觸發事件，進行刪除的動作，UI 並不會更新，原因是因爲 cache 沒有更新，而 Cache 沒更新的原因就是沒有回傳相關的資訊，所以沒有 `__typename`，導致將不會重新進行 request。

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

在使用 Document Cache 時可能會遇到回傳 empty array 的狀況，例如 query 可能長這樣

```graphql
{
  posts {
    id
    title
  }
}
```

此時若是 posts 還未有任何的資料，可能會回傳 `null` 或是 `[]`，資料內未帶 `Post` 的 `__typename`，如上所述所提因爲 document cache 是使用 `__typename` 來判斷是否重新進行 request 更新資料，當執行 `createPost` 的 Mutation 回傳 `Post` 的 `__typename` 就無法再次 trigger request(因爲沒有 `Post` 的資料，Query 回傳的 `__typename` 只有 `Posts`)，必須重新載入頁面才能正確的更新。

{{<figure src="./return-empty-list.png" title="從 server 回來的 posts 是空的陣列" width="100%">}}

{{<figure src="./empty-list-not-update.gif" title="因爲回傳的是 empty array，沒有獲取到 __typename，所以 urql 不知道還要再進行一次重新獲取數據" width="100%">}}

urql 提供了非常實用的功能，就是告訴 urql 這個 query empty list 的 `__typename` 是什麼，這樣在執行 Mutation 時也可以透過回傳的 `__typename` 使 urql 知道該去重新獲取資料。

```javascript
const context = useMemo(() => ({additionalTypenames: ['Post']}), []);
const [{data: postsQueryData}] = usePostsQuery({context});
```

此時回傳的 `posts: []` 就會被認爲與 `Post` 有相關聯，會進行重新 request。

### Normalized Cache

normalized cache 是另外一種處理 cache 的方式，有點像是人爲的去進行更新，當發生 mutation 時，可以透過更新 cache 的方式而不是重新 request。

normalized cache 非常的強大，相對的也較爲複雜，若專案沒有特別需求的話，其實使用 document cache 就非常足夠了，也容易使用，

在較爲複雜的場景才會需要使用 normalized cache，它支援了更多的 feature。

要使用 normalize cache 需要先安裝一個 package

{{<cmd>}}
yarn add @urql/exchange-graphcache
{{</cmd>}}

之後添加 exchange 至設定中

```javascript
import { cacheExchange  } from '@urql/exchange-graphcache'

const client = createClient({
    url: 'http://localhost:5000',
    exchanges: [devtoolsExchange, dedupExchange, debugExchange, cacheExchange(), fetchExchange],
});
```

之後就可以開始使用 normalized cache 了。

此時測試使用會發現就算原本的 posts 已經有資料了，但是畫面仍然未更新

{{<figure src="./graphcache-no-update.gif" title="尚未進行設定，cache 未更新" width="100%">}}

原因是因爲必須透過 `updates` 設定告知 Mutation 該如何去更新這些資料

待更新...

## SSR
urql 也提供了 library 支援 SSR，可參考[文件](https://formidable.com/open-source/urql/docs/advanced/server-side-rendering/)，以 next-js 爲例

{{<cmd>}}
yarn add next-urql react-is urql graphql
{{</cmd>}}

之後設定 client 的參數，在使用 `withUrqlClient` 即可，非常的簡單。

```tsx
// utils/createUrqlClient.tsx
export default (_ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({...}),
    _ssrExchange,
    fetchExchange,
  ],
});

// src/pages/index.tsx

// 之後只需要使用 withUrqlClient 將元件包起來，並設定 SSR 爲 true
import NavBar from '../components/NavBar';
import { withUrqlClient } from 'next-urql';
import createUrqlClient from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar />
      {data && data.posts.map((post) => <div key={post.id}>{post.title}</div>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
```

此時該頁面就會是 SSR 的形式

{{<mermaid>}}
flowchart TD
id1(user visit web) --> id2(browser load localhost:3000) --> id3(nextjs server)
--> id4(request graphql server localhost:4000) --> id5(building HTML) --> id6(send back to browser)
{{</mermaid>}}

SSR 會從 Server  build HTML，看以下例子，將回傳的資料 delay 3 秒後在回傳，SSR 與 SPA 的方式會不同

```typescript
// 回傳資料的 code
class Post {
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    await sleep(3);
    return em.find(Post, {});
  }
}

```

此時若有設定 SSR，可以看到資料會直接在頁面上呈現出來，並且 HTML 有帶上資料的訊息

{{<figure src="./urql-ssr.gif" title="資料會直接在頁面上呈現出來" width="100%">}}

{{<figure src="./urql-ssr-html.png" title="SSR 的 HTML 會帶上資料" width="100%">}}

若無設定 SSR，可以看到資料會過一陣子才會渲染出來，並且 HTML 並沒有帶上資料的訊息

{{<figure src="./urql-no-ssr.gif" title="會先渲染畫面，再去獲取資料" width="100%">}}
