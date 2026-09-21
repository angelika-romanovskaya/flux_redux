То же Todo-приложение, что и в версии с классическим Redux, но переписанное
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

## Сколько кода удалось убрать

Примерно так:

| Файл               | Классический Redux                                  | Redux Toolkit             |
| ------------------ | --------------------------------------------------- | ------------------------- |
| `actions.js`       | ~25 строк                                           | — (генерируется)          |
| `todosReducer.js`  | ~50 строк (switch на 4 case)                        | ~25 строк (todosSlice)    |
| `filterReducer.js` | ~15 строк                                           | ~10 строк (filterSlice)   |
| `store.js`         | ~20 строк (createStore + applyMiddleware + compose) | ~8 строк (configureStore) |
| `index.js`         | +обёртки для DevTools                               | `Provider` как есть       |
| Итого              | **~110 строк**                                      | **~45 строк**             |

Итого примерно **60–70 строк служебного кода удаляется**, а если считать
вместе с ручными спредами для иммутабельности — экономия больше.

## Функционал

Всё то же, что было в версии на чистом Redux:

- добавление задачи (`addTodo`);
- удаление (`removeTodo`);
- переключение `completed` (`toggleTodo`);
- очистка выполненных (`clearCompleted`);
- фильтр `all / active / completed` (`setFilter` в отдельном слайсе).

## Запуск

```
npm install
npm start
```

Порт 3000.
