---
title: "Express GraphQL Server"
date: 2021-06-06T17:13:15+08:00
toc: true
tags: ["GraphQL", "Web", "Server-Side"]
---

GraphQL 分為 client-side 與 server-side，此篇屬於 server-side 的部分。

> 建立 GraphQL 的 Schema 有分 2 種方式，一是使用 Schema Definition Language (SDL)，是一種 GraphQL 定義 Schema 的語言。
> 
> 另一種是使用程式語言的方式建立 (JavaScript, Ruby...) Schema，express-graphql 就是使用 JavaScript 去定義 Schema。

## GraphQL 的原因

REST-ful API 是常用於 Web 的 API 設計，透過 http request 不同的 method 實現了 CRUD(Create, Read, Update, Delete)。

以下是 Blog 常見的 REST-ful API 設計

|    URL    | Method |     Operation     |
| :-------: | :----: | :---------------: |
|  /posts   |  POST  | Create a new post |
|  /posts   |  GET   |  Fetch all posts  |
| /posts/14 |  GET   |   Fetch post 14   |
| /posts/14 |  PUT   |  Update post 14   |
| /posts/14 | DELETE |  DELETE post 14   |

若要將 Blog 與 User 間進行關聯，URL 可能會長這樣

User REST-ful API

|    URL    | Method |     Operation     |
| :-------: | :----: | :---------------: |
|  /users   |  POST  | Create a new user |
|  /users   |  GET   |  Fetch all users  |
| /users/22 |  GET   |   Fetch user 22   |
| /users/22 |  PUT   |  Update user 22   |
| /users/22 | DELETE |  Delete user 22   |

Post 的 URL 設計大約會像這樣

|        URL         | Method |             Operation              |
| :----------------: | :----: | :--------------------------------: |
|  /users/22/posts   |  POST  |    Create a new post by user 22    |
|  /users/22/posts   |  GET   | Fetch all posts created by user 22 |
| /users/22/posts/14 |  GET   |  Fetch post 14 created by user 22  |
| /users/22/posts/14 |  PUT   | Update post 14 created by user 22  |
| /users/22/posts/14 | DELETE | DELETE post 14 created by user 22  |

當資料越來越複雜，REST-ful API 將無法很好的處理資料間的相互關聯性。

以 facebook 的資料為例子，每個 User 都會帶有個人的資訊，包括居住地、目前的公司、姓名等...

User 的目前職位與工作的公司是會變動的，又必須保存歷史紀錄，此外會有很多人在相同的公司或是職位，所以會將公司與職位這 2 個 table 拉出來透過 ID 去進行關聯。

{{<mermaid>}}
classDiagram
class User {
    +Id id
    +String name
    +Id company_id
    +Id position_id
}
class Position {
    +Id id
    +String name
    +String description
}
class Company {
    +Id id
    +String name
    +String description
}
User<|-- Position
User<|-- Company
{{</mermaid>}}

而 facebook 的好友又有其他的好友，這些好友有可能在相同的公司也有可能不同，REST-ful API 很難去設計這多層次關聯的資料。

另外若要透過 REST-ful API 去進行設計獲取好友們的資訊，以 User 為出發點，就必須像 server 發出多次的請求去完成 1 個人的訊息，例如 `/users/1/companies`、`/users/1/positions`、`/users/2/companies`...這會造成 server 的請求次數過高。

最後就會放棄 REST-ful 採用 `/users/21/friends_with_companies_and_positions` ...，會造成的問題就是，必須把文件寫得很清楚，這個 router 是設計拿來做什麼的，並且需要去客製化許多的 router。

在使用 REST-ful 時，也常發生的問題是回傳許多前端此時並不需要使用到的訊息。

GraphQL 就是為了解決 REST-ful API 以上的問題。

## GraphQL Intro

解決了

1. 資料的關聯性
2. 對 server 發送多次的請求
3. 獲取到多餘的資料 

GraphQL 並是不一種資料庫，不論使用任何的資料庫都能使用 GraphQL，它是一種 graph 的資料結構，透過 node 間的相依將資料進行關聯，也適用於外接第 3 方的 server 請求。

{{< figure src="./graph.jpg" title="graph 示意圖" >}}

## Express GraphQL

> 使用 express 建立 GraphQL 的 server

{{< cmd >}}
npm install --save express express-graphql graphql lodash
{{< /cmd >}}

在使用 GraphQL 之前需要先替資料定義 Schema，Schema 主要用來描述資料間的相互關係與資料的屬性。

