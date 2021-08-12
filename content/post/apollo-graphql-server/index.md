---
title: "Apollo GraphQL Server"
date: 2021-06-20T21:43:12+08:00
draft: true
toc: true
tags: ["GraphQL", "Web", "Server-Side"]
---

## Resolver

1. Resolver 的名稱必須與 Schema Types 的名稱一致
2. Resolver 回傳的 Type 必須與定義的 field 一致
3. Resolver 可以是 async function
4. 可以從任何的來源取得資料

```javascript
// query type 與 resolver filed 相符
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

## Directives

> 類似裝飾器，可以透過它另外設定 field 或是 query，也可以自定義 directive

預設的 Directive

1. @include(if: Boolean!) 如果是 true 則執行裝飾器裡的內容
2. @skip(if: Boolean!) 與 @include 相反，如過是 true 則不執行裡面的內容
3. @deprecated(reason: String) 替 field 增加移除、棄用等提示，主要是為了兼容舊的 Schema

替 title 設置告示已移除
```javascript
// ...

const typeDefs = gql`
    type Book {
        title: String @deprecated(reason: "remove title use new title")
        author: String
        newTitle: String 
    }

    type Query {
        books: [Book]
    }
`

// ...
```

{{< figure src="./graph.jpg" title="graph 示意圖" >}}