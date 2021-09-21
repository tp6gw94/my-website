---
title: "Vue 3 的一些使用方式"
date: 2021-08-16T21:53:05+08:00
draft: true
toc: true
---

> 本文參考 [可組和的 Vue - Anthony Fu](https://www.youtube.com/watch?v=CtrKCHM-FAk) 與 [Production Vue](https://frontendmasters.com/courses/production-vue/) 加上一些些個人的經驗 ，影片說明的非常詳細，推薦觀看。
> 
> Vue 3 最大的改動就是 composition API，將邏輯統一整理、拆分，避免像 Options API 一樣，處理同個問題，卻將程式碼拆分至不同的地方。此外也避免了 Vue 2 mixin 引入的問題。
>

## Validator Props

透過 `validator` 可以限定 `props` 傳入值的限定。

```javascript
export default {
  props: {
    label: {
      type: String,
      required: true,
      validator: (value) => {
        // 只有 A, B, C 這 3 個值能通過驗證
        return ['A', 'B', 'C'].indexOf(value) !== -1;
      }
    }
  }
}
```

## Slot

當 `props` 傳入過多資訊時，或是透過 `props` 處理過多的邏輯，應該使用 `slot` 避免元件的過於複雜。

假設這是一個 Button 元件，傳入了顯示的文字。

```html
<template>
  <button type="button" class="btn">
    {{ text }}
  </button>
</template>
```

```javascript
export default {
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
```

此時有了新的需求，替 Button 加上 Icon，可能會設計成這樣。

```html
<template>
  <button type="button" class="btn">
    <AppIcon :iconName="icon" />
    {{ text }}
  </button>
</template>
```

```javascript
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    icon: {
      type: String,
    }
  }
}
```

到目前爲止應該都蠻合理的，此時新需求是可能左邊也有 Icon，可能會變這樣。

```html
<template>
  <button type="button" class="btn">
    <AppIcon v-if="leftIcon" :iconName="leftIcon" />
    {{ text }}
    <AppIcon v-if="rightIcon" :iconName="rightIcon" />
  </button>
</template>
```

```javascript
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    leftIcon: {
      type: String
    },
    rightIcon: {
      type: String
    }
  }
}
```

又新增了新需求，Icon 在點擊後需要有讀取中的圖示。

```html
<template>
  <button type="button" class="btn">
    <template v-if="isLoading">
      <AppIcon iconName="loading" />
    </template>
    <template v-else>
      <AppIcon v-if="leftIcon" :iconName="leftIcon" />
      {{ text }}
      <AppIcon v-if="rightIcon" :iconName="rightIcon" />
    </template>
  </button>
</template>
```

```javascript
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    leftIcon: {
      type: String
    },
    rightIcon: {
      type: String
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  }
}
```

在讀取中的圖示希望可以有左右邊。

```html
<template>
  <button type="button" class="btn">
    <template v-if="isLoading">
      <AppIcon iconName="loading" />
    </template>
    <template v-else>
      <template v-if="leftIcon">
        <AppIcon v-if="isLoadingLeft" iconName="loading" />
        <AppIcon v-else :iconName="leftIcon" />
      </template>
      {{ text }}
      <template v-if="rightIcon">
        <AppIcon v-if="isLoadingRight" iconName="loading" />
        <AppIcon v-else :iconName="rightIcon" />
      </template>
    </template>
  </button>
</template>
```


```javascript
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    leftIcon: {
      type: String
    },
    rightIcon: {
      type: String
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isLoadingRight: {
      type: Boolean,
      default: false
    },
    isLoadingLeft: {
      type: Boolean,
      default: false
    }
  }
}
```

可以看見隨著需求的增加，原本設計好的簡單明瞭的元件會越來越難讀、也難以維護(上面 Button 其實還不算複雜，但想像可能又需要傳 icon 的顏色、 button class 等等)。

上述的 Button 元件遇到了以下問題。

- 新的需求一直進來，導致元件的複雜化
- 違反了單一的原則
- 過多的條件判斷
- 低靈活性
- 難以維護

元件的設計應該是易於擴展且容易使用的。

~~通常看到這個 Button，該做的就是另外建立 Button，不使用該組件。~~

改用 Slot，會簡單很多。


```html
<!-- BaseButton -->
<button type="button" class="btn">
  <slot></slot>
</button>
```

Slot 提供了高擴展與易讀性，在需要使用 Button 元件時，可以輕易的達成許多的需求。

```html
<base-button>
  Submit
</base-button>
```

```html
<base-button>
  Submit
  <app-icon icon="xxx" />
</base-button>
```

```html
<base-button>
  <app-icon icon="xxx" />
  Submit
  <app-icon icon="xxx" />
</base-button>
```

## Vendor Components Wrapper

在使用例如 Icon 的套件時，都會使用到 vendor 的 component。

```html
<template>
  <font-awesome-icon icon="water" />
  <font-awesome-icon icon="fire" />
  <font-awesome-icon icon="air" />
  <font-awesome-icon icon="close" />
</template>
```

這樣使用並沒有任何的問題，但是想像可能會有自己自定的 Icon 使用或是更換 Icon 使用 MaterialIcon 等等，所以建議將 vendor 的 component 在包一層，便於將 Icon 統一管理(或是其它的 vendor component)。

```html
<template>
  <font-awesome-icon v-if="source === 'font-awesome'" :icon="icon" />
  <span v-else :class="customIcon"></span>
</template>
```

若有其它 Icon library 可以直接透過 `v-else-if` 去做修改即可。

```html
<template>
  <font-awesome-icon v-if="source === 'font-awesome'" :icon="icon" />
  <material-cion v-else-if="source === 'material'" :icon="icon" />
  <span v-else :class="customIcon"></span>
</template>
```


```