```javascript
// schema/schema.js
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLInt, GraphQLString } = graphql;

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  },
});

```

GraphQL 透過 Root Query 進入點去尋找目標 User，需要先進行定義可以透過哪些屬性找到相對應的 User 資料。

```javascript
// schema/schema.js

// ...

// 透過傳遞 id 尋找 User
// resolve function 會進入 DB 尋找資料，function 內第二個參數會傳入參數 object
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, { id }) {
        // query DB
      },
    },
  },
});
```

之後 export 定義好的 schema。

```javascript
// schema/schema.js

const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLSchema } = graphql;
// ...

module.exports = new GraphQLSchema({
  query: RootQuery,
});
```

在 express 的 server 中註冊 GraphQL 的 middleware，並將 schema 一併帶入。

```javascript
// server.js

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

// register graphql middleware
app.use(
  '/graphql',
  graphqlHTTP({
    graphiql: true, // GraphQL 的 Tool，可以下 query 進行測試，production 的環境下應該關閉
    schema,
  })
);

app.listen(4000, () => {
  console.log('listen port on 4000');
});

```

之後瀏覽 `localhost:4000/graphql` 就會看見 GraphiQL，可以在上面執行 query 進行測試。

### GraphiQL

{{< figure src="./graphiql.png" title="GraphiQL" >}}

GraphiQL 提供了可以進行 query 的測試頁面，同時也產生了剛剛撰寫的 schema 的文件。

可以點擊右上角的 Docs 去查看剛剛定義的 query 與資料有哪些的屬性。

{{< figure src="./UserQuery.png" title="User Query" >}}

{{< figure src="./UserDoc.png" title="User Schema" >}}

可以執行 query 測試資料是否能成功獲取

query

```graphql
{
  user(id: "44") {
    id,
    firstName,
    age
  }
}
```

response

```json
{
  "data": {
    "user": {
      "id": "44",
      "firstName": "Jay",
      "age": 22
    }
  }
}
```

## Outside API

> GraphQL 不限於只能從 DB 獲取資料，它也可以向外部的 API 發送請求並回傳給 Client。

使用 json-server 當作測試外部的 API，透過 axios 進行 request

{{< cmd >}}
npm install json-server axios
{{< /cmd >}}

建立資料

```json
// db.json

{
  "users": [
    {
      "id": "12",
      "firstName": "Vivi",
      "age": 66
    },
    {
      "id": "89",
      "firstName": "Cris",
      "age": 9
    },
    {
      "id": "99",
      "firstName": "Tim",
      "age": 11
    }
  ]
}
```

啟動 server

{{< cmd >}}
json-server --watch db.json
{{< /cmd >}}

瀏覽 `localhost:3000/users` 即可看到 user 的資料，後面可加入 id 瀏覽特定的 user `localhost:3000/users/89`

在 schema resolve function 中，取代原本要進入 DB 獲取資料，改為發送 request 的請求，resolve function 當回傳 Promise 時，會自動等待並回傳。

```javascript
// schema/schema.js

const axios = require('axios');

// ...

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      // ...
      resolve(parentValue, { id }) {
         return axios
          .get(`http://localhost:3000/users/${id}`)
          .then((resp) => resp.data);
      },
    },
  },
});
```

## Relation

### mocha data

在 db.json 中建立 company 的 mocha data，並將 user 新增 companyId

```json
{
  "users": [
    {
      "id": "12",
      "firstName": "Vivi",
      "age": 66,
      "companyId": "1"
    },
    {
      "id": "89",
      "firstName": "Cris",
      "age": 9,
      "companyId": "2"
    },
    {
      "id": "99",
      "firstName": "Tim",
      "age": 11,
      "companyId": "2"
    }
  ],
  "companies": [
    {
      "id": "1",
      "name": "Apple",
      "description": "Tech"
    },
    {
      "id": "2",
      "name": "Google",
      "description": "Tech"
    }
  ]
}
```

透過 json-server 輸入網址 `http://localhost:3000/companies/2/users` 在 google 工作的 user。

在 schema 再定義 company type，並將 company 與 user 進行連結。

```javascript
// schema/schema.js

// ...

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      // resolve 定義資料獲取的方式，這裡透過 companyId 去進行關聯獲取資料
      resolve({ companyId }, args) {
        return axios
          .get(`http://localhost:3000/companies/${companyId}`)
          .then((resp) => resp.data);
      },
    },
  },
});
```

之後在 GrqphiQL 進行 query 測試

```graphql
{
  user(id: "12") {
    id
    firstName,
    company {
      name
    }
  }
}
```

```json
// response
{
  "data": {
    "user": {
      "id": "12",
      "firstName": "Vivi",
      "company": {
        "name": "Apple"
      }
    }
  }
}
```

## Multiple Root Query Entry

> 在實際應用來說，單個 Root Query 進入點並無法滿足應用程式，在許多時候並不會以 User 為進入點，可能是 Company 或是 Position 等。

在 Root Query 的 field 中新增 company

```javascript
// schema/schema.js

