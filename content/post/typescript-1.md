---
title: "Typescript I"
date: 2021-08-18T22:13:15+08:00
toc: true
---

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