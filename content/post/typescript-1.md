---
title: "Typescript"
date: 2021-08-18T22:13:15+08:00
toc: true
---

## Intro

TypeScript = JavaScript + Type

目前廣泛使用，透過 compiler 編譯成 js file。

Pros
- build time check type
- 相對 JS 提示友好

Cons
- 並不是真的 static type，仍然會有 runtime 的 type error
- 定義 type 繁瑣
- 推導方式不聰明

## Basic

基本的使用方式

```typescript
const num: number = 1;
const isBool: boolean = false;
const date: Date = new Date();
const str: string = 'hello';
const arr1: Array<string> = ['a','b'];
const arr2: Array<number> = [1, 2, 3];
const tuple: [number, boolean, string] = [1, false, 'hey'];
const obj: {option?: string, readonly isReadOnly: boolean, tuple: [number, string]} = {isReadOnly: false, tuple: [1, 'a']};

type Sum = (a: number, b: number) => number;
const sum: Sum = (a, b,) => a+b;
function sum2(a: number, b: number):number {
    return a+b;
}
```

[Playground Link](https://www.typescriptlang.org/play?#code/MYewdgzgLgBGCuBbAXHJAjApgJxgXhgEYBuAWAChRJYBLCAIRBABtV0nnMBDMfGAMy7MImMpXDQYAEy5RMqACKzMfMJgDuMJXIAUASjFVJ0bKhM0wAcz4ByABaZmzEDcMTYXbNkKoAgl64ATwAecysAPj4AbRsuGwAaG3QbAF03ahhPbAAmPwCQhEQsbEiCKMJ4mGzKgGY0iiNYKHgAB05UKMLiyvYWbjBKsMsU6IqBIRFK+0xA1PTJEHQAK1QAbxAWqBpwAH4zKGwLS0rsbilwZkCYOgAlM4B5MEu2Dn7K5rb5GE6MHEGDo4pAC+fFWtweT0CqEEwkw71a7W+Y1iqSBYgoUECLRUAGUkHwdFxUF0-jB0MTftg9PhIiTsPNYBAkKg8YgCVwevFqXhIlwANToMT8eBgYBbcAwJmIbKEilFUnktDyqnIOkwVYUGBamCnZrYXj8wUUIEUChSnQVbJ6IA)

## Union Types & Intersection Types

### Union Types

Union Type 與 or 的概念相同，使用 `|` 來表示。

```typescript
const a: 'hello' | 'hey' = 'hello';
```

```typescript
type Todo = {
    userId: number;
    id: number;
    title: string;
    completed: boolean
}

// 泛型 T 後續會介紹，有可能會回傳 data or error
async function http<T>(request: RequestInfo): Promise<[true, T] | [false, Error]> {
    const resp = await fetch(request);

    if (!resp.ok) return [false, new Error('fetch error')];
    
    const data = await resp.json();
    return [true, data];
}

http<Array<Todo>>('https://jsonplaceholder.typicode.com/todos').then(respData => {
    // 有 2 個方式可以推導 type
    
    // Discriminated Unions
    if (respData[0]) {
        console.log(respData[1]) // type Todo[]
    } else {
        console.log(respData[1].message); // type Error
    }

    const [respStatus, dataOrError] = respData;
    // Narrowing with type guards
    if (dataOrError instanceof Error) {
        console.log(dataOrError.message); // type Error
    } else {
        console.log(dataOrError); // type ToDo[]
    }
})
```

[Playground Link](https://www.typescriptlang.org/play?#code/C4TwDgpgBAKg9gEzlAvFA3gWAFBT1AVwGcIAnASQQC4oA7AgWwCMyBuHfKAS2rsZdLtc+YF2AAbCDSLBSXWgHMhnAMZwGYScAi8mcOJICGtHAF8cOQ0RC0VUAGYFbouLSgALYMDAAeGAD4AClIIAEcCCBkaACUwiJlyWns4AEoaAAVSdS4SHwBtWQiAGlgAXSgAHyg8+0NxEhKAUVIs0lL-DA58NVoZKBCiMFQoQwB3QzEHCGAVd2C4yOAUoS68LnsoQIBCAbAAOjgAaxT+6YJSNxq6hroIUahm1sCAcntp2agyVueU0uV8VZQHp9BCGYCGYZjCbAU6DPYAKyIrkCy0BIWA50uhQgJVB4L+Zgs2E83h8AEEWoYQH5EHB-EFniSwEQqAB6VmI1yaQwqCDuAwIMh7UBgLhqQV7NQMVnAWlEH7C9wQWjzQYAETBEJQHSwwjw7KgapyKjkDHkYJ0UAAqrQuK4iID1ptdhrwXkAAylE66ziqe0GCB7cRwBSqsCuwx5ACMXqgBpF0HgSDypUBpk+9WgPt9eGBAaDIbDEejpT2DEiREMCggyzjrKgCYeLTgpDTRL9vRheV2AGVwRiiLjNQB5UiPFvlNAuzX-fX1gByhmbo3kCigK+A7gb4GgCgIS4QDr13A2gTxhlH49I3E7xl5cA2V+9gI7SMkBdD58vzdIZYrVZrVg623SAm1aNMMxITpj1ffNg0-Ecxx-Wt4x3WA4DVOAUzbbBTBSIA)

### Intersection Types

Intersection Type 則是 and 使用 `&` 表示

```typescript
function dateRange(end:string, start: string): Date & {startDate: Date, endDate: Date} {
    const date = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    return {...date, startDate, endDate}
}

dateRange('2021-01-01', '2020-01-01').startDate.getDate();
dateRange('2021-01-01', '2020-01-01').endDate.getDate();

```

[Playground Link](https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAEwIZQKYCVVgOYYAUGYyAXAM5QBOM+ANIlatVGUzXXgJTsAi6DIgBkiAN7NWAzP0GMSyaRlmYAvuIBQibYggIqKQYgC8iMBgDuiJYW4BuLTr1gDkqEpNnL1wYTf3HbWcDBQ9TcysbBQCdRGoMKBBqJDEAOnS0TEY3JXlSJVUNQo1M7FwCQgByACYABmqARgBaWubWysYa+tqWtobK7lScwVSCd18A0px8Ii7G3t6OxDme1sXB0JGxmwCgA)

## Type Aliases & Interface

### Type Aliases

可以替 Type 進行命名，使用 `type` keyword，可以使用 Union Types 與 Intersection Types

```typescript
type Demo = {
    a: string;
    b: boolean
}
type DemoWithUnion = number | {a: string};
type DemoWIthInterscrion = number & {a: number};

```
[Playground Link](https://www.typescriptlang.org/play?#code/C4TwDgpgBAIhC2B7KBeKBvAUFHUCGAXFAM7ABOAlgHYDmA3NrgEZFOKIA2EeVmAvplCRYCRAHUKwABYBVKhURVUUKgFd4TCGSgAfDIRLlqNPgyHQ4SMQElp1qsC3EAxpUXK1GrVABk+op6aZKaYmEA)

### Interface

使用 `interface` keyword

```typescript
interface IAnim {
  eat: () => void;
  name: string;
}

class Anim implements IAnim {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    eat() {
        console.log('eat');
    }
}
```
[Playground Link](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgJIEETALbIN4BQyyEcYAXMgBQCUyAvAHzIBuA9sACYDcRyIcbBEoBnMFFABzXgF8CBBABs4Ikckw5kOAA6KIQ8GoxZchYsQFDR4qb3PIEbEGKgBXBGDZQql4chdSdGb25mAAFsAiAHS+DPyCEHbmcvakYLT4fCEOTiJselGKbJJUAORppTRJxHIyQA)


也可以同時 implement 多個 interface

```typescript
interface IAnim {
  eat: () => void;
  name: string;
}

interface Demo {
    xxx: () => void
}

class Anim implements IAnim, Demo {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    eat() {
        console.log('eat');
    }

    xxx() {
        
    }
}
```

[Playground Link](https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgJIEETALbIN4BQyyEcYAXMgBQCUyAvAHzIBuA9sACYDcRyIcbBEoBnMFFABzXgF8CBUJFiIUAEQjY2+PsQAe+yrQbN2XAnIIIANnBEjkmHMhwAHKxojh7GLNgA0yOqa2sTEAkKi4lK8ocgIbCBiUACuCGBsUFThwshJUnSEsbFgABbAIgB02Qz8ghAxoXKxpGBGhUXE8Yls7hVWbJJUAOQtQzQNxBax+rptOkXzcjJAA)

interface 有另外一個特性稱爲 **open interface**，若同名的 interface，將會傳入新屬性至原 interface

```typescript
interface IAnim {
  eat: () => void;
  name: string;
}

class Anim implements IAnim {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    eat() {
        console.log('eat');
    }

    xxx() {

    }
}
// 會將新屬性丟至 IAnim
interface IAnim {
    xxx: () => void
}
```
[Playground Link](https://www.typescriptlang.org/play?ssl=22&ssc=2&pln=1&pc=1#code/JYOwLgpgTgZghgYwgAgJIEETALbIN4BQyyEcYAXMgBQCUyAvAHzIBuA9sACYDcRyIcbBEoBnMFFABzXgF8CBBABs4Ikckw5kOAA6KIQ8GoxZchYsQFDR4qb3PIEbEGKgBXBGDZQql4chdSdGb25mAAFsAiAHS+DPyCEHbmcvakYLT4fCEOTiJselGKbJJUAORppTRJxHJZyAAejRmEdXJyAPTtyIDA5oDgOoANpoA2OoDkBoD4coDPgWga2ASgkLCIKMaawcSN9ZQZTKwcnAQyQA)

open interface 的特性主要是使用來修改 Global 的 interface

```typescript
interface Window {
    newProperty: string
}

window.newProperty
```
[Playground Link](https://www.typescriptlang.org/play?ssl=5&ssc=19&pln=1&pc=1#code/JYOwLgpgTgZghgYwgAgOqgCYHsDuyDeAUMiciBDgApRYAO0YAngFzIDOYUoA5oQL6FCOTLgB05KjXpQmQA)

### Which one to use ？

二者其實差不多，在多數情況下都可以使用，不過還是有一些建議。

1. 若是要定義類似 object 的 type 建議使用 type aliases，因爲可以使用 `|` 與 `&`
2. 若要定義 type 供 `implements` 使用，建議使用 `interface`，就不會有可能會有 `number | {a: string}` 這種錯誤發生
3. 若是建立第 3 方的 library，希望可以由使用者定義傳入哪寫 type，建議使用 interface，便於使用者修改它

## Generics

泛型，當有可能不是固定 type 時，可以使用泛型，告知 typescript 此次是使用什麼類型

若沒有使用泛型，可能會像是這樣

```typescript
function listToDict(list: any[], idgen: (item: any) => string): {[key: string]: any} {
    const dict: {[key: string]: any} = {};

    list.forEach(item => {
        const key = idgen(item);
        dict[key] = item;
    });

    return dict;
}

const demo = [{name: 'Mike', userId: '01'}, {name: 'Todd', userId: '02'}];

const userDict = listToDict(demo, (item) => item.userId);
userDict.a.b.c.d;
```

[Playground Link](https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAGxgZygFTgERtAClQwC5EBDMATwG0BdAGkRgBMBzAUzDIJig4C2ZSlQCUiALwA+RBgBOMMG1FkA3jQDWHKmXmK2dYdQC+iVQChEVxBAQZELfFDWbtuqAqWGKJyWeMA3OaW1sRQAHTAcHIAouQQABa8-AKSMhbWmTZ2UIhaVH6snGDJgqJBWdaO0K5UdIUpFdbG5cGZchxQIHJI1VBBxsG2YPYsgnB+NKpg5AIcZADkALIwWgtMIGgccgCSLIsADACMC8ZM07PziAvYLCzriJvbe4cATKd0QebD9k9yeNA-GFsACoAQxgI4ExSgJxNJmClwn89q0-qDwuRwgAjcIQcIsAJAA)

造成 runtime 的 error。

使用泛型，告知正確的 type

```typescript
function listToDict<T>(list: T[], idgen: (item: T) => string): {[key: string]: T} {
    const dict: {[key: string]: T} = {};

    list.forEach(item => {
        const key = idgen(item);
        dict[key] = item;
    });

    return dict;
}

const demo = [{name: 'Mike', userId: '01'}, {name: 'Todd', userId: '02'}];

const userDict = listToDict(demo, (item) => item.userId);
userDict.a.b.c.d; // Property 'b' does not exist on type '{ name: string; userId: string; }'
```
[Playground Link](https://www.typescriptlang.org/play?#code/GYVwdgxgLglg9mABAGxgZygFTgERtAHkwD4AKVDALkUwG0BdAGkRgBMBzAUzGtJik4BbapgCUiALzFEGAE4ww7UdQDetANacAntTkL29EQF9EKgFCJLiCAgyJW+KKo3bdUeYsM0TE00YDcZhZWFFAAdMBwsgCiAIYQABZ8AoKS0uZWmda2UIiaWpIsHNzJQqKBWVYO0C5a9IX8QhVWRuVBmbKcUCCySNVQgUZBNmB2rEJwhbQqYLGCnNQA5ACyMJqLzCBonLIAkqxLAAwAjItGzDNzC4iL2KysG4hbO-tHAExn9IFmI3bPsnhoIVQthAVBSONBHBmKVBOIpCwUmF-vs2v8wWFYmEAEZhCBhVj+RAAemJiAACrI4AAHHZQAqLbGLexwThoRBgOC5TgAD3QuQQiHptJuKg5VzcHnYRJRBxk7n0RKMiyAA)

此時 typescript 就會報錯。

## Top Types

Top Types 指的是 `any` 與 `unknown`，這 2 個 type 可以給予任何的 value，但其中還是有些許的不同

```typescript
let a: any = '';
a = 123;
a = true;
a = new Symbol();

let b: unknown = '';
b = 123;
b = true;
b = new Symbol();
```

以上都是正確的，但是在 `unknown` 是不允許在未使用 type guard 前去使用的

```typescript
let a: any = '';
a.b.c.d.hello.i.can.use.any; // 可以通過 compile

let b: unknown = '';
b.c.a.d; // 會報錯 Ojbect is of type 'unknown'
```

在使用 `unknow` 前，必須像下面這樣，先進行 type 的判斷

```typescript
let b: unknown = '';

if (typeof b === 'string') {
    console.log(b);
} else if (typeof b === 'boolean') {
    console.log(b);
}
```

`any` 最常用於原本的專案要改使用 typesciprt 時，需要將 type 慢慢定義調整的過程使用

`unknow` 最常用於無法肯定的 type，需要在 runtime 的時候去定義或處理時(例如去獲取不確定的資料時）

## Bottom Types

Bottom Types 指的是 `never` 是一種很抽象的概念，代表不可能發生的

在某些時候是非常有用的，例如下面的例子，使用 `never` 來表示確認已經 handle 了所以可能的狀況

```typescript
class Dog {
    wolf() {
        console.log('wolf')
    }
}

class Car {
    meow() {
        console.log('meow')
    }
}


type Animal = Dog | Car

const ani: Animal = getRandomAnimal();

if (ani instanceof Dog) {
    ani.wolf();
} else if (anin instanceof Car) {
    ani.meow()
} else {
    const neverVal: never = ani;
}

```

若此時多加一個 class，此時 typescript 就會自動報錯，告知你還有一種可能未進行處理

```typescript
// ...

class Person {
    say() {
        console.log('hello')
    }
}

type Animal = Dog | Car | Person

const ani: Animal = getRandomAnimal();

if (ani instanceof Dog) {
    ani.wolf();
} else if (ani instanceof Car) {
    ani.meow()
} else {
    // Type 'Person' is not assignable to type 'never' error
    const neverVal: never = ani; 
}

```

`never` 也很適合在 `switch` 中使用，能夠避免許多錯誤

## Type guards & narrowing

type guard 可以使用不同的方式產生

```typescript
let a: Date | null | undefined | 'string' | [number] | { dateRange: [Date, Date] };

// 使用 instanceof
if (a instanceof  Date) {
    console.log('a is Date type', a);
} 
// 使用 typeof
else if (typeof a === 'string') {
    console.log('a is string type', a);
}
// 使用特定的值
else if (typeof a === null) {
    console.log('a is null', a);
}
// 使用 true or false 判斷
else if (!a) {
    console.log('a should be 0, false, undefined etc...', a);
}
// 使用 js function 確認
else if (Array.isArray(a)) {
    console.log('a is array', a);
}
// property 確認
else if ("dateRange" in a) {
    console.log('dateRange in a', a);
}
// 可以加個 else 讓他確認是 nerver
else {
    console.log('a should be never', a);
}
```

假設定義好了一個 `interface`，使用下方的方式並不能正確指向 `Person` 這個 interface

```typescript
interface Person {
    name: string
    age: number
    location: string
}

let maybePerson: unknown;

if (maybePerson && typeof maybePerson === 'object' && "name" in maybePerson && typeof maybePerson['name'] === 'string' && 'location' in maybePerson && typeof maybePerson['location'] === 'string' && 'age' in maybePerson && typeof maybePerson['age'] === 'number') {
    console.log(maybePerson); // type object
}
```

儘管在 `if` 裡面可以使用 `name`、`age` 等，但是它的 type 仍然只是 object 而非 `Person`

在 typescript 中使用 `is` 的 type guard 來判斷 `type` 是否是 user defined 的 type

```typescript
interface Person {
    name: string
    age: number
    location: string
}

let maybePerson: unknown;

function isPerson(maybePerson: any) : maybePerson is Person {
    return (maybePerson && typeof maybePerson === 'object' && "name" in maybePerson && typeof maybePerson['name'] === 'string' && 'location' in maybePerson && typeof maybePerson['location'] === 'string' && 'age' in maybePerson && typeof maybePerson['age'] === 'number')
}

if (isPerson(maybePerson)) {
    console.log(maybePerson); // type Person
}
```

自定義的 type guard function，回傳 boolean 來判斷是否是該 type，假若在 type guard 內的邏輯錯誤，誤把不是該 type 的認爲是的話，typescript 並無法抓到這種錯誤

另外還有一個方式加上 `asserts` 去判斷 type，就不需要使用 `if` 包起來去判斷是否爲該 type

```typescript
// ...
function assertsIsPerson(maybePerson: any) : asserts maybePerson is Person {
    if(!(maybePerson && typeof maybePerson === 'object' && "name" in maybePerson && typeof maybePerson['name'] === 'string' && 'location' in maybePerson && typeof maybePerson['location'] === 'string' && 'age' in maybePerson && typeof maybePerson['age'] === 'number')) {
        throw new Error('is not Person type');
    }
}

assertsIsPerson(maybePerson)
console.log(maybePerson); // type Person
```

## Type Queries

`keyof` 與 `typeof` 是常用的 type query，可以從 value 獲取資訊

`keyof` 可以獲取 `type` 或是 `interface` 的 property，包括 string、number 與 symbol

```typescript
type DateProperty = keyof Date;
```

若想指獲取某種 type 的 key，可以使用 `&` 獲取

```typescript
type DateProperty = keyof Date;
type DateStringProperty = DateProperty & string
```

`typeof` 獲取某 value 的 type

```typescript
const apiResponse = Promise.all([fetch('http://google.com'), Promise.resolve('test')]);
type ApiResponse = typeof apiResponse; // type ApiResponse = Promise<[Response, string]>
```

## Conditional Types

與一般的 JavaScript 三元運算相同 `condition ? trueValue : falseValue`，可以透過三元運算賦予 type

```typescript
class A {

}

class B {

}

type AorB<T> = T extends 'A' ? A : B

let a:AorB<'A'> // type A

let b:AorB<'B'> // type B

```

## Extract & Exclude

`Extract` 與 `Exclude` 是 `typescript` 的 utils type

`Extract<A, B>`，只要在 A 中有滿足 B 條件的，都會被選起來，`Exclude` 則相反，滿足條件的都會被排除

```typescript
type A = "A" | {a: 'a', b: 'b', c: 'c'} | [string] | [false, true] | {b: 1, c: 2}

type StringA = Extract<A, string> // type StringA = "A"
type ObjectB = Extract<A, {b: any}> // type {a: 'a', b: 'b', c: 'c'} | {b: 1, c: 2}
type ObjectA = Extract<A, {a: any}> // type {a: "a", b: "b", c: "c"}
type ArrayA = Extract<A, Array> // type [string] | [false, true]
type NeverA = Extract<A, Array<number>> // type never

type NoStringA = Exclude<A, string> // type {a: "a", b: "b", c: "c"} | [string] | [false, true] | {b: 1, c: 2}
type NoObjectB = Exclude<A, {b: any} > // type "A" | [string] | [false, true]
type NoObjectNumber = Exclude<A, { [key: string]: number }> // type "A" | {a: "a", b: "b", c: "c"} | [string] | [false, true]
```

`Extract` 與 `Exclude` 是透過 [Conditional Types](#conditional-types) 去達成的

```typescript
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

## Indexed Access Types

可以取某 type 的值來當做另外一個 type

```typescript
type A = {
    a: string
    b: number
    c: {
        d: boolean
        e: Date
    }
}

type C = A['c'] // type {d: boolean, e: Date}
type E = A['c']['e'] // type Date
type AC = A['c'|'a'] // type string | {d: boolean, e: Date}
```

## Mapped Types

下面這程式 typescript 並不會報錯，因爲設定 key 爲 string 皆可

```typescript
enum Gender {
    Man,
    Woman
}

type Person =  {
    age: number
    married: boolean
    gender: Gender
}

type Dict<T> = {[key: string] : T}

const personDic: Dict<Person> = {
    jack: {
        age: 10,
        married: false,
        gender: Gender.Man
    },
    marray: {
        age: 33,
        married: true,
        gender: Gender.Woman
    }
}

console.log(personDic.test); // no error
```

若將 key 使用 in 來寫死，雖然會報錯，但是卻很難去進行擴充

```typescript
type MyRecord = {[key in 'jack' | 'marray']: Person}

const recordPerson: MyRecord = {
    jack: {
        age: 10,
        married: false,
        gender: Gender.Man
    },
    marray: {
        age: 33,
        married: true,
        gender: Gender.Woman
    }
}

console.log(recordPerson.test) // error
```

若將 `MyRecord` 改成以下方式，就非常易於擴展與使用

```typescript
type MyRecord<Key extends string, Value> = {[key in Key]: Value}

const recordPerson: MyRecord<'jack' | 'marray', Person> = {
    jack: {
        age: 10,
        married: false,
        gender: Gender.Man
    },
    marray: {
        age: 33,
        married: true,
        gender: Gender.Woman
    }
}
```

而 typescript 有提供一個 utils type `Record`，就是透過上面 `MyRecord` 去生成的，所以可以直接寫成這樣

```typescript
const recordPerson2: Record<'jack' | 'marray', Person> = {
    jack: {
        age: 10,
        married: false,
        gender: Gender.Man
    },
    marray: {
        age: 33,
        married: true,
        gender: Gender.Woman
    }
}
```

另外一個是 `Pick`，可以從一個 type 中選出哪些 property 是所需要的

```typescript
type Person =  {
    age: number
    married: boolean
    gender: Gender
}

type PersonAge = Pick<Person, 'age'>

const personAge: PersonAge = {
    age: 16
}
```

## Mapping Modifiers

`Partial`、`Required`、`Readonly`

`Partial` 讓所有的 key 都變成是可選的的

```typescript
type Person =  {
    age: number
    married: boolean
    gender: Gender
}

type PartialPerson = Partial<Person> // type {age?: number, married?: boolean, gender?: Gender}
```

`Required` 相反，所有的 key 都是必須的

```typescript
type RequiredPerson = Required<PartialPerson> // type {age: number;married: boolean;gender: Gender;}
```

`Readonly` 就是變成可讀

```typescript
type ReadonlyPerson = Readonly<Person> // type {readonly age: number;readonly married: boolean;readonly gender: Gender;}
```

## Template Literal Type

typescript 也可以像 js 一樣使用 <code>`</code> 定義 type

```typescript
type A = 'A'|'B'
type B = 'C'|'D'

type T = `set${A}${B}` // "setAC" | "setAD" | "setBC" | "setBD"
```

可以搭配 `Extract` 去 filter property

```typescript
type Query = Extract<keyof Document, `query${string}`> 
// type "queryCommandEnabled" | "queryCommandIndeterm" | "queryCommandState" | "queryCommandSupported" | "queryCommandValue" | "querySelector" | "querySelectorAll"
```