---
title: "React + TypeScript Usage Guide"
date: 2021-11-08T19:09:26+08:00
draft: true
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

建立一個 `Button` 的 Component

```tsx
export const Button = () => {
    return <button></button>
}
```