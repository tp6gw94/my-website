---
title: "React + TypeScript Tips"
date: 2021-11-08T19:09:26+08:00
tags: ["TypeScript", "React"]
---

## HOC

HOC = **Higher Order Component**，簡單來說就是透過一個 function 傳進 Component 然後處理一些事情，最後 return 原本的 Component，就可以稱爲 HOC。

以下是不使用 HOC 的例子，將會改寫成 HOC 的形式。

```tsx
type Post = {
    userId: number;
    id: number;
    title: string;
};

const fetchPosts = async (): Promise<Array<Post>> => {
    const resp = await axios.get<Array<Post>>(
        "https://jsonplaceholder.typicode.com/posts"
    );
    return resp.data;
};

function Loading() {
    return <div>Loading</div>;
}

const PostInformation = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Array<Post> | null>(null);

    useEffect(() => {
        fetchPosts().then((data) => {
            setPosts(data);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            {loading && <Loading />}
            {posts && (
                <ul>
                    {posts.map((post) => (
                        <li key={post.id}>{post.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function App() {
    return (
        <div>
            <PostInformation />
        </div>
    );
}
```

下方是使用 HOC 的例子，首先先建立 function，會將原本的 Component 回傳，因爲使用 TypesScript 的關係，所以需要將 `props` 的 Type 用泛型的方式傳入。
```tsx
function withPosts<T>(Compomemt: React.CompomemtType<T>) {
    return (porps: T) => {
        return <Compomemt {...(props as T)} />
    }
}
```

之後就可以將獲取 Posts 的邏輯放入 `withPosts` 內，然後將 `posts` 傳進 Component 中。並且一併處理 loading 時的畫面。

```tsx
function withPosts<T>(Compomemt: React.CompomemtType<T>) {
    return (porps: T) => {
        const [loading, setLoading] = useState(true);
        const [posts, setPosts] = useState<Array<Post> | null>(null);

        useEffect(() => {
            fetchPosts().then((data) => {
                setPosts(data);
                setLoading(false);
            });
        }, []);
        
        if (loading) return <Loading />
        return <Compomemt {...(props as T)} posts={posts} />
    }
}
```

將原先的 Component 的獲取 Post 的邏輯移除，並丟入 `withPosts` 中。
```tsx
type PostInformationProps = {
    posts: Array<Post>
}

const PostInformation = (props: PostInformationProps) => {
    return (
        <div>
            {props.posts && (
                <ul>
                    {props.posts.map((post) => (
                        <li key={post.id}>{post.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
const PostInformationWithPost = wwithPosts(PostInformation);

export default function App() {
    return (
        <div>
            <PostInformationWithPost />
        </div>
    );
}
```
現在會報出 ts 的錯誤 *Property 'posts' is missing in type '{}' but required in type 'PostInformationProps'*，預期有 `posts` 的傳入，但在 `App` 的 Component 中未傳遞。所以需要在 `withPosts` 中傳入的 `props` 中移除 `posts` 的屬性。