// ...
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, { id }) {
        // return _.find(users, { id });
        return axios
          .get(`http://localhost:3000/users/${id}`)
          .then((resp) => resp.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, { id }) {
        return axios
          .get(`http://localhost:3000/companies/${id}`)
          .then((resp) => resp.data);
      },
    },
  },
});
// ...
```

就可以透過 company 當作 entry 進行 query

```graphql
{
  company(id: "1") {
    name
    description
  }
}
```

```json
// response
{
  "data": {
    "company": {
      "name": "Apple",
      "description": "Tech"
    }
  }
}
```

此時的 company 還未與 user 連接，只能透過 user 查找 company。所以需要在修改 company type 將 company 與 user 進行雙向的綁定。

User 對 Company 是 1 對 1 的關係，Company 對 User 是 1 對多，預期要傳回在 Company 內所有的 User。

```javascript
// schema/schema.js

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      // 預期要回傳所有在 company 的 user list
      type: new GraphQLList(UserType),
      resolve({ id }, args) {
        return axios
          .get(`http://localhost:3000/companies/${id}/users`)
          .then((resp) => resp.data);
      },
    },
  },
});

// Define User schema
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve({ companyId }, args) {
        return axios
          .get(`http://localhost:3000/companies/${companyId}`)
          .then((resp) => resp.data);
      },
    },
  },
});
```

此時會發現尷尬的事情，Company Type 與 User Type 2 者皆使用到了彼此，若其中一個在另一個的前面，會造成在定義之前使用的錯誤，為了解決這問題必須使用 javascript 的閉包，讓定義完成後在執行。

```javascript
// schema/schema.js

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // 使用 closure 避免定義前使用的 error
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      // 預期要回傳所有在 company 的 user list
      type: new GraphQLList(UserType),
      resolve({ id }, args) {
        return axios
          .get(`http://localhost:3000/companies/${id}/users`)
          .then((resp) => resp.data);
      },
    },
  }),
});

// Define User schema
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ( {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve({ companyId }, args) {
        return axios
          .get(`http://localhost:3000/companies/${companyId}`)
          .then((resp) => resp.data);
      },
    },
  }),
});
```

這樣就可以進行 query 了

```graphql
{
  company(id: "2") {
    name
    users {
      firstName
    }
  }
}
```
```json
// response
{
  "data": {
    "company": {
      "name": "Google",
      "users": [
        {
          "firstName": "Cris"
        },
        {
          "firstName": "Tim"
        }
      ]
    }
  }
}
```

此時也可以做出很 cool 的遞迴 query

```graphql
{
  company(id: "2") {
    name
    users {
      firstName
      company {
        name
        users {
          age
          firstName
        }
      }
    }
  }
}
```
```json
// response
{
  "data": {
    "company": {
      "name": "Google",
      "users": [
        {
          "firstName": "Cris",
          "company": {
            "name": "Google",
            "users": [
              {
                "age": 9,
                "firstName": "Cris"
              },
              {
                "age": 11,
                "firstName": "Tim"
              }
            ]
          }
        },
        {
          "firstName": "Tim",
          "company": {
            "name": "Google",
            "users": [
              {
                "age": 9,
                "firstName": "Cris"
              },
              {
                "age": 11,
                "firstName": "Tim"
              }
            ]
          }
        }
      ]
    }
  }
}
```

## Mutation

> mutation 用來對資料進行 Create, Update, Delete 的操作。

在 schema 中先行定義 mutation 的行為。

```javascript
// ...

const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

// ...

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addUser: {
      // mutation 的回傳值，回傳 User
      type: UserType,
      args: {
        // GraphQLNonNull 代表不可為空
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age }) {
        return axios
          .post('http://localhost:3000/users', { firstName, age })
          .then((resp) => resp.data);
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
```

進行 mutation

```graphql
mutation {
  addUser(firstName: "Leo", age: 20) {
    id
    firstName
    age
  }
}
```

```json
// response
{
  "data": {
    "addUser": {
      "id": "vsi02dQ",
      "firstName": "Leo",
      "age": 20
    }
  }
}
```

