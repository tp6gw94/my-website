---
title: "Redux"
date: 2021-11-24T19:45:56+08:00
toc: true
---

## Intro

Redux 是個管理 state 的工具，無論任何框架或是 VanillaJS 皆可以使用 Redux 進行狀態管理。

## Redux API

- `compose`

  回傳一個組合起來的 function。

  ```typescript
  import { compose } from "redux";

  const trimStr = (str: string): string => str.trim();
  const upperStr = (str: string): string => str.toUpperCase();
  const reverseStr = (str: string): string => str.split("").reverse().join("");

  export const trimAndUpperAndReverseStr = (str: string) =>
   reverseStr(upperStr(trimStr(str)));
  export const composeTrimAndUpperAndReverse = (str: string) =>
   compose(trimStr, upperStr, reverseStr)(str);

  // equal
  console.log(trimAndUpperAndReverseStr("  hello  "))
  console.log(composeTrimAndUpperAndReverse("  hello  "));
  ```
  [sandbox](https://codesandbox.io/s/summer-mountain-p1ugv?file=/src/redux-compose.ts)

- `createStore`

  傳遞 reducer 參數，reducer 是一個 pure function，帶入 2 個參數，第一個是 state 原本儲存起來的 object，另一個是 action 觸發的事件與將要修改 state 的值，將會回傳 store，store 是將所有 reducer 集合在一起管理的物件。

  其中 action 必須包含 `type`，依照 flux action pattern 要傳入的值爲 `payload`。

  ```javascript
  { type: 'INCREMENT', payload: 5 }
  ```

  透過將 action 傳入 dispatch 進行更改 state

  ```typescript
  import { createStore } from "redux";

  const initialState = {
    count: 1
  };

  type ActionType = "INCREMENT" | "DECREMENT" | "ADD";
  type Action<T = any> = { type: ActionType; payload?: T };

  const reducer = (
    state = initialState,
    action: Action
  ): typeof initialState => {
    switch (action.type) {
      case "INCREMENT":
        return { count: state.count + 1 };
      case "DECREMENT":
        return { count: state.count - 1 };
      case "ADD":
        return {count: state.count + action.payload}
      default:
        return initialState;
    }
  };

  export const store = createStore(reducer);
  ```

  store object 內有 4 個 method

   1. `dispatch` - trigger action
   2. `subscribe` - 會偵測到 state 的更新，trigger 某些 function
   3. `getState` - get state
   4. `replaceReducer` - 傳遞新的 reducer 取代舊的 reducer

  對於要 dispatch action 的時候，需要打很多的字，爲了避免打錯字與未來更容易進行維護與擴展，通常會建立 action crater 來協助進行 dispatch

  ```typescript
  const increment = (): Action => ({ type: "INCREMENT" });
  const decrement = (): Action => ({ type: "DECREMENT" });
  const add = (n: number): Action<number> => ({ type: "ADD", payload: n });
  ```

  透過 `dispatch` 更新 store

  ```typescript
  store.dispatch(increment());
  console.log(store.getState()); // 2
  ```

  透過 `subscribe` 每當 state 更新，可以執行某些 function

  ```typescript
  store.subscribe(() => {
    console.log("sub ", store.getState());
  });
  ```
  [sandbox](https://codesandbox.io/s/summer-mountain-p1ugv?file=/src/redux-store.ts:792-851)

  {{<note>}}
  更改 reducer 的值會回傳新的 state object，而不會直接更改 object 的 value，通常 state 會使用 flat object 比較不會使用較複雜的 nested object，否則更新 state 會比較麻煩。
  {{</note>}}

  {{<note>}}
  在 project 中只會有一個 store，或許會有多個 reducer。
  {{</note>}}
- `bindActionCreators`

  將多個 actions 集中成一個 object，並綁定在 store dispatch 上。

  ```typescript
    import { bindActionCreators } from "redux";
    import { increment, decrement, store } from "./redux-store";

    const actions = bindActionCreators({ increment, decrement }, store.dispatch);

    console.log("actions: ", actions);

    actions.increment(); // trigger increment action
  ```
  [sandbox](https://codesandbox.io/s/summer-mountain-p1ugv?file=/src/redux-bind-actions.ts)
- `combineReducers`

  當 reducer 值越來越多時，透過 `combineReducers` 切分 reducer，較好維護與拓展。

  ```typescript
  import { combineReducers, createStore } from "redux";

  type UserAction = { type: "ADD_USER"; payload: string };

  const initialUserState = ["Todd"];

  const userReducer = (
    state = initialUserState,
    action: UserAction
  ): typeof initialUserState => {
    switch (action.type) {
      case "ADD_USER":
        return [...state, action.payload];
      default:
        return state;
    }
  };

  type TodoAction = { type: "ADD_TODO"; payload: string };

  const initialTodoState = ["Go to shopping"];

  const todoReducer = (
    state = initialTodoState,
    action: TodoAction
  ): typeof initialTodoState => {
    switch (action.type) {
      case "ADD_TODO":
        return [...state, action.payload];
      default:
        return state;
    }
  };

  const reducer = combineReducers({ user: userReducer, todo: todoReducer });
  console.log("combineReducer ", createStore(reducer).getState());

  ```
  [sandbox](https://codesandbox.io/s/summer-mountain-p1ugv?file=/src/redux-combine-reducer.ts:0-855)
- `applyMiddleweare`

  談到 middleweare 前，必須理解類似的東西 enhancer

  `createStore` 可傳入 function 新增 enhancer，增強 store 的功能，常見的包含 redux-devtool

  ```javascript
  const round = (number) => Math.round(number * 100) / 100;

  const monitorReducerEnhancer = (createStore) => (
    reducer,
    initialState,
    enhancer
  ) => {
    const monitoredReducer = (state, action) => {
      const start = performance.now();
      const newState = reducer(state, action);
      const end = performance.now();
      const diff = round(end - start);

      console.log("reducer process time:", diff);

      return newState;
    };

    return createStore(monitoredReducer, initialState, enhancer);
  };
  const store = createStore(reducer, monitorReducerEnhancer);
  ```

  可以透過 `compose` 傳入多個 enhancer

  ```javascript
  const logReducerEnhancer = (createStore) => (reducer, initialStore, enhancer) => {
    const logReducer = (state, action) => {
      console.log('old state ', state, action)
      const newState = reducer(state, action);
      console.log('new state ', newState, action)
      return newState;
    }

    return createStore(logReducer, initialStore, enhancer);
  }

  const store = createStore(reducer, compose( logReducerEnhancer, monitorReducerEnhancer));
  ```

  middleware 與 enhancer 類似，區別在於主要修改的是 dispatch action 的功能，但如果 2 者要做到相同的事也是可以做到。常見的 middleware 包含 redux-thunk、redux toolkit。

  ```javascript
  const logMiddleware = (store) => (next) => (action) => {
    console.log("old state ", store.getState(), action);
    next(action);
    console.log("new state ", store.getState(), action);
  };

  const store = createStore(reducer, applyMiddleware(logMiddleware));
  ```

  [sandbox](https://codesandbox.io/s/summer-mountain-p1ugv?file=/src/redux-enhancer.js:1229-1296)

## Redux With React use hook

常見的 pattern

{{<fileTree>}}
* src
  * actions.js
  * reducer.js
  * store.js
  * index.js
  * ...
{{</fileTree>}}

```javascript
// actions.js
export const INCREMENT = "INCREMENT";
export const DECREMENT = "DECREMENT";
export const SET = "SET";

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
export const set = (val) => ({ type: SET, payload: val });

```

```javascript
// reducer.js
import { DECREMENT, INCREMENT, SET } from "./actions";

const initialState = {
  count: 0
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case DECREMENT:
      return { count: state.count - 1 };
    case SET:
      return { count: action.payload };
    default:
      return initialState;
  }
};

```

```javascript
// store.js
import { createStore } from "redux";
import { reducer } from "./reducer";

// redux devtool
const enhancer =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
export const store = createStore(reducer, enhancer);
```
在最上層透過 `react- redux` 傳遞 `store` 到每個 component 中

```javascript
// index.js
import { StrictMode } from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";

import App from "./App";
import { store } from "./store";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
  rootElement
);

```

透過 `react-redux` 提供的 `useSelector` hook 獲取 `reducer` 的值

```javascript
// ...
import { useSelector } from "react-redux";

// ...
const count = useSelector((state) => state.count);
```

使用 `useDispatch` hook 執行 `action`

```jsx
// ...
import { decrement, increment, set } from "./actions";
// ...
<button onClick={() => dispatch(increment())}>Increment</button>
<button onClick={() => dispatch(set(0))}>Rest</button>
<button onClick={() => dispatch(decrement())}>Decrement</button>
// ...
```

可以用 `bindActionCreator` 建立 counter 的 custom hook，更簡潔且更好維護

```javascript
// useActions.js
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";

export const useActions = (actions) => {
  const dispatch = useDispatch();
  return useMemo(() => bindActionCreators(actions, dispatch), [
    actions,
    dispatch
  ]);
};
```

```javascript
// useCount.js
import { useSelector } from "react-redux";
import { useActions } from "./useActions";
import { decrement, increment, set } from "./actions";

export const useCount = () => {
  const count = useSelector((state) => state.count);
  const actions = useActions({ increment, set, decrement });
  return { count, ...actions };
};
```

之後要使用的話就只需要使用 count 的 hook 了

```jsx
// ...
import { useCount } from "./useCount";
// ...
const { count, increment, set, decrement } = useCount();
// ...
<h1>{count}</h1>
<button onClick={() => increment()}>Increment</button>
<button onClick={() => set(0)}>Rest</button>
<button onClick={() => decrement()}>Decrement</button>
//...
```

[sandbox](https://codesandbox.io/s/quirky-bogdan-4iz2k?file=/src/App.js)

## Redux with React Use Connect API

使用 `connect` 與 `mapStateToProps` 獲取 reducer 的值

```jsx
import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    tasks: state
  };
};

const TaskContainer = (props) => {
  return (
    <ul>
      {props.tasks.map((task) => (
        <li key={task.id}>{task.task}</li>
      ))}
    </ul>
  );
};

export default connect(mapStateToProps)(TaskContainer);
```

透過 `connect` 與 `mapDispatchToProps` 傳遞 action

```javascript
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const { useState } = require("react");
const { addTask } = require("./actions");

const mapDispatchToProps = (dispatch) => {
  // return {
  //   onSubmit: (task) => dispatch(addTask(task))
  // };
  // or
  return bindActionCreators(
    {
      onSubmit: (task) => addTask(task)
    },
    dispatch
  );
};

const TaskFormContainer = (props) => {
  const [task, setTask] = useState("");

  const onFormSubmit = (e) => {
    e.preventDefault();
    props.onSubmit(task);
    setTask("");
  };

  return (
    <form onSubmit={(e) => onFormSubmit(e)}>
      <input value={task} onChange={(e) => setTask(e.target.value)} />
      <button>Add</button>
    </form>
  );
};

export default connect(null, mapDispatchToProps)(TaskFormContainer);
```
加上 update 的 action，所有 reducer 的更新必須使用 immutable 的方式進行

```javascript
// ...
case UPDATE_TASK:
  return state.map((taskItem) => {
    if (taskItem.id === action.payload.id) {
      return { ...taskItem, task: action.payload.task };
    }
    return taskItem;
  });
// ...
```
[sandbox](https://codesandbox.io/s/gifted-star-xozu6)

## Deriving Data

> 透過 reselect library 可以建立衍生資料， store 改變也自動變更的 selector function，有點像是 vue 中的 computed，有助於提高效能與維護性，不需要多一個狀態的管理。

```javascript
// reducer.js
const initialState = {
  backlog: [
    { id: 1, name: "task1", completed: false },
    { id: 2, name: "task2", completed: false },
    { id: 3, name: "task3", completed: true },
    { id: 4, name: "task4", completed: false },
    { id: 5, name: "task5", completed: true }
  ],
  hotfix: [
    { id: 1, name: "task1", completed: true },
    { id: 2, name: "task2", completed: true },
    { id: 3, name: "task3", completed: true },
    { id: 4, name: "task4", completed: false },
    { id: 5, name: "task5", completed: true }
  ]
};

export const reducer = (state = initialState, action) => {
  return state;
};

```

透過 `createSelector` 建立 selector function

```javascript
import { createSelector } from "reselect";

const selectBacklog = (state) => state.backlog;
const selectHotfix = (state) => state.hotfix;

export const selecteCompletedBacklog = createSelector(
  [selectBacklog],
  (tasks) => tasks.filter((task) => task.completed)
);

export const selecteCompletedHotfix = createSelector([selectHotfix], (bugs) =>
  bugs.filter((bug) => bug.completed)
);

export const selectCompleteTick = createSelector(
  [selecteCompletedBacklog, selecteCompletedHotfix],
  (tasks, bugs) => [...tasks, ...bugs]
);
```

使用 `useSelect` 獲取 state

```javascript
// ...
const completedTasks = useSelector(selecteCompletedBacklog);
const fixedBugs = useSelector(selecteCompletedHotfix);
const completedTick = useSelector(selectCompleteTick);
// ...
```

[sandbox](https://codesandbox.io/s/fervent-estrela-9bm5o?file=/src/selecters.js)

[Using Memoizing Selectors](https://react-redux.js.org/api/hooks#using-memoizing-selectors)

[Deriving Data with Selectors](https://redux.js.org/usage/deriving-data-selectors)

## Immer

redux 更新 state 時，需要使用 immutable 的方式

```javascript
return {
  ...state,
  user: {
    ...state.user,
    location: {
      city: action.payload
    }
  }
}
```

使用 immer library 有助於處理更新 state，可以使用 mutable 的方式更新 object

```javascript
// ...
case UPDATE_TASK:
  // 未使用 immer
  return state.map((taskItem) => {
    if (taskItem.id === action.payload.id) {
      return { ...taskItem, task: action.payload.task };
    }
    return taskItem;
  });

  // 使用 immer
  return produce(state, (draftState) => {
    const task = draftState.find((item) => item.id === action.payload.id);
    task.task = action.payload.task;
  })
case ADD_TASK:
  // 未使用 immer
  return [...state, {id: uuidv4(), task: action.payload}];
  // 使用 immer
  return produce(state, (defatState) => {
    draftState.push({id: uuidv4(), task: action.payload})
  })
// ...
```

## Redux Toolkit

> 建立在 redux 之上的 toolkit library，提供了許多有用的 API 與 pattern，也內建了許多 middleware

官方推薦的 structure

{{<fileTree>}}
* app
  * store.js
* features
  * counter (feature name)
    * counterSlice.js (slice file)
* App.js
* index.js
* ...
{{</fileTree>}}

slice 在 redux-toolkit 中包含了，reducer 與 actions，無需像 redux 一樣需要建立個別的檔案，同時更新  state 也會透過 immer library 進行更新，redux-toolkit 已經都幫我們都處理好了

透過 `createSlice` 建立 slice
```javascript
// features/user/userSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const createUser = (name) => {
  return {
    id: nanoid(),
    name
  };
};

const initialState = [createUser("Jon"), createUser("Todd")];

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.push(createUser(action.payload));
    }
  }
});

export const { addUser } = userSlice.actions;

export default userSlice.reducer;
```

使用 `configureStore` 建立 store

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit";
import user from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    user
  }
});
```

透過 `useSelector` 獲取 state 與使用 `dispatch` trigger action
```javascript
// UserContainer.js
import { useSelector } from "react-redux";

// ...
const users = useSelector((state) => state.user);
// ...
```

```javascript
// ...
const dispatch = useDispatch();
// ...
dispatch(addUser(user));
// ...
```

也可以透過 `createAction` 將 action 的 payload 做一次處理，就可以依照不同的情況 trigger 不同的 action

```javascript
// ...
import { createAction } from '@reduxjs/toolkit';
export const addSuperUser = createAction("user/addUser", (name) => {
  return {
    payload: `** ${name} **`
  };
});

// dispatch
dispatch(addSuperUser(user)); // it's will like ** Mike **
```

有時候會發生需要一個 action 同時更改 2 個 reducer state，redux-toolkit 提供了 `extraReducers` API

```javascript
// backlogSlice.js
// ...
reducers: {
    // ...
    assignTask: (state, action) => {
      const task = state.find((task) => task.id === action.payload.taskId);
      task.assigner = action.payload.userId;
    }
  }
}

// ...
```
```javascript
// userSlice.js
import { assignTask } from "../backlog/backlogSlice";
// ...
extraReducers: (builder) => {
  builder.addCase(assignTask, (state, action) => {
    const user = state.find((u) => u.id === action.payload.userId);
    user.tasks.push({
      id: action.payload.taskId,
      name: action.payload.taskName
    });
  });
}
// ..
```
像是 subscription 一樣，當 trigger `assignTask` 這 action 時，也會 trigger `extraReducers`

```javascript
dispatch(
  assignTask({
    taskId: task.id,
    taskName: task.name,
    userId: e.target.value
  })
)
```
[sandbox](https://codesandbox.io/s/jolly-liskov-swnsb?file=/src/features/backlog/BacklogContainer.js:837-1037)

## Async With React Toolkit

通常使用 redux 處理 async 的 action 時，會使用 redux-thunk 的 middleware 處理，判斷 `action` 是否是 `function`，react-toolkit 提供了 `createAsyncThunk` 建立 async 的 action，使用 `extraReducers` 去更改 state，使用上更簡單，也能依照不同的 async 狀態更改 state

```javascript
// postSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  loading: false
};

const END_POINT = "https://jsonplaceholder.typicode.com/posts";

export const fetchPosts = createAsyncThunk("post/fetchPosts", async () => {
  const response = await fetch(END_POINT).then((resp) => resp.json());
  return response;
});

const postSlice = createSlice({
  name: "post",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      });
  }
});

export default postSlice.reducer;
```

```javascript
dispatch(fetchPosts())
```

[sandbox](https://codesandbox.io/s/sweet-shirley-te9jv?file=/src/App.js:332-354)