```tsx
function withPosts<T>(Component: React.ComponentType<T>) {
    return (props: Omit<T, 'posts'>) => {
        // ...
    }
    // or
    return (props: Omit<T, keyof PostInformationProps>) => {
        return // ...
    }
}
```
[sandbox](https://codesandbox.io/s/laughing-chaum-271dk?file=/src/App.tsx)

這樣就不會報錯了。

## Limiting Props

建立一個 `Button` 的 Component，其中一種透過 string 的方式更改 variant

```tsx
type ButtonProps = {
    variant?: "primary" | "secondary" | "success";
    outline?: boolean;
    text: string;
};

const Button: React.FC<ButtonProps> = ({
   text,
   variant = "primary",
   outline = false
}) => {
    const btnClass = `${variant} ${outline ? "outline" : ""}`;
    return <button className={btnClass}>{text}</button>;
};

export default function App() {
    return (
        <div className="App">
            <Button text={"this is primary button"} />
            <Button text={"this is secondary button"} variant="secondary" />
            <Button text={"this is success button"} variant="success" />
            <Button text={"this is outline button"} outline />
        </div>
    );
}
```

另外一種是直接透過傳遞 props 會預設爲 true 的方式`<Button primary />` 直接給與名稱(React 在傳遞 props 時若未賦值預設是`true`)，不過若 props 未限定當有 primary 時，secondary 和 success 是不能同時出現的話，就會變成有可能發生 `<Button primary success />`而不會報錯。

```tsx
type ButtonProps = {
  text?: string;
  success?: boolean;
  secondary?: boolean;
  primary?: boolean;
  outline?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  text,
  success,
  secondary,
  primary,
  outline
}) => {
  const btnClassObj: Record<
    keyof Omit<ButtonProps, "text">,
    boolean | undefined
  > = {
    success: success,
    secondary: secondary,
    primary: primary,
    outline: outline
  };
  const btnClass = (Object.keys(btnClassObj) as Array<keyof typeof btnClassObj>)
    .filter((className) => btnClassObj[className])
    .join(" ");
  return <button className={btnClass}>{text}</button>;
};

export default function App() {
  return (
    <div className="App">
      <Button text={"this is primary button"} primary />
      <Button text={"this is secondary button"} secondary />
      <Button text={"this is success button"} success />
      <Button text={"this is outline button"} outline />
    </div>
  );
}
```

要讓 ts 報錯的話，只需要修改 props 就可以了

```tsx
type ButtonProps = {
  text?: string;
  outline?: boolean;
};

type PrimaryButton = ButtonProps & {
  primary?: boolean;
  secondary?: never;
  success?: never;
};

type SecondaryButton = ButtonProps & {
  secondary?: boolean;
  primary?: never;
  success?: never;
};

type SuccessButton = ButtonProps & {
  success?: boolean;
  primary?: never;
  secondary?: never;
};

const Button: React.FC<PrimaryButton | SecondaryButton | SuccessButton> = ({
  text,
  outline = false,
  primary = false,
  secondary = false,
  success = false
}) => {
  const btnClassObj: Record<
    keyof Omit<PrimaryButton | SecondaryButton | SuccessButton, "text">,
    boolean | undefined
  > = {
    success,
    secondary,
    primary,
    outline
  };
  const btnClass = (Object.keys(btnClassObj) as Array<keyof typeof btnClassObj>)
    .filter((className) => btnClassObj[className])
    .join(" ");
  return <button className={btnClass}>{text}</button>;
};

export default function App() {
  return (
    <div className="App">
      <Button text={"this is primary button"} primary />
      <Button text={"this is secondary button"} secondary />
      <Button text={"this is success button"} success />
      <Button text={"this is outline button"} outline />
    </div>
  );
}
```

此時使用 `Button` 時，同時傳遞 `primary`、`secondary` TS 就會報錯。

[sandbox](https://codesandbox.io/s/funny-cerf-jpynx?file=/src/App.tsx)

## Polymorphic Component

前端時常會發生設計稿的元素樣式或是行爲與原本的元素並不相同，例如像是 `button` 的 `a`，透過 Polymorphic Component 動態的產生 html 的元素。

使用 TypeScript 的泛型也能達成動態的 tag 目的。
```tsx
type BaseButtonProps<E extends React.ElementType = React.ElementType> = {
  text?: string;
  outline?: boolean;
  as?: E;
};
// overwrite props
type ButtonProps<E extends React.ElementType> = BaseButtonProps<E> &
  Omit<React.ComponentProps<E>, keyof BaseButtonProps>;

type PrimaryButton<E extends React.ElementType> = ButtonProps<E> & {
  primary?: boolean;
  secondary?: never;
  success?: never;
};

type SecondaryButton<E extends React.ElementType> = ButtonProps<E> & {
  secondary?: boolean;
  primary?: never;
  success?: never;
};

type SuccessButton<E extends React.ElementType> = ButtonProps<E> & {
  success?: boolean;
  primary?: never;
  secondary?: never;
};
const defaultElem = "button"
function Button<E extends React.ElementType = typeof defaultElem>({
  text,
  as,
  outline = false,
  primary = false,
  secondary = false,
  success = false, 
  ...rest
}: PrimaryButton<E> | SecondaryButton<E> | SuccessButton<E>) {

  const btnClassObj: Record<
    "success" | "secondary" | "primary" | "outline",
    boolean | undefined
  > = {
    success,
    secondary,
    primary,
    outline
  };
  const btnClass = (Object.keys(btnClassObj) as Array<keyof typeof btnClassObj>)
    .filter((className) => btnClassObj[className])
    .join(" ");
  const TagName = as || defaultElem;
  return <TagName {...rest} className={btnClass}>{text}</TagName>;
}

export default function App() {
  return (
    <div className="App">
      <Button text={"this is primary button"} primary as="a" href="/" />
    </div>
  );
}
```
這樣當要使用 `a` Element 時，就可以 `as="a"`，並且也能帶入 `a` 的屬性也不會報錯。HTML 的 DOM 元素也會隨著帶入不同的 tag 變換。

[sandbox](https://codesandbox.io/s/keen-boyd-ncxfs?file=/src/App.tsx)