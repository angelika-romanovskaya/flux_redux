# react-hw-22 (Redux Toolkit)

То же приложение, что и в версии с классическим Redux, но переписанное
на Redux Toolkit. Цель — посмотреть, сколько кода реально уходит, если не
писать руками то, что Toolkit уже умеет.

## Сравнение: классический Redux vs Redux Toolkit

| Что                       | Классический Redux                                                                 | Redux Toolkit                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Установка                 | `redux` + `react-redux` + `redux-thunk` + `redux-devtools-extension`               | `@reduxjs/toolkit` + `react-redux`                                                  |
| Типы экшенов              | Строковые константы: `const ADD_TODO = "ADD_TODO"`                                 | Генерируются автоматически из `name` + ключей `reducers`                            |
| Action creators           | Отдельные функции: `const addTodo = (text) => ({ type: ADD_TODO, payload: text })` | Генерируются вместе со слайсом, экспортируются из `todosSlice.actions`              |
| Reducer                   | `switch (action.type) { case ADD_TODO: return { ...state, todos: [...] } }`        | Объект с методами: `addTodo(state, action) { ... }`                                 |
| Иммутабельность           | Руками через спреды, либо Immer отдельно                                           | Immer встроен — можно писать `state.push(...)` и `todo.completed = !todo.completed` |
| Комбинирование редьюсеров | `combineReducers({ todos, filter })` вручную                                       | Просто объект `reducer: { todos, filter }` в `configureStore`                       |
| Thunk-мидлвара            | Подключается вручную                                                               | Уже включена                                                                        |
| DevTools                  | Требует `composeWithDevTools` или `window.__REDUX_DEVTOOLS_EXTENSION__`            | Уже включены                                                                        |
| Настройка store           | `createStore` + `applyMiddleware` + `compose`                                      | Один `configureStore({ reducer: {...} })`                                           |

## Что делает configureStore

`configureStore` — обёртка над `createStore`, которая собирает
рабочий store «из коробки»:

- принимает объект `reducer` и сам вызывает `combineReducers`;
- добавляет `redux-thunk` в middleware;
- включает Redux DevTools без дополнительных обёрток;
- в dev-режиме включает проверки: «не мутирует ли редьюсер state» и
  «сериализуемы ли экшены и state»;
- возвращает уже готовый store — с ним сразу можно работать.

Строк кода на настройку store: **1 файл, 8 строк** вместо классических ~30.

## Что делает createSlice

`createSlice` — фабрика, которая по одному объекту создаёт сразу три вещи:

1. **Action creators** — из имени `name` и названий ключей в `reducers`.
   Например, ключ `addTodo` в слайсе `todos` → экшен `"todos/addTodo"` и
   функция `addTodo(payload)`.
2. **Reducer** — сам собирает обработчик `switch` из тех же ключей.
3. **Action types** — строки вроде `"todos/addTodo"` тоже генерируются,
   руками их писать не надо.

Плюс `prepare` внутри экшена позволяет задать форму payload — например,
`addTodo(text)` под капотом превращается в `{ id, text, completed }` с
автоматическим `nanoid()`.

## Жизненный цикл createAsyncThunk

Любая асинхронная операция (запрос на сервер, чтение с диска, что угодно,
что не выполняется синхронно) в RTK оформляется через `createAsyncThunk`.
Это фабрика, которая принимает два аргумента:

```js
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",                 // имя — попадёт в типы экшенов
  async (arg, thunkApi) => { ... }    // сама работа: вернёт значение → payload
);
```

Что происходит, когда ты где-то пишешь `dispatch(fetchPosts())`:

1. Thunk запускает твой `async`-колбэк.
2. **Сразу** диспатчит экшен `posts/fetchPosts/pending`.
3. Ждёт, пока колбэк отработает.
4. Если колбэк вернул значение — диспатчит `posts/fetchPosts/fulfilled`,
   и это значение кладётся в `action.payload`.
5. Если колбэк бросил исключение — диспатчит `posts/fetchPosts/rejected`,
   и ошибка кладётся в `action.error`. Если внутри был вызван
   `thunkApi.rejectWithValue(...)` — то значение попадёт в `action.payload`.

То есть вместо ручного диспатча трёх экшенов (`REQUEST`, `SUCCESS`, `FAILURE`)
ты пишешь одну асинхронную функцию, а Toolkit сам раздаёт эти три экшена
в нужные моменты.

## Что такое pending, fulfilled, rejected

Это три фазы одной асинхронной операции. Названия стандартные для промисов,
и RTK просто использует ту же терминологию.

**`pending`** — «запрос начался». Экшен уходит сразу, синхронно, до первого
`await`. В этот момент принято ставить `loading: true` и сбрасывать `error`.

**`fulfilled`** — «успешно завершилось». Экшен уходит, когда твой
`async`-колбэк вернул значение. В `action.payload` лежит то, что вернулось.
Тут `loading: false` и, как правило, запись данных в стор.

**`rejected`** — «упало». Экшен уходит, если из колбэка полетело исключение
или был вызван `rejectWithValue`. Ошибку достаём из `action.payload`
(если использовали `rejectWithValue`) или из `action.error.message`.

Имена экшенов собираются из имени thunk'а:

```
posts/fetchPosts/pending
posts/fetchPosts/fulfilled
posts/fetchPosts/rejected
```

## Пример extraReducers

`reducers` — для синхронных экшенов, которые ты пишешь сам.
`extraReducers` — для тех, что создал кто-то другой: thunk'и, экшены из
других слайсов. Обычно именно здесь живут `pending / fulfilled / rejected`.

```js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, thunkApi) => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts?_limit=10"
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.message || "Не удалось загрузить данные"
      );
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPosts(state) {
      state.posts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
```

Несколько замечаний по коду:

- `addCase` привязан к **конкретному** thunk'у. Если в проекте несколько
  thunk'ов, каждый обрабатывается своим набором `addCase` — экшены не
  перемешаются.
- Мутации вида `state.loading = true` работают, потому что под капотом Immer.
  Писать `{ ...state, loading: true }` не нужно.
- `addMatcher` нужен только для «широких» условий вроде «любой pending в
  приложении». Для одного thunk'а `addCase` понятнее и безопаснее.

## Почему это удобнее ручных thunk actions

В классическом Redux на каждый запрос приходилось писать:

- три константы (`REQUEST`, `SUCCESS`, `FAILURE`);
- три action creator'а;
- сам thunk, который вручную диспатчил эти три экшена;
- три `case` в редьюсере;
- `try/catch` внутри thunk'а, чтобы не забыть `FAILURE`.

Итого — около 60–70 строк на один запрос. Плюс легко ошибиться: забыть
`REQUEST`, перепутать тип, не передать `payload`.

С `createAsyncThunk` всё это делает Toolkit:

- типы экшенов генерируются автоматически, опечатка невозможна;
- три фазы (`pending`/`fulfilled`/`rejected`) диспатчатся сами;
- `rejectWithValue` даёт осмысленный payload ошибки;
- `extraReducers.addCase(...)` явно связывает обработку с конкретным
  thunk'ом — не надо угадывать строку типа экшена;
- в Redux DevTools сразу видно три экшена с общим префиксом — легко
  отфильтровать все запросы одного типа.

Тот же posts-thunk на классическом Redux занимал бы ~60 строк плюс
изменения в редьюсере. В RTK — примерно 30, и всё в одном файле рядом.

## Сколько кода удалось убрать

Примерно так:

| Файл               | Классический Redux                                  | Redux Toolkit             |
| ------------------ | --------------------------------------------------- | ------------------------- |
| `actionTypes.js`   | ~10 строк                                           | — (генерируется)          |
| `actions.js`       | ~25 строк                                           | — (генерируется)          |
| `todosReducer.js`  | ~50 строк (switch на 4 case)                        | ~25 строк (todosSlice)    |
| `postsReducer.js`  | ~70 строк (switch + 3 фазы запроса)                 | ~30 строк (postsSlice)    |
| `filterReducer.js` | ~15 строк                                           | ~10 строк (filterSlice)   |
| `store.js`         | ~20 строк (createStore + applyMiddleware + compose) | ~8 строк (configureStore) |
| `index.js`         | +обёртки для DevTools                               | `Provider` как есть       |
| Итого              | **~190 строк**                                      | **~75 строк**             |

Итого примерно **100–120 строк служебного кода удаляется**, а если считать
вместе с ручными спредами для иммутабельности — экономия ещё больше.

## Функционал

Todo-часть:

- добавление задачи (`addTodo`);
- удаление (`removeTodo`);
- переключение `completed` (`toggleTodo`);
- очистка выполненных (`clearCompleted`);
- фильтр `all / active / completed` (`setFilter` в отдельном слайсе).

Posts-часть:

- загрузка постов через `createAsyncThunk` (`fetchPosts`);
- индикатор загрузки (`loading`);
- обработка ошибок (`error`);
- очистка списка (`clearPosts`).

## Запуск

```
npm install
npm start
```

Порт 3